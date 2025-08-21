# Database Setup Guide for Reiki Healing Platform

## Prerequisites

### 1. Install MySQL
Choose one of these options:

#### Option A: MySQL Community Server (Recommended)
- Download from: https://dev.mysql.com/downloads/mysql/
- Follow installation wizard
- Set root password during setup

#### Option B: XAMPP (Easier for beginners)
- Download from: https://www.apachefriends.org/
- Install XAMPP
- Start MySQL service from XAMPP Control Panel

#### Option C: MySQL with Homebrew (macOS)
```bash
brew install mysql
brew services start mysql
```

## Database Setup Steps

### 1. Configure Environment Variables
Edit your `.env` file in the backend directory:

```bash
# Update these values based on your MySQL setup
DB_HOST=localhost
DB_PORT=3306
DB_NAME=reiki_healing_platform
DB_USER=root
DB_PASSWORD=your_mysql_password
```

### 2. Initialize Database
Run this command from the backend directory:

```bash
npm run db:setup
```

This will:
- Create the database
- Create all tables with proper indexes
- Insert default admin user
- Add sample data for testing

### 3. Manual Setup (Alternative)
If you prefer to set up manually:

```bash
# Initialize database schema only
npm run db:init

# Add sample data (optional)
npm run db:seed
```

## Database Schema Overview

### Core Tables:
- **users** - All users (clients, therapists, admins)
- **therapist_profiles** - Additional therapist information
- **appointments** - Booking and session management
- **reviews** - Client feedback and ratings
- **notifications** - System notifications
- **refresh_tokens** - JWT token management

### Support Tables:
- **payment_transactions** - Payment processing
- **therapist_availability** - Scheduling
- **email_templates** - Email automation
- **system_settings** - Platform configuration

## Default Accounts Created

### Admin Account
- **Email:** admin@reikihealing.com
- **Password:** admin123
- **Role:** admin

### Sample Therapists
- **Akiko Tanaka:** master.akiko@reikihealing.com (password123)
- **David Williams:** healer.david@reikihealing.com (password123)
- **Crystal Martinez:** crystal.reiki@reikihealing.com (password123)

### Sample Clients
- **Sarah Johnson:** sarah.client@example.com (password123)
- **Mike Chen:** mike.wellness@example.com (password123)
- **Emma Rodriguez:** emma.seeker@example.com (password123)

## Verification

After setup, verify your database:

```bash
# Connect to MySQL
mysql -u root -p

# Use the database
USE reiki_healing_platform;

# Check tables
SHOW TABLES;

# Check sample data
SELECT COUNT(*) FROM users;
SELECT first_name, last_name, role FROM users;
```

## Troubleshooting

### Connection Issues
1. **MySQL not running:** Start MySQL service
2. **Access denied:** Check username/password in .env
3. **Database not found:** Run `npm run db:init`

### Common Errors
- **ECONNREFUSED:** MySQL service not started
- **ER_ACCESS_DENIED:** Wrong credentials in .env
- **ER_BAD_DB_ERROR:** Database doesn't exist

## Next Steps

1. ✅ Database setup complete
2. 🚀 Start backend server: `npm run dev`
3. 🌐 Test API endpoints
4. 📱 Connect frontend to backend
5. 💳 Configure payment processing (Stripe)
6. 📧 Set up email service (SMTP)

## Production Considerations

- Use strong passwords for all accounts
- Enable SSL/TLS for database connections
- Set up regular database backups
- Configure proper user permissions
- Use environment-specific databases
