const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const rideRoutes = require('./src/routes/rides');
const driverRoutes = require('./src/routes/drivers');
const emergencyRoutes = require('./src/routes/emergency');

// Import middleware
const { authMiddleware } = require('./src/middleware/auth');
const errorHandler = require('./src/middleware/errorHandler');
const logger = require('./src/middleware/logger');

// Import services
const socketService = require('./src/services/socketService');

const app = express();
const server = createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(logger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/rides', authMiddleware, rideRoutes);
app.use('/api/drivers', authMiddleware, driverRoutes);
app.use('/api/emergency', authMiddleware, emergencyRoutes);

// Socket.io connection handling
socketService.initialize(io);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`🚀 Zipp Server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔌 Socket.io ready for real-time connections`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = { app, server, io };