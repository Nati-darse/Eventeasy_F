const express = require('express');
const router = express.Router();
const userAuth = require('../middlewares/userAuth');
const {
  verifyUserIdentity,
  initializePayment,
  verifyPayment,
  getPaymentStatus,
  getUserPayments
} = require('../controllers/paymentController');

// Verify user identity before payment
router.post('/verify-identity', userAuth, verifyUserIdentity);

// Initialize payment for an event
router.post('/initialize/:eventId', userAuth, initializePayment);

// Verify payment callback from Chapa (no auth required)
router.get('/verify', verifyPayment);

// Get payment status by transaction reference
router.get('/status/:txRef', userAuth, getPaymentStatus);

// Get all payments for a user
router.get('/user', userAuth, getUserPayments);

module.exports = router;