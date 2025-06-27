const mongoose = require('mongoose');

/**
 * Review Model Schema
 * Handles event reviews and ratings
 */
const reviewSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },

  comment: {
    type: String,
    maxlength: [500, 'Comment cannot exceed 500 characters'],
    trim: true,
  },

  // Review metadata
  isVerified: {
    type: Boolean,
    default: false, // True if user actually attended the event
  },

  isModerated: {
    type: Boolean,
    default: false,
  },

  moderationNotes: String,

  // Helpful votes
  helpfulVotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    helpful: Boolean,
  }],

}, {
  timestamps: true,
});

// Compound index to ensure one review per user per event
reviewSchema.index({ eventId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ eventId: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });

/**
 * Calculate helpfulness score
 */
reviewSchema.virtual('helpfulnessScore').get(function() {
  if (!this.helpfulVotes || this.helpfulVotes.length === 0) return 0;
  
  const helpful = this.helpfulVotes.filter(vote => vote.helpful).length;
  const total = this.helpfulVotes.length;
  
  return total > 0 ? (helpful / total) * 100 : 0;
});

module.exports = mongoose.model('Review', reviewSchema);