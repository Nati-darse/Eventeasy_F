const mongoose = require('mongoose');

/**
 * Event Model Schema
 * Defines the structure for event documents
 */
const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    minlength: [3, 'Event name must be at least 3 characters'],
    maxlength: [100, 'Event name cannot exceed 100 characters'],
  },

  time: {
    type: Date,
    required: [true, 'Event time is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Event time must be in the future',
    },
  },

  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: {
      values: [
        'Educational/Academic Events',
        'Social & Cultural Events',
        'Sports & Recreational Events',
        'Entertainment Events',
        'Professional & Educational Events',
        'religous',
      ],
      message: 'Please select a valid category',
    },
  },

  pattern: {
    type: String,
    required: [true, 'Event pattern is required'],
    trim: true,
    minlength: [2, 'Pattern must be at least 2 characters'],
    maxlength: [50, 'Pattern cannot exceed 50 characters'],
  },

  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },

  updates: {
    type: String,
    trim: true,
    maxlength: [500, 'Updates cannot exceed 500 characters'],
  },

  // Media files
  imageUrl: {
    public_id: {
      type: String,
      required: [true, 'Image is required'],
    },
    url: {
      type: String,
      required: [true, 'Image URL is required'],
    },
  },

  videoUrl: {
    public_id: String,
    url: String,
  },

  // Location using GeoJSON
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Event location is required'],
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates format',
      },
    },
    address: {
      type: String,
      trim: true,
    },
  },

  // Relationships
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Event organizer is required'],
  },

  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],

  // Event management
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected', 'cancelled'],
      message: 'Status must be pending, approved, rejected, or cancelled',
    },
    default: 'pending',
  },

  // Capacity and pricing
  capacity: {
    type: Number,
    min: [1, 'Capacity must be at least 1'],
    default: 100,
  },

  price: {
    amount: {
      type: Number,
      min: [0, 'Price cannot be negative'],
      default: 0,
    },
    currency: {
      type: String,
      default: 'ETB',
    },
  },

  // Event metadata
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],

  isPublic: {
    type: Boolean,
    default: true,
  },

  isFeatured: {
    type: Boolean,
    default: false,
  },

  // Analytics
  views: {
    type: Number,
    default: 0,
  },

  // Event dates
  registrationDeadline: Date,
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
eventSchema.index({ location: '2dsphere' }); // Geospatial index
eventSchema.index({ organizer: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ time: 1 });
eventSchema.index({ tags: 1 });

/**
 * Virtual for attendee count
 */
eventSchema.virtual('attendeeCount').get(function() {
  return this.attendees ? this.attendees.length : 0;
});

/**
 * Virtual for available spots
 */
eventSchema.virtual('availableSpots').get(function() {
  return this.capacity - this.attendeeCount;
});

/**
 * Virtual for event status display
 */
eventSchema.virtual('isUpcoming').get(function() {
  return this.time > new Date();
});

/**
 * Virtual for event duration (if endTime is added later)
 */
eventSchema.virtual('duration').get(function() {
  if (this.endTime) {
    return this.endTime - this.time;
  }
  return null;
});

/**
 * Pre-save middleware
 */
eventSchema.pre('save', function(next) {
  // Auto-generate tags from event name and description
  if (this.isModified('eventName') || this.isModified('description')) {
    const text = `${this.eventName} ${this.description || ''}`.toLowerCase();
    const words = text.match(/\b\w{3,}\b/g) || [];
    this.tags = [...new Set(words)].slice(0, 10); // Unique tags, max 10
  }
  
  next();
});

/**
 * Instance method to check if user is attending
 * @param {string} userId - User ID to check
 * @returns {boolean} Whether user is attending
 */
eventSchema.methods.isUserAttending = function(userId) {
  return this.attendees.some(attendee => 
    attendee.toString() === userId.toString()
  );
};

/**
 * Instance method to add attendee
 * @param {string} userId - User ID to add
 * @returns {boolean} Success status
 */
eventSchema.methods.addAttendee = function(userId) {
  if (this.isUserAttending(userId)) {
    return false; // Already attending
  }
  
  if (this.attendeeCount >= this.capacity) {
    throw new Error('Event is at full capacity');
  }
  
  this.attendees.push(userId);
  return true;
};

/**
 * Instance method to remove attendee
 * @param {string} userId - User ID to remove
 * @returns {boolean} Success status
 */
eventSchema.methods.removeAttendee = function(userId) {
  const index = this.attendees.findIndex(attendee => 
    attendee.toString() === userId.toString()
  );
  
  if (index === -1) {
    return false; // Not attending
  }
  
  this.attendees.splice(index, 1);
  return true;
};

/**
 * Instance method to increment view count
 */
eventSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

/**
 * Static method to find events near location
 * @param {number} longitude - Longitude
 * @param {number} latitude - Latitude
 * @param {number} maxDistance - Maximum distance in meters
 * @returns {Promise<Event[]>} Array of nearby events
 */
eventSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance,
      },
    },
    status: 'approved',
    time: { $gt: new Date() },
  });
};

/**
 * Static method to find upcoming events
 * @param {number} limit - Number of events to return
 * @returns {Promise<Event[]>} Array of upcoming events
 */
eventSchema.statics.findUpcoming = function(limit = 10) {
  return this.find({
    status: 'approved',
    time: { $gt: new Date() },
  })
  .sort({ time: 1 })
  .limit(limit)
  .populate('organizer', 'name email profilePicture');
};

/**
 * Static method to find events by category
 * @param {string} category - Event category
 * @returns {Promise<Event[]>} Array of events in category
 */
eventSchema.statics.findByCategory = function(category) {
  return this.find({
    category,
    status: 'approved',
    time: { $gt: new Date() },
  })
  .sort({ time: 1 })
  .populate('organizer', 'name email profilePicture');
};

module.exports = mongoose.model('Event', eventSchema);