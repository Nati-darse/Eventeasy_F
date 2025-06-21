const express = require('express');
const router = express.Router();
const userAuth = require('../middlewares/userAuth');
const {
  initializePayment,
  verifyPayment,
  getPaymentStatus,
  getUserPayments
} = require('../controllers/paymentController');

// Initialize payment for an event
router.post('/initialize/:eventId', userAuth, initializePayment);

// Verify payment callback from Chapa
router.get('/verify', verifyPayment);

// Get payment status by transaction reference
router.get('/status/:tx_ref', userAuth, getPaymentStatus);

// Get all payments for a user
router.get('/user', userAuth, getUserPayments);

module.exports = router;