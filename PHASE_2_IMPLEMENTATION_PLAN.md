# GOFER EXAM — PHASE 2 IMPLEMENTATION PLAN
## Step-by-Step Execution Guide

**Status:** Ready for Implementation
**Approval:** Architecture Reviewed ✅
**Timeline:** 10-12 weeks

---

## IMPLEMENTATION STATUS TRACKER

### ✅ COMPLETED
- [x] Phase 1 Audit
- [x] Architecture Design
- [x] Database Schema Design
- [x] API Specification
- [x] Security Planning

### 🔄 IN PROGRESS
- [ ] Backend Project Setup
- [ ] Django Configuration
- [ ] Database Setup
- [ ] Model Creation
- [ ] API Development

### 📋 PENDING
- [ ] Frontend Integration
- [ ] Testing
- [ ] Documentation
- [ ] Deployment Preparation

---

## STEP 3: BACKEND FOUNDATION

### 3.1 Create Backend Directory

**Goal:** Set up clean Django project structure

**Actions:**
1. Create `backend/` directory
2. Set up Python virtual environment
3. Install Django and dependencies
4. Initialize Django project
5. Create Django apps

**Commands:**
```bash
# Navigate to project root
cd c:/Users/user/Desktop/abc/gofer-exam

# Create backend directory
mkdir backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Install core dependencies
pip install django==5.0
pip install djangorestframework==3.14.0
pip install djangorestframework-simplejwt==5.3.1
pip install psycopg2-binary==2.9.9
pip install django-cors-headers==4.3.1
pip install python-decouple==3.8
pip install drf-spectacular==0.27.0
pip install pillow==10.1.0

# Create requirements file
pip freeze > requirements.txt

# Create Django project
django-admin startproject config .

# Create Django apps
python manage.py startapp accounts
python manage.py startapp students  
python manage.py startapp consultants
python manage.py startapp scholarships
python manage.py startapp universities
python manage.py startapp destinations
python manage.py startapp services
python manage.py startapp applications
python manage.py startapp consultations
python manage.py startapp documents
python manage.py startapp notifications
python manage.py startapp common
```

### 3.2 Configure Django Settings

**File:** `backend/config/settings/base.py`

**Key Configurations:**
- Split settings (base, development, production)
- Configure INSTALLED_APPS
- Configure MIDDLEWARE
- Configure REST_FRAMEWORK
- Configure SIMPLE_JWT
- Configure CORS
- Configure database
- Configure static/media files

### 3.3 Create Custom User Model

**File:** `backend/apps/accounts/models.py`

```python
from django.contrib.auth.models.AbstractUser import AbstractUser
from django.db import models
import uuid

class User(AbstractUser):
    """Custom user model with email as primary identifier"""
    
    ROLE_CHOICES = [
        ('STUDENT', 'Student'),
        ('CONSULTANT', 'Consultant'),
        ('ADMIN', 'Administrator'),
        ('SUPERADMIN', 'Super Administrator'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.email
```

### 3.4 Configure PostgreSQL

**Actions:**
1. Create PostgreSQL database
2. Create database user
3. Configure `.env` file
4. Update settings to use environment variables

**Database Setup:**
```sql
-- Create database
CREATE DATABASE gofer_exam_db;

-- Create user
CREATE USER gofer_exam_user WITH PASSWORD 'secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE gofer_exam_db TO gofer_exam_user;
ALTER DATABASE gofer_exam_db OWNER TO gofer_exam_user;
```

**Environment File (`.env`):**
```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=gofer_exam_db
DB_USER=gofer_exam_user
DB_PASSWORD=secure_password_here
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000

# JWT
ACCESS_TOKEN_LIFETIME_MINUTES=15
REFRESH_TOKEN_LIFETIME_DAYS=7
```

### 3.5 Run Initial Migrations

```bash
# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### 3.6 Test Django Admin

```bash
# Run development server
python manage.py runserver

# Access admin at http://localhost:8000/admin
```

---

## STEP 4: AUTHENTICATION SYSTEM

### 4.1 Create Authentication Views

**File:** `backend/apps/accounts/views.py`

**Endpoints to Implement:**
- POST `/api/v1/auth/register/` - User registration
- POST `/api/v1/auth/login/` - User login (returns JWT)
- POST `/api/v1/auth/token/refresh/` - Refresh access token
- POST `/api/v1/auth/logout/` - Logout (blacklist token)
- GET `/api/v1/auth/me/` - Get current user info

### 4.2 Create Serializers

**File:** `backend/apps/accounts/serializers.py`

- `UserRegistrationSerializer`
- `UserLoginSerializer`
- `UserSerializer`
- `TokenRefreshSerializer`

### 4.3 Configure JWT Authentication

**Add to settings:**
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
}
```

### 4.4 Create URL Configuration

**File:** `backend/apps/accounts/urls.py`

```python
from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    UserProfileView,
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserProfileView.as_view(), name='user_profile'),
]
```

### 4.5 Test Authentication

```bash
# Test registration
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#","name":"Test User"}'

# Test login
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'
```

---

## STEP 5: CORE DATA MODELS

### 5.1 Scholarship Model

**File:** `backend/apps/scholarships/models.py`

**Fields:**
- id (UUID)
- title
- provider
- country
- amount
- type (choices)
- eligibility (JSONField)
- deadline (DateField)
- description
- level (choices)
- fields (JSONField)
- application_link
- featured (Boolean)
- published (Boolean)
- created_at
- updated_at

### 5.2 University Model

**File:** `backend/apps/universities/models.py`

**Fields:**
- id (UUID)
- name
- country
- city
- ranking (Integer)
- logo (ImageField)
- description
- programs (JSONField)
- tuition_range
- acceptance_rate
- international_students (Integer)
- website (URLField)
- created_at
- updated_at

### 5.3 Destination Model

**File:** `backend/apps/destinations/models.py`

**Fields:**
- id (UUID)
- country
- flag
- popular_cities (JSONField)
- description
- why_study_here (JSONField)
- top_universities (Integer)
- average_tuition
- language
- student_visa_info
- living_cost
- intake_seasons (JSONField)
- image (ImageField)
- created_at
- updated_at

### 5.4 Student Profile Model

**File:** `backend/apps/students/models.py`

**Fields:**
- id (UUID)
- user (OneToOne)
- name
- phone
- country
- target_countries (JSONField)
- target_level
- target_field
- english_proficiency
- avatar (ImageField)
- assigned_consultant (ForeignKey)
- created_at
- updated_at

### 5.5 Application Model

**File:** `backend/apps/applications/models.py`

**Fields:**
- id (UUID)
- student (ForeignKey)
- university
- program
- country
- status (choices)
- submitted_date
- notes
- created_at
- updated_at

---

## STEP 6: REST API ENDPOINTS

### 6.1 Scholarship API

**File:** `backend/apps/scholarships/views.py`

```python
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Scholarship
from .serializers import ScholarshipSerializer
from .filters import ScholarshipFilter

class ScholarshipViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Scholarship API ViewSet
    
    GET /api/v1/scholarships/ - List scholarships
    GET /api/v1/scholarships/{id}/ - Retrieve scholarship
    """
    queryset = Scholarship.objects.filter(published=True)
    serializer_class = ScholarshipSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ScholarshipFilter
    search_fields = ['title', 'provider', 'description']
    ordering_fields = ['deadline', 'created_at']
    ordering = ['-featured', 'deadline']
```

### 6.2 Create Filters

**File:** `backend/apps/scholarships/filters.py`

```python
import django_filters
from .models import Scholarship

class ScholarshipFilter(django_filters.FilterSet):
    country = django_filters.CharFilter(lookup_expr='iexact')
    type = django_filters.ChoiceFilter(choices=Scholarship.TYPE_CHOICES)
    level = django_filters.ChoiceFilter(choices=Scholarship.LEVEL_CHOICES)
    featured = django_filters.BooleanFilter()
    
    class Meta:
        model = Scholarship
        fields = ['country', 'type', 'level', 'featured']
```

### 6.3 Create Serializers

**File:** `backend/apps/scholarships/serializers.py`

```python
from rest_framework import serializers
from .models import Scholarship

class ScholarshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scholarship
        fields = [
            'id', 'title', 'provider', 'country', 'amount',
            'type', 'eligibility', 'deadline', 'description',
            'level', 'fields', 'application_link', 'featured',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
```

---

## STEP 7: DATA MIGRATION

### 7.1 Create Migration Script

**File:** `backend/scripts/seed_database.py`

```python
import json
import sys
import os
from datetime import datetime

# Add Django project to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

import django
django.setup()

from apps.scholarships.models import Scholarship
from apps.universities.models import University
from apps.destinations.models import Destination

def seed_scholarships():
    """Import scholarships from frontend data"""
    scholarships_data = [
        {
            "id": "sch-1",
            "title": "Fulbright Foreign Student Program",
            "provider": "U.S. Department of State",
            "country": "United States",
            # ... rest of data
        },
        # ... more scholarships
    ]
    
    for data in scholarships_data:
        Scholarship.objects.get_or_create(
            id=data['id'],
            defaults=data
        )
    
    print(f"✅ Imported {len(scholarships_data)} scholarships")

def seed_universities():
    """Import universities from frontend data"""
    # Similar implementation
    pass

def seed_destinations():
    """Import destinations from frontend data"""
    # Similar implementation
    pass

if __name__ == '__main__':
    print("🌱 Seeding database...")
    seed_scholarships()
    seed_universities()
    seed_destinations()
    print("✅ Database seeding complete!")
```

### 7.2 Run Migration

```bash
python scripts/seed_database.py
```

---

## STEP 8: FRONTEND INTEGRATION

### 8.1 Install Axios

```bash
cd frontend
npm install axios
```

### 8.2 Create API Client

**File:** `frontend/lib/api/client.ts`

(See Architecture document for complete implementation)

### 8.3 Create Environment File

**File:** `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 8.4 Update Scholarship Page

**File:** `frontend/app/scholarships/page.tsx`

```typescript
// Before
import { scholarships } from '@/data/scholarships';

// After
import { useState, useEffect } from 'react';
import { fetchScholarships } from '@/lib/api/scholarships';

// In component
const [scholarships, setScholarships] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchScholarships()
    .then(data => setScholarships(data.results))
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
}, []);
```

---

## STEP 9: TESTING

### 9.1 Backend Tests

```bash
# Install pytest
pip install pytest pytest-django

# Run tests
pytest
```

### 9.2 API Tests

**File:** `backend/tests/test_scholarships.py`

```python
from django.test import TestCase
from rest_framework.test import APIClient
from apps.scholarships.models import Scholarship

class ScholarshipAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.scholarship = Scholarship.objects.create(
            title="Test Scholarship",
            # ... other fields
        )
    
    def test_list_scholarships(self):
        response = self.client.get('/api/v1/scholarships/')
        self.assertEqual(response.status_code, 200)
        self.assertGreater(len(response.data['results']), 0)
    
    def test_filter_by_country(self):
        response = self.client.get('/api/v1/scholarships/?country=USA')
        self.assertEqual(response.status_code, 200)
```

---

## STEP 10: DOCUMENTATION

### 10.1 API Documentation

**Configure drf-spectacular:**

```python
# settings/base.py
INSTALLED_APPS += ['drf_spectacular']

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Gofer Exam API',
    'DESCRIPTION': 'Educational Consultancy Platform API',
    'VERSION': '1.0.0',
}
```

**Access documentation:**
- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/

### 10.2 Update README

Add backend setup instructions to README.md

---

## COMPLETION CHECKLIST

### Backend Setup ✅
- [ ] Django project created
- [ ] PostgreSQL configured
- [ ] Custom User model created
- [ ] Django apps created
- [ ] Settings configured
- [ ] Initial migrations run

### Authentication ✅
- [ ] JWT configured
- [ ] Registration endpoint
- [ ] Login endpoint
- [ ] Token refresh endpoint
- [ ] Permission classes

### Data Models ✅
- [ ] Scholarship model
- [ ] University model
- [ ] Destination model
- [ ] Student model
- [ ] Application model
- [ ] Consultation model
- [ ] Document model

### API Endpoints ✅
- [ ] Scholarship CRUD
- [ ] University CRUD
- [ ] Destination CRUD
- [ ] Student profile
- [ ] Applications
- [ ] Filtering works
- [ ] Search works
- [ ] Pagination works

### Frontend Integration ✅
- [ ] API client created
- [ ] Scholarship pages connected
- [ ] University pages connected
- [ ] Destination pages connected
- [ ] Auth pages connected
- [ ] Error handling
- [ ] Loading states

### Testing ✅
- [ ] Backend unit tests
- [ ] API endpoint tests
- [ ] Permission tests
- [ ] Integration tests
- [ ] Frontend tests

### Documentation ✅
- [ ] API documentation (Swagger)
- [ ] README updated
- [ ] Setup guide
- [ ] Environment variables documented

### Security ✅
- [ ] HTTPS ready
- [ ] CORS configured
- [ ] Rate limiting
- [ ] Input validation
- [ ] File upload security
- [ ] Permission checks

---

## NEXT ACTIONS

1. **Create backend directory structure** ← START HERE
2. Set up Django project
3. Configure PostgreSQL
4. Create models
5. Build API endpoints
6. Connect frontend
7. Write tests
8. Document everything

---

**Implementation Status:** Ready to Begin
**Estimated Completion:** 10-12 weeks
**Next Command:** `mkdir backend`

---

*Implementation Plan v1.0*
*Ready for Execution*
*November 2, 2026*
