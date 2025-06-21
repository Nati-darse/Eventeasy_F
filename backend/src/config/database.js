const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Database Configuration
 * Handles MongoDB connection with proper error handling and connection events
 */
class DatabaseConfig {
  constructor() {
    this.connectionOptions = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    };
  }

  /**
   * Connect to MongoDB database
   * @returns {Promise<void>}
   */
  async connect() {
    try {
      await mongoose.connect(process.env.MONGO_URI, this.connectionOptions);
      console.log('✅ MongoDB connected successfully');
      this.setupEventListeners();
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
    }
  }

  /**
   * Setup database connection event listeners
   * @private
   */
  setupEventListeners() {
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connected to database');
    });

    mongoose.connection.on('error', (error) => {
      console.error('🔥 Mongoose connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ Mongoose disconnected from database');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔒 Mongoose connection closed due to app termination');
      process.exit(0);
    });
  }

  /**
   * Disconnect from database
   * @returns {Promise<void>}
   */
  async disconnect() {
    await mongoose.connection.close();
  }
}

module.exports = new DatabaseConfig();