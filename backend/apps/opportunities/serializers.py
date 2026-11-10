from rest_framework import serializers

from .models import Opportunity


class OpportunitySerializer(serializers.ModelSerializer):
    eligibility = serializers.ListField(
        child=serializers.CharField(),
        required=False,
    )
    benefits = serializers.ListField(
        child=serializers.CharField(),
        required=False,
    )

    class Meta:
        model = Opportunity
        fields = (
            'id',
            'title',
            'slug',
            'short_description',
            'description',
            'organization',
            'country',
            'category',
            'level',
            'eligibility',
            'benefits',
            'application_deadline',
            'application_url',
            'official_website',
            'status',
            'is_published',
            'is_featured',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'slug', 'created_at', 'updated_at')
