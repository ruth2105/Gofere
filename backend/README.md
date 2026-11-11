# GOFER EXAM Backend API

Django REST API for the GOFER EXAM platform. Exposed routes include cookie-based authentication, public catalogues, student-owned applications and profiles, consultant case review and consultation workflows, and an administrator aggregate overview. Document upload APIs are not implemented.

## Technology Stack

- **Django 5.0** - Web framework
- **Django REST Framework 3.14** - REST API
- **PostgreSQL** - Primary database
- **Simple JWT** - Authentication
- **drf-spectacular** - OpenAPI documentation

## Project Structure

```
backend/
├── apps/                    # Django applications
│   ├── accounts/           # User authentication & management
│   ├── students/           # Student profiles
│   ├── consultants/        # Consultant profiles
│   ├── scholarships/       # Scholarship listings
│   ├── universities/       # University data
│   ├── destinations/       # Study destinations
│   ├── services/           # Consultant services
│   ├── applications/       # Application tracking
│   ├── consultations/      # Consultation bookings
│   ├── documents/          # Document management
│   ├── notifications/      # Notification system
│   └── common/             # Shared utilities
├── config/                  # Django configuration
│   ├── settings/           # Split settings
│   │   ├── base.py         # Shared settings
│   │   ├── development.py  # Development settings
│   │   ├── production.py   # Production settings
│   │   └── test.py         # Test settings
│   ├── urls.py             # URL routing
│   └── wsgi.py             # WSGI application
├── media/                   # User uploaded files
├── static/                  # Static files
├── tests/                   # Test suite
├── scripts/                 # Utility scripts
├── requirements/            # Python dependencies
│   ├── base.txt            # Base requirements
│   ├── development.txt     # Dev requirements
│   └── production.txt      # Production requirements
├── manage.py               # Django management
├── .env                    # Environment variables (not in git)
└── .env.example            # Example environment file

```

## Setup Instructions

### Prerequisites

1. **Python 3.12+**
   ```powershell
   python --version
   ```

2. **PostgreSQL 14+**
   - Download from: https://www.postgresql.org/download/windows/
   - During installation, note your PostgreSQL password
   - Ensure PostgreSQL service is running

3. **Git** (for version control)

### Installation Steps

#### 1. PostgreSQL Database Setup

After installing PostgreSQL, create the database and user:

```powershell
# Connect to PostgreSQL (use the password you set during installation)
psql -U postgres

# In the PostgreSQL prompt, run these commands. Set a unique local password
# when prompted; do not reuse a shared or production credential.
CREATE DATABASE gofer_exam_db;
CREATE USER gofer_exam_user;
\password gofer_exam_user
ALTER ROLE gofer_exam_user SET client_encoding TO 'utf8';
ALTER ROLE gofer_exam_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE gofer_exam_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE gofer_exam_db TO gofer_exam_user;
\q
```

#### 2. Virtual Environment Setup

```powershell
# Navigate to backend directory
cd c:\Users\user\Desktop\abc\gofer-exam\backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# If you get an execution policy error, run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 3. Install Dependencies

```powershell
# Upgrade pip
python -m pip install --upgrade pip

# Install requirements
pip install -r requirements\base.txt

# For development (includes testing and debugging tools)
pip install -r requirements\development.txt
```

#### 4. Environment Configuration

Create `backend\.env` from `.env.example` only if it does not already exist, then
set the local database password you chose above. Never overwrite an existing
environment file:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

In `backend\.env`, configure at least:
```ini
DJANGO_SETTINGS_MODULE=config.settings.development
DB_PASSWORD=your-unique-local-database-password
```

#### 5. Run Migrations

```powershell
# Create database tables
python manage.py makemigrations
python manage.py migrate
```

#### 6. Create Superuser

```powershell
# Create an admin account
python manage.py createsuperuser
# Enter email, first name, last name, and password when prompted
```

#### 7. Run Development Server

```powershell
# Start the Django development server
python manage.py runserver

# Server will be available at: http://localhost:8000
# Admin panel: http://localhost:8000/admin
# API docs: http://localhost:8000/api/v1/docs
```

## API Documentation

Once the server is running, access interactive API documentation:

- **Swagger UI**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc
- **OpenAPI Schema**: http://localhost:8000/api/v1/schema

## API Endpoints

### Authentication
- `POST /api/v1/auth/register/` - Create an unverified student account and request a verification email; does not sign in or set session cookies
- `POST /api/v1/auth/verify-email/` - Verify an account using the one-time token sent by email
- `POST /api/v1/auth/resend-verification/` - Request a verification email (account status is not disclosed)
- `POST /api/v1/auth/login/` - User login; sets HttpOnly JWT cookies
- `POST /api/v1/auth/token/refresh/` - Refresh the HttpOnly access cookie
- `POST /api/v1/auth/logout/` - Clear cookies and blacklist the refresh token

### User Management
- `GET /api/v1/auth/me/` - Get current user profile
- `PATCH /api/v1/auth/me/` - Update current user profile

### Country Registry
- `GET /api/v1/countries/` - List active ISO 3166-1 countries and territories, including alpha-2/alpha-3 codes, names, and flag emojis
- The country registry is read-only through the public API; administrators manage entries through Django Admin.
- Run `python manage.py import_countries` to import or update the bundled `pycountry` registry. The command does not delete entries or change active status.
- Region and subregion values remain blank until populated from a separately verified geographical dataset.

### Student Applications
- `GET /api/v1/applications/` - List the authenticated student's applications
- `POST /api/v1/applications/` - Create a draft for one university or published scholarship
- `GET /api/v1/applications/{id}/` - Retrieve an owned application
- `PATCH /api/v1/applications/{id}/` - Edit an owned draft
- `POST /api/v1/applications/{id}/submit/` - Mark a draft as submitted to the provider
- `POST /api/v1/applications/{id}/withdraw/` - Withdraw an owned submitted application

Application records are scoped to the authenticated student. Students cannot set the owner,
consultant, staff notes, or workflow status directly. Marking an application as submitted only
updates the student's tracker; it does not send an application to an institution.

### Consultant Application Review
- `GET /api/v1/applications/consultant/assigned/` - List only applications assigned to the authenticated consultant
- `POST /api/v1/applications/consultant/assigned/{id}/start-review/` - Move an assigned submitted application into review, with an optional student-visible note
- The review action does not make admission decisions; administrators continue to manage final application decisions.

### Student Profiles
- `GET /api/v1/students/me/` - Retrieve the authenticated student's profile
- `PATCH /api/v1/students/me/` - Update the authenticated student's profile
- `GET /api/v1/students/me/completion/` - Get profile completion and missing fields

Student profiles accept `nationality_country` and `residence_country` as active ISO alpha-2
country codes. Existing free-text `nationality` and `country` fields remain available for
backward compatibility and are synchronized to the registered country name when a registry
reference is supplied.

### Consultations
- `GET /api/v1/consultations/consultants/` - List verified, available consultants for student accounts
- `GET /api/v1/consultations/` - List the authenticated student's consultation requests
- `POST /api/v1/consultations/` - Request a consultation; the request remains pending until confirmed
- `POST /api/v1/consultations/{id}/cancel/` - Cancel an owned upcoming request
- `POST /api/v1/consultations/{id}/feedback/` - Rate a completed consultation once
- `GET /api/v1/consultations/consultant/assigned/` - List consultations assigned to the authenticated consultant
- `POST /api/v1/consultations/consultant/assigned/{id}/confirm/` - Confirm a pending request and optionally provide a meeting URL
- `POST /api/v1/consultations/consultant/assigned/{id}/cancel/` - Cancel an upcoming assigned request
- `POST /api/v1/consultations/consultant/assigned/{id}/complete/` - Record a completed session, private notes, and action items

Booking times include an IANA time zone. The API rejects past requests and overlapping pending or
confirmed bookings for the same consultant. This is a manual request-and-confirm workflow; it does
not synchronize external calendars, send reminders, or process consultation payments.

### Scholarships
- `GET /api/v1/scholarships/` - List published scholarships (with filters)
- `GET /api/v1/scholarships/{slug}/` - Get a published scholarship
- `GET /api/v1/scholarships/eligible-for-me/` - Get current open scholarships with personalized eligibility results (authenticated students only)
- Filters: `country`, `type`, `level`, `status`, `is_featured`, `search`, `ordering`
- Scholarship records are drafts by default. Publish them through Django Admin before they are visible through the public API.
- Personalized matching uses structured country, degree, GPA, and field-of-study data. Missing or unconfirmed details are reported for verification; free-text eligibility descriptions are not interpreted.

### Opportunities
- `GET /api/v1/opportunities/` - List published opportunities
- `GET /api/v1/opportunities/{slug}/` - Get a published opportunity
- `POST`, `PUT`, `PATCH`, and `DELETE` on the opportunity routes require an authenticated administrator.
- Filters: `category`, `country`, `level`, `status`, `is_featured`, `search`, `ordering`
- Opportunities are drafts by default. Django Admin supports manual authoring and publishing.
- Collected source records remain private until an administrator links them to a scholarship or opportunity and verifies them. Opportunities linked to collected records cannot be published unless all linked source records are verified and available.
- The public API excludes unpublished opportunities and any opportunity linked to an unverified, incomplete, or unavailable source record.

### Universities
- `GET /api/v1/universities/` - List universities
- `GET /api/v1/universities/{slug}/` - Get university details

### Destinations
- `GET /api/v1/destinations/` - List study destinations
- `GET /api/v1/destinations/{slug}/` - Get destination details

University and destination records are currently public by default because their models
do not yet have publication status fields. Adding draft/published workflows requires a
reviewed schema migration before existing records can be hidden safely.

Services are exposed through the public catalogue API. Document management and notifications do
not yet have user-facing API routes. Consultant profiles are exposed only as a limited directory
of verified consultants for student consultation requests.

## Authentication

The API uses JWT (JSON Web Tokens) stored in HttpOnly cookies. JWT values are never
returned in login, registration, or refresh JSON responses.

### Login and cookies

```bash
POST /api/v1/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "STUDENT"
  }
}
```

### Browser sessions

The response sets `access_token` and `refresh_token` as HttpOnly cookies. Token values
are not returned in JSON. Browser clients send cookies with credentials, and unsafe
requests must include the CSRF token returned by `GET /api/v1/auth/csrf/` in the
`X-CSRFToken` header.

### Token Lifecycle

- **Access Token**: Valid for 15 minutes
- **Refresh Token**: Valid for 7 days
- Refresh tokens are rotated on each use and old ones are blacklisted.
- Logout clears both cookies and blacklists the submitted refresh token.

## User Roles

1. **STUDENT** - Regular student users
2. **CONSULTANT** - Study abroad consultants
3. **ADMIN** - Platform administrators
4. **SUPERADMIN** - Full system access

## Development Commands

```powershell
# Create new app
python manage.py startapp app_name apps/app_name

# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver

# Run tests
pytest

# Run tests with coverage
pytest --cov=apps --cov-report=html

# Code formatting
black apps/
isort apps/

# Linting
flake8 apps/

# Django shell
python manage.py shell

# Database shell
python manage.py dbshell

# Collect static files (production)
python manage.py collectstatic
```

## Testing

```powershell
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test apps.accounts
```

## Reference Data

Do not seed invented scholarships, universities, opportunities, or user accounts.
To import or update the standardized ISO country registry:

```powershell
python manage.py import_countries
```

## Environment Variables

Use `backend\.env.example` as a reference when creating `backend\.env`. Never
commit the latter or copy production credentials into a development environment.

```ini
# Required
DJANGO_SETTINGS_MODULE=config.settings.development
SECRET_KEY=your-secret-key
DB_NAME=gofer_exam_db
DB_USER=gofer_exam_user
DB_PASSWORD=your-unique-local-database-password
DB_HOST=localhost
DB_PORT=5432

# Optional
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
GOFER_FRONTEND_URL=http://localhost:3000
EMAIL_VERIFICATION_TOKEN_TTL_MINUTES=60
EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS=60

# Configure before production; use an address on a domain verified with your provider.
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
GOFER_EMAIL_FROM=no-reply@YOUR_VERIFIED_DOMAIN
EMAIL_HOST=smtp.your-provider.example
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=your-provider-username
EMAIL_HOST_PASSWORD=your-provider-password
EMAIL_TIMEOUT=10
```

Development uses Django's console email backend by default; verification messages
are printed to the backend console and are not delivered to an inbox. Production
requires an explicitly configured email backend, SMTP host, and sender address.
An SMTP/provider acceptance is not proof of inbox delivery; confirm the provider
and verified sender domain before inviting real users. Registration returns an
error if the configured backend rejects the verification message. A created but
unverified account can request a fresh message from the sign-in page.
The verification and resend endpoints are rate-limited with Django REST Framework
scoped throttles. Configure a shared Django cache for consistent limits across
multiple production workers.

## Troubleshooting

### PostgreSQL Connection Issues

1. Ensure PostgreSQL service is running:
   ```powershell
   Get-Service postgresql*
   ```

2. Test connection:
   ```powershell
   psql -U gofer_exam_user -d gofer_exam_db
   ```

3. Check `.env` database credentials match PostgreSQL setup

### Virtual Environment Issues

If activation fails:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Migration Issues

Inspect migration state and planned operations before diagnosing a migration issue.
Do not reset or fake migration history on a database containing data:
```powershell
python manage.py showmigrations
python manage.py migrate --plan
```

### Port Already in Use

Change port:
```powershell
python manage.py runserver 8001
```

## Production Deployment

For production deployment:

1. Set `DJANGO_SETTINGS_MODULE=config.settings.production`
2. Configure production environment variables
3. Set up SSL/TLS certificates
4. Configure static file storage (S3, etc.)
5. Set up email service (SendGrid, AWS SES, etc.)
6. Enable database backups
7. Configure logging and monitoring
8. Use gunicorn or similar WSGI server
9. Set up reverse proxy (nginx)

The Render API start command in `render.yaml` runs migrations at service startup.
Before migrating a database containing user data, inspect the migration and confirm
an available backup and recovery path. The included free database is temporary
and is not suitable for production data or durable document storage.

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test
3. Run tests: `pytest`
4. Format code: `black apps/ && isort apps/`
5. Commit changes: `git commit -m "Add feature"`
6. Push branch: `git push origin feature/your-feature`
7. Create Pull Request

## License

Proprietary - GOFER EXAM Platform

## Support

For issues or questions, contact the development team.
