from django.utils import timezone
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        queryset = Notification.objects.filter(user=self.request.user)
        unread_filter = self.request.query_params.get('unread')
        if unread_filter is not None:
            if unread_filter.lower() not in ('true', 'false'):
                raise ValidationError({'unread': 'Use true or false.'})
            queryset = queryset.filter(is_read=unread_filter.lower() == 'false')
        return queryset

    @action(detail=True, methods=['post'])
    def read(self, request, pk=None):
        notification = self.get_object()
        notification.mark_as_read()
        return Response(self.get_serializer(notification).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='read-all')
    def read_all(self, request):
        now = timezone.now()
        updated_count = Notification.objects.filter(
            user=request.user,
            is_read=False,
        ).update(
            is_read=True,
            read_at=now,
        )
        return Response({'updated_count': updated_count}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'count': count}, status=status.HTTP_200_OK)
