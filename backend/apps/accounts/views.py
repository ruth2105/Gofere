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
from django.core.exceptions import ImproperlyConfigured
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.throttling import ScopedRateThrottle

from .email_verification import (
    VerificationCooldownError,
    VerificationEmailDeliveryError,
    send_verification_email,
    verify_email_token,
)
from .models import User
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserSerializer,
    UserProfileUpdateSerializer,
    EmailVerificationSerializer,
    ResendVerificationSerializer,
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
@authentication_classes([])
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
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_register'
    
    @extend_schema(
        tags=['Authentication'],
        summary='Register new user',
        description='Create an unverified student account and send an email-verification link.',
        responses={
            201: OpenApiResponse(description='Account created and verification email accepted'),
            400: OpenApiResponse(description='Validation error'),
            503: OpenApiResponse(description='Verification email could not be accepted'),
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        try:
            send_verification_email(user)
        except VerificationEmailDeliveryError:
            return Response({
                'error': (
                    'Your account was created, but the email provider could not accept '
                    'the verification message. You can request another message from the '
                    'sign-in page.'
                ),
                'status_code': status.HTTP_503_SERVICE_UNAVAILABLE,
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except ImproperlyConfigured:
            return Response({
                'error': (
                    'Your account was created, but email delivery is not configured. '
                    'Please contact support.'
                ),
                'status_code': status.HTTP_503_SERVICE_UNAVAILABLE,
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        if settings.EMAIL_BACKEND == 'django.core.mail.backends.console.EmailBackend':
            delivery_message = (
                'Your account was created. In development, the verification message '
                'was printed to the Django console.'
            )
        else:
            delivery_message = (
                'Your account was created. The configured email backend accepted the '
                'verification message; inbox delivery is not guaranteed.'
            )

        return Response({
            'user': UserSerializer(user).data,
            'email': user.email,
            'message': delivery_message,
            'resend_cooldown_seconds': settings.EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS,
        }, status=status.HTTP_201_CREATED)


@method_decorator(csrf_protect, name='dispatch')
class EmailVerificationView(APIView):
    """Consume a one-time email-verification token."""

    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_verify'

    @extend_schema(
        tags=['Authentication'],
        summary='Verify an email address',
        request=EmailVerificationSerializer,
        responses={
            200: OpenApiResponse(description='Email verified or already verified'),
            400: OpenApiResponse(description='Invalid or expired verification token'),
        },
    )
    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = verify_email_token(serializer.validated_data['token'])

        if result == 'verified':
            return Response({
                'status': result,
                'message': 'Your email is verified. You can now sign in.',
            }, status=status.HTTP_200_OK)
        if result == 'already_verified':
            return Response({
                'status': result,
                'message': 'This email address has already been verified. You can sign in.',
            }, status=status.HTTP_200_OK)
        if result == 'expired':
            return Response({
                'status': result,
                'error': 'This verification link has expired. Request a new one to continue.',
            }, status=status.HTTP_400_BAD_REQUEST)
        return Response({
            'status': 'invalid',
            'error': 'This verification link is invalid. Request a new one to continue.',
        }, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_protect, name='dispatch')
class ResendVerificationEmailView(APIView):
    """Resend an email-verification link without revealing account status."""

    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_resend'

    @extend_schema(
        tags=['Authentication'],
        summary='Resend an email-verification link',
        request=ResendVerificationSerializer,
        responses={
            202: OpenApiResponse(description='Request accepted without disclosing account status'),
            503: OpenApiResponse(description='Email provider did not accept the message'),
        },
    )
    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(
            email__iexact=serializer.validated_data['email'],
            role='STUDENT',
            is_verified=False,
            is_active=True,
        ).first()

        if user:
            try:
                send_verification_email(user)
            except VerificationCooldownError:
                pass
            except (VerificationEmailDeliveryError, ImproperlyConfigured):
                return Response({
                    'error': (
                        'The email provider could not accept the verification message. '
                        'Please try again later.'
                    ),
                    'status_code': status.HTTP_503_SERVICE_UNAVAILABLE,
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        return Response({
            'message': (
                'If this address belongs to an unverified account and the resend '
                'cooldown has elapsed, a verification message will be sent.'
            ),
            'cooldown_seconds': settings.EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS,
        }, status=status.HTTP_202_ACCEPTED)


@method_decorator(csrf_protect, name='dispatch')
class UserLoginView(APIView):
    """
    Login with email and password.
    Sets JWT session cookies.
    """
    
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
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
    authentication_classes = []

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
    authentication_classes = []

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

        try:
            refresh = RefreshToken(refresh_token)
        except TokenError:
            refresh = None
        if refresh is not None:
            user = User.objects.filter(
                pk=refresh.get(settings.SIMPLE_JWT['USER_ID_CLAIM'])
            ).first()
            if user and user.is_student and not user.is_verified:
                response = Response(
                    {'error': 'Please verify your email before signing in.'},
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
