const Payment = require('../models/paymentModel');
const Event = require('../models/Event');
const User = require('../models/User');
const chapaConfig = require('../config/chapa');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

/**
 * Send payment confirmation email
 * @param {object} payment - Payment object
 * @param {object} event - Event object
 * @param {object} user - User object
 */
const sendPaymentConfirmationEmail = async (payment, event, user) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `🎉 Payment Confirmed - ${event.eventName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Payment Successful!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Your ticket has been confirmed</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Event Details</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #667eea; margin-top: 0;">${event.eventName}</h3>
              <p><strong>Date:</strong> ${new Date(event.time).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${new Date(event.time).toLocaleTimeString()}</p>
              ${event.location?.address ? `<p><strong>Location:</strong> ${event.location.address}</p>` : ''}
              <p><strong>Category:</strong> ${event.category}</p>
            </div>
            
            <h2 style="color: #333;">Payment Details</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p><strong>Amount Paid:</strong> ${payment.amount} ${payment.currency}</p>
              <p><strong>Transaction ID:</strong> ${payment.txRef}</p>
              <p><strong>Payment Date:</strong> ${new Date(payment.verifiedAt).toLocaleString()}</p>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
              <h3 style="color: #28a745; margin-top: 0;">✅ Confirmation</h3>
              <p style="margin: 0;">You have been successfully added to the event attendees list. Please arrive 15 minutes before the event starts.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL}/attendee" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">View My Events</a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 14px;">
              <p>Thank you for using EventEasy!</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Payment confirmation email sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Failed to send payment confirmation email:', error);
    // Don't throw error - email failure shouldn't break the payment flow
  }
};

/**
 * Verify user identity before payment
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const verifyUserIdentity = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Get user details
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if email matches
    if (user.email !== email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email does not match your account' 
      });
    }

    // Check if user has a password (Google OAuth users might not have one)
    if (!user.password) {
      return res.status(400).json({ 
        success: false, 
        message: 'This account was created with Google OAuth. Please use Google login instead.' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Incorrect password' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Identity verified successfully'
    });
  } catch (error) {
    console.error('Identity verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify identity',
      error: error.message
    });
  }
};

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

    // Check if event has payment requirement
    if (!event.price || event.price.amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'This event is free. No payment required.' 
      });
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

    // Check if event has available spots
    if (event.maxAttendees && event.currentAttendees >= event.maxAttendees) {
      return res.status(400).json({ 
        success: false, 
        message: 'Event is full. No more spots available.' 
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
      amount: event.price.amount,
      currency: event.price.currency || 'ETB',
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
      currency: paymentData.currency,
      txRef,
      chapaReference: chapaResponse.data.reference,
      status: 'pending',
      paymentDetails: {
        eventName: event.eventName,
        userName: user.name,
        userEmail: user.email,
        eventDate: event.time,
        eventLocation: event.location?.address || 'Location TBD'
      }
    });

    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment initialized successfully',
      data: {
        checkoutUrl: chapaResponse.data.checkout_url,
        txRef,
        reference: chapaResponse.data.reference,
        amount: paymentData.amount,
        currency: paymentData.currency,
        eventName: event.eventName
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
    const isSuccessful = verificationResult.data.status === 'success';
    payment.status = isSuccessful ? 'success' : 'failed';
    payment.verificationData = verificationResult.data;
    payment.verifiedAt = new Date();
    await payment.save();

    // If payment successful, add user to event attendees and send email
    if (isSuccessful) {
      // Add user to event attendees
      await Event.findByIdAndUpdate(
        payment.eventId,
        { 
          $addToSet: { attendees: payment.userId },
          $inc: { currentAttendees: 1 } // Increment current attendees count
        }
      );

      // Get event and user details for email
      const event = await Event.findById(payment.eventId);
      const user = await User.findById(payment.userId);

      // Send confirmation email
      if (event && user) {
        await sendPaymentConfirmationEmail(payment, event, user);
      }

      console.log(`✅ Payment successful for event ${payment.eventId}, user ${payment.userId} added to attendees`);
    }

    // Redirect to thank you page
    const frontendUrl = 'http://localhost:5173';
    res.redirect(`${frontendUrl}/payment/thank-you?status=${payment.status}&tx_ref=${tx_ref}`);
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
    const userId = req.user.id;

    if (!txRef) {
      return res.status(400).json({ success: false, message: 'Transaction reference is required' });
    }

    const payment = await Payment.findOne({ txRef: txRef, userId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    // Get event details
    const event = await Event.findById(payment.eventId).select('eventName time location imageUrl');

    res.status(200).json({
      success: true,
      data: {
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.createdAt,
        verifiedAt: payment.verifiedAt,
        eventId: payment.eventId,
        event: event,
        paymentDetails: payment.paymentDetails,
        txRef: payment.txRef
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
      .populate('eventId', 'eventName time category imageUrl location')
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
  verifyUserIdentity,
  initializePayment,
  verifyPayment,
  getPaymentStatus,
  getUserPayments
};