"""
Application model for GOFER EXAM.
Student applications to universities and scholarships.
"""

import uuid
from django.db import models
from django.core.validators import URLValidator


class Application(models.Model):
    """
    Student applications to universities/scholarships.
    """
    
    TYPE_CHOICES = [
        ('UNIVERSITY', 'University Application'),
        ('SCHOLARSHIP', 'Scholarship Application'),
    ]
    
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('UNDER_REVIEW', 'Under Review'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
        ('WAITLISTED', 'Waitlisted'),
        ('WITHDRAWN', 'Withdrawn'),
    ]
    
    # Primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Student
    student = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='applications',
        limit_choices_to={'role': 'STUDENT'}
    )
    
    # Application Type & Target
    application_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    
    # University Application
    university = models.ForeignKey(
        'universities.University',
        on_delete=models.SET_NULL,
        related_name='applications',
        null=True,
        blank=True
    )
    program_name = models.CharField(max_length=300, blank=True)
    degree_level = models.CharField(max_length=100, blank=True)
    
    # Scholarship Application
    scholarship = models.ForeignKey(
        'scholarships.Scholarship',
        on_delete=models.SET_NULL,
        related_name='applications',
        null=True,
        blank=True
    )
    
    # Application Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='DRAFT'
    )
    
    # Important Dates
    submission_date = models.DateTimeField(null=True, blank=True)
    deadline_date = models.DateField(null=True, blank=True)
    decision_date = models.DateField(null=True, blank=True)
    
    # Application Details
    application_id = models.CharField(
        max_length=100,
        blank=True,
        help_text='University/Scholarship application reference ID'
    )
    application_url = models.URLField(
        blank=True,
        validators=[URLValidator()],
        help_text='Link to online application portal'
    )
    
    # Consultant Support
    consultant = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        related_name='assisted_applications',
        null=True,
        blank=True,
        limit_choices_to={'role': 'CONSULTANT'}
    )
    
    # Notes & Updates
    notes = models.TextField(blank=True)
    admin_notes = models.TextField(
        blank=True,
        help_text='Internal notes (visible only to admins and consultant)'
    )
    status_updates = models.JSONField(
        default=list,
        help_text='Timeline of status changes'
    )
    
    # Notifications
    email_notifications = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'applications'
        verbose_name = 'Application'
        verbose_name_plural = 'Applications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student']),
            models.Index(fields=['status']),
            models.Index(fields=['application_type']),
            models.Index(fields=['university']),
            models.Index(fields=['scholarship']),
            models.Index(fields=['consultant']),
            models.Index(fields=['deadline_date']),
        ]
    
    def __str__(self):
        target = self.university or self.scholarship
        return f"{self.student.email} - {target} ({self.status})"
    
    def add_status_update(self, status, note=''):
        """Add a status change to the timeline."""
        from django.utils import timezone
        
        update = {
            'status': status,
            'note': note,
            'timestamp': timezone.now().isoformat()
        }
        
        if not self.status_updates:
            self.status_updates = []
        
        self.status_updates.append(update)
        self.status = status
        self.save()
