const mongoose = require('mongoose');

/**
 * Database Configuration
 * Enhanced MongoDB connection with better error handling and monitoring
 */
class DatabaseConfig {
  constructor() {
    this.connectionOptions = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority',
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
      this.setupIndexes();
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

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 Mongoose reconnected to database');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔒 Mongoose connection closed due to app termination');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await mongoose.connection.close();
      console.log('🔒 Mongoose connection closed due to app termination');
      process.exit(0);
    });
  }

  /**
   * Setup database indexes for better performance
   * @private
   */
  async setupIndexes() {
    try {
      // User indexes
      await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
      await mongoose.connection.db.collection('users').createIndex({ googleId: 1 }, { sparse: true });
      await mongoose.connection.db.collection('users').createIndex({ role: 1 });
      await mongoose.connection.db.collection('users').createIndex({ isVerified: 1 });

      // Event indexes
      await mongoose.connection.db.collection('events').createIndex({ location: '2dsphere' });
      await mongoose.connection.db.collection('events').createIndex({ organizer: 1 });
      await mongoose.connection.db.collection('events').createIndex({ status: 1 });
      await mongoose.connection.db.collection('events').createIndex({ category: 1 });
      await mongoose.connection.db.collection('events').createIndex({ time: 1 });
      await mongoose.connection.db.collection('events').createIndex({ tags: 1 });
      await mongoose.connection.db.collection('events').createIndex({ createdAt: -1 });

      // Review indexes
      await mongoose.connection.db.collection('reviews').createIndex({ eventId: 1, userId: 1 }, { unique: true });
      await mongoose.connection.db.collection('reviews').createIndex({ eventId: 1, createdAt: -1 });
      await mongoose.connection.db.collection('reviews').createIndex({ rating: 1 });

      // Report indexes
      await mongoose.connection.db.collection('reports').createIndex({ reportedBy: 1 });
      await mongoose.connection.db.collection('reports').createIndex({ reportedEvent: 1 });
      await mongoose.connection.db.collection('reports').createIndex({ reportedUser: 1 });
      await mongoose.connection.db.collection('reports').createIndex({ status: 1 });
      await mongoose.connection.db.collection('reports').createIndex({ priority: 1 });
      await mongoose.connection.db.collection('reports').createIndex({ createdAt: -1 });

      // Payment indexes
      await mongoose.connection.db.collection('payments').createIndex({ txRef: 1 }, { unique: true });
      await mongoose.connection.db.collection('payments').createIndex({ userId: 1 });
      await mongoose.connection.db.collection('payments').createIndex({ eventId: 1 });
      await mongoose.connection.db.collection('payments').createIndex({ status: 1 });

      console.log('📊 Database indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating database indexes:', error);
    }
  }

  /**
   * Disconnect from database
   * @returns {Promise<void>}
   */
  async disconnect() {
    await mongoose.connection.close();
  }

  /**
   * Get database health status
   * @returns {object} Health status
   */
  getHealthStatus() {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    return {
      status: states[state] || 'unknown',
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
    };
  }
}

module.exports = new DatabaseConfig();