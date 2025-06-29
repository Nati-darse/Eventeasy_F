import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const PaymentService = {
  async verifyIdentity(email, password) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/Event-Easy/payment/verify-identity`,
        { email, password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Identity verification error:', error.response?.data || error.message);
      throw error;
    }
  },

  async initializePayment(eventId) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/Event-Easy/payment/initialize/${eventId}`,
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
  },

  async getPaymentStatus(txRef) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/Event-Easy/payment/status/${txRef}`,
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
};

const PaymentPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const status = queryParams.get('status');
  const txRef = queryParams.get('tx_ref');

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);
  
  // Identity verification state
  const [showIdentityForm, setShowIdentityForm] = useState(false);
  const [identityData, setIdentityData] = useState({ email: '', password: '' });
  const [identityError, setIdentityError] = useState('');
  const [identityVerified, setIdentityVerified] = useState(false);

  // Check if we're on the status page
  const isStatusPage = status && txRef;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (isStatusPage) {
          // Fetch payment status
          const paymentData = await PaymentService.getPaymentStatus(txRef);
          setPaymentStatus(paymentData.data);
          
          // Also fetch event details if we have eventId
          if (paymentData.data.eventId) {
            const eventResponse = await axios.get(
              `http://localhost:5000/Event-Easy/Event/events/${paymentData.data.eventId}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
              }
            );
            setEvent(eventResponse.data);
          }
        } else if (eventId) {
          // Fetch event details
          const eventResponse = await axios.get(
            `http://localhost:5000/Event-Easy/Event/events/${eventId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );
          setEvent(eventResponse.data);
          
          // Show identity form for paid events
          if (eventResponse.data.price && eventResponse.data.price.amount > 0) {
            setShowIdentityForm(true);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, isStatusPage, txRef]);

  const handleIdentitySubmit = async (e) => {
    e.preventDefault();
    setIdentityError('');
    
    try {
      setLoading(true);
      await PaymentService.verifyIdentity(identityData.email, identityData.password);
      setIdentityVerified(true);
      setShowIdentityForm(false);
    } catch (err) {
      setIdentityError(err.response?.data?.message || 'Identity verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      const response = await PaymentService.initializePayment(eventId);
      
      if (response.success && response.data.checkoutUrl) {
        // Redirect to Chapa checkout page
        window.location.href = response.data.checkoutUrl;
      } else {
        setError('Failed to initialize payment. Please try again.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Payment initialization failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-center mb-4 text-5xl">⚠️</div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 text-center">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Payment Status Page
  if (isStatusPage) {
    const isSuccessful = status === 'success' || (paymentStatus && paymentStatus.status === 'success');
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-lg shadow-md max-w-md w-full"
        >
          <div className="text-center mb-6">
            {isSuccessful ? (
              <div className="text-green-500 text-6xl mb-4">✅</div>
            ) : (
              <div className="text-red-500 text-6xl mb-4">❌</div>
            )}
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isSuccessful ? 'Payment Successful!' : 'Payment Failed'}
            </h2>
            
            <p className="text-gray-600">
              {isSuccessful 
                ? 'Your payment has been processed successfully and you have been added to the event attendees.' 
                : 'There was an issue processing your payment.'}
            </p>
          </div>

          {paymentStatus && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">{paymentStatus.amount} {paymentStatus.currency}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-semibold">{txRef}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold">
                  {new Date(paymentStatus.createdAt).toLocaleString()}
                </span>
              </div>
              {paymentStatus.event && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Event:</span>
                  <span className="font-semibold">{paymentStatus.event.eventName}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-col space-y-3">
            {isSuccessful && (
              <button
                onClick={() => navigate('/attendee')}
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                View My Events
              </button>
            )}
            <button
              onClick={() => navigate('/attendee')}
              className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back to Events
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Identity Verification Form
  if (showIdentityForm && !identityVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-lg shadow-md max-w-md w-full"
        >
          <div className="text-center mb-6">
            <div className="text-orange-500 text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Identity</h2>
            <p className="text-gray-600">Please confirm your email and password to proceed with payment</p>
          </div>

          {event && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">{event.eventName}</h3>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Amount:</span>
                <span className="font-semibold">{event.price.amount} {event.price.currency || 'ETB'}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleIdentitySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={identityData.email}
                onChange={(e) => setIdentityData({ ...identityData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={identityData.password}
                onChange={(e) => setIdentityData({ ...identityData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your password"
                required
              />
            </div>

            {identityError && (
              <div className="text-red-500 text-sm text-center">{identityError}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Identity'}
            </button>
          </form>

          <button
            onClick={() => navigate(-1)}
            className="w-full mt-4 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </motion.div>
      </div>
    );
  }

  // Payment Page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-lg shadow-md max-w-md w-full"
      >
        <div className="text-center mb-6">
          <div className="text-orange-500 text-6xl mb-4">💳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Payment</h2>
          <p className="text-gray-600">You're about to purchase a ticket for this event</p>
        </div>

        {event && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">{event.eventName}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-semibold">{event.price.amount} {event.price.currency || 'ETB'}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(event.time).toLocaleDateString()}</span>
              </div>
              {event.location?.address && (
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="text-right">{event.location.address}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>🔒 Your payment will be processed securely by Chapa</p>
          <p>📧 You'll receive a confirmation email after successful payment</p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentPage;