"""Email-verification token lifecycle and transactional email delivery."""

import hashlib
import logging
import secrets
from datetime import timedelta
from urllib.parse import urlencode

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.db import transaction
from django.template.loader import render_to_string
from django.utils import timezone

from .models import EmailVerificationToken, User

logger = logging.getLogger(__name__)


class VerificationCooldownError(Exception):
    """Raised when a verification email was sent too recently."""


class VerificationEmailDeliveryError(Exception):
    """Raised when the configured email backend does not accept a message."""


def _token_digest(token):
    return hashlib.sha256(token.encode('utf-8')).hexdigest()


@transaction.atomic
def send_verification_email(user):
    """Rotate the user's verification token and send it through Django's backend."""
    now = timezone.now()
    User.objects.select_for_update().get(pk=user.pk)
    verification = (
        EmailVerificationToken.objects.select_for_update()
        .filter(user=user)
        .first()
    )

    cooldown = timedelta(seconds=settings.EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS)
    if verification and verification.last_sent_at > now - cooldown:
        raise VerificationCooldownError

    token = secrets.token_urlsafe(32)
    if verification is None:
        verification = EmailVerificationToken(user=user)
    verification.token_hash = _token_digest(token)
    verification.created_at = now
    verification.expires_at = now + timedelta(
        minutes=settings.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES
    )
    verification.last_sent_at = now
    verification.used_at = None
    verification.save()

    query = urlencode({'token': token})
    verification_url = (
        f'{settings.GOFER_FRONTEND_URL.rstrip("/")}/student/verify-email?{query}'
    )
    context = {
        'first_name': user.first_name or 'there',
        'verification_url': verification_url,
        'expiration_minutes': settings.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES,
    }

    try:
        message = EmailMultiAlternatives(
            subject='Verify your GOFER EXAM email',
            body=render_to_string(
                'accounts/email_verification.txt',
                context,
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )
        message.attach_alternative(
            render_to_string('accounts/email_verification.html', context),
            'text/html',
        )
        accepted_count = message.send(fail_silently=False)
        if accepted_count != 1:
            raise VerificationEmailDeliveryError
    except Exception as error:
        logger.error(
            'Verification email delivery failed for user_id=%s exception_type=%s',
            user.pk,
            type(error).__name__,
        )
        raise VerificationEmailDeliveryError from None

    logger.info('Verification email accepted by backend for user_id=%s', user.pk)
    return verification


@transaction.atomic
def verify_email_token(token):
    """Verify the token owner, returning a safe status without exposing the token."""
    token_hash = _token_digest(token)
    verification = (
        EmailVerificationToken.objects.select_for_update()
        .select_related('user')
        .filter(token_hash=token_hash)
        .first()
    )

    if verification is None:
        return 'invalid'

    if verification.user.is_verified or verification.used_at:
        return 'already_verified'

    if verification.expires_at <= timezone.now():
        return 'expired'

    verification.user.is_verified = True
    verification.user.save(update_fields=['is_verified', 'updated_at'])
    verification.used_at = timezone.now()
    verification.save(update_fields=['used_at'])
    return 'verified'
