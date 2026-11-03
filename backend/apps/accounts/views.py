"""
Views for user authentication and profile management.
"""

from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from drf_spectacular.utils import extend_schema, OpenApiResponse
from django.conf import settings
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from rest_framework.decorators import api_view, permission_classes

from .models import User
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserSerializer,
    UserProfileUpdateSerializer
)


def set_auth_cookies(response, refresh_token, access_token=None):
    refresh = RefreshToken(refresh_token)
    access = access_token or str(refresh.access_token)
    response.set_cookie(
        settings.AUTH_ACCESS_COOKIE_NAME,
        access,
        max_age=int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        path=settings.AUTH_ACCESS_COOKIE_PATH,
    )
    response.set_cookie(
        settings.AUTH_REFRESH_COOKIE_NAME,
        str(refresh),
        max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()),
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        path=settings.AUTH_REFRESH_COOKIE_PATH,
    )


def clear_auth_cookies(response):
    response.delete_cookie(
        settings.AUTH_ACCESS_COOKIE_NAME,
        path=settings.AUTH_ACCESS_COOKIE_PATH,
        samesite=settings.AUTH_COOKIE_SAMESITE,
    )
    response.delete_cookie(
        settings.AUTH_REFRESH_COOKIE_NAME,
        path=settings.AUTH_REFRESH_COOKIE_PATH,
        samesite=settings.AUTH_COOKIE_SAMESITE,
    )


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def csrf_token(request):
    return Response({'csrfToken': get_token(request._request)})


@method_decorator(csrf_protect, name='dispatch')
class UserRegistrationView(generics.CreateAPIView):
    """
    Register a new user account.
    Creates a STUDENT role by default.
    """
    
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    @extend_schema(
        tags=['Authentication'],
        summary='Register new user',
        description='Create a new user account. All users are assigned STUDENT role by default.',
        responses={
            201: OpenApiResponse(description='User created successfully'),
            400: OpenApiResponse(description='Validation error'),
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        response = Response({
            'user': UserSerializer(user).data,
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)
        set_auth_cookies(response, str(refresh))
        return response


@method_decorator(csrf_protect, name='dispatch')
class UserLoginView(APIView):
    """
    Login with email and password.
    Sets JWT session cookies.
    """
    
    permission_classes = [permissions.AllowAny]
    serializer_class = UserLoginSerializer
    
    @extend_schema(
        tags=['Authentication'],
        summary='User login',
        description='Authenticate with email and password. Sets HttpOnly JWT session cookies.',
        request=UserLoginSerializer,
        responses={
            200: OpenApiResponse(description='Login successful'),
            400: OpenApiResponse(description='Invalid credentials'),
        }
    )
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        refresh = RefreshToken.for_user(user)
        response = Response({
            'user': UserSerializer(user).data,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
        set_auth_cookies(response, str(refresh))
        return response


@method_decorator(csrf_protect, name='dispatch')
class UserLogoutView(APIView):
    """
    Logout and blacklist refresh token.
    """
    
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['Authentication'],
        summary='User logout',
        description='Logout and blacklist the refresh token.',
        responses={
            200: OpenApiResponse(description='Logout successful'),
            400: OpenApiResponse(description='Invalid token'),
        }
    )
    def post(self, request):
        refresh_token = request.COOKIES.get(settings.AUTH_REFRESH_COOKIE_NAME)
        response = Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except TokenError:
                error_response = Response(
                    {'error': 'The session was cleared, but its refresh token was invalid or expired.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
                clear_auth_cookies(error_response)
                return error_response
        clear_auth_cookies(response)
        return response


@method_decorator(csrf_protect, name='dispatch')
class CookieTokenRefreshView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['Authentication'],
        summary='Refresh user session',
        description='Refresh the access cookie using the HttpOnly refresh cookie.',
        responses={
            200: OpenApiResponse(description='Session refreshed'),
            401: OpenApiResponse(description='Session expired or invalid'),
        },
    )
    def post(self, request):
        refresh_token = request.COOKIES.get(settings.AUTH_REFRESH_COOKIE_NAME)
        if not refresh_token:
            response = Response(
                {'error': 'Session expired. Please sign in again.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            clear_auth_cookies(response)
            return response

        serializer = TokenRefreshSerializer(data={'refresh': refresh_token})
        if not serializer.is_valid():
            response = Response(
                {'error': 'Session expired. Please sign in again.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            clear_auth_cookies(response)
            return response

        tokens = serializer.validated_data
        response = Response({'message': 'Session refreshed'}, status=status.HTTP_200_OK)
        set_auth_cookies(
            response,
            tokens.get('refresh', refresh_token),
            access_token=tokens['access'],
        )
        return response


class CurrentUserView(generics.RetrieveUpdateAPIView):
    """
    Get or update current user profile.
    """
    
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def get_serializer_class(self):
        if self.request.method == 'PUT' or self.request.method == 'PATCH':
            return UserProfileUpdateSerializer
        return UserSerializer
    
    @extend_schema(
        tags=['User Profile'],
        summary='Get current user',
        description='Retrieve authenticated user profile information.',
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    @extend_schema(
        tags=['User Profile'],
        summary='Update current user',
        description='Update authenticated user profile information.',
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)
