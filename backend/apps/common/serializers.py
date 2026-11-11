from rest_framework import serializers

from .models import Country


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = (
            'code',
            'name',
            'official_name',
            'alpha3_code',
            'flag_emoji',
            'region',
            'subregion',
        )
        read_only_fields = fields
