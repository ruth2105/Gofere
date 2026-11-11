
from django.contrib import admin, messages
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from .models import (
    CollectionRun,
    Opportunity,
    OpportunitySource,
    OpportunitySourceRecord,
)


@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'organization',
        'category',
        'country',
        'status',
        'application_deadline',
        'is_published',
        'is_featured',
    )

    list_filter = (
        'is_published',
        'category',
        'status',
        'country',
        'level',
        'is_featured',
    )

    search_fields = (
        'title',
        'organization',
        'country',
        'description',
    )

    readonly_fields = (
        'id',
        'slug',
        'created_at',
        'updated_at',
    )

    fieldsets = (
        ('Opportunity', {
            'fields': (
                'title',
                'slug',
                'short_description',
                'description',
                'organization',
                'country',
                'category',
                'level',
            )
        }),
        ('Eligibility and benefits', {
            'fields': (
                'eligibility',
                'benefits',
            )
        }),
        ('Application', {
            'fields': (
                'application_deadline',
                'application_url',
                'official_website',
                'status',
            )
        }),
        ('Publication', {
            'fields': (
                'is_published',
                'is_featured',
            )
        }),
        ('Timestamps', {
            'fields': (
                'id',
                'created_at',
                'updated_at',
            )
        }),
    )

    actions = (
        'publish_selected',
        'unpublish_selected',
    )

    @admin.action(description='Publish selected opportunities')
    def publish_selected(self, request, queryset):
        published = 0
        errors = []

        for opportunity in queryset:
            opportunity.is_published = True

            try:
                opportunity.save()
            except ValidationError as error:
                errors.append(
                    f'{opportunity.title}: {error}'
                )
            else:
                published += 1

        if published:
            self.message_user(
                request,
                f'{published} opportunity record(s) published.',
                level=messages.SUCCESS,
            )

        if errors:
            self.message_user(
                request,
                'Some opportunities could not be published: '
                + '; '.join(errors),
                level=messages.ERROR,
            )

    @admin.action(description='Unpublish selected opportunities')
    def unpublish_selected(self, request, queryset):
        updated = queryset.update(is_published=False)

        self.message_user(
            request,
            f'{updated} opportunity record(s) unpublished.',
            level=messages.SUCCESS,
        )


@admin.register(OpportunitySource)
class OpportunitySourceAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'organization',
        'source_type',
        'collection_method',
        'is_active',
        'reliability_status',
        'last_success_at',
        'updated_at',
    )

    list_filter = (
        'is_active',
        'source_type',
        'collection_method',
        'reliability_status',
    )

    search_fields = (
        'name',
        'organization',
        'base_url',
    )

    readonly_fields = (
        'last_success_at',
        'last_failure_at',
        'last_error_code',
        'last_error_message',
        'created_at',
        'updated_at',
    )

    date_hierarchy = 'updated_at'


@admin.register(CollectionRun)
class CollectionRunAdmin(admin.ModelAdmin):
    list_display = (
        'source',
        'status',
        'trigger_type',
        'started_at',
        'finished_at',
        'records_seen',
        'records_created',
        'records_updated',
        'error_count',
    )

    list_filter = (
        'status',
        'trigger_type',
        'source',
    )

    search_fields = (
        'source__name',
        'source__organization',
        'collector_version',
    )

    readonly_fields = (
        'source',
        'trigger_type',
        'status',
        'started_at',
        'finished_at',
        'records_seen',
        'records_created',
        'records_updated',
        'records_unchanged',
        'records_flagged_duplicate',
        'records_rejected',
        'error_count',
        'error_summary',
        'collector_version',
        'request_metadata',
    )

    date_hierarchy = 'started_at'


@admin.register(OpportunitySourceRecord)
class OpportunitySourceRecordAdmin(admin.ModelAdmin):
    list_display = (
        'source_title',
        'source',
        'scholarship',
        'opportunity',
        'source_status',
        'verification_status',
        'last_seen_at',
    )

    list_filter = (
        'source_status',
        'verification_status',
        'source',
    )

    search_fields = (
        'source_title',
        'normalized_title',
        'source_record_key',
        'official_source_url',
    )

    readonly_fields = (
        'source',
        'collection_run',
        'source_record_key',
        'official_source_url',
        'official_application_url',
        'source_title',
        'normalized_title',
        'normalized_organization',
        'normalized_deadline',
        'eligibility_scope',
        'eligible_nationalities',
        'excluded_nationalities',
        'eligibility_notes',
        'source_payload',
        'content_hash',
        'identity_fingerprint',
        'similarity_fingerprint',
        'source_status',
        'verification_status',
        'last_seen_at',
        'last_changed_at',
        'verified_at',
        'verified_by',
        'created_at',
        'updated_at',
    )

    date_hierarchy = 'last_seen_at'

    actions = (
        'mark_selected_verified',
        'mark_selected_needs_review',
        'reject_selected',
    )

    @admin.action(description='Verify selected records')
    def mark_selected_verified(self, request, queryset):
        verified = 0
        errors = []

        records = queryset.select_related(
            'opportunity',
            'scholarship',
        )

        for record in records:
            record.verification_status = 'VERIFIED'
            record.verified_at = timezone.now()
            record.verified_by = request.user

            try:
                with transaction.atomic():
                    record.save()
            except ValidationError as error:
                errors.append(
                    f'{record.source_title}: {error}'
                )
            else:
                verified += 1

        if verified:
            self.message_user(
                request,
                f'{verified} source record(s) verified.',
                level=messages.SUCCESS,
            )

        if errors:
            self.message_user(
                request,
                'Some source records could not be verified: '
                + '; '.join(errors),
                level=messages.ERROR,
            )

    @admin.action(description='Mark selected records as needing review')
    def mark_selected_needs_review(self, request, queryset):
        self._set_verification_status(
            request,
            queryset,
            'NEEDS_REVIEW',
            'marked as needing review',
        )

    @admin.action(description='Reject selected records')
    def reject_selected(self, request, queryset):
        self._set_verification_status(
            request,
            queryset,
            'REJECTED',
            'rejected',
        )

    def _set_verification_status(
        self,
        request,
        queryset,
        status,
        description,
    ):
        updated = 0
        errors = []

        records = queryset.select_related('opportunity')

        for record in records:
            record.verification_status = status
            record.verified_at = None
            record.verified_by = None

            try:
                with transaction.atomic():
                    if (
                        record.opportunity_id
                        and record.opportunity.is_published
                    ):
                        record.opportunity.is_published = False
                        record.opportunity.save()

                    record.save()

            except ValidationError as error:
                errors.append(
                    f'{record.source_title}: {error}'
                )
            else:
                updated += 1

        if updated:
            self.message_user(
                request,
                f'{updated} source record(s) {description}.',
                level=messages.SUCCESS,
            )

        if errors:
            self.message_user(
                request,
                'Some source records could not be updated: '
                + '; '.join(errors),
                level=messages.ERROR,
            )
