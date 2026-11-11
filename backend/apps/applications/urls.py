from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminOverviewView,
    ApplicationViewSet,
    ConsultantAssignedApplicationsView,
    ConsultantStartApplicationReviewView,
)

app_name = 'applications'

router = DefaultRouter()
router.register(r'', ApplicationViewSet, basename='application')

urlpatterns = [
    path('admin/overview/', AdminOverviewView.as_view(), name='admin-overview'),
    path('consultant/assigned/', ConsultantAssignedApplicationsView.as_view(), name='consultant-assigned'),
    path(
        'consultant/assigned/<uuid:application_id>/start-review/',
        ConsultantStartApplicationReviewView.as_view(),
        name='consultant-start-application-review',
    ),
    path('', include(router.urls)),
]
