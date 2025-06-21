import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import PaymentService from '../services/paymentService';
import { motion } from 'framer-motion';

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
                ? 'Your payment has been processed successfully.' 
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
            </div>
          )}

          <div className="mt-6 flex flex-col space-y-3">
            {isSuccessful && (
              <button
                onClick={() => navigate(`/attend/${paymentStatus.eventId}`)}
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                View Event Details
              </button>
            )}
            
            <button
              onClick={() => navigate('/Attendee')}
              className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Events
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Payment Initiation Page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-lg shadow-md max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Complete Your Purchase</h2>
        
        {event && (
          <div className="mb-6">
            <div className="flex items-center mb-4">
              {event.imageUrl?.url && (
                <img 
                  src={event.imageUrl.url} 
                  alt={event.eventName} 
                  className="w-20 h-20 object-cover rounded-md mr-4"
                />
              )}
              <div>
                <h3 className="font-bold text-lg">{event.eventName}</h3>
                <p className="text-gray-600 text-sm">
                  {new Date(event.time).toLocaleDateString()} at {new Date(event.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </div>
            
            <div className="border-t border-b border-gray-200 py-4 my-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Ticket Price:</span>
                <span className="font-semibold">{event.price?.amount || 100} ETB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Fee:</span>
                <span className="font-semibold">0 ETB</span>
              </div>
            </div>
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{event.price?.amount || 100} ETB</span>
            </div>
          </div>
        )}
        
        <div className="mt-6">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Pay with Chapa'
            )}
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>By completing this purchase, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentPage;