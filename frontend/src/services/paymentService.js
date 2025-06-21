import axios from 'axios';

const API_URL = 'http://localhost:5000/Event-Easy/payment';

/**
 * Payment Service
 * Handles payment operations with Chapa
 */
class PaymentService {
  /**
   * Initialize payment for an event
   * @param {string} eventId - Event ID
   * @returns {Promise<object>} Payment initialization result
   */
  static async initializePayment(eventId) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/initialize/${eventId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Payment initialization error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get payment status
   * @param {string} txRef - Transaction reference
   * @returns {Promise<object>} Payment status
   */
  static async getPaymentStatus(txRef) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/status/${txRef}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Get payment status error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get user payments
   * @returns {Promise<object>} User payments
   */
  static async getUserPayments() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Get user payments error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default PaymentService;