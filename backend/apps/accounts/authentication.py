from django.conf import settings
from rest_framework.authentication import CSRFCheck
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied
from rest_framework.permissions import SAFE_METHODS
from rest_framework_simplejwt.authentication import JWTAuthentication


class CookieJWTAuthentication(JWTAuthentication):
    """Authenticate browser sessions from HttpOnly cookies and enforce CSRF."""

    def authenticate(self, request):
        raw_token = request.COOKIES.get(settings.AUTH_ACCESS_COOKIE_NAME)
        if raw_token is None:
            authenticated = super().authenticate(request)
            if authenticated:
                self.require_verified_student(authenticated[0])
            return authenticated

        validated_token = self.get_validated_token(raw_token)
        if request.method not in SAFE_METHODS:
            self.enforce_csrf(request)

        user = self.get_user(validated_token)
        self.require_verified_student(user)
        return user, validated_token

    @staticmethod
    def require_verified_student(user):
        if user.is_student and not user.is_verified:
            raise AuthenticationFailed(
                'Please verify your email before using your account.'
            )

    @staticmethod
    def enforce_csrf(request):
        django_request = request._request
        check = CSRFCheck(lambda req: None)
        check.process_request(django_request)
        reason = check.process_view(django_request, None, (), {})
        if reason:
            raise PermissionDenied(f'CSRF Failed: {reason}')
