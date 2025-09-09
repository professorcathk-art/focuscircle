const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('🔗 Attempting to connect to MongoDB...');
    console.log('🔗 MongoDB URI:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
      connectTimeoutMS: 5000, // Connection timeout
      socketTimeoutMS: 5000, // Socket timeout
      bufferCommands: true // Enable buffering for serverless
    });

    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('❌ Full error:', error);
    // Don't exit the process, just log the error
    console.log('⚠️  Server will continue without MongoDB connection');
    throw error; // Re-throw so the caller knows it failed
  }
};

module.exports = connectDB;
