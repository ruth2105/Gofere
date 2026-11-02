# GOFER EXAM - Database Models Summary

**Date**: November 2, 2026  
**Status**: All Models Created ✅  
**Total Models**: 10 core models across 9 Django apps

---

## 📊 Models Overview

### 1. **User** (`apps/accounts/`)
**Purpose**: Custom email-based authentication  
**Key Features**:
- Email as USERNAME_FIELD (no username required)
- UUID primary key
- Role-based access: STUDENT, CONSULTANT, ADMIN, SUPERADMIN
- Email verification status
- Custom UserManager

**Fields** (13):
- id (UUID, PK)
- email (unique)
- first_name, last_name
- phone_number
- role (choices)
- is_active, is_staff, is_verified
- date_joined, last_login, updated_at

---

### 2. **StudentProfile** (`apps/students/`)
**Purpose**: Extended student information  
**Relationship**: OneToOne with User  
**Key Features**:
- Educational background tracking
- Study abroad preferences
- Test scores (IELTS, TOEFL, GRE, GMAT, SAT)
- Profile completion calculation
- Reward points system

**Fields** (30+):
- Personal: date_of_birth, gender, nationality, passport_number
- Contact: address, city, country, postal_code
- Emergency: emergency_contact_name, phone, relationship
- Education: current_education_level, school_name, field_of_study, graduation_year, gpa
- Preferences: target_countries (JSON), target_degree_level, preferred_fields (JSON), budget_range
- Test Scores: english_test_type, english_test_score, gre_score, gmat_score, sat_score
- Status: profile_completed, is_active_applicant, reward_points

---

### 3. **ConsultantProfile** (`apps/consultants/`)
**Purpose**: Consultant professional profiles  
**Relationship**: OneToOne with User  
**Key Features**:
- Verification system (PENDING, VERIFIED, REJECTED)
- Rating and statistics tracking
- Specialization and expertise areas
- Consultation pricing

**Fields** (25+):
- Professional: company_name, job_title, years_of_experience, bio, profile_image
- Expertise: specializations (JSON), languages (JSON), expertise_countries (JSON), expertise_fields (JSON)
- Consultation: consultation_rate, availability_hours, timezone
- Verification: verification_status, verification_documents (JSON), verified_at
- Status: is_available, is_featured
- Statistics: total_consultations, total_students_helped, average_rating, success_rate
- Social: website_url, linkedin_url, twitter_url

---

### 4. **Scholarship** (`apps/scholarships/`)
**Purpose**: Scholarship listings with comprehensive filtering  
**Key Features**:
- Matches Phase 1 TypeScript interface (22 fields)
- Multiple filter options (country, type, level, field)
- Deadline tracking
- View and application counters

**Fields** (22):
- Basic: name, slug, description, short_description
- Organization: provider, provider_logo, country
- Details: type (FULL/PARTIAL/MERIT/NEED/RESEARCH/ATHLETIC), level, amount, amount_type
- Eligibility: eligibility (JSON), required_gpa, fields (JSON), target_countries (JSON)
- Application: application_deadline, application_url, documents_required (JSON)
- Status: status (OPEN/UPCOMING/CLOSED), is_featured, is_popular
- Additional: benefits (JSON), website_url, contact_email
- Statistics: view_count, application_count, success_rate

---

### 5. **University** (`apps/universities/`)
**Purpose**: University listings  
**Key Features**:
- Matches Phase 1 structure (12+ fields)
- World and national rankings
- Programs stored as JSON for flexibility
- Cost information

**Fields** (18+):
- Basic: name, slug, description
- Location: country, city, address
- Details: type (PUBLIC/PRIVATE/RESEARCH/LIBERAL_ARTS/TECHNICAL), founded_year
- Media: image, logo
- Rankings: world_ranking, national_ranking
- Academic: total_students, international_students, acceptance_rate, programs (JSON), popular_majors (JSON)
- Costs: tuition_fee, application_fee
- Requirements: required_tests (JSON), minimum_gpa
- Contact: website_url, admissions_email, phone_number
- Features: is_featured, is_partner
- Statistics: view_count, application_count

---

### 6. **Destination** (`apps/destinations/`)
**Purpose**: Study abroad destination countries  
**Key Features**:
- Comprehensive country information
- Work permit details
- Cost breakdowns
- Immigration statistics

**Fields** (25+):
- Basic: name, slug, description, flag_emoji
- Media: image, banner_image
- Statistics: total_universities, international_students, popularity_rank, education_quality_rating
- Costs: average_tuition_fee, average_living_cost
- Work: work_while_studying, work_hours_per_week, post_study_work_visa, post_study_work_duration
- Language: primary_language, english_required, required_tests (JSON)
- Immigration: visa_approval_rate, visa_processing_time
- Additional: highlights (JSON), scholarship_availability
- Resources: official_education_website, embassy_website
- Features: is_popular, is_featured, view_count, scholarship_count

---

### 7. **Service** (`apps/services/`)
**Purpose**: Consultant services offered to students  
**Key Features**:
- Multiple service categories
- Pricing and duration
- Feature lists

**Fields** (14):
- Basic: title, slug, description, short_description
- Category: category (CONSULTATION/APPLICATION/DOCUMENT/VISA/SCHOLARSHIP/ESSAY/INTERVIEW/OTHER)
- Pricing: price, currency, duration
- Features: features (JSON)
- Provider: consultant (FK to User)
- Status: is_active, is_featured
- Media: image
- Statistics: view_count, purchase_count

---

### 8. **Application** (`apps/applications/`)
**Purpose**: Student applications to universities/scholarships  
**Key Features**:
- Dual purpose (university or scholarship applications)
- Status tracking with timeline
- Consultant assignment
- Deadline management

**Fields** (16+):
- Student: student (FK to User)
- Type: application_type (UNIVERSITY/SCHOLARSHIP)
- University: university (FK), program_name, degree_level
- Scholarship: scholarship (FK)
- Status: status (DRAFT/SUBMITTED/UNDER_REVIEW/ACCEPTED/REJECTED/WAITLISTED/WITHDRAWN)
- Dates: submission_date, deadline_date, decision_date
- Details: application_id, application_url
- Support: consultant (FK to User)
- Notes: notes, admin_notes, status_updates (JSON)
- Notifications: email_notifications

---

### 9. **Consultation** (`apps/consultations/`)
**Purpose**: Student-consultant consultation bookings  
**Key Features**:
- Multiple consultation types (VIDEO/PHONE/IN_PERSON/CHAT)
- Meeting details and links
- Payment tracking
- Rating and feedback system

**Fields** (20+):
- Participants: student (FK), consultant (FK), service (FK)
- Details: type, title, description
- Schedule: scheduled_date, scheduled_time, duration_minutes, timezone
- Meeting: meeting_url, meeting_id, meeting_password
- Status: status (PENDING/CONFIRMED/COMPLETED/CANCELLED/NO_SHOW)
- Payment: is_paid, payment_amount
- Notes: student_notes, consultant_notes, action_items (JSON)
- Feedback: student_rating, student_feedback
- Reminders: reminder_sent, reminder_sent_at
- Timestamps: completed_at

---

### 10. **Document** (`apps/documents/`)
**Purpose**: Student document uploads and management  
**Key Features**:
- Multiple document types
- File validation (PDF, DOC, DOCX, JPG, PNG)
- Verification workflow
- Expiry tracking for time-sensitive documents

**Fields** (18):
- Owner: user (FK)
- Details: document_type (PASSPORT/TRANSCRIPT/DIPLOMA/RECOMMENDATION/PERSONAL_STATEMENT/CV/FINANCIAL/TEST_SCORE/PHOTO/OTHER)
- File: file, file_size, file_extension
- Related: application (FK), consultation (FK)
- Verification: status (PENDING/APPROVED/REJECTED/EXPIRED), verified_by (FK), verification_notes, verified_at
- Expiry: expiry_date
- Security: is_confidential

**Special Methods**:
- `is_expired` property
- `file_size_mb` property
- Auto-delete file on model deletion

---

### 11. **Notification** (`apps/notifications/`)
**Purpose**: User notifications and alerts  
**Key Features**:
- Multiple notification types
- Priority levels
- Email integration
- Action links

**Fields** (15):
- Recipient: user (FK)
- Details: type (APPLICATION/CONSULTATION/DOCUMENT/MESSAGE/DEADLINE/SCHOLARSHIP/SYSTEM/OTHER)
- Priority: priority (LOW/NORMAL/HIGH/URGENT)
- Content: title, message, action_url, action_text
- Status: is_read, read_at
- Email: send_email, email_sent, email_sent_at
- Related: application (FK), consultation (FK)

---

## 🔗 Relationships

```
User (1) ──────────────────> (1) StudentProfile
User (1) ──────────────────> (1) ConsultantProfile
User (1) ──────────────────> (M) Applications (as student)
User (1) ──────────────────> (M) Applications (as consultant)
User (1) ──────────────────> (M) Consultations (as student)
User (1) ──────────────────> (M) Consultations (as consultant)
User (1) ──────────────────> (M) Documents
User (1) ──────────────────> (M) Notifications
User (1) ──────────────────> (M) Services (as consultant)

Scholarship (1) ────────────> (M) Applications
University (1) ─────────────> (M) Applications
Service (1) ────────────────> (M) Consultations
Application (1) ────────────> (M) Documents
Consultation (1) ───────────> (M) Documents
Application (1) ────────────> (M) Notifications
Consultation (1) ───────────> (M) Notifications
```

---

## 🗄️ Database Tables

| Model | Table Name | Primary Key | Indexes |
|-------|------------|-------------|---------|
| User | `users` | UUID | email, role, is_active |
| StudentProfile | `student_profiles` | UUID | user, country, education_level |
| ConsultantProfile | `consultant_profiles` | UUID | user, verification_status, is_available, is_featured, average_rating |
| Scholarship | `scholarships` | UUID | country, type, level, status, is_featured, application_deadline, slug |
| University | `universities` | UUID | country, city, type, is_featured, world_ranking, slug |
| Destination | `destinations` | UUID | name, is_popular, is_featured, popularity_rank, slug |
| Service | `services` | UUID | category, consultant, is_active, is_featured, slug |
| Application | `applications` | UUID | student, status, application_type, university, scholarship, consultant, deadline_date |
| Consultation | `consultations` | UUID | student, consultant, status, scheduled_date, is_paid |
| Document | `documents` | UUID | user, document_type, status, application, consultation |
| Notification | `notifications` | UUID | user + is_read, user + created_at, type, priority |

---

## 📈 JSON Fields Usage

For maximum flexibility, several fields use JSONField to store arrays/objects:

**StudentProfile**:
- `target_countries` - List of target study countries
- `preferred_fields` - List of preferred fields of study

**ConsultantProfile**:
- `specializations` - List of expertise areas
- `languages` - List of languages spoken
- `expertise_countries` - List of country expertise
- `expertise_fields` - List of field expertise
- `verification_documents` - List of verification document URLs

**Scholarship**:
- `eligibility` - List of eligibility criteria
- `fields` - List of eligible fields of study
- `target_countries` - Countries from which students can apply
- `documents_required` - List of required documents
- `benefits` - List of scholarship benefits

**University**:
- `programs` - List of available programs/degrees
- `popular_majors` - List of most popular majors
- `required_tests` - List of required tests

**Destination**:
- `required_tests` - List of commonly required tests
- `highlights` - List of key highlights/benefits

**Service**:
- `features` - List of service features/deliverables

**Application**:
- `status_updates` - Timeline of status changes

**Consultation**:
- `action_items` - List of action items discussed

---

## ✅ Model Features

### All Models Include:
- ✅ UUID primary keys (enhanced security)
- ✅ Timestamps (created_at, updated_at)
- ✅ Proper indexes for query optimization
- ✅ Verbose names for admin interface
- ✅ Custom `__str__` methods
- ✅ Comprehensive field validation
- ✅ Help text for complex fields

### Special Features:
- ✅ Auto-generated slugs (Scholarship, University, Destination, Service)
- ✅ View counters (Scholarship, University, Destination, Service)
- ✅ Calculated properties (StudentProfile.age, University.international_student_percentage)
- ✅ Status tracking methods (Application.add_status_update, Consultation.mark_completed)
- ✅ Cascade and SET_NULL relationships for data integrity

---

## 🎯 Phase 1 Data Compatibility

All models are designed to match Phase 1 TypeScript interfaces:

| Phase 1 Type | Backend Model | Fields Match |
|--------------|---------------|--------------|
| `Scholarship` | `Scholarship` | ✅ 22 fields |
| `University` | `University` | ✅ 12+ fields |
| `Destination` | `Destination` | ✅ All fields |
| `Student` | `User` + `StudentProfile` | ✅ Combined |
| `Consultant` | `User` + `ConsultantProfile` | ✅ Combined |
| `Application` | `Application` | ✅ Extended |
| `Document` | `Document` | ✅ Extended |
| `Consultation` | `Consultation` | ✅ Extended |
| `ServiceOffered` | `Service` | ✅ All fields |

---

## 🔒 Security Features

- ✅ Role-based access control (User.role)
- ✅ Document confidentiality flags
- ✅ Verification workflows (ConsultantProfile, Document)
- ✅ Consultant assignment tracking
- ✅ Admin-only notes fields
- ✅ File type validation
- ✅ Email verification status

---

## 📝 Next Steps

1. ⏳ Install PostgreSQL
2. ⏳ Run migrations: `python manage.py makemigrations`
3. ⏳ Apply migrations: `python manage.py migrate`
4. ⏳ Create superuser: `python manage.py createsuperuser`
5. ⏳ Access admin: http://localhost:8000/admin
6. ⏳ Build REST API serializers and viewsets
7. ⏳ Seed database from Phase 1 demo data

---

**Status**: All models created and ready for migration!  
**Location**: `backend/apps/`  
**Admin Configured**: ✅ All models registered in Django admin
