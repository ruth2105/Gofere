from django.utils import timezone
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from apps.common.permissions import IsStudent
from .models import Application
from .serializers import ApplicationSerializer


class ApplicationViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    http_method_names = ['get', 'post', 'put', 'patch', 'head', 'options']

    def get_queryset(self):
        return (
            Application.objects
            .filter(student=self.request.user)
            .select_related('university', 'scholarship')
        )

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.status != 'DRAFT':
            raise PermissionDenied('Only draft applications can be edited.')
        serializer.save()

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        application = self.get_object()
        if application.status != 'DRAFT':
            raise ValidationError({'status': 'Only draft applications can be marked as submitted.'})

        application.submission_date = timezone.now()
        application.add_status_update('SUBMITTED', 'Marked as submitted by the student.')
        return Response(self.get_serializer(application).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def withdraw(self, request, pk=None):
        application = self.get_object()
        if application.status != 'SUBMITTED':
            raise ValidationError({'status': 'Only submitted applications can be withdrawn.'})

        application.add_status_update('WITHDRAWN', 'Withdrawn by the student.')
        return Response(self.get_serializer(application).data, status=status.HTTP_200_OK)
