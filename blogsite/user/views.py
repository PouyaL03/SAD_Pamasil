from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
import secrets  # For generating secure random strings
from .models import User
from .serializers import UserSerializer
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer
from rest_framework.permissions import AllowAny  # Allows any user to access

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.conf import settings

# Simulated Token Store
TOKEN_STORE = {}

# User Registration View


# class UserRegistrationView(APIView):
#     permission_classes = [AllowAny]  # Allow anyone to register

#     def post(self, request):
#         serializer = UserSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response({'message': 'ثبت‌نام با موفقیت انجام شد.'}, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
from django.core.mail import send_mail
from django.urls import reverse
from django.contrib.sites.shortcuts import get_current_site
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import get_user_model

class UserRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_active = False  # Ensure the user is not active until email is verified
            user.save()

            # Send activation email
            self.send_verification_email(user)
            return Response({'message': 'ثبت‌نام با موفقیت انجام شد. لطفا ایمیل خود را برای تایید حساب بررسی کنید.'}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def send_verification_email(self, user):
        # Generate a token for the user
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(str(user.id).encode('utf-8'))
        #uid = urlsafe_base64_encode(str(user.pk).encode()).decode()

        # Build verification URL
        domain = settings.SITE_DOMAIN
        verification_url = f"http://{domain}/api/user/verify-email/{uid}/{token}/"

        # Send email
        send_mail(
            "تایید حساب کاربری",
            f"لطفا روی لینک زیر کلیک کنید تا حساب کاربری خود را تایید کنید:\n\n{verification_url}",
            "no-reply@myapp.com",  # Replace with your email
            [user.email],
            fail_silently=False,
        )


# class UserRegistrationView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         role = request.data.get("role", "customer")  # Default to customer if not provided
#         serializer = UserSerializer(data=request.data)
#         if serializer.is_valid():
#             user = serializer.save()
#             user.role = role  # Set the role during registration
#             user.save()  # Save the user with the selected role
#             return Response({'message': 'ثبت‌نام با موفقیت انجام شد.'}, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# User Login View
# class UserLoginView(APIView):
#     def post(self, request):
#         username = request.data.get("username")
#         password = request.data.get("password")

#         # Authenticate the user
#         user = authenticate(username=username, password=password)
#         if user:
#             # Generate a custom token
#             custom_token = secrets.token_hex(32)  # Generate a 64-character token
#             TOKEN_STORE[user.username] = custom_token  # Save the token in the simulated store

#             print(f"Generated token for user {user.username}: {custom_token}")  # Debugging

#             return Response(
#                 {"message": "ورود با موفقیت انجام شد.", "token": custom_token},
#                 status=status.HTTP_200_OK,
#             )
#         return Response(
#             {"error": "نام کاربری یا رمز عبور اشتباه است."},
#             status=status.HTTP_401_UNAUTHORIZED,
#         )


# class UserLoginView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         username = request.data.get("username")
#         password = request.data.get("password")

#         user = authenticate(username=username, password=password)
#         if user:
#             token, _ = Token.objects.get_or_create(user=user)
#             return Response(
#                 {"message": "ورود با موفقیت انجام شد.", "token": token.key},
#                 status=status.HTTP_200_OK
#             )

#         return Response(
#             {"error": "نام کاربری یا رمز عبور اشتباه است."},
#             status=status.HTTP_401_UNAUTHORIZED
#         )

from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token

# Get the custom User model
User = get_user_model()

class UserLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        try:
            # Find the user by username
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"error": "نام کاربری یا رمز عبور اشتباه است."},  # Invalid username or password
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Check if the password matches
        if not user.check_password(password):
            return Response(
                {"error": "نام کاربری یا رمز عبور اشتباه است."},  # Invalid username or password
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Check if the user is active (email verified)
        if not user.is_active:
            return Response(
                {"error": "لطفا ایمیل خود را تایید کنید."},  # Email not verified
                status=status.HTTP_400_BAD_REQUEST
            )

        # If the user is active and the password matches, generate a token
        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {"message": "ورود با موفقیت انجام شد.", "token": token.key},
            status=status.HTTP_200_OK
        )






# Custom Authentication Method
def validate_token(username, token):
    return TOKEN_STORE.get(username) == token

# User Profile View
# class UserProfileView(APIView):
#     def get(self, request):
#         # Get token and username from headers
#         username = request.headers.get("Username")
#         token = request.headers.get("Authorization")

#         # Validate token
#         if not username or not token or not validate_token(username, token):
#             return Response(
#                 {"error": "شما دسترسی ندارید. لطفاً وارد شوید."},
#                 status=status.HTTP_401_UNAUTHORIZED,
#             )

#         # Retrieve the user and serialize their data
#         try:
#             user = User.objects.get(username=username)
#             serializer = UserSerializer(user)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         except:
#             return Response({"error": "کاربر یافت نشد."}, status=status.HTTP_404_NOT_FOUND)




# class UserProfileView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         try:
#             # Get the authenticated user
#             user = request.user

#             # Serialize the user data excluding the password
#             user_data = {
#                 "username": user.username,
#                 "first_name": user.first_name,
#                 "last_name": user.last_name,
#                 "email": user.email,
#                 "date_of_birth": user.date_of_birth,
#                 "mobile_number": user.mobile_number,  # Assuming you have a mobile_number field
#                 "national_id": user.national_id,  # Assuming you have a national_id field
#             }

#             return Response(user_data, status=200)

#         except User.DoesNotExist:
#             return Response({"error": "کاربر یافت نشد."}, status=404)


# User List View
class UserListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserProfileSerializer
from rest_framework.authtoken.models import Token

class UserProfileEditView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def get(self, request):
        # Return the user's current profile data
        serializer = UserProfileSerializer(request.user)  # Use the logged-in user
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        # Update the user's profile
        serializer = UserProfileSerializer(request.user, data=request.data)

        if serializer.is_valid():
            serializer.save()  # Save the updated profile
            return Response({"message": "پروفایل با موفقیت به‌روزرسانی شد."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        # Delete the user's account
        request.user.delete()
        return Response({"message": "حساب شما با موفقیت حذف شد."}, status=status.HTTP_200_OK)

    

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def post(self, request):
        # Delete the user's token to log them out
        request.user.auth_token.delete()
        return Response({"message": "خروج با موفقیت انجام شد."}, status=status.HTTP_200_OK)

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.core.exceptions import ObjectDoesNotExist

# Use get_user_model() to access the custom user model
User = get_user_model()

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        national_id = request.data.get("national_id")
        new_password = request.data.get("new_password")

        if not national_id or not new_password:
            return Response({"error": "کد ملی یا رمز عبور جدید وارد نشده است."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Fetch the user based on national_id
            user = User.objects.get(national_id=national_id)

            # Validate the new password (to ensure it's strong)
            try:
                validate_password(new_password, user)
            except Exception as e:
                return Response({"error": f"رمز عبور جدید معتبر نیست: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

            # Set the new password
            user.set_password(new_password)
            user.save()

            # Optionally, send a confirmation email (if needed)

            return Response({"message": "رمز عبور شما با موفقیت تغییر یافت."}, status=status.HTTP_200_OK)

        except ObjectDoesNotExist:
            return Response({"error": "کاربری با این کد ملی یافت نشد."}, status=status.HTTP_404_NOT_FOUND)



from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import get_user_model
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

User = get_user_model()

class EmailVerificationView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        try:
            # Decode user ID and get user
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)

            # Validate token
            if default_token_generator.check_token(user, token):
                user.is_active = True  # Activate the user
                user.save()
                return HttpResponse("<h1>حساب شما با موفقیت تایید شد!</h1>")
            else:
                return HttpResponse("<h1>لینک تایید معتبر نیست.</h1>")
        except Exception as e:
            return HttpResponse("<h1>خطا در تایید حساب.</h1>", status=400)
