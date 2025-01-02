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

# Simulated Token Store
TOKEN_STORE = {}

# User Registration View


class UserRegistrationView(APIView):
    permission_classes = [AllowAny]  # Allow anyone to register

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'ثبت‌نام با موفقیت انجام شد.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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


class UserLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response(
                {"message": "ورود با موفقیت انجام شد.", "token": token.key},
                status=status.HTTP_200_OK
            )

        return Response(
            {"error": "نام کاربری یا رمز عبور اشتباه است."},
            status=status.HTTP_401_UNAUTHORIZED
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




class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get the authenticated user
            user = request.user

            # Serialize the user data excluding the password
            user_data = {
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "date_of_birth": user.date_of_birth,
                "mobile_number": user.mobile_number,  # Assuming you have a mobile_number field
                "national_id": user.national_id,  # Assuming you have a national_id field
            }

            return Response(user_data, status=200)

        except User.DoesNotExist:
            return Response({"error": "کاربر یافت نشد."}, status=404)


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

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def post(self, request):
        # Delete the user's token to log them out
        request.user.auth_token.delete()
        return Response({"message": "خروج با موفقیت انجام شد."}, status=status.HTTP_200_OK)
