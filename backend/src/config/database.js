const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('🔗 Attempting to connect to MongoDB...');
    console.log('🔗 MongoDB URI:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs

    // Set mongoose options for better serverless compatibility
    mongoose.set('strictQuery', false);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Increased timeout
      connectTimeoutMS: 10000, // Connection timeout
      socketTimeoutMS: 10000, // Socket timeout
      bufferCommands: false, // Disable buffering for serverless
      bufferMaxEntries: 0, // Disable buffering
      maxPoolSize: 1, // Limit connection pool for serverless
      minPoolSize: 0, // No minimum connections
      maxIdleTimeMS: 30000, // Close connections after 30s
      retryWrites: true,
      w: 'majority'
    });

    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Connection state: ${conn.connection.readyState}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error name:', error.name);
    console.error('❌ Full error:', error);
    
    // Check if it's a network/connection issue
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('❌ Network issue - check MongoDB Atlas Network Access settings');
    } else if (error.code === 'EAUTH') {
      console.error('❌ Authentication issue - check MongoDB Atlas Database User credentials');
    }
    
    console.log('⚠️  Server will continue without MongoDB connection');
    throw error; // Re-throw so the caller knows it failed
  }
};

module.exports = connectDB;
