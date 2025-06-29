import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, MapPin, CreditCard, Mail } from 'lucide-react';

const ThankYouPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const status = queryParams.get('status');
  const txRef = queryParams.get('tx_ref');

  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!txRef) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/Event-Easy/payment/status/${txRef}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPaymentDetails(data.data);
        } else {
          setError('Failed to load payment details');
        }
      } catch (err) {
        setError('Failed to load payment details');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [txRef]);

  const isSuccessful = status === 'success' || (paymentDetails && paymentDetails.status === 'success');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/attendee')}
            className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-8 text-center">
            {isSuccessful ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="inline-block mb-4"
                >
                  <CheckCircle className="w-20 h-20 text-green-300" />
                </motion.div>
                <h1 className="text-4xl font-bold mb-2">🎉 Payment Successful!</h1>
                <p className="text-xl opacity-90">Your ticket has been confirmed</p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">❌</div>
                <h1 className="text-4xl font-bold mb-2">Payment Failed</h1>
                <p className="text-xl opacity-90">There was an issue with your payment</p>
              </>
            )}
          </div>

          {/* Content */}
          <div className="p-8">
            {isSuccessful && paymentDetails && (
              <>
                {/* Success Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8"
                >
                  <div className="flex items-center mb-4">
                    <Mail className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-green-800">Confirmation Email Sent</h3>
                  </div>
                  <p className="text-green-700">
                    We've sent a confirmation email to your registered email address with all the event details.
                  </p>
                </motion.div>

                {/* Event Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <Calendar className="w-6 h-6 text-blue-600 mr-3" />
                    Event Details
                  </h2>
                  
                  {paymentDetails.event && (
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl p-4">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          {paymentDetails.event.eventName}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-gray-600">
                              {new Date(paymentDetails.event.time).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-gray-600">
                              {new Date(paymentDetails.event.time).toLocaleTimeString()}
                            </span>
                          </div>
                          {paymentDetails.event.location?.address && (
                            <div className="flex items-center md:col-span-2">
                              <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                              <span className="text-gray-600">
                                {paymentDetails.event.location.address}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Payment Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-8"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <CreditCard className="w-6 h-6 text-purple-600 mr-3" />
                    Payment Details
                  </h2>
                  
                  <div className="bg-white rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Amount Paid:</span>
                      <span className="font-semibold text-lg">
                        {paymentDetails.amount} {paymentDetails.currency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {paymentDetails.txRef}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Date:</span>
                      <span className="text-gray-800">
                        {new Date(paymentDetails.verifiedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Next Steps */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8"
                >
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">📋 What's Next?</h3>
                  <ul className="space-y-2 text-yellow-700">
                    <li>• Check your email for the confirmation details</li>
                    <li>• Arrive 15 minutes before the event starts</li>
                    <li>• Bring a valid ID for verification</li>
                    <li>• You can view all your events in your dashboard</li>
                  </ul>
                </motion.div>
              </>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {isSuccessful ? (
                <>
                  <button
                    onClick={() => navigate('/attendee')}
                    className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl"
                  >
                    View My Events
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="flex-1 bg-gray-500 text-white py-4 rounded-xl hover:bg-gray-600 transition-colors font-semibold text-lg"
                  >
                    Back to Home
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/attendee')}
                    className="flex-1 bg-blue-500 text-white py-4 rounded-xl hover:bg-blue-600 transition-colors font-semibold text-lg"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="flex-1 bg-gray-500 text-white py-4 rounded-xl hover:bg-gray-600 transition-colors font-semibold text-lg"
                  >
                    Back to Home
                  </button>
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ThankYouPage; 