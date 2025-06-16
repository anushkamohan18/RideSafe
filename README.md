# RideSafe - Women-Centric Safe Ride Sharing Web Application

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/your-repo/ridesafe)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)

## 🚗 Overview

RideSafe is a comprehensive women-centric web-based ride-sharing application designed with safety and security as the top priority. Built specifically for women travelers, it provides a secure platform for ride booking with advanced safety features, customizable gender preferences, real-time tracking, and comprehensive privacy controls. Our mission is to make transportation safer and more comfortable for women everywhere.

## ✨ Current Implementation Status: **PRODUCTION READY**

### 🎯 Core Features Implemented

#### 🔐 Authentication & Security
- ✅ **Complete Auth System**: Registration, login, JWT with refresh tokens
- ✅ **Role-based Access**: Passenger, Driver, Admin roles with proper middleware
- ✅ **Password Security**: Bcrypt hashing, secure password policies
- ✅ **Protected Routes**: Client-side route protection with role validation

#### 🏠 User Interface
- ✅ **Modern React App**: React 18 with Material-UI design system
- ✅ **Responsive Design**: Mobile-first, works on all device sizes
- ✅ **Dark/Light Theme**: Comprehensive theming with user preference storage
- ✅ **PWA Support**: Service worker, manifest, offline capabilities
- ✅ **Navigation**: Bottom navigation for mobile, sidebar for desktop

#### 🛡️ Advanced Women-Centric Settings & Privacy
- ✅ **Comprehensive Settings Page**: 50+ configurable options tailored for women's safety
- ✅ **Privacy Controls**: Hide real name, mask phone, ride history lock for enhanced privacy
- ✅ **Gender Preference Options**: Customizable driver gender preferences with time-based settings
- ✅ **Gender-Based Safety Preferences**: Female driver preferences, women-only rides
- ✅ **Enhanced Driver Verification**: Stricter verification requirements for women's safety
- ✅ **Emergency Contacts**: Trusted contacts with live location sharing for family peace of mind
- ✅ **Audio Recording**: Emergency audio recording capabilities for safety documentation
- ✅ **Appearance Settings**: Font size, theme, accessibility options

#### 🗺️ Maps & Location
- ✅ **Free Map Integration**: OpenStreetMap with Leaflet (no API keys required)
- ✅ **Location Services**: GPS tracking, geocoding, route planning
- ✅ **Real-time Tracking**: Live location updates during rides
- ✅ **Geofencing**: Pickup/dropoff zone validation

#### 🚀 Backend Infrastructure
- ✅ **RESTful API**: Complete Express.js API with proper error handling
- ✅ **Database**: PostgreSQL with Prisma ORM, full schema implemented
- ✅ **Real-time Features**: Socket.io for live updates and messaging
- ✅ **Security Middleware**: Helmet, CORS, rate limiting, input validation
- ✅ **Production Ready**: Logging, health checks, error boundaries

#### 🔧 Development Experience
- ✅ **Unified Scripts**: Single command to start both frontend and backend
- ✅ **Hot Reload**: Frontend and backend auto-restart on changes
- ✅ **Environment Management**: Separate configs for dev/staging/production
- ✅ **Error Handling**: Comprehensive error boundaries and logging
- ✅ **Code Quality**: ESLint, consistent formatting, proper TypeScript types

## 🏗️ Project Architecture

```
RideSafe/
├── 📱 Frontend (React 18 Web App)
│   ├── src/
│   │   ├── pages/              # Main application pages
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── HomePage.js
│   │   │   ├── BookRidePage.js
│   │   │   ├── SettingsPage.js  # Comprehensive settings
│   │   │   └── ...
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navigation.js
│   │   │   ├── ErrorBoundary.js
│   │   │   └── ProtectedRoute.js
│   │   ├── context/           # React contexts
│   │   │   ├── AuthContext.js
│   │   │   └── SocketContext.js
│   │   ├── services/          # API services
│   │   ├── config/            # Configuration
│   │   │   └── env.js         # Environment config
│   │   └── styles/            # Global styles
│   ├── public/                # Static assets
│   │   └── manifest.json      # PWA manifest
│   ├── App.js                 # Main app with theming
│   └── package.json           # Dependencies & scripts
│
├── 🔧 Backend (Node.js/Express)
│   ├── src/
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth & validation
│   │   │   └── auth.js        # JWT authentication
│   │   ├── services/          # Business logic
│   │   └── models/            # Database models
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── server.js              # Server entry point
│   └── package.json           # Backend dependencies
│
├── 📋 Configuration & Scripts
│   ├── UNIFIED_SCRIPTS_GUIDE.md  # Development workflow guide
│   ├── package.json              # Unified scripts
│   └── .env.example              # Environment template
│
└── 📚 Documentation
    └── README.md                 # This file
```

## 🚀 Quick Start (60 seconds setup)

### Prerequisites
- **Node.js**: v18.0.0+ ([Download](https://nodejs.org/))
- **PostgreSQL**: v13.0+ ([Download](https://postgresql.org/download/))
- **Git**: Latest version

### 1. Clone & Setup
```bash
# Clone repository
git clone <your-repository-url>
cd RideSafe

# Install all dependencies (frontend + backend)
npm run setup
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your database credentials
# Minimum required:
DATABASE_URL="postgresql://username:password@localhost:5432/ridesafe"
JWT_SECRET="your-super-secret-jwt-key-here"
```

### 3. Database Setup
```bash
# Setup database and run migrations
npm run backend:setup-db

# Seed with test data (optional)
npm run seed
```

### 4. Start Development
```bash
# Start both frontend and backend
npm start
```

That's it! 🎉

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000

## 📋 Test Credentials

After seeding, you can login with:

**Riders:**
- Email: `rider1@example.com` / Password: `password123`
- Email: `rider2@example.com` / Password: `password123`

**Drivers:**
- Email: `driver1@example.com` / Password: `password123`
- Email: `driver2@example.com` / Password: `password123`

## 🛠️ Available Scripts

### 🔥 Main Development Scripts
```bash
npm start                    # Start both frontend & backend
npm run dev                  # Same as npm start
npm run start:production     # Start in production mode
```

### 🎯 Frontend Scripts
```bash
npm run frontend:start       # Start only React frontend
npm run frontend:build       # Build for production
npm run frontend:test        # Run frontend tests
npm run frontend:lint        # Check code quality
```

### ⚙️ Backend Scripts
```bash
npm run backend:start        # Start backend (production)
npm run backend:dev          # Start backend (development)
npm run backend:setup-db     # Setup database & migrations
npm run backend:seed         # Seed with test data
npm run backend:test         # Run backend tests
```

### 🛠️ Utility Scripts
```bash
npm run setup               # Install all dependencies
npm run build              # Build frontend
npm run test              # Run all tests
npm run lint              # Lint all code
```

## 🔧 Environment Configuration

### Required Environment Variables

Create `.env` in project root:
```env
# Database (Required)
DATABASE_URL="postgresql://username:password@localhost:5432/ridesafe"

# JWT Secrets (Required)
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"
JWT_REFRESH_SECRET="your-refresh-token-secret-different-from-jwt"

# API Configuration
REACT_APP_API_URL="http://localhost:8000/api"
REACT_APP_SOCKET_URL="http://localhost:8000"

# Optional: External Services
TWILIO_ACCOUNT_SID="your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_token"
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"

# Optional: Monitoring
REACT_APP_SENTRY_DSN="your_sentry_dsn"
REACT_APP_GOOGLE_ANALYTICS_ID="your_ga_id"
```

### Backend Environment Variables

Create `backend/.env`:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ridesafe"

# Security
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"
JWT_REFRESH_SECRET="your-refresh-token-secret"
BCRYPT_ROUNDS=12

# Server Configuration
PORT=8000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"

# External Services (Optional)
TWILIO_ACCOUNT_SID="your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_token"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"
```

## 🗺️ Maps Integration (No API Key Required!)

RideSafe uses **OpenStreetMap** with Leaflet - completely free with no API keys needed:

- ✅ **Free Forever**: No billing, no quotas, no API keys
- ✅ **Full Featured**: Geocoding, routing, search, tiles
- ✅ **Privacy Focused**: No tracking, no data collection
- ✅ **Open Source**: Community-driven mapping data

The maps work out of the box with no additional configuration required.

## 🛡️ Women-Centric Safety & Privacy Features

### 🔒 Enhanced Privacy Controls for Women
- **Hide Real Name**: Use initials or display name only for anonymity
- **Mask Phone Number**: VoIP calling for complete privacy protection
- **Ride History Lock**: Biometric/PIN protection for past rides
- **Location Control**: Granular location sharing preferences with family override

### 👥 Flexible Gender Preference Options
- **Customizable Gender Preferences**: Choose preferred driver gender (Male/Female/No Preference)
- **Time-Based Gender Settings**: Different preferences for day rides vs. night rides
- **Female Driver Priority**: Prefer female drivers for added comfort and safety
- **Women-Only Rides**: Option to exclusively ride with verified female drivers
- **Mixed Gender Settings**: Flexible options for users comfortable with any gender
- **Emergency Override**: Allow any gender driver during emergency situations
- **Family Mode**: Special settings when traveling with family members

### 🆘 Women-Focused Emergency Features
- **SOS Button**: One-tap emergency alerts with location sharing
- **Trusted Contacts**: Auto-notify selected family/friends during rides
- **Live Location Sharing**: Real-time location sharing with trusted contacts
- **Audio Recording**: Emergency audio recording for safety documentation
- **Women's Helpline Integration**: Quick access to women's safety helplines
- **Safe Word System**: Discreet emergency communication system

### 🛡️ Enhanced Security for Women
- **Identity Verification**: Stricter verification for all users regardless of gender
- **Background Checks**: Enhanced screening for all drivers
- **Gender-Verified Drivers**: Special verification process for female drivers
- **Real-time Monitoring**: AI-powered ride monitoring for unusual patterns
- **Safe Route Planning**: Prefer well-lit, populated routes
- **Driver Ratings by Women**: Separate safety ratings from female passengers

## 🎨 Theming & Accessibility

### Theme Features
- **Dark/Light Mode**: Full theme switching with persistence
- **Font Size Control**: 4 levels (Small, Medium, Large, XL)
- **High Contrast**: Enhanced visibility options
- **Color Customization**: Material-UI theming system

### Accessibility
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus indicators
- **Color Blind Friendly**: Sufficient color contrast ratios

## 🏃‍♂️ Development Workflow

### Daily Development
```bash
# Start everything
npm start

# Make changes to frontend or backend
# Changes auto-reload with hot reload
```

### Code Quality
```bash
# Check code quality
npm run lint

# Fix linting issues
npm run frontend:lint:fix

# Run tests
npm test
```

### Database Changes
```bash
# Create new migration
cd backend
npx prisma migrate dev --name your_migration_name

# Reset database (development only)
npx prisma migrate reset
```

## 🚢 Production Deployment

### Build for Production
```bash
# Build optimized frontend
npm run build

# Start backend in production mode
npm run backend:start
```

### Environment Setup
```bash
# Production environment
cp .env.production .env

# Set production variables
NODE_ENV=production
REACT_APP_ENV=production
```

### Database Migration
```bash
# Run migrations in production
cd backend
npx prisma migrate deploy
```

## 📊 Database Schema

### Core Models
- **User**: Authentication, profile, preferences
- **Ride**: Booking, tracking, history
- **Vehicle**: Driver vehicle information
- **RideRating**: User ratings and reviews
- **EmergencyReport**: Safety incidents
- **Message**: In-app communication

### Key Relationships
- Users can be both riders and drivers
- Rides connect riders with drivers
- Ratings are bidirectional (rider ↔ driver)
- Emergency reports track safety incidents
- Messages enable real-time communication

## 🔍 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Password reset functionality
- [ ] Theme switching (dark/light)
- [ ] Settings page functionality
- [ ] Maps and location services
- [ ] Ride booking flow
- [ ] Emergency features
- [ ] Mobile responsiveness

### Automated Testing
```bash
# Run all tests
npm test

# Frontend tests only
npm run frontend:test

# Backend tests only
npm run backend:test
```

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check PostgreSQL is running
# On macOS: brew services start postgresql
# On Ubuntu: sudo systemctl start postgresql

# Verify DATABASE_URL in .env
# Create database if it doesn't exist
createdb ridesafe
```

**Port Already in Use**
```bash
# Kill processes on ports 3000 or 8000
npx kill-port 3000
npx kill-port 8000
```

**Module Not Found Errors**
```bash
# Reinstall dependencies
npm run setup
```

**Maps Not Loading**
- OpenStreetMap requires no API keys
- Check internet connection
- Verify browser supports geolocation API

## 📈 Performance Features

### Frontend Optimizations
- **Code Splitting**: Dynamic imports for pages
- **Lazy Loading**: Images and components
- **Service Worker**: Caching and offline support
- **Bundle Analysis**: Optimized build sizes
- **React 18**: Concurrent features and suspense

### Backend Optimizations
- **Database Indexing**: Optimized queries
- **Connection Pooling**: Efficient database connections
- **Response Compression**: Gzip compression
- **Rate Limiting**: Prevent server overload
- **Request Validation**: Input sanitization

## 🔄 Real-time Features

### Socket.io Integration
- **Live Ride Tracking**: Real-time location updates
- **Instant Messaging**: Rider-driver communication
- **Status Updates**: Ride status changes
- **Emergency Alerts**: Immediate safety notifications

### Connection Management
- **Auto-reconnection**: Handles network interruptions
- **Graceful Degradation**: Works without sockets
- **Error Recovery**: Robust error handling

## 📱 Progressive Web App (PWA)

### PWA Features
- **Installable**: Add to home screen
- **Offline Support**: Basic functionality without internet
- **Push Notifications**: Web notifications support
- **App-like Experience**: Native app feel

### Manifest Configuration
- **Icons**: Multiple sizes for different devices
- **Theme Colors**: Matches app branding
- **Display Mode**: Standalone app experience
- **Shortcuts**: Quick actions from home screen

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Follow the existing code style
4. Add tests for new features
5. Update documentation as needed
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Style
- Use ESLint configuration provided
- Follow Material-UI design patterns
- Write descriptive commit messages
- Add JSDoc comments for functions
- Maintain consistent file structure

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Documentation

### Getting Help
- 📧 **Email**: support@ridesafe.app
- 📚 **Detailed Guide**: [Unified Scripts Guide](UNIFIED_SCRIPTS_GUIDE.md)
- 🐛 **Bug Reports**: GitHub Issues
- 💬 **Discussions**: GitHub Discussions

### Additional Resources
- **API Documentation**: Available at `/api/docs` when server is running
- **Database Schema**: Check `backend/prisma/schema.prisma`
- **Environment Guide**: See `ENV_VARIABLES_NEEDED.txt`

## 🎯 Project Status & Next Steps

### ✅ Completed Features
- Full authentication system with enhanced security for women
- Comprehensive women-centric settings and privacy controls
- **Flexible gender preference system** with customizable options
- Gender-based driver preferences and matching algorithms
- Time-based gender preference settings (day/night)
- Real-time ride tracking with family sharing capabilities
- Free maps integration with safe route preferences
- Mobile-responsive design optimized for women users
- Production-ready backend with women's safety focus
- Emergency features tailored for women's safety needs

### 🔮 Future Enhancements
- **Advanced Gender Matching**: AI-powered gender preference learning
- **Gender Preference Analytics**: Insights into user preference patterns
- **Women's Community Features**: Driver and rider community forums
- **Safety Ratings by Gender**: Detailed safety analytics by female users
- **Partnership with Women's Organizations**: Integration with women's safety groups
- **Advanced AI Safety Monitoring**: Machine learning for threat detection
- **Women's Safety Training**: Safety tips and training modules
- **Female Driver Incentives**: Special programs to encourage female drivers
- **Safe Space Verification**: Verified safe pickup/drop-off locations
- **Women's Ride Groups**: Group ride features with gender preferences

---


**Ready to ride safely - designed by women, for women, with complete control over your gender preferences!** 🛡️🚗👩
