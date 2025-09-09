const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');
const connectRedis = require('./config/redis');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const websiteRoutes = require('./routes/website');
const summaryRoutes = require('./routes/summary');
const notificationRoutes = require('./routes/notification');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

const app = express();

// Trust proxy for Vercel (fixes rate limiting error)
app.set('trust proxy', 1);

// Debug environment variables
console.log('🔍 Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Missing');
console.log('REDIS_URL:', process.env.REDIS_URL ? 'Set' : 'Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Missing');
console.log('AIML_API_KEY:', process.env.AIML_API_KEY ? 'Set' : 'Missing');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

// Connect to databases with error handling
const initializeDatabases = async () => {
  try {
    await connectDB();
    console.log('✅ Database connection completed');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }

  try {
    const { connectRedis } = require('./config/redis');
    await connectRedis();
    console.log('✅ Redis connection completed');
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
  }
};

// Initialize databases
initializeDatabases();

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://focuscircle-mnl8.vercel.app',
  'https://focuscircle.vercel.app',
  'https://focuscircle-mnl8-jzvuugy6j-professorcathk-2833s-projects.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } 
    // Allow Vercel preview URLs (they have this pattern)
    else if (origin && origin.includes('vercel.app')) {
      console.log('Allowing Vercel preview URL:', origin);
      callback(null, true);
    } 
    else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// CORS test endpoint
app.get('/cors-test', (req, res) => {
  res.status(200).json({
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authenticateToken, userRoutes);
app.use('/api/websites', authenticateToken, websiteRoutes);
app.use('/api/summaries', authenticateToken, summaryRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🔄 Deployment: ${new Date().toISOString()}`);
});

module.exports = app;
