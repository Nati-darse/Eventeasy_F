const axios = require('axios');

/**
 * Chapa Payment Gateway Configuration
 * Handles payment processing with Chapa (Ethiopian payment provider)
 */
class ChapaConfig {
  constructor() {
    this.baseUrl = 'https://api.chapa.co/v1';
    this.secretKey = process.env.CHAPA_SECRET_KEY;
    this.publicKey = process.env.CHAPA_PUBLIC_KEY;
    
    // Use localhost for development - match the PaymentPage route
    const frontendUrl = 'http://localhost:5173';
    this.callbackUrl = `${frontendUrl}/payment`;
    this.returnUrl = `${frontendUrl}/payment`;
  }

  /**
   * Initialize payment with Chapa
   * @param {object} paymentData - Payment data
   * @returns {Promise<object>} Payment initialization result
   */
  async initializePayment(paymentData) {
    try {
      const { amount, email, firstName, lastName, tx_ref, title, description } = paymentData;
      
      // Shorten title to meet Chapa's 16-character limit
      const shortTitle = title ? title.substring(0, 16) : 'Event Payment';
      
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
            title: shortTitle,
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