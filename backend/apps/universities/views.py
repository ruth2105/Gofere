"""
Views for University model.
"""

from rest_framework import viewsets, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework.response import Response

from .models import University
from .serializers import UniversityListSerializer, UniversityDetailSerializer


class UniversityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing and retrieving universities.
    
    Filtering options:
    - country: Filter by country
    - city: Filter by city
    - type: Filter by university type
    - is_featured: Filter featured universities
    - is_partner: Filter partner universities
    - search: Search in name, city, country
    """
    
    queryset = University.objects.all()
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['country', 'city', 'type', 'is_featured', 'is_partner']
    search_fields = ['name', 'city', 'country', 'description']
    ordering_fields = ['world_ranking', 'national_ranking', 'created_at', 'view_count']
    ordering = ['world_ranking', 'name']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UniversityDetailSerializer
        return UniversityListSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """Increment view count when university is viewed."""
        instance = self.get_object()
        instance.increment_view_count()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @extend_schema(
        tags=['Universities'],
        summary='List universities',
        description='Get list of universities with filtering and search capabilities.',
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @extend_schema(
        tags=['Universities'],
        summary='Get university details',
        description='Retrieve detailed information about a specific university.',
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
