
"""
Views for GOFER EXAM student profiles.
"""

from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from drf_spectacular.utils import extend_schema

from .serializers import (
    StudentProfileSerializer,
    StudentProfileCompletionSerializer,
)


def get_student_profile(user):
    """Get or create the authenticated student's profile."""

    if user.role != 'STUDENT':
        raise PermissionDenied(
            'Only student accounts can access student profiles.'
        )

    from .models import StudentProfile

    profile, _ = StudentProfile.objects.get_or_create(user=user)

    return profile


class CurrentStudentProfileView(generics.RetrieveUpdateAPIView):
    """Retrieve or partially update the current student's profile."""

    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    http_method_names = ['get', 'patch', 'head', 'options']

    def get_object(self):
        return get_student_profile(self.request.user)

    @extend_schema(
        summary='Get current student profile',
        responses={200: StudentProfileSerializer},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary='Update current student profile',
        request=StudentProfileSerializer,
        responses={200: StudentProfileSerializer},
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)


class StudentProfileCompletionView(generics.GenericAPIView):
    """Return the current student's profile completion."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = StudentProfileCompletionSerializer

    @extend_schema(
        summary='Get student profile completion',
        responses={200: StudentProfileCompletionSerializer},
    )
    def get(self, request, *args, **kwargs):
        profile = get_student_profile(request.user)

        details = profile.get_profile_completion_details()

        serializer = self.get_serializer(data=details)
        serializer.is_valid(raise_exception=True)

        return Response(serializer.data)
