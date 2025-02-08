from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
import secrets  # For generating secure random strings
from .models import User
from .serializers import UserSerializer, UserProfileSerializer
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.core.mail import send_mail
from django.urls import reverse
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse
from django.contrib.auth import get_user_model

User = get_user_model()

class UserRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_active = False  # Ensure the user is not active until email is verified
            user.save()
            self.send_verification_email(user)
            return Response({'message': 'ثبت‌نام با موفقیت انجام شد. لطفا ایمیل خود را برای تایید حساب بررسی کنید.'}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def send_verification_email(self, user):
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(str(user.id).encode('utf-8'))
        domain = settings.SITE_DOMAIN
        verification_url = f"http://{domain}/api/user/verify-email/{uid}/{token}/"
        send_mail(
            "تایید حساب کاربری",
            f"لطفا روی لینک زیر کلیک کنید تا حساب کاربری خود را تایید کنید:\n\n{verification_url}",
            "no-reply@myapp.com",  # Replace with your sender email
            [user.email],
            fail_silently=False,
        )

class UserLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"error": "نام کاربری یا رمز عبور اشتباه است."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        if not user.check_password(password):
            return Response(
                {"error": "نام کاربری یا رمز عبور اشتباه است."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        if not user.is_active:
            return Response(
                {"error": "لطفا ایمیل خود را تایید کنید."},
                status=status.HTTP_400_BAD_REQUEST
            )
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {"message": "ورود با موفقیت انجام شد.", "token": token.key},
            status=status.HTTP_200_OK
        )

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        national_id = request.data.get("national_id")
        new_password = request.data.get("new_password")
        if not national_id or not new_password:
            return Response(
                {"error": "کد ملی یا رمز عبور جدید وارد نشده است."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            user = User.objects.get(national_id=national_id)
            # Validate the new password (using Django's built-in validators)
            try:
                from django.contrib.auth.password_validation import validate_password
                validate_password(new_password, user)
            except Exception as e:
                return Response(
                    {"error": f"رمز عبور جدید معتبر نیست: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.set_password(new_password)
            user.save()
            return Response(
                {"message": "رمز عبور شما با موفقیت تغییر یافت."},
                status=status.HTTP_200_OK
            )
        except ObjectDoesNotExist:
            return Response(
                {"error": "کاربری با این کد ملی یافت نشد."},
                status=status.HTTP_404_NOT_FOUND
            )

class EmailVerificationView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
            if default_token_generator.check_token(user, token):
                user.is_active = True
                user.save()
                return HttpResponse("<h1>حساب شما با موفقیت تایید شد!</h1>")
            else:
                return HttpResponse("<h1>لینک تایید معتبر نیست.</h1>")
        except Exception as e:
            return HttpResponse("<h1>خطا در تایید حساب.</h1>", status=400)

class UserListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserProfileEditView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "پروفایل با موفقیت به‌روزرسانی شد."},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        request.user.delete()
        return Response(
            {"message": "حساب شما با موفقیت حذف شد."},
            status=status.HTTP_200_OK
        )

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response(
            {"message": "خروج با موفقیت انجام شد."},
            status=status.HTTP_200_OK
        )

# New API endpoint to check that the provided username and national_id match.
class CheckUsernameNationalIDView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        national_id = request.data.get("national_id")
        if not username or not national_id:
            return Response(
                {"valid": False, "error": "Both username and national_id are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"valid": False}, status=status.HTTP_200_OK)
        if user.national_id == national_id:
            return Response({"valid": True}, status=status.HTTP_200_OK)
        else:
            return Response({"valid": False}, status=status.HTTP_200_OK)
