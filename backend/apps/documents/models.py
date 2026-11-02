"""
Document model for GOFER EXAM.
Student document uploads and management.
"""

import uuid
import os
from django.db import models
from django.core.validators import FileExtensionValidator


def user_document_path(instance, filename):
    """Generate upload path for user documents."""
    # Upload to: documents/<user_id>/<document_type>/<filename>
    return f'documents/{instance.user.id}/{instance.document_type}/{filename}'


class Document(models.Model):
    """
    Document uploads for applications and consultations.
    """
    
    TYPE_CHOICES = [
        ('PASSPORT', 'Passport'),
        ('TRANSCRIPT', 'Academic Transcript'),
        ('DIPLOMA', 'Diploma/Certificate'),
        ('RECOMMENDATION', 'Letter of Recommendation'),
        ('PERSONAL_STATEMENT', 'Personal Statement'),
        ('CV', 'Curriculum Vitae'),
        ('FINANCIAL', 'Financial Document'),
        ('TEST_SCORE', 'Test Score (IELTS/TOEFL/etc.)'),
        ('PHOTO', 'Photograph'),
        ('OTHER', 'Other Document'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('EXPIRED', 'Expired'),
    ]
    
    # Primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Owner
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='documents'
    )
    
    # Document Details
    document_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    
    # File Upload
    file = models.FileField(
        upload_to=user_document_path,
        validators=[FileExtensionValidator(
            allowed_extensions=['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
        )]
    )
    file_size = models.IntegerField(
        default=0,
        help_text='File size in bytes'
    )
    file_extension = models.CharField(max_length=10, blank=True)
    
    # Related Objects (optional)
    application = models.ForeignKey(
        'applications.Application',
        on_delete=models.CASCADE,
        related_name='documents',
        null=True,
        blank=True
    )
    consultation = models.ForeignKey(
        'consultations.Consultation',
        on_delete=models.CASCADE,
        related_name='documents',
        null=True,
        blank=True
    )
    
    # Status & Verification
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    verified_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        related_name='verified_documents',
        null=True,
        blank=True,
        limit_choices_to={'role__in': ['ADMIN', 'SUPERADMIN', 'CONSULTANT']}
    )
    verification_notes = models.TextField(blank=True)
    
    # Expiry (for documents like passports, test scores)
    expiry_date = models.DateField(null=True, blank=True)
    
    # Security & Access
    is_confidential = models.BooleanField(
        default=False,
        help_text='Restrict access to owner and assigned consultant/admin only'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'documents'
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['document_type']),
            models.Index(fields=['status']),
            models.Index(fields=['application']),
            models.Index(fields=['consultation']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"
    
    def save(self, *args, **kwargs):
        """Set file size and extension on save."""
        if self.file:
            self.file_size = self.file.size
            self.file_extension = os.path.splitext(self.file.name)[1].lower()
        
        super().save(*args, **kwargs)
    
    @property
    def is_expired(self):
        """Check if document is expired."""
        if self.expiry_date:
            from datetime import date
            return self.expiry_date < date.today()
        return False
    
    @property
    def file_size_mb(self):
        """Get file size in MB."""
        return round(self.file_size / (1024 * 1024), 2)
    
    def delete(self, *args, **kwargs):
        """Delete file from storage when model is deleted."""
        if self.file:
            self.file.delete(save=False)
        super().delete(*args, **kwargs)
