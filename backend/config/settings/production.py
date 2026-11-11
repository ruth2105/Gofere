"""
Production settings for GOFER EXAM project.
"""

from .base import *
from decouple import config
from django.core.exceptions import ImproperlyConfigured
import environ
from urllib.parse import urlsplit

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

if (
    SECRET_KEY.startswith('django-insecure-')
    or len(SECRET_KEY) < 32
    or len(set(SECRET_KEY)) < 5
):
    raise ImproperlyConfigured('Set a strong SECRET_KEY of at least 32 characters in production.')

ALLOWED_HOSTS = [
    host for host in config('ALLOWED_HOSTS', default='').split(',') if host
]
if not ALLOWED_HOSTS:
    raise ImproperlyConfigured('Set ALLOWED_HOSTS in production.')

frontend_url = urlsplit(GOFER_FRONTEND_URL)
if frontend_url.scheme != 'https' or not frontend_url.netloc:
    raise ImproperlyConfigured('GOFER_FRONTEND_URL must be an absolute HTTPS URL in production.')

# Database
DATABASES = {'default': environ.Env().db_url('DATABASE_URL')}
DATABASES['default']['CONN_MAX_AGE'] = 600
DATABASES['default']['OPTIONS'] = {'sslmode': 'require'}

# CORS Settings for Production
CORS_ALLOWED_ORIGINS = [
    origin for origin in config('CORS_ALLOWED_ORIGINS', default='').split(',') if origin
]
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = [
    origin for origin in config('CSRF_TRUSTED_ORIGINS', default='').split(',') if origin
]

# Security Settings
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Email Configuration for Production
EMAIL_BACKEND = config(
    'EMAIL_BACKEND',
    default='django.core.mail.backends.smtp.EmailBackend',
)
if (
    EMAIL_BACKEND == 'django.core.mail.backends.console.EmailBackend'
    or not DEFAULT_FROM_EMAIL
    or DEFAULT_FROM_EMAIL == 'webmaster@localhost'
):
    raise ImproperlyConfigured(
        'Configure a production email backend and GOFER_EMAIL_FROM.'
    )
if EMAIL_BACKEND == 'django.core.mail.backends.smtp.EmailBackend':
    if not EMAIL_HOST:
        raise ImproperlyConfigured(
            'Set EMAIL_HOST to configure production email delivery.'
        )
    if EMAIL_USE_TLS and EMAIL_USE_SSL:
        raise ImproperlyConfigured('EMAIL_USE_TLS and EMAIL_USE_SSL cannot both be enabled.')

# Static files (AWS S3 or similar)
# Uncomment and configure when ready to use cloud storage
# STATICFILES_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
# DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
# AWS_ACCESS_KEY_ID = config('AWS_ACCESS_KEY_ID')
# AWS_SECRET_ACCESS_KEY = config('AWS_SECRET_ACCESS_KEY')
# AWS_STORAGE_BUCKET_NAME = config('AWS_STORAGE_BUCKET_NAME')
# AWS_S3_REGION_NAME = config('AWS_S3_REGION_NAME', default='us-east-1')
