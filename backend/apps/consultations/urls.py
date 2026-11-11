from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ConsultantAssignedConsultationsView,
    ConsultantConsultationActionView,
    ConsultantDirectoryView,
    StudentConsultationViewSet,
)

app_name = 'consultations'

router = DefaultRouter()
router.register(r'', StudentConsultationViewSet, basename='consultation')

urlpatterns = [
    path('consultants/', ConsultantDirectoryView.as_view(), name='consultant-directory'),
    path('consultant/assigned/', ConsultantAssignedConsultationsView.as_view(), name='consultant-assigned'),
    path(
        'consultant/assigned/<uuid:consultation_id>/<str:action_name>/',
        ConsultantConsultationActionView.as_view(),
        name='consultant-consultation-action',
    ),
    path('', include(router.urls)),
]
