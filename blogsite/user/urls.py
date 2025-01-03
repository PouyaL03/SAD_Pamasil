from django.urls import path
from .views import UserRegistrationView, UserListView, UserLoginView, UserProfileEditView, LogoutView, ForgotPasswordView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-registration'),
    path('all/', UserListView.as_view(), name='user-list'),
    path("login/", UserLoginView.as_view(), name="user-login"),
    #path("profile/", UserProfileView.as_view(), name="user-profile"),
    path('profile/', UserProfileEditView.as_view(), name='user-profile-edit'),
    path('logout/', LogoutView.as_view(), name='user-logout'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
]
