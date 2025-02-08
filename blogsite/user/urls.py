from django.urls import path
from .views import (
    UserRegistrationView,
    UserListView,
    UserLoginView,
    UserProfileEditView,
    LogoutView,
    ForgotPasswordView,
    EmailVerificationView,
    CheckUsernameNationalIDView  # <-- New view added
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-registration'),
    path('all/', UserListView.as_view(), name='user-list'),
    path("login/", UserLoginView.as_view(), name="user-login"),
    path('profile/', UserProfileEditView.as_view(), name='user-profile-edit'),
    path('logout/', LogoutView.as_view(), name='user-logout'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('verify-email/<uidb64>/<token>/', EmailVerificationView.as_view(), name='verify-email'),
    path('check-username-nationalid/', CheckUsernameNationalIDView.as_view(), name='check-username-nationalid'),
]
