"""
Views for Destination model.
"""

from rest_framework import viewsets, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework.response import Response

from .models import Destination
from .serializers import DestinationListSerializer, DestinationDetailSerializer


class DestinationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing and retrieving study destinations.
    """
    
    queryset = Destination.objects.all()
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_popular', 'is_featured', 'english_required', 'work_while_studying']
    search_fields = ['name', 'description', 'primary_language']
    ordering_fields = ['popularity_rank', 'average_tuition_fee', 'view_count']
    ordering = ['popularity_rank', 'name']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DestinationDetailSerializer
        return DestinationListSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """Increment view count when destination is viewed."""
        instance = self.get_object()
        instance.increment_view_count()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @extend_schema(
        tags=['Destinations'],
        summary='List study destinations',
        description='Get list of study abroad destinations.',
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @extend_schema(
        tags=['Destinations'],
        summary='Get destination details',
        description='Retrieve detailed information about a study destination.',
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
