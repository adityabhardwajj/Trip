import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables (Vercel will provide env vars automatically)
dotenv.config();

console.log('API function initializing...');
console.log('MONGODB_URI set:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET set:', !!process.env.JWT_SECRET);

// Import routes
import authRoutes from '../backend/routes/authRoutes.js';
import tripRoutes from '../backend/routes/tripRoutes.js';
import bookingRoutes from '../backend/routes/bookingRoutes.js';
import userRoutes from '../backend/routes/userRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure database connection before handling requests
app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
    }
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    const errorMessage = error.message || 'Database connection failed';
    console.error('Error details:', errorMessage);
    res.status(503).json({
      success: false,
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? errorMessage : 'Check server logs'
    });
  }
});

// Prevent caching for trip endpoints (to ensure fresh seat data)
app.use(['/api/trips', '/trips'], (req, res, next) => {
  res.removeHeader('ETag');
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Routes - mount with /api prefix (Vercel may preserve the full path)
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

// Also mount without /api prefix (in case Vercel strips it)
app.use('/auth', authRoutes);
app.use('/trips', tripRoutes);
app.use('/bookings', bookingRoutes);
app.use('/users', userRoutes);

// Health check (without /api prefix since Vercel already routes /api/* here)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Health check with /api prefix for compatibility
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  console.log('404 - Route not found:', req.method, req.path);
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.method} ${req.path} not found` 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Connect to MongoDB (with connection pooling for serverless)
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    // Close existing connection if any
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    const db = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    cachedDb = db;
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Initialize database connection on cold start
if (mongoose.connection.readyState === 0) {
  connectToDatabase().catch(console.error);
}

// Export the Express app for Vercel serverless functions
// Vercel expects the handler to be the default export
export default app;

// Also export as handler for compatibility
export const handler = app;

