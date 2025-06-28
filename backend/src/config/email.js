const nodemailer = require('nodemailer');

/**
 * Email Configuration
 * Handles email service setup and operations
 */
class EmailConfig {
  constructor() {
    this.transporter = this.createTransport();
  }

  /**
   * Create nodemailer transporter
   * @private
   * @returns {object} Nodemailer transporter
   */
  createTransport() {
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      service: 'Gmail',
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  /**
   * Send email
   * @param {object} mailOptions - Email options
   * @returns {Promise<object>} Send result
   */
  async sendEmail(mailOptions) {
    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('❌ Email send error:', error);
      throw error;
    }
  }

  /**
   * Send welcome email
   * @param {string} email - Recipient email
   * @param {string} name - Recipient name
   * @returns {Promise<object>} Send result
   */
  async sendWelcomeEmail(email, name) {
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Welcome to Event Easy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">Welcome to Event Easy!</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering on Event Easy! We are excited to have you on board.</p>
          <p>Start exploring amazing events in your area and connect with like-minded people.</p>
          <p>Best regards,<br>Event Easy Team</p>
        </div>
      `,
    };

    return this.sendEmail(mailOptions);
  }

  /**
   * Send OTP email
   * @param {string} email - Recipient email
   * @param {string} otp - OTP code
   * @returns {Promise<object>} Send result
   */
  async sendOTPEmail(email, otp) {
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Account Verification OTP - Event Easy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">Email Verification</h2>
          <p>Your verification code is:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #1f2937; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p>This code is valid for 24 hours.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
        </div>
      `,
    };

    return this.sendEmail(mailOptions);
  }
}

module.exports = new EmailConfig();