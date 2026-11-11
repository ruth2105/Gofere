"""
Views for Scholarship model.
"""

from rest_framework import viewsets, filters, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter

from apps.students.views import get_student_profile
from .models import Scholarship
from .serializers import ScholarshipListSerializer, ScholarshipDetailSerializer
from .services.matching import (
    evaluate_scholarship,
    get_current_scholarships,
    get_public_scholarships,
)


class ScholarshipViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing and retrieving scholarships.

    Filtering options:
    - country: Filter by country
    - type: Filter by scholarship type
    - level: Filter by education level
    - status: Filter by status
    - featured: Filter featured scholarships
    - search: Search in name, provider, description
    """

    permission_classes = [permissions.AllowAny]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        'country',
        'type',
        'level',
        'status',
        'is_featured',
    ]

    search_fields = [
        'name',
        'provider',
        'description',
        'country',
    ]

    ordering_fields = [
        'application_deadline',
        'created_at',
        'view_count',
    ]

    ordering = ['-is_featured', 'application_deadline']
    lookup_field = 'slug'

    def get_queryset(self):
        return get_public_scholarships()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ScholarshipDetailSerializer
        return ScholarshipListSerializer

    @extend_schema(
        tags=['Scholarships'],
        summary='Get scholarship details',
        description='Retrieve detailed information about a specific published scholarship.',
    )
    def retrieve(self, request, *args, **kwargs):
        """Increment view count when a scholarship is viewed."""
        instance = self.get_object()
        instance.increment_view_count()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @extend_schema(
        tags=['Scholarships'],
        summary='List scholarships',
        description='Get list of scholarships with filtering and search capabilities.',
        parameters=[
            OpenApiParameter(
                name='country',
                description='Filter by country',
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name='type',
                description='Filter by scholarship type',
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name='level',
                description='Filter by education level',
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name='status',
                description='Filter by status (OPEN, UPCOMING, CLOSED)',
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name='is_featured',
                description='Filter featured scholarships',
                required=False,
                type=bool,
            ),
            OpenApiParameter(
                name='search',
                description='Search in name, provider, description',
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name='ordering',
                description='Order by application_deadline, created_at, or view_count',
                required=False,
                type=str,
            ),
        ],
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class EligibleScholarshipsView(APIView):
    """Return current scholarships with personalized eligibility results."""

    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Get scholarships matched to the current student",
        description=(
            "Evaluates structured nationality, degree level, GPA, and "
            "field-of-study requirements. Missing or unconfirmed information "
            "is reported separately."
        ),
        responses={200: dict},
    )
    def get(self, request, *args, **kwargs):
        profile = get_student_profile(request.user)
        scholarships = get_current_scholarships()
        results = []
        for scholarship in scholarships:
            match = evaluate_scholarship(profile, scholarship)
            scholarship_data = ScholarshipDetailSerializer(
                scholarship,
                context={"request": request},
            ).data
            results.append({
                "scholarship": scholarship_data,
                "match": match,
            })
        return Response({
            "count": len(results),
            "results": results,
        })