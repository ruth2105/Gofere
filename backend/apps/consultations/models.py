"""
Consultation model for GOFER EXAM.
Student consultation bookings with consultants.
"""

import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Consultation(models.Model):
    """
    Consultation bookings between students and consultants.
    """
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending Confirmation'),
        ('CONFIRMED', 'Confirmed'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('NO_SHOW', 'No Show'),
    ]
    
    TYPE_CHOICES = [
        ('VIDEO', 'Video Call'),
        ('PHONE', 'Phone Call'),
        ('IN_PERSON', 'In Person'),
        ('CHAT', 'Chat'),
    ]
    
    # Primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Participants
    student = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='student_consultations',
        limit_choices_to={'role': 'STUDENT'}
    )
    consultant = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='consultant_consultations',
        limit_choices_to={'role': 'CONSULTANT'}
    )
    
    # Service (optional link to booked service)
    service = models.ForeignKey(
        'services.Service',
        on_delete=models.SET_NULL,
        related_name='consultations',
        null=True,
        blank=True
    )
    
    # Consultation Details
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='VIDEO')
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    
    # Scheduling
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField()
    duration_minutes = models.IntegerField(
        default=60,
        validators=[MinValueValidator(15), MaxValueValidator(480)]
    )
    timezone = models.CharField(max_length=100, default='UTC')
    
    # Meeting Details
    meeting_url = models.URLField(
        blank=True,
        help_text='Video call link (Zoom, Google Meet, etc.)'
    )
    meeting_id = models.CharField(max_length=200, blank=True)
    meeting_password = models.CharField(max_length=100, blank=True)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    
    # Payment (if applicable)
    is_paid = models.BooleanField(default=False)
    payment_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0)]
    )
    
    # Notes & Outcomes
    student_notes = models.TextField(
        blank=True,
        help_text='Student notes/questions for the consultation'
    )
    consultant_notes = models.TextField(
        blank=True,
        help_text='Consultant notes during/after consultation'
    )
    action_items = models.JSONField(
        default=list,
        help_text='List of action items discussed'
    )
    
    # Feedback & Rating
    student_rating = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    student_feedback = models.TextField(blank=True)
    
    # Reminders
    reminder_sent = models.BooleanField(default=False)
    reminder_sent_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'consultations'
        verbose_name = 'Consultation'
        verbose_name_plural = 'Consultations'
        ordering = ['-scheduled_date', '-scheduled_time']
        indexes = [
            models.Index(fields=['student']),
            models.Index(fields=['consultant']),
            models.Index(fields=['status']),
            models.Index(fields=['scheduled_date']),
            models.Index(fields=['is_paid']),
        ]
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.consultant.get_full_name()} ({self.scheduled_date})"
    
    @property
    def is_upcoming(self):
        """Check if consultation is upcoming."""
        from datetime import date
        return self.scheduled_date >= date.today() and self.status in ['PENDING', 'CONFIRMED']
    
    @property
    def is_past(self):
        """Check if consultation is in the past."""
        from datetime import date
        return self.scheduled_date < date.today()
    
    def mark_completed(self):
        """Mark consultation as completed."""
        from django.utils import timezone
        self.status = 'COMPLETED'
        self.completed_at = timezone.now()
        self.save()
