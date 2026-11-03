"""
URL patterns for authentication.
"""

from django.urls import path
from .views import (
    UserRegistrationView,
    UserLoginView,
    UserLogoutView,
    CookieTokenRefreshView,
    CurrentUserView,
    csrf_token,
)

app_name = 'accounts'

urlpatterns = [
    # Authentication
    path('csrf/', csrf_token, name='csrf_token'),
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    
    # User Profile
    path('me/', CurrentUserView.as_view(), name='current_user'),
]
