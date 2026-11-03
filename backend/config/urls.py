"""
URL configuration for GOFER EXAM project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/v1/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/v1/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/v1/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API v1 endpoints
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/applications/', include('apps.applications.urls')),
    path('api/v1/scholarships/', include('apps.scholarships.urls')),
    path('api/v1/services/', include('apps.services.urls')),
    path('api/v1/universities/', include('apps.universities.urls')),
    path('api/v1/destinations/', include('apps.destinations.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Customize admin site
admin.site.site_header = "GOFER EXAM Administration"
admin.site.site_title = "GOFER EXAM Admin"
admin.site.index_title = "Welcome to GOFER EXAM Admin Portal"
