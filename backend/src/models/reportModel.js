const mongoose = require('mongoose');

/**
 * Report Model Schema
 * Handles event and user reports with admin workflow
 */
const reportSchema = new mongoose.Schema({
  reportType: {
    type: String,
    enum: ['event', 'user', 'content'],
    required: true,
  },

  // Reporter information
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // What is being reported
  reportedEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  },

  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  // Report details
  reason: {
    type: String,
    enum: [
      'Inappropriate Content',
      'Misleading Information',
      'Safety Concern',
      'Spam',
      'Fraudulent Event',
      'Organizer Issue',
      'Venue Problem',
      'Technical Issue',
      'Harassment',
      'Fake Profile',
      'Other'
    ],
    required: true,
  },

  description: {
    type: String,
    required: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },

  // Admin workflow
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'rejected', 'escalated'],
    default: 'pending',
  },

  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },

  // Admin handling
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  adminNotes: [{
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    note: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],

  resolution: {
    action: {
      type: String,
      enum: ['no_action', 'warning_sent', 'content_removed', 'user_suspended', 'event_cancelled', 'other'],
    },
    details: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: Date,
  },

  // Evidence
  evidence: [{
    type: String, // URLs to screenshots or other evidence
  }],

}, {
  timestamps: true,
});

// Indexes
reportSchema.index({ reportedBy: 1 });
reportSchema.index({ reportedEvent: 1 });
reportSchema.index({ reportedUser: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ priority: 1 });
reportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);