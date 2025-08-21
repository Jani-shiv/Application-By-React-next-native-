# 🌟 Reiki Healing Platform - Complete Web & Mobile Application

A comprehensive, full-stack healing platform built with modern technologies, featuring user management, therapist profiles, appointment booking, and review systems.

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [User Accounts & Testing](#user-accounts--testing)
- [Project Structure](#project-structure)
- [Development Guidelines](#development-guidelines)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🎯 Overview

The Reiki Healing Platform is a modern, full-stack application designed to connect healing practitioners with clients. It provides a seamless experience for appointment booking, therapist management, and client interaction through both web and mobile interfaces.

### 🚀 Live Application
- **Web Application:** http://localhost:3001
- **Backend API:** http://localhost:3000
- **API Health Check:** http://localhost:3000/api/health

## ✨ Features

### 👑 Admin Features
- Complete user management system
- Therapist profile management
- Platform analytics and reporting
- System settings configuration
- User verification management

### 👨‍⚕️ Therapist Features
- Professional profile creation
- Availability schedule management
- Appointment booking system
- Client communication tools
- Revenue tracking and reporting

### 👤 Client Features
- Browse certified therapists
- Book appointments online
- Leave reviews and ratings
- Appointment history tracking
- Profile management

### 🔧 System Features
- JWT-based authentication with refresh tokens
- Email verification system
- Responsive design (mobile-friendly)
- Real-time notifications
- Secure password hashing
- File upload capabilities
- Search and filtering

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Database:** MySQL 8.0
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Email Service:** Nodemailer
- **File Upload:** Multer
- **Validation:** express-validator
- **Development:** Nodemon

### Frontend (Web)
- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Animations:** Framer Motion
- **HTTP Client:** Axios
- **State Management:** React Context/Hooks

### Mobile App
- **Framework:** React Native
- **Development Platform:** Expo
- **Navigation:** React Navigation

### Database
- **Primary Database:** MySQL
- **Development Environment:** XAMPP
- **ORM/Query Builder:** Native MySQL2 queries

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **XAMPP** (for MySQL database)
- **Git** (for version control)

### System Requirements
- **OS:** Windows 10/11, macOS, or Linux
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 2GB free space

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Jani-shiv/Application-By-React-next-native-.git
cd Application-By-React-next-native-
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies
```bash
cd ../web-app
npm install
```

#### Mobile App Dependencies
```bash
cd ../mobile-app
npm install
```

### 3. Database Setup

#### Start XAMPP MySQL
1. Open XAMPP Control Panel
2. Start **Apache** and **MySQL** services
3. Ensure MySQL is running on port 3306

#### Create Database
```bash
cd backend
npm run db:create
npm run db:seed
```

### 4. Environment Configuration

Create `.env` file in the `backend` directory:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=reiki_healing_platform

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_REFRESH_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Application Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3001

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

## 🚀 Running the Application

### Method 1: Individual Services

#### Start Backend Server
```bash
cd backend
npm run dev
```
**Server will run on:** http://localhost:3000

#### Start Frontend Application
```bash
cd web-app
npm run dev
```
**Application will run on:** http://localhost:3001

#### Start Mobile App (Optional)
```bash
cd mobile-app
npm start
```

### Method 2: Quick Start Script
```bash
# Windows
.\start-platform.ps1

# Or manually start both servers
npm run start:all
```

## 🗄️ Database Schema

The platform uses a comprehensive MySQL database with the following tables:

### Core Tables

#### 1. users
```sql
- id (PRIMARY KEY)
- email (UNIQUE)
- password_hash
- first_name, last_name
- phone, date_of_birth, address
- profile_image
- role (client/therapist/admin)
- is_verified
- email_verification_token
- password_reset_token
- password_reset_expires
- last_login
- created_at, updated_at
```

#### 2. therapist_profiles
```sql
- id (PRIMARY KEY)
- user_id (FOREIGN KEY → users.id)
- bio, years_experience
- hourly_rate
- specializations (JSON)
- certifications (JSON)
- profile_image
- is_verified, is_active
- created_at, updated_at
```

#### 3. appointments
```sql
- id (PRIMARY KEY)
- client_id (FOREIGN KEY → users.id)
- therapist_id (FOREIGN KEY → users.id)
- appointment_date, start_time, end_time
- status (pending/confirmed/completed/cancelled)
- session_type, notes
- total_amount
- created_at, updated_at
```

#### 4. reviews
```sql
- id (PRIMARY KEY)
- appointment_id (FOREIGN KEY → appointments.id)
- client_id (FOREIGN KEY → users.id)
- therapist_id (FOREIGN KEY → users.id)
- rating (1-5), review_text
- is_public
- created_at, updated_at
```

### Supporting Tables
- **availability** - Therapist availability schedules
- **notifications** - System notifications
- **refresh_tokens** - JWT refresh token management
- **system_settings** - Platform configuration

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "client"
}
```

#### POST `/api/auth/login`
Authenticate user and receive JWT tokens.
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/refresh`
Refresh expired access token.
```json
{
  "refreshToken": "your-refresh-token"
}
```

### User Management Endpoints

#### GET `/api/users/profile`
Get current user profile (requires authentication).

#### PUT `/api/users/profile`
Update user profile information.

#### GET `/api/therapists`
Get list of all verified therapists.

#### GET `/api/therapists/:id`
Get specific therapist details.

### Appointment Endpoints

#### POST `/api/appointments`
Create new appointment booking.

#### GET `/api/appointments`
Get user's appointments (client or therapist view).

#### PUT `/api/appointments/:id`
Update appointment status or details.

### Review Endpoints

#### POST `/api/reviews`
Submit appointment review.

#### GET `/api/reviews/therapist/:id`
Get reviews for specific therapist.

### Admin Endpoints

#### GET `/api/admin/users`
Get all users (admin only).

#### PUT `/api/admin/users/:id/verify`
Verify user account (admin only).

## � User Accounts & Testing

The platform comes with pre-configured test accounts for immediate testing:

### 👑 Admin Account
- **Email:** `admin@reikihealing.com`
- **Password:** `admin123`
- **Capabilities:** Full platform management

### 👨‍⚕️ Therapist Accounts

#### Akiko Tanaka (Reiki Master)
- **Email:** `master.akiko@reikihealing.com`
- **Password:** `password123`
- **Specialization:** Traditional Reiki, Energy Healing
- **Rate:** $80/hour

#### Dr. Michael Chen (Holistic Practitioner)
- **Email:** `dr.chen@reikihealing.com`
- **Password:** `password123`
- **Specialization:** Reiki, Chakra Balancing, Meditation
- **Rate:** $90/hour

#### Elena Rodriguez (Certified Healer)
- **Email:** `elena.rodriguez@reikihealing.com`
- **Password:** `password123`
- **Specialization:** Crystal Healing, Reiki, Spiritual Guidance
- **Rate:** $75/hour

### 👤 Client Accounts

#### Sarah Johnson
- **Email:** `sarah.client@example.com`
- **Password:** `password123`

#### David Wilson
- **Email:** `david.client@example.com`
- **Password:** `password123`

#### Emma Thompson
- **Email:** `emma.client@example.com`
- **Password:** `password123`

## 📁 Project Structure

```
reiki-healing-platform/
│
├── backend/                     # Node.js/Express API
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js      # Database connection
│   │   │   └── email.js         # Email configuration
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT authentication
│   │   │   ├── upload.js        # File upload handling
│   │   │   └── validation.js    # Request validation
│   │   ├── routes/
│   │   │   ├── auth.js          # Authentication routes
│   │   │   ├── users.js         # User management
│   │   │   ├── therapists.js    # Therapist operations
│   │   │   ├── appointments.js  # Booking system
│   │   │   ├── reviews.js       # Review system
│   │   │   └── admin.js         # Admin operations
│   │   ├── utils/
│   │   │   ├── email.js         # Email utilities
│   │   │   └── helpers.js       # Common functions
│   │   └── server.js            # Main server file
│   ├── uploads/                 # File upload directory
│   ├── scripts/
│   │   ├── create-database.js   # Database creation
│   │   └── seed-database.js     # Sample data seeding
│   ├── package.json
│   └── .env                     # Environment variables
│
├── web-app/                     # React Web Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── Layout.tsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   └── therapists/
│   │   │       ├── TherapistCard.tsx
│   │   │       └── TherapistList.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── TherapistsPage.tsx
│   │   │   ├── AppointmentsPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── utils/
│   │   │   ├── api.ts            # API client
│   │   │   └── auth.ts           # Authentication utilities
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript type definitions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── mobile-app/                  # React Native Mobile App
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── navigation/
│   │   └── utils/
│   ├── App.tsx
│   └── package.json
│
├── shared/                      # Shared types and utilities
│   └── types/
│       └── index.ts
│
├── docs/                        # Documentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── TROUBLESHOOTING.md
│
├── .github/
│   └── copilot-instructions.md  # GitHub Copilot configuration
│
├── README.md                    # This file
├── PLATFORM_STATUS.md           # Current platform status
└── start-platform.ps1           # Quick start script
```

## 🔧 Development Guidelines

### Code Style
- **Backend:** Use ES6+ features, async/await
- **Frontend:** Follow React best practices, use TypeScript
- **Database:** Use prepared statements, avoid SQL injection

### Security Best Practices
- All passwords are hashed using bcryptjs
- JWT tokens have expiration times
- Input validation on all endpoints
- CORS configuration for production
- File upload restrictions

### Testing
```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd web-app
npm test

# Run mobile app tests
cd mobile-app
npm test
```

### Git Workflow
1. Create feature branches from `main`
2. Use conventional commit messages
3. Submit pull requests for review
4. Ensure all tests pass before merging

## 🚀 Deployment

### Production Environment Setup

#### 1. Environment Variables
Update `.env` with production values:
```env
NODE_ENV=production
DB_HOST=your-production-db-host
JWT_SECRET=your-production-jwt-secret
EMAIL_HOST=your-production-email-host
FRONTEND_URL=https://your-domain.com
```

#### 2. Database Migration
```bash
npm run db:migrate:prod
```

#### 3. Build Applications
```bash
# Build frontend
cd web-app
npm run build

# Build mobile app
cd mobile-app
npm run build
```

#### 4. Deploy to Server
```bash
# Using PM2 for process management
npm install -g pm2
cd backend
pm2 start src/server.js --name "reiki-api"
```

### Recommended Hosting Platforms
- **Backend:** Railway, Heroku, DigitalOcean
- **Frontend:** Vercel, Netlify, Cloudflare Pages
- **Database:** PlanetScale, AWS RDS, DigitalOcean Databases
- **Mobile:** Expo Application Services (EAS)

## 🔍 Troubleshooting

### Common Issues

#### Backend Server Won't Start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID [PID_NUMBER] /F

# Restart server
cd backend
npm run dev
```

#### Database Connection Error
1. Ensure XAMPP MySQL is running
2. Check database credentials in `.env`
3. Verify database exists:
```bash
npm run db:create
```

#### Frontend Build Errors
```bash
# Clear node_modules and reinstall
cd web-app
rm -rf node_modules package-lock.json
npm install
```

#### Authentication Issues
1. Clear browser localStorage
2. Check JWT_SECRET in `.env`
3. Restart backend server

### Debug Mode
```bash
# Enable debug logging
NODE_ENV=development DEBUG=* npm run dev
```

### Performance Optimization
- Use database indexing for frequently queried fields
- Implement caching for static data
- Optimize image uploads and storage
- Use CDN for static assets

## 🤝 Contributing

We welcome contributions from developers, designers, and the healing community! Here's how you can contribute to make this platform even better:

### 🚀 Quick Contribution Guide

1. **Fork the Repository**
   ```bash
   # Fork on GitHub: https://github.com/Jani-shiv/Application-By-React-next-native-/fork
   git clone https://github.com/YOUR_USERNAME/Application-By-React-next-native-.git
   cd Application-By-React-next-native-
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   # or for bug fixes:
   git checkout -b bugfix/fix-issue-name
   ```

3. **Make Your Changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation if needed
   - Test your changes thoroughly

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "✨ feat: Add amazing new feature
   
   - Describe what your feature does
   - List any breaking changes
   - Reference any related issues (#123)"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Create a Pull Request**
   - Go to: https://github.com/Jani-shiv/Application-By-React-next-native-/pulls
   - Click "New Pull Request"
   - Choose your branch and describe your changes
   - Link any related issues

### 💡 What Can You Contribute?

#### 🐛 **Bug Fixes**
- Fix authentication issues
- Resolve database connection problems
- Improve error handling
- Fix responsive design issues

#### ✨ **New Features**
- Payment integration (Stripe, PayPal)
- Video consultation feature
- Calendar synchronization
- Push notifications
- Multi-language support
- Dark mode theme
- Advanced search filters

#### 📱 **Mobile App Enhancements**
- iOS/Android specific features
- Offline mode capabilities
- Camera integration for profile photos
- Location-based therapist search
- Biometric authentication

#### 🎨 **UI/UX Improvements**
- Better accessibility features
- Improved animations
- New themes and layouts
- Better user onboarding
- Enhanced admin dashboard

#### 📚 **Documentation**
- API documentation improvements
- Tutorial videos
- Code examples
- Translation of docs
- Better error message guides

### 🏷️ **Issue Labels & Types**

When creating issues or PRs, please use these labels:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested
- `security` - Security-related issues
- `performance` - Performance improvements
- `mobile` - Mobile app specific
- `backend` - Backend/API related
- `frontend` - Web app related
- `database` - Database related

### 📋 **Contribution Guidelines**

#### Code Style
- **Backend**: Follow Node.js best practices, use async/await
- **Frontend**: Use TypeScript, follow React hooks patterns
- **Mobile**: Follow React Native conventions
- **Database**: Use prepared statements, proper indexing

#### Commit Message Format
Use conventional commits format:
```
type(scope): description

body (optional)

footer (optional)
```

Examples:
- `feat(auth): add OAuth login support`
- `fix(api): resolve therapist search bug`
- `docs(readme): update installation guide`
- `style(ui): improve responsive design`

#### Testing Requirements
- Add unit tests for new functions
- Include integration tests for API endpoints
- Test mobile app on both iOS and Android
- Ensure all existing tests pass

#### Security Guidelines
- Never commit sensitive data (passwords, API keys)
- Use environment variables for configuration
- Follow OWASP security guidelines
- Report security issues privately

### 🌟 **Recognition**

Contributors will be:
- Listed in our Contributors section
- Mentioned in release notes
- Invited to join our developer community
- Eligible for contributor badges

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing frontend framework
- **Express.js** for the robust backend framework
- **MySQL** for reliable database management
- **Tailwind CSS** for beautiful, responsive design
- **All contributors** who helped build this platform

### 🏆 **Contributors**

Thanks to all the amazing people who have contributed to this project:

<!-- Contributors list will be automatically updated -->
<a href="https://github.com/Jani-shiv/Application-By-React-next-native-/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Jani-shiv/Application-By-React-next-native-" />
</a>

### 🌟 **Special Thanks**
- The healing and wellness community for inspiration
- Beta testers who provided valuable feedback
- Open source projects that made this possible

## 📊 **Project Stats**

![GitHub stars](https://img.shields.io/github/stars/Jani-shiv/Application-By-React-next-native-?style=social)
![GitHub forks](https://img.shields.io/github/forks/Jani-shiv/Application-By-React-next-native-?style=social)
![GitHub issues](https://img.shields.io/github/issues/Jani-shiv/Application-By-React-next-native-)
![GitHub pull requests](https://img.shields.io/github/issues-pr/Jani-shiv/Application-By-React-next-native-)
![GitHub license](https://img.shields.io/github/license/Jani-shiv/Application-By-React-next-native-)

## 🚀 **Quick Links**

- 🌐 **Live Demo**: [Coming Soon]
- 📱 **Mobile App**: [App Store](#) | [Google Play](#)
- 📖 **Documentation**: https://github.com/Jani-shiv/Application-By-React-next-native-/wiki
- 🐛 **Report Bug**: https://github.com/Jani-shiv/Application-By-React-next-native-/issues/new?template=bug_report.md
- 💡 **Request Feature**: https://github.com/Jani-shiv/Application-By-React-next-native-/issues/new?template=feature_request.md
- 💬 **Join Discussion**: https://github.com/Jani-shiv/Application-By-React-next-native-/discussions

## 📞 Support & Contact

### 🐛 **Report Issues**
Found a bug or have a feature request? Please report it:
- **GitHub Issues**: https://github.com/Jani-shiv/Application-By-React-next-native-/issues
- **New Issue**: https://github.com/Jani-shiv/Application-By-React-next-native-/issues/new

### 💬 **Get Help & Discussions**
- **GitHub Discussions**: https://github.com/Jani-shiv/Application-By-React-next-native-/discussions
- **Q&A Forum**: https://github.com/Jani-shiv/Application-By-React-next-native-/discussions/categories/q-a
- **Feature Requests**: https://github.com/Jani-shiv/Application-By-React-next-native-/discussions/categories/ideas

### 👥 **Community**
- **Contributors**: https://github.com/Jani-shiv/Application-By-React-next-native-/graphs/contributors
- **Wiki**: https://github.com/Jani-shiv/Application-By-React-next-native-/wiki
- **Releases**: https://github.com/Jani-shiv/Application-By-React-next-native-/releases

### 📧 **Direct Contact**
For urgent matters, security issues, or business inquiries:
- **Repository Owner**: [@Jani-shiv](https://github.com/Jani-shiv)
- **Email**: admin@reikihealing.com (for platform-related queries)

### 🔒 **Security Issues**
For security vulnerabilities, please:
1. **DO NOT** create a public issue
2. Email security concerns privately
3. Use GitHub's security advisory feature
4. Allow time for responsible disclosure

### 📚 **Documentation Links**
- **Main Repository**: https://github.com/Jani-shiv/Application-By-React-next-native-
- **Project Board**: https://github.com/Jani-shiv/Application-By-React-next-native-/projects
- **Code of Conduct**: https://github.com/Jani-shiv/Application-By-React-next-native-/blob/main/CODE_OF_CONDUCT.md
- **Contributing Guide**: https://github.com/Jani-shiv/Application-By-React-next-native-/blob/main/CONTRIBUTING.md

---

**🌟 Built with ❤️ for the healing community**

*Last updated: August 21, 2025*
