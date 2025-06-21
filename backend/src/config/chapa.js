const axios = require('axios');
require('dotenv').config();

/**
 * Chapa Payment Gateway Configuration
 * Handles payment processing with Chapa (Ethiopian payment provider)
 */
class ChapaConfig {
  constructor() {
    this.baseUrl = 'https://api.chapa.co/v1';
    this.secretKey = process.env.CHAPA_SECRET_KEY;
    this.publicKey = process.env.CHAPA_PUBLIC_KEY;
    this.callbackUrl = process.env.FRONTEND_URL + '/payment/callback';
    this.returnUrl = process.env.FRONTEND_URL + '/payment/success';
  }

  /**
   * Initialize payment with Chapa
   * @param {object} paymentData - Payment data
   * @returns {Promise<object>} Payment initialization result
   */
  async initializePayment(paymentData) {
    try {
      const { amount, email, firstName, lastName, tx_ref, title, description } = paymentData;
      
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          amount,
          currency: 'ETB',
          email,
          first_name: firstName,
          last_name: lastName,
          tx_ref,
          callback_url: this.callbackUrl,
          return_url: this.returnUrl,
          customization: {
            title: title || 'Event Easy Payment',
            description: description || 'Payment for event ticket',
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('❌ Chapa payment initialization error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Verify payment with Chapa
   * @param {string} txRef - Transaction reference
   * @returns {Promise<object>} Payment verification result
   */
  async verifyPayment(txRef) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${txRef}`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('❌ Chapa payment verification error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Generate unique transaction reference
   * @param {string} prefix - Transaction reference prefix
   * @returns {string} Unique transaction reference
   */
  generateTransactionReference(prefix = 'EE-') {
    const timestamp = Date.now().toString();
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${timestamp}-${randomStr}`;
  }
}

module.exports = new ChapaConfig();