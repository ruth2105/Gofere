"""
Notification model for GOFER EXAM.
User notifications and alerts.
"""

import uuid
from django.db import models


class Notification(models.Model):
    """
    Notifications for users about important events and updates.
    """
    
    TYPE_CHOICES = [
        ('APPLICATION', 'Application Update'),
        ('CONSULTATION', 'Consultation Reminder'),
        ('DOCUMENT', 'Document Status'),
        ('MESSAGE', 'New Message'),
        ('DEADLINE', 'Deadline Reminder'),
        ('SCHOLARSHIP', 'New Scholarship'),
        ('SYSTEM', 'System Notification'),
        ('OTHER', 'Other'),
    ]
    
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('NORMAL', 'Normal'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    ]
    
    # Primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Recipient
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    
    # Notification Details
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='NORMAL')
    
    title = models.CharField(max_length=300)
    message = models.TextField()
    
    # Action Link (optional)
    action_url = models.CharField(
        max_length=500,
        blank=True,
        help_text='Relative URL for action (e.g., /applications/123)'
    )
    action_text = models.CharField(
        max_length=100,
        blank=True,
        help_text='Text for action button'
    )
    
    # Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Email Notification
    send_email = models.BooleanField(default=False)
    email_sent = models.BooleanField(default=False)
    email_sent_at = models.DateTimeField(null=True, blank=True)
    
    # Related Objects (optional)
    application = models.ForeignKey(
        'applications.Application',
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True,
        blank=True
    )
    consultation = models.ForeignKey(
        'consultations.Consultation',
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True,
        blank=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['type']),
            models.Index(fields=['priority']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"
    
    def mark_as_read(self):
        """Mark notification as read."""
        from django.utils import timezone
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()
    
    @classmethod
    def create_notification(cls, user, type, title, message, **kwargs):
        """Helper method to create a notification."""
        return cls.objects.create(
            user=user,
            type=type,
            title=title,
            message=message,
            **kwargs
        )
