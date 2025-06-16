# RideSafe - Unified Development Scripts Guide

## 🚀 Quick Start

### First Time Setup
```bash
# Install all dependencies (frontend + backend)
npm run setup

# Setup database and seed with test data
npm run backend:setup-db
npm run seed
```

### Development
```bash
# Start both backend and frontend in development mode
npm start
# or
npm run dev
```

This will start:
- **Backend** on `http://localhost:8000` (with nodemon for auto-restart)
- **Frontend** on `http://localhost:3000` (with hot reload)

## 📋 Available Scripts

### 🔥 Main Development Scripts
- `npm start` - Start both backend and frontend in development mode
- `npm run dev` - Same as `npm start` (alias)
- `npm run start:production` - Start both servers in production mode

### 🎯 Frontend-Only Scripts
- `npm run frontend:start` - Start only the React frontend
- `npm run frontend:build` - Build frontend for production
- `npm run frontend:build:production` - Build with production environment
- `npm run frontend:test` - Run frontend tests
- `npm run frontend:lint` - Lint frontend code
- `npm run frontend:lint:fix` - Fix linting issues
- `npm run frontend:serve` - Serve built frontend

### ⚙️ Backend-Only Scripts
- `npm run backend:start` - Start backend in production mode
- `npm run backend:dev` - Start backend in development mode (nodemon)
- `npm run backend:setup-db` - Setup database and run migrations
- `npm run backend:migrate` - Run database migrations
- `npm run backend:seed` - Seed database with test data
- `npm run backend:test` - Run backend tests
- `npm run backend:lint` - Lint backend code

### 🛠️ Utility Scripts
- `npm run setup` - Install all dependencies (frontend + backend)
- `npm run seed` - Seed database with test data
- `npm run build` - Build frontend for production
- `npm run test` - Run both frontend and backend tests
- `npm run lint` - Lint both frontend and backend code

## 🔐 Test Credentials

After seeding the database, you can login with:

**Riders:**
- Email: `rider1@example.com` / Password: `password123`
- Email: `rider2@example.com` / Password: `password123`

**Drivers:**
- Email: `driver1@example.com` / Password: `password123`
- Email: `driver2@example.com` / Password: `password123`

## 🎨 Console Output

The unified scripts use colored prefixes to distinguish between services:
- **BACKEND** - Blue background
- **FRONTEND** - Magenta background

## 📝 Development Workflow

1. **First time setup:**
   ```bash
   npm run setup
   npm run backend:setup-db
   npm run seed
   ```

2. **Daily development:**
   ```bash
   npm start
   ```

3. **Production build:**
   ```bash
   npm run build
   npm run start:production
   ```

## 🚨 Troubleshooting

- If you get port conflicts, make sure no other processes are using ports 3000 or 8000
- If database issues occur, run `npm run backend:setup-db` again
- For fresh data, run `npm run seed` to reset test data
- To stop all servers: `Ctrl+C` in the terminal running `npm start`

## 🌟 Benefits

- **Single command** to start everything
- **Unified output** with color-coded logs
- **Consistent naming** for all scripts
- **Easy switching** between development and production
- **Integrated testing** and linting 