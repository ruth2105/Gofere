from django.db.models import Exists, OuterRef
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework import filters, permissions, viewsets

from apps.common.permissions import IsAdminUser

from .models import Opportunity, OpportunitySourceRecord
from .serializers import OpportunitySerializer


class OpportunityViewSet(viewsets.ModelViewSet):
    serializer_class = OpportunitySerializer
    lookup_field = 'slug'
    filter_backends = (
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    )
    filterset_fields = (
        'category',
        'country',
        'level',
        'status',
        'is_featured',
    )
    search_fields = (
        'title',
        'organization',
        'description',
        'country',
    )
    ordering_fields = ('application_deadline', 'created_at')
    ordering = ('application_deadline', '-created_at')

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsAdminUser()]

    def get_queryset(self):
        queryset = Opportunity.objects.all()
        user = self.request.user
        if user.is_authenticated and user.is_admin:
            return queryset

        invalid_source_records = OpportunitySourceRecord.objects.filter(
            opportunity_id=OuterRef('pk'),
        ).exclude(
            verification_status='VERIFIED',
            source_status='AVAILABLE',
            verified_at__isnull=False,
            verified_by__isnull=False,
        )
        return queryset.filter(is_published=True).filter(
            ~Exists(invalid_source_records)
        )

    @extend_schema(
        tags=['Opportunities'],
        summary='List published opportunities',
        description=(
            'Lists only published opportunities. Search by title, organization, '
            'description, or country; filter by category, country, level, status, '
            'and featured status.'
        ),
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['Opportunities'],
        summary='Get an opportunity',
        description='Retrieve a published opportunity by its slug.',
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
