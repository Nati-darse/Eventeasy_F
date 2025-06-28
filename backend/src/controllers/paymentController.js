const Payment = require('../models/paymentModel');
const Event = require('../models/Event');
const User = require('../models/User');
const chapaConfig = require('../config/chapa');

/**
 * Initialize payment for event ticket
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const initializePayment = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Validate event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if user already has a ticket
    const existingPayment = await Payment.findOne({
      eventId,
      userId,
      status: 'success'
    });

    if (existingPayment) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have a ticket for this event' 
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate unique transaction reference
    const txRef = chapaConfig.generateTransactionReference();

    // Prepare payment data
    const paymentData = {
      amount: event.price?.amount || 100, // Default to 100 if not set
      email: user.email,
      firstName: user.name.split(' ')[0],
      lastName: user.name.split(' ').slice(1).join(' ') || 'User',
      tx_ref: txRef,
      title: `Ticket for ${event.eventName}`,
      description: `Payment for ${event.eventName} event ticket`
    };

    // Initialize payment with Chapa
    const chapaResponse = await chapaConfig.initializePayment(paymentData);

    // Save payment record
    const payment = new Payment({
      eventId,
      userId,
      amount: paymentData.amount,
      txRef,
      chapaReference: chapaResponse.data.reference,
      paymentDetails: {
        eventName: event.eventName,
        userName: user.name,
        userEmail: user.email
      }
    });

    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment initialized successfully',
      data: {
        checkoutUrl: chapaResponse.data.checkout_url,
        txRef,
        reference: chapaResponse.data.reference
      }
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize payment',
      error: error.message
    });
  }
};

/**
 * Verify payment callback from Chapa
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const verifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.query;

    if (!tx_ref) {
      return res.status(400).json({ success: false, message: 'Transaction reference is required' });
    }

    // Find payment record
    const payment = await Payment.findOne({ txRef: tx_ref });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    // Verify payment with Chapa
    const verificationResult = await chapaConfig.verifyPayment(tx_ref);

    // Update payment status
    payment.status = verificationResult.data.status === 'success' ? 'success' : 'failed';
    payment.verificationData = verificationResult.data;
    await payment.save();

    // If payment successful, add user to event attendees
    if (payment.status === 'success') {
      await Event.findByIdAndUpdate(
        payment.eventId,
        { $addToSet: { attendees: payment.userId } }
      );
    }

    // Redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL}/payment/status?status=${payment.status}&tx_ref=${tx_ref}`);
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};

/**
 * Get payment status
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getPaymentStatus = async (req, res) => {
  try {
    const { txRef } = req.params;

    if (!txRef) {
      return res.status(400).json({ success: false, message: 'Transaction reference is required' });
    }

    const payment = await Payment.findOne({ txRef: txRef });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.createdAt,
        eventId: payment.eventId,
        paymentDetails: payment.paymentDetails
      }
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message
    });
  }
};

/**
 * Get user payments
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id;

    const payments = await Payment.find({ userId })
      .populate('eventId', 'eventName time category imageUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user payments',
      error: error.message
    });
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
  getPaymentStatus,
  getUserPayments
};