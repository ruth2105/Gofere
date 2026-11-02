# PostgreSQL Installation and Setup Guide

This guide will help you install PostgreSQL on Windows and create the database for GOFER EXAM.

## Step 1: Download PostgreSQL

1. Visit the official PostgreSQL download page:
   **https://www.postgresql.org/download/windows/**

2. Click on "Download the installer" (PostgreSQL installer by EDB)

3. Download the latest stable version (PostgreSQL 16.x or later recommended)

## Step 2: Install PostgreSQL

1. Run the downloaded installer (`postgresql-16.x-windows-x64.exe`)

2. Follow the installation wizard:
   - **Installation Directory**: Accept default (`C:\Program Files\PostgreSQL\16`)
   - **Components**: Select all (PostgreSQL Server, pgAdmin 4, Command Line Tools)
   - **Data Directory**: Accept default
   - **Password**: Set a strong password for the `postgres` superuser
     - **⚠️ REMEMBER THIS PASSWORD!** You'll need it later
   - **Port**: 5432 (default)
   - **Locale**: Default locale

3. Click "Next" through the remaining screens and "Finish" when complete

4. Uncheck "Stack Builder" (we don't need additional tools)

## Step 3: Verify Installation

Open PowerShell and test:

```powershell
# Check if psql is accessible
psql --version

# If command not found, add to PATH:
# 1. Press Win + X, select "System"
# 2. Click "Advanced system settings" → "Environment Variables"
# 3. Under "System variables", find "Path", click "Edit"
# 4. Click "New" and add: C:\Program Files\PostgreSQL\16\bin
# 5. Click OK, restart PowerShell
```

## Step 4: Create Database and User

Open PowerShell and run:

```powershell
# Connect to PostgreSQL as superuser
psql -U postgres

# You'll be prompted for the password you set during installation
```

Once in the PostgreSQL prompt (`postgres=#`), run these commands:

```sql
-- Create the database
CREATE DATABASE gofer_exam_db;

-- Create the user
CREATE USER gofer_exam_user WITH PASSWORD 'postgres';

-- Configure user settings
ALTER ROLE gofer_exam_user SET client_encoding TO 'utf8';
ALTER ROLE gofer_exam_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE gofer_exam_user SET timezone TO 'UTC';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE gofer_exam_db TO gofer_exam_user;

-- Connect to the new database
\c gofer_exam_db

-- Grant schema privileges (PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO gofer_exam_user;

-- Exit PostgreSQL
\q
```

## Step 5: Test Database Connection

```powershell
# Test connection as the gofer_exam_user
psql -U gofer_exam_user -d gofer_exam_db -h localhost

# If successful, you'll see:
# gofer_exam_db=>

# Exit
\q
```

## Step 6: Update .env File (if needed)

If you used a different password or configuration, update `backend/.env`:

```ini
DB_NAME=gofer_exam_db
DB_USER=gofer_exam_user
DB_PASSWORD=postgres  # Change this if you used a different password
DB_HOST=localhost
DB_PORT=5432
```

## Step 7: Run Django Migrations

```powershell
# Navigate to backend directory
cd c:\Users\user\Desktop\abc\gofer-exam\backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Run migrations
python manage.py makemigrations
python manage.py migrate
```

## Troubleshooting

### Issue: "psql: command not found"

**Solution**: Add PostgreSQL to your PATH:

1. Press Win + X → System
2. Advanced system settings → Environment Variables
3. Under System variables, find "Path" → Edit
4. New → Add: `C:\Program Files\PostgreSQL\16\bin`
5. OK → Restart PowerShell

### Issue: "FATAL: password authentication failed"

**Solution**: Check your password and update `.env` file

```powershell
# Reset postgres password if forgotten:
# 1. Edit: C:\Program Files\PostgreSQL\16\data\pg_hba.conf
# 2. Change "md5" to "trust" for local connections
# 3. Restart PostgreSQL service
# 4. Run: psql -U postgres
# 5. ALTER USER postgres PASSWORD 'new_password';
# 6. Change "trust" back to "md5" in pg_hba.conf
# 7. Restart PostgreSQL service
```

### Issue: "connection refused"

**Solution**: Ensure PostgreSQL service is running:

```powershell
# Check service status
Get-Service postgresql*

# Start service if stopped
Start-Service postgresql-x64-16

# Set to start automatically
Set-Service postgresql-x64-16 -StartupType Automatic
```

### Issue: "FATAL: database does not exist"

**Solution**: Run the CREATE DATABASE commands again (Step 4)

### Issue: "permission denied for schema public"

**Solution**: Grant schema permissions:

```sql
psql -U postgres -d gofer_exam_db
GRANT ALL ON SCHEMA public TO gofer_exam_user;
\q
```

## Useful PostgreSQL Commands

```powershell
# Connect as superuser
psql -U postgres

# Connect to specific database
psql -U gofer_exam_user -d gofer_exam_db

# List all databases
\l

# List all users
\du

# Connect to a database
\c database_name

# List all tables
\dt

# Describe table structure
\d table_name

# Exit PostgreSQL
\q
```

## pgAdmin 4 (GUI Alternative)

If you prefer a graphical interface:

1. Open pgAdmin 4 (installed with PostgreSQL)
2. Right-click "Servers" → Create → Server
3. Name: "GOFER EXAM Local"
4. Connection tab:
   - Host: localhost
   - Port: 5432
   - Username: postgres
   - Password: [your postgres password]
5. Save

Then create database visually:
- Right-click "Databases" → Create → Database
- Name: gofer_exam_db
- Owner: postgres

## Next Steps

Once PostgreSQL is set up and the database is created:

1. Run Django migrations: `python manage.py migrate`
2. Create superuser: `python manage.py createsuperuser`
3. Run development server: `python manage.py runserver`
4. Access API at: http://localhost:8000/api/v1/

## Security Recommendations

### For Development:
- Current setup is fine with simple password

### For Production:
1. Use strong, unique passwords
2. Change default PostgreSQL port (5432)
3. Enable SSL/TLS connections
4. Configure firewall rules
5. Regular database backups
6. Use environment-specific credentials
7. Enable audit logging

## Backup and Restore

### Create Backup:
```powershell
pg_dump -U gofer_exam_user -d gofer_exam_db -F c -f backup.dump
```

### Restore Backup:
```powershell
pg_restore -U gofer_exam_user -d gofer_exam_db backup.dump
```

## Uninstall (if needed)

1. Windows Settings → Apps → PostgreSQL 16
2. Uninstall
3. Delete data directory: `C:\Program Files\PostgreSQL\16\data`
4. Remove from PATH environment variable
