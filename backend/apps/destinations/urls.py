"""
URL patterns for destinations.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DestinationViewSet

app_name = 'destinations'

router = DefaultRouter()
router.register(r'', DestinationViewSet, basename='destination')

urlpatterns = [
    path('', include(router.urls)),
]
