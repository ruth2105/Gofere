# GOFER EXAM — PHASE 2 ARCHITECTURE
## Backend System Design & Integration Plan

**Date:** November 2, 2026
**Architect:** Senior Full-Stack Developer
**Phase:** 2 - Production Backend Implementation

---

## 1. ARCHITECTURAL OVERVIEW

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Browser  │  │  Mobile  │  │  Tablet  │  │   PWA    │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                      │
        ┌─────────────▼────────────────┐
        │    NEXT.JS FRONTEND          │
        │  (Phase 1 - Preserved)       │
        │  ┌────────────────────────┐  │
        │  │  App Router Pages      │  │
        │  │  UI Components         │  │
        │  │  Type Definitions      │  │
        │  │  Utility Functions     │  │
        │  └────────────────────────┘  │
        └─────────────┬────────────────┘
                      │
        ┌─────────────▼────────────────┐
        │     API CLIENT LAYER         │
        │  ┌────────────────────────┐  │
        │  │  HTTP Client           │  │
        │  │  Auth Interceptor      │  │
        │  │  Error Handler         │  │
        │  │  Type Validation       │  │
        │  └────────────────────────┘  │
        └─────────────┬────────────────┘
                      │
        ┌─────────────▼────────────────┐
        │   DJANGO REST FRAMEWORK      │
        │  (Phase 2 - New)             │
        │  ┌────────────────────────┐  │
        │  │  JWT Authentication    │  │
        │  │  Permission Classes    │  │
        │  │  Serializers           │  │
        │  │  ViewSets              │  │
        │  │  Pagination            │  │
        │  │  Filtering             │  │
        │  └────────────────────────┘  │
        └─────────────┬────────────────┘
                      │
        ┌─────────────▼────────────────┐
        │    DJANGO APPLICATION        │
        │  ┌────────────────────────┐  │
        │  │  Business Logic        │  │
        │  │  Models                │  │
        │  │  Services              │  │
        │  │  Validators            │  │
        │  └────────────────────────┘  │
        └─────────────┬────────────────┘
                      │
        ┌─────────────▼────────────────┐
        │    POSTGRESQL DATABASE       │
        │  ┌────────────────────────┐  │
        │  │  Tables                │  │
        │  │  Indexes               │  │
        │  │  Constraints           │  │
        │  │  Relationships         │  │
        │  └────────────────────────┘  │
        └──────────────────────────────┘
```

---

## 2. PROJECT STRUCTURE

### Recommended Directory Structure

```
gofer-exam/
│
├── frontend/                              ← Phase 1 (existing, to be moved)
│   ├── app/
│   ├── components/
│   ├── data/                             ← Will be deprecated
│   ├── lib/
│   │   ├── utils.ts
│   │   └── api/                          ← New API client (Phase 2)
│   │       ├── client.ts
│   │       ├── auth.ts
│   │       ├── scholarships.ts
│   │       ├── universities.ts
│   │       ├── destinations.ts
│   │       └── students.ts
│   ├── types/
│   ├── public/
│   ├── .env.local                        ← New environment file
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── next.config.ts
│
└── backend/                               ← Phase 2 (new)
    │
    ├── config/                           ← Django project settings
    │   ├── __init__.py
    │   ├── settings/
    │   │   ├── __init__.py
    │   │   ├── base.py                   ← Base settings
    │   │   ├── development.py            ← Dev settings
    │   │   ├── production.py             ← Prod settings
    │   │   └── test.py                   ← Test settings
    │   ├── urls.py                       ← Root URL configuration
    │   ├── asgi.py
    │   └── wsgi.py
    │
    ├── apps/                             ← Django applications
    │   │
    │   ├── accounts/                     ← User authentication & management
    │   │   ├── __init__.py
    │   │   ├── models.py                 (User, Role, Permission)
    │   │   ├── serializers.py
    │   │   ├── views.py
    │   │   ├── urls.py
    │   │   ├── permissions.py
    │   │   ├── managers.py
    │   │   ├── admin.py
    │   │   └── tests/
    │   │
    │   ├── students/                     ← Student management
    │   │   ├── models.py                 (StudentProfile, EducationHistory)
    │   │   ├── serializers.py
    │   │   ├── views.py
    │   │   ├── urls.py
    │   │   ├── permissions.py
    │   │   ├── admin.py
    │   │   └── tests/
    │   │
    │   ├── consultants/                  ← Consultant management
    │   │   ├── models.py                 (ConsultantProfile, Assignment)
    │   │   ├── serializers.py
    │   │   ├── views.py
    │   │   ├── urls.py
    │   │   ├── permissions.py
    │   │   ├── admin.py
    │   │   └── tests/
    │   │
    │   ├── scholarships/                 ← Scholarship database
    │   │   ├── models.py                 (Scholarship, Category, Eligibility)
    │   │   ├── serializers.py
    │   │   ├── views.py
    │   │   ├── urls.py
    │   │   ├── filters.py                ← DRF filters
    │   │   ├── admin.py
    │   │   └── tests/
    │   │
    │   ├── universities/                 ← University database
    │   │   ├── models.py                 (University, Program)
    │   │   ├── serializers.py
    │   │   ├── views.py
    │   │   ├── urls.py
    │   │   ├── admin.py
    │   │   └── tests/
    │   │
    │   ├── destinations/                 ← Study abroad destinations
    │   │   ├── models.py                 (Destination, Information)
    │   │   ├── serializers.py
    │   │   ├── views.py
    │   │   ├── urls.py
    │   │   ├── admin.py
    │   │   └── tests/
    │   │
    │   ├── services/                     ← Services offered
    │   │   ├── models.py                 (Service, Category)
    │   │   ├── serializers.py
    │   │   ├── views.py
    │   │   ├── urls.py
    │   │   ├── admin.py
    │   │   └── tests/
    │   │
    │   ├── applications/                 ← University applications
    │   │   ├── models.py                 (Application, StatusHistory)
    │   │   ├── serializers.py
    │   │   ├── views.py
    │   │   ├── urls.py
    │   │   ├── permissions.py
    │   │   ├── admin.py
    │   │   └── tests/
    │   │
    │   ├── consultations/                ← Consultation bookings
    │   │   ├── models.py                 (Consultation, Message)
    │   │   ├── serializers.py
    │   │   ├── views.py
    │   │   ├── urls.py
    │   │   ├── permissions.py
    │   │   ├── admin.py
    │   │   └── tests/
    │   │
    │   ├── documents/                    ← Document management
    │   │   ├── models.py                 (Document, Category, Review)
    │   │   ├── serializers.py
    │   │   ├── views.py
    │   │   ├── urls.py
    │   │   ├── permissions.py
    │   │   ├── storage.py                ← Custom storage
    │   │   ├── validators.py
    │   │   ├── admin.py
    │   │   └── tests/
    │   │
    │   ├── notifications/                ← Notification system
    │   │   ├── models.py                 (Notification, Preference)
    │   │   ├── serializers.py
    │   │   ├── views.py
    │   │   ├── urls.py
    │   │   ├── services.py               ← Email service
    │   │   ├── admin.py
    │   │   └── tests/
    │   │
    │   └── common/                       ← Shared utilities
    │       ├── models.py                 (TimeStampedModel, etc.)
    │       ├── permissions.py            (Base permissions)
    │       ├── pagination.py
    │       ├── exceptions.py
    │       ├── validators.py
    │       └── utils.py
    │
    ├── media/                            ← User uploads (development)
    │   └── documents/
    │
    ├── static/                           ← Static files
    │   └── admin/
    │
    ├── tests/                            ← Integration tests
    │   ├── test_auth.py
    │   ├── test_api.py
    │   └── test_permissions.py
    │
    ├── scripts/                          ← Utility scripts
    │   ├── seed_database.py              ← Import demo data
    │   └── create_superuser.py
    │
    ├── requirements/                     ← Python dependencies
    │   ├── base.txt                      ← Base requirements
    │   ├── development.txt               ← Dev requirements
    │   ├── production.txt                ← Prod requirements
    │   └── test.txt                      ← Test requirements
    │
    ├── .env.example                      ← Environment template
    ├── .gitignore
    ├── manage.py                         ← Django management
    ├── pytest.ini                        ← Pytest configuration
    └── README.md
```

---

## 3. DATABASE DESIGN

### Entity Relationship Diagram

```
┌─────────────────┐
│      USER       │
├─────────────────┤
│ id (PK)         │
│ email           │
│ password_hash   │
│ role            │
│ is_active       │
│ is_verified     │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         ├─────────────────┬─────────────────┐
         │                 │                 │
┌────────▼────────┐ ┌─────▼──────────┐ ┌───▼───────────┐
│ STUDENT_PROFILE │ │CONSULTANT_PROF │ │ ADMIN_PROFILE │
├─────────────────┤ ├────────────────┤ ├───────────────┤
│ user_id (FK)    │ │ user_id (FK)   │ │ user_id (FK)  │
│ name            │ │ name           │ │ name          │
│ phone           │ │ phone          │ │ department    │
│ country         │ │ expertise []   │ │ permissions[] │
│ target_ctrys [] │ │ countries []   │ └───────────────┘
│ target_level    │ │ bio            │
│ target_field    │ │ rating         │
│ eng_prof        │ │ students_mgd   │
│ avatar          │ │ avatar         │
└────────┬────────┘ └────────┬───────┘
         │                   │
         │                   │
         │         ┌─────────▼──────────┐
         │         │ CONSULTANT_ASSIGN  │
         │         ├────────────────────┤
         │         │ consultant_id (FK) │
         │         │ student_id (FK)    │
         │         │ assigned_date      │
         │         │ status             │
         │         └────────────────────┘
         │
┌────────▼─────────┐
│   APPLICATION    │
├──────────────────┤
│ id (PK)          │
│ student_id (FK)  │
│ university       │
│ program          │
│ country          │
│ status           │
│ submitted_date   │
│ notes            │
└────────┬─────────┘
         │
         │ 1:N
         │
┌────────▼─────────┐
│    DOCUMENT      │
├──────────────────┤
│ id (PK)          │
│ application (FK) │
│ student_id (FK)  │
│ name             │
│ type             │
│ file_path        │
│ status           │
│ upload_date      │
└──────────────────┘

┌─────────────────┐
│   SCHOLARSHIP   │
├─────────────────┤
│ id (PK)         │
│ title           │
│ provider        │
│ country         │
│ amount          │
│ type            │
│ eligibility []  │
│ deadline        │
│ description     │
│ level           │
│ fields []       │
│ application_url │
│ featured        │
│ published       │
│ created_at      │
│ updated_at      │
└─────────────────┘

┌─────────────────┐
│   UNIVERSITY    │
├─────────────────┤
│ id (PK)         │
│ name            │
│ country         │
│ city            │
│ ranking         │
│ logo            │
│ description     │
│ programs []     │
│ tuition_range   │
│ accept_rate     │
│ intl_students   │
│ website         │
│ created_at      │
│ updated_at      │
└─────────────────┘

┌─────────────────┐
│  DESTINATION    │
├─────────────────┤
│ id (PK)         │
│ country         │
│ flag            │
│ pop_cities []   │
│ description     │
│ why_study []    │
│ top_unis        │
│ avg_tuition     │
│ language        │
│ visa_info       │
│ living_cost     │
│ intake []       │
│ image           │
│ created_at      │
│ updated_at      │
└─────────────────┘

┌──────────────────┐
│ CONSULTATION     │
├──────────────────┤
│ id (PK)          │
│ student_id (FK)  │
│ consultant (FK)  │
│ date             │
│ time             │
│ type             │
│ status           │
│ mode             │
│ notes            │
│ created_at       │
└──────────────────┘
```

### Database Indexes

```sql
-- Performance optimization indexes
CREATE INDEX idx_scholarship_country ON scholarships(country);
CREATE INDEX idx_scholarship_type ON scholarships(type);
CREATE INDEX idx_scholarship_level ON scholarships(level);
CREATE INDEX idx_scholarship_deadline ON scholarships(deadline);
CREATE INDEX idx_scholarship_featured ON scholarships(featured, published);

CREATE INDEX idx_application_student ON applications(student_id);
CREATE INDEX idx_application_status ON applications(status);

CREATE INDEX idx_document_student ON documents(student_id);
CREATE INDEX idx_document_status ON documents(status);

CREATE INDEX idx_consultation_student ON consultations(student_id);
CREATE INDEX idx_consultation_consultant ON consultations(consultant_id);
CREATE INDEX idx_consultation_date ON consultations(date);

CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_role ON users(role);
```

---

## 4. AUTHENTICATION ARCHITECTURE

### JWT Token Flow

```
┌─────────────┐                ┌──────────────┐                ┌──────────────┐
│   Client    │                │   Django     │                │  PostgreSQL  │
│  (Next.js)  │                │   Backend    │                │   Database   │
└──────┬──────┘                └──────┬───────┘                └──────┬───────┘
       │                              │                                │
       │  POST /api/v1/auth/register  │                                │
       ├─────────────────────────────>│                                │
       │  {email, password, name}     │                                │
       │                              │  CREATE USER                   │
       │                              ├───────────────────────────────>│
       │                              │                                │
       │                              │  User created                  │
       │                              │<───────────────────────────────┤
       │  201 Created                 │                                │
       │  {user_id, message}          │                                │
       │<─────────────────────────────┤                                │
       │                              │                                │
       │  POST /api/v1/auth/login     │                                │
       ├─────────────────────────────>│                                │
       │  {email, password}           │                                │
       │                              │  VERIFY CREDENTIALS            │
       │                              ├───────────────────────────────>│
       │                              │                                │
       │                              │  User verified                 │
       │                              │<───────────────────────────────┤
       │                              │                                │
       │                              │  GENERATE JWT TOKENS           │
       │                              │  - Access Token (15 min)       │
       │                              │  - Refresh Token (7 days)      │
       │                              │                                │
       │  200 OK                      │                                │
       │  {access, refresh, user}     │                                │
       │<─────────────────────────────┤                                │
       │                              │                                │
       │  Store tokens in memory      │                                │
       │  (or httpOnly cookie)        │                                │
       │                              │                                │
       │  GET /api/v1/students/me     │                                │
       │  Header: Authorization:      │                                │
       │    Bearer <access_token>     │                                │
       ├─────────────────────────────>│                                │
       │                              │  VERIFY TOKEN                  │
       │                              │  CHECK PERMISSIONS             │
       │                              │                                │
       │                              │  GET USER DATA                 │
       │                              ├───────────────────────────────>│
       │                              │                                │
       │                              │  User data                     │
       │                              │<───────────────────────────────┤
       │  200 OK                      │                                │
       │  {user_data}                 │                                │
       │<─────────────────────────────┤                                │
       │                              │                                │
       │  (Access token expires)      │                                │
       │                              │                                │
       │  POST /api/v1/auth/token/    │                                │
       │       refresh/               │                                │
       ├─────────────────────────────>│                                │
       │  {refresh}                   │                                │
       │                              │  VERIFY REFRESH TOKEN          │
       │                              │                                │
       │  200 OK                      │                                │
       │  {access}                    │                                │
       │<─────────────────────────────┤                                │
       │                              │                                │
       │  Continue with new token     │                                │
       │                              │                                │
```

### Token Configuration

```python
# settings/base.py
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}
```

---

## 5. API ENDPOINT DESIGN

### Base URL Structure

```
Production:  https://api.goferexam.com/api/v1/
Development: http://localhost:8000/api/v1/
```

### Complete API Specification

#### **Authentication Endpoints**

```
POST   /api/v1/auth/register/
POST   /api/v1/auth/login/
POST   /api/v1/auth/token/refresh/
POST   /api/v1/auth/logout/
POST   /api/v1/auth/password-reset/
POST   /api/v1/auth/password-reset/confirm/
POST   /api/v1/auth/email-verify/
POST   /api/v1/auth/email-verify/confirm/
```

#### **Student Endpoints**

```
GET    /api/v1/students/me/
PATCH  /api/v1/students/me/
GET    /api/v1/students/me/applications/
GET    /api/v1/students/me/consultations/
GET    /api/v1/students/me/documents/
```

#### **Scholarship Endpoints**

```
GET    /api/v1/scholarships/
GET    /api/v1/scholarships/{id}/
POST   /api/v1/scholarships/           [Admin only]
PATCH  /api/v1/scholarships/{id}/      [Admin only]
DELETE /api/v1/scholarships/{id}/      [Admin only]

Query Parameters:
  ?country=USA
  &type=FULL
  &level=GRAD
  &search=fulbright
  &featured=true
  &page=1
  &page_size=20
  &ordering=-deadline
```

#### **University Endpoints**

```
GET    /api/v1/universities/
GET    /api/v1/universities/{id}/
POST   /api/v1/universities/           [Admin only]
PATCH  /api/v1/universities/{id}/      [Admin only]

Query Parameters:
  ?country=USA
  &search=mit
  &page=1
  &page_size=20
```

#### **Destination Endpoints**

```
GET    /api/v1/destinations/
GET    /api/v1/destinations/{id}/
POST   /api/v1/destinations/           [Admin only]
PATCH  /api/v1/destinations/{id}/      [Admin only]
```

#### **Service Endpoints**

```
GET    /api/v1/services/
GET    /api/v1/services/{id}/
```

#### **Application Endpoints**

```
GET    /api/v1/applications/           [Own applications]
POST   /api/v1/applications/
GET    /api/v1/applications/{id}/
PATCH  /api/v1/applications/{id}/
DELETE /api/v1/applications/{id}/
```

#### **Consultation Endpoints**

```
GET    /api/v1/consultations/          [Own consultations]
POST   /api/v1/consultations/
GET    /api/v1/consultations/{id}/
PATCH  /api/v1/consultations/{id}/
DELETE /api/v1/consultations/{id}/
```

#### **Document Endpoints**

```
GET    /api/v1/documents/              [Own documents]
POST   /api/v1/documents/
GET    /api/v1/documents/{id}/
DELETE /api/v1/documents/{id}/
GET    /api/v1/documents/{id}/download/
```

---

## 6. PERMISSION SYSTEM

### Role Hierarchy

```
SUPERADMIN (is_superuser=True)
    │
    ├── Full system access
    ├── Can create/delete users
    ├── Can access Django Admin
    └── Can modify any data
    
ADMIN (role='ADMIN', is_staff=True)
    │
    ├── Can manage scholarships
    ├── Can manage universities
    ├── Can manage destinations
    ├── Can view all students
    ├── Can view all applications
    └── Can access Django Admin
    
CONSULTANT (role='CONSULTANT')
    │
    ├── Can view assigned students
    ├── Can manage assigned consultations
    ├── Can view student applications
    ├── Can upload documents for students
    └── Cannot modify scholarships/universities
    
STUDENT (role='STUDENT')
    │
    ├── Can view own profile
    ├── Can create applications
    ├── Can upload documents
    ├── Can book consultations
    ├── Can view scholarships (public)
    └── Cannot access other students' data
```

### Permission Classes

```python
# apps/common/permissions.py

class IsStudent(BasePermission):
    """Allow only students"""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'STUDENT'
        )

class IsConsultant(BasePermission):
    """Allow only consultants"""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'CONSULTANT'
        )

class IsAdmin(BasePermission):
    """Allow only administrators"""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'ADMIN' or
            request.user.is_superuser
        )

class IsOwnerOrReadOnly(BasePermission):
    """Allow modifications only to owner"""
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.student == request.user.student_profile

class IsAssignedConsultant(BasePermission):
    """Allow only assigned consultant"""
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        if request.user.role != 'CONSULTANT':
            return False
        return (
            obj.student.assigned_consultant ==
            request.user.consultant_profile
        )
```

---

## 7. FRONTEND INTEGRATION STRATEGY

### API Client Architecture

```typescript
// lib/api/client.ts
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor (add auth token)
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor (handle token refresh)
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = this.getRefreshToken();
            const { data } = await this.client.post('/auth/token/refresh/', {
              refresh: refreshToken,
            });
            
            this.setAccessToken(data.access);
            originalRequest.headers.Authorization = `Bearer ${data.access}`;
            
            return this.client(originalRequest);
          } catch (refreshError) {
            this.logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private setAccessToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  private logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/student/login';
  }

  // HTTP methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }
}

export const apiClient = new APIClient();
```

### Migration Strategy

**Phase A: Preserve Demo Data**
```typescript
// Initially keep both
import { scholarships as demoScholarships } from '@/data/scholarships';
import { fetchScholarships } from '@/lib/api/scholarships';

// Use API if available, fall back to demo
const scholarships = await fetchScholarships().catch(() => demoScholarships);
```

**Phase B: Hybrid Approach**
```typescript
// Use environment flag
const USE_API = process.env.NEXT_PUBLIC_USE_API === 'true';

const scholarships = USE_API 
  ? await fetchScholarships()
  : demoScholarships;
```

**Phase C: Full API Integration**
```typescript
// Remove demo data imports
import { fetchScholarships } from '@/lib/api/scholarships';

const scholarships = await fetchScholarships();
```

---

## 8. SECURITY ARCHITECTURE

### Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                         │
└─────────────────────────────────────────────────────────────┘

Layer 1: Network Security
├── HTTPS/TLS encryption
├── CORS configuration
├── Rate limiting
└── IP whitelisting (optional)

Layer 2: Authentication
├── JWT tokens
├── Token expiration
├── Token refresh
├── Password hashing (bcrypt)
└── Email verification

Layer 3: Authorization
├── Role-based access control
├── Permission classes
├── Object-level permissions
└── Ownership validation

Layer 4: Input Validation
├── Django REST serializers
├── Field validators
├── File type validation
└── File size limits

Layer 5: Data Protection
├── SQL injection protection (ORM)
├── XSS prevention
├── CSRF tokens
└── Parameterized queries

Layer 6: Audit & Monitoring
├── Access logs
├── Change logs
├── Error tracking (Sentry)
└── Security alerts
```

---

## 9. TESTING STRATEGY

### Test Coverage Goals

```
Backend:
  - Unit tests: 80%+ coverage
  - Integration tests: Critical paths
  - API tests: All endpoints
  - Permission tests: All roles
  
Frontend:
  - Component tests: Key components
  - Integration tests: Auth flow
  - E2E tests: Critical user journeys
```

### Test Structure

```python
# tests/test_auth.py
class AuthenticationTestCase(APITestCase):
    def test_user_registration(self):
        """Test student can register"""
        
    def test_user_login(self):
        """Test user can login"""
        
    def test_token_refresh(self):
        """Test token refresh works"""
        
    def test_logout(self):
        """Test logout invalidates token"""

# tests/test_permissions.py
class PermissionTestCase(APITestCase):
    def test_student_cannot_access_other_student_data(self):
        """Test data isolation"""
        
    def test_consultant_can_only_view_assigned_students(self):
        """Test consultant permissions"""
        
    def test_admin_can_manage_scholarships(self):
        """Test admin permissions"""
```

---

## 10. DEPLOYMENT ARCHITECTURE

### Development Environment

```
Developer Machine
├── Frontend: http://localhost:3000
├── Backend: http://localhost:8000
└── Database: PostgreSQL on localhost:5432
```

### Production Environment (Future)

```
┌──────────────────────────────────────────┐
│           Load Balancer / CDN            │
│              (Cloudflare)                │
└─────────┬─────────────────┬──────────────┘
          │                 │
    ┌─────▼─────┐     ┌─────▼──────┐
    │ Frontend  │     │  Backend   │
    │ (Vercel)  │     │   (VPS)    │
    │ Next.js   │     │  Django    │
    └───────────┘     │  Gunicorn  │
                      │  Nginx     │
                      └─────┬──────┘
                            │
                    ┌───────▼────────┐
                    │   PostgreSQL   │
                    │   (Managed)    │
                    └────────────────┘
```

---

## 11. IMPLEMENTATION PHASES

### Recommended Sequence

**Week 1-2: Backend Foundation**
- Create backend directory
- Set up Django project
- Configure PostgreSQL
- Create custom User model
- Set up Django apps
- Initial migrations

**Week 3-4: Authentication**
- JWT authentication
- Registration endpoint
- Login endpoint
- Token refresh
- Password reset
- Email verification

**Week 5-6: Core Data APIs**
- Scholarship model + API
- University model + API
- Destination model + API
- Service model + API
- Admin interfaces
- Data migration scripts

**Week 7-8: Frontend Integration**
- API client library
- Connect scholarship pages
- Connect destination pages
- Update login/register forms
- Error handling
- Loading states

**Week 9-10: Business Logic**
- Student profile API
- Application system
- Consultation booking
- Document management
- Consultant assignment

**Week 11-12: Testing & Polish**
- Backend tests
- Frontend tests
- Integration tests
- API documentation
- Performance optimization
- Security audit

---

## 12. SUCCESS CRITERIA

Phase 2 is complete when:

✅ Django backend runs without errors
✅ PostgreSQL connected and migrations applied
✅ User registration works (returns 201)
✅ User login works (returns JWT tokens)
✅ Token refresh works
✅ Scholarships stored in database
✅ Scholarship API returns data
✅ Frontend displays API data
✅ Permission system works
✅ Admin interface accessible
✅ Tests pass (80%+ coverage)
✅ API documentation generated
✅ No Phase 1 functionality broken

---

**Architecture Approved:** ✅ Ready for Implementation
**Risk Assessment:** LOW (solid foundation)
**Estimated Timeline:** 10-12 weeks
**Next Step:** Begin Django project setup

---

*Architecture Document v1.0*
*Senior Full-Stack Architect*
*November 2, 2026*
