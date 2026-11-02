"""
Views for Scholarship model.
"""

from rest_framework import viewsets, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .models import Scholarship
from .serializers import ScholarshipListSerializer, ScholarshipDetailSerializer
from apps.common.permissions import IsAdminOrReadOnly


class ScholarshipViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing and retrieving scholarships.
    
    Filtering options:
    - country: Filter by country
    - type: Filter by scholarship type (Full, Partial, etc.)
    - level: Filter by education level
    - status: Filter by status (OPEN, UPCOMING, CLOSED)
    - featured: Filter featured scholarships (true/false)
    - search: Search in name, provider, description
    """
    
    queryset = Scholarship.objects.all()
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['country', 'type', 'level', 'status', 'is_featured']
    search_fields = ['name', 'provider', 'description', 'country']
    ordering_fields = ['application_deadline', 'created_at', 'view_count']
    ordering = ['-is_featured', 'application_deadline']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ScholarshipDetailSerializer
        return ScholarshipListSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """Increment view count when scholarship is viewed."""
        instance = self.get_object()
        instance.increment_view_count()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @extend_schema(
        tags=['Scholarships'],
        summary='List scholarships',
        description='Get list of scholarships with filtering and search capabilities.',
        parameters=[
            OpenApiParameter(name='country', description='Filter by country', required=False, type=str),
            OpenApiParameter(name='type', description='Filter by type (Full, Partial, Merit, Need)', required=False, type=str),
            OpenApiParameter(name='level', description='Filter by level (Undergraduate, Graduate, etc.)', required=False, type=str),
            OpenApiParameter(name='status', description='Filter by status (OPEN, UPCOMING, CLOSED)', required=False, type=str),
            OpenApiParameter(name='is_featured', description='Filter featured scholarships', required=False, type=bool),
            OpenApiParameter(name='search', description='Search in name, provider, description', required=False, type=str),
            OpenApiParameter(name='ordering', description='Order by field (application_deadline, created_at, view_count)', required=False, type=str),
        ]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @extend_schema(
        tags=['Scholarships'],
        summary='Get scholarship details',
        description='Retrieve detailed information about a specific scholarship.',
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)


from rest_framework.response import Response
