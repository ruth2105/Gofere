"""
URL patterns for scholarships.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EligibleScholarshipsView, ScholarshipViewSet

app_name = 'scholarships'

router = DefaultRouter()
router.register(r'', ScholarshipViewSet, basename='scholarship')

urlpatterns = [
    path(
        'eligible-for-me/',
        EligibleScholarshipsView.as_view(),
        name='eligible-for-me',
    ),
    path('', include(router.urls)),
]
