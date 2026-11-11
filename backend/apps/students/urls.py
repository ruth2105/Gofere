"""
URL routes for GOFER EXAM student profiles.
"""

from django.urls import path

from .views import (
    CurrentStudentProfileView,
    StudentProfileCompletionView,
)

app_name = 'students'

urlpatterns = [
    path(
        'me/',
        CurrentStudentProfileView.as_view(),
        name='current_profile',
    ),
    path(
        'me/completion/',
        StudentProfileCompletionView.as_view(),
        name='profile_completion',
    ),
]