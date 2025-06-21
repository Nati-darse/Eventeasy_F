const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'ETB'
  },
  txRef: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: 'chapa'
  },
  chapaReference: {
    type: String
  },
  paymentDetails: {
    type: Object
  },
  verificationData: {
    type: Object
  }
}, { timestamps: true });

// Indexes for better query performance
paymentSchema.index({ txRef: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ eventId: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);