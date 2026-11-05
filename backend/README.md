# GOFER EXAM Backend API

Django REST API for the GOFER EXAM platform. Exposed routes include cookie-based authentication, public catalogues, student-owned application tracking, a read-only consultant assigned-application list, and a read-only administrator aggregate overview. Consultation booking and document upload APIs are not implemented.

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

# In the PostgreSQL prompt, run these commands:
CREATE DATABASE gofer_exam_db;
CREATE USER gofer_exam_user WITH PASSWORD 'postgres';
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

The `.env` file already exists with default development settings. Update if needed:

```
DJANGO_SETTINGS_MODULE=config.settings.development
DB_PASSWORD=your_postgres_password
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
- `POST /api/v1/auth/register/` - User registration
- `POST /api/v1/auth/login/` - User login; sets HttpOnly JWT cookies
- `POST /api/v1/auth/token/refresh/` - Refresh the HttpOnly access cookie
- `POST /api/v1/auth/logout/` - Clear cookies and blacklist the refresh token

### User Management
- `GET /api/v1/auth/me/` - Get current user profile
- `PATCH /api/v1/auth/me/` - Update current user profile

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

### Scholarships
- `GET /api/v1/scholarships/` - List published scholarships (with filters)
- `GET /api/v1/scholarships/{slug}/` - Get a published scholarship
- Filters: `country`, `type`, `level`, `status`, `is_featured`, `search`, `ordering`
- Scholarship records are drafts by default. Publish them through Django Admin before they are visible through the public API.

### Universities
- `GET /api/v1/universities/` - List universities
- `GET /api/v1/universities/{slug}/` - Get university details

### Destinations
- `GET /api/v1/destinations/` - List study destinations
- `GET /api/v1/destinations/{slug}/` - Get destination details

University and destination records are currently public by default because their models
do not yet have publication status fields. Adding draft/published workflows requires a
reviewed schema migration before existing records can be hidden safely.

Services are exposed through the public catalogue API. Consultation booking, document management,
notifications, and consultant profile models are not currently exposed as API routes.

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
pytest

# Run specific app tests
pytest apps/accounts/tests/

# Run with coverage
pytest --cov=apps --cov-report=html

# View coverage report
start htmlcov/index.html
```

## Database Seeding

To populate the database with demo data from Phase 1:

```powershell
python scripts/seed_database.py
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```ini
# Required
DJANGO_SETTINGS_MODULE=config.settings.development
SECRET_KEY=your-secret-key
DB_NAME=gofer_exam_db
DB_USER=gofer_exam_user
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# Optional
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
DEFAULT_FROM_EMAIL=noreply@goferexam.com
```

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

Reset migrations (⚠️ destroys data):
```powershell
python manage.py migrate --fake app_name zero
python manage.py migrate app_name
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
