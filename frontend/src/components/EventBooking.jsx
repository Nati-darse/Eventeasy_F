import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarCheck, FaUsers, FaTicketAlt, FaCreditCard } from 'react-icons/fa';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from './LoadingSpinner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EventBooking = ({ event, onBookingSuccess, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [bookingType, setBookingType] = useState('rsvp'); // 'rsvp' or 'ticket'
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleRSVP = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `https://event-easy.onrender.com/Event-Easy/Event/events/${event._id}/attend`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        success('Successfully registered for the event!');
        onBookingSuccess('rsvp');
      } else {
        error(response.data.message || 'Failed to register for event');
      }
    } catch (err) {
      console.error('RSVP error:', err);
      error(err.response?.data?.message || 'Failed to register for event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTicketPurchase = () => {
    navigate(`/payment/${event._id}`);
  };

  const isPaidEvent = event.price?.amount > 0;
  const isEventFull = event.attendees?.length >= event.capacity;
  const isEventPast = new Date(event.time) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {isPaidEvent ? 'Purchase Ticket' : 'RSVP for Event'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {event.eventName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Event Details */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <FaCalendarCheck className="mr-2" />
              <span className="text-sm">
                {new Date(event.time).toLocaleDateString()} at{' '}
                {new Date(event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <FaUsers className="mr-2" />
              <span className="text-sm">
                {event.attendees?.length || 0} / {event.capacity} attendees
              </span>
            </div>
          </div>

          {isPaidEvent && (
            <div className="flex items-center justify-between">
              <div className="flex items-center text-green-600 dark:text-green-400">
                <FaTicketAlt className="mr-2" />
                <span className="text-sm font-medium">
                  {event.price.amount} {event.price.currency || 'ETB'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Booking Options */}
        {!isPaidEvent && (
          <div className="mb-6">
            <div className="flex border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setBookingType('rsvp')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  bookingType === 'rsvp'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                Free RSVP
              </button>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {isEventPast && (
          <div className="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 p-3 rounded-lg mb-4">
            This event has already passed.
          </div>
        )}

        {isEventFull && !isEventPast && (
          <div className="bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 p-3 rounded-lg mb-4">
            This event is currently full. You can still register to be added to the waitlist.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>

          {isPaidEvent ? (
            <button
              onClick={handleTicketPurchase}
              disabled={isEventPast || isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <FaCreditCard />
                  Buy Ticket
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleRSVP}
              disabled={isEventPast || isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <FaCalendarCheck />
                  RSVP Now
                </>
              )}
            </button>
          )}
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          By {isPaidEvent ? 'purchasing a ticket' : 'registering'}, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default EventBooking;