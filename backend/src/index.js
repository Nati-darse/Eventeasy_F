require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Import routes
const router = require('./routes/routes');
const userRouter = require('./routes/userRoutes');
const eventRouter = require('./routes/eventRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const reportRouter = require('./routes/reportRoutes');
const paymentRouter = require('./routes/paymentRoutes');
const authRouter = require('./routes/authRoutes');
const adminRouter = require('./routes/adminRoutes');

// Import middleware
const { generalLimiter } = require('./middleware/rateLimiter');
const {
  securityHeaders,
  mongoSanitization,
  xssProtection,
  parameterPollution,
  customSecurity,
  validateInput,
} = require('./middleware/security');

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(customSecurity);
app.use(mongoSanitization);
app.use(xssProtection);
app.use(parameterPollution);
app.use(validateInput);

// Rate limiting
app.use(generalLimiter);

// CORS configuration
const allowedOrigins = [
  /^http:\/\/localhost:\d+$/, // Allow all localhost ports for dev
  'https://eventeasy-f.vercel.app',
  // Add more production origins as needed
  'https://accounts.google.com',
  'https://www.googleapis.com'
];

app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Allow Google domains for FedCM
    if (origin.includes('googleusercontent.com') || 
        origin.includes('accounts.google.com') ||
        origin.includes('www.googleapis.com')) {
      return callback(null, true);
    }
    // Allow all localhost ports for dev
    if (/^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    // Allow listed string origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'Sec-Fetch-Mode',
    'Sec-Fetch-Site',
    'Sec-Fetch-Dest'
  ],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  const dbHealth = connectDB.getHealthStatus();
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: dbHealth,
    environment: process.env.NODE_ENV || 'development',
  });
});

// Google OAuth test endpoint
app.get('/google-config', (req, res) => {
  res.status(200).json({
    success: true,
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured',
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
  });
});

// API routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Event-Easy backend is running',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

// Mount routes
app.use("/Event-Easy/users", router);
app.use("/Event-Easy/user", userRouter);
app.use("/Event-Easy/Event", eventRouter);
app.use('/Event-Easy/review', reviewRouter);
app.use('/Event-Easy/report', reportRouter);
app.use('/Event-Easy/payment', paymentRouter);
app.use('/Event-Easy/auth', authRouter);
app.use('/Event-Easy/admin', adminRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors,
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    });
  }

  // Default error
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

// Start server after DB connection
const startServer = async () => {
  try {
    await connectDB.connect();
    const PORT = process.env.PORT || 5000;
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Frontend URLs: http://localhost:5173, https://event-easy-n4tha.vercel.app`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
      });
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();