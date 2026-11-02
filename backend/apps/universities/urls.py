"""
URL patterns for universities.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UniversityViewSet

app_name = 'universities'

router = DefaultRouter()
router.register(r'', UniversityViewSet, basename='university')

urlpatterns = [
    path('', include(router.urls)),
]
