from rest_framework import permissions, viewsets

from .models import Country
from .serializers import CountrySerializer


class CountryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CountrySerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = None
    queryset = Country.objects.filter(is_active=True)
    search_fields = ('code', 'name', 'official_name', 'alpha3_code')
    ordering_fields = ('code', 'name')
    ordering = ('name',)
