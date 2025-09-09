const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('🔗 Attempting to connect to MongoDB...');
    console.log('🔗 MongoDB URI:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0 // Disable mongoose buffering
    });

    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('❌ Full error:', error);
    // Don't exit the process, just log the error
    console.log('⚠️  Server will continue without MongoDB connection');
  }
};

module.exports = connectDB;
