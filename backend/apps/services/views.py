"""
Public read-only API for active services.
"""

from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework import filters, permissions, viewsets

from .models import Service
from .serializers import ServiceSerializer


class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    """List and retrieve active services without exposing provider accounts."""

    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ['category', 'is_featured']
    search_fields = ['title', 'short_description', 'description']
    ordering_fields = ['title', 'price', 'created_at']
    ordering = ['-is_featured', 'category', 'title']
    lookup_field = 'slug'

    @extend_schema(
        tags=['Services'],
        summary='List active services',
        description='Get the public catalogue of active services.',
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['Services'],
        summary='Get service details',
        description='Retrieve an active service by its slug.',
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
