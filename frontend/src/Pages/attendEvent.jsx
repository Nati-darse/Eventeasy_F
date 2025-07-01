import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LeafletMapComponent from '../Components/LeafletMapComponent.jsx';
import { motion } from 'framer-motion';
import { useToast } from '../hooks/useToast.jsx';

const AttendeeEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [event, setEvent] = useState(null);
  const [attending, setAttending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/Login_Attendee');
      return;
    }

            fetch(`https://event-easy.onrender.com/Event-Easy/Event/events/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
        setLoading(false);

        // Decode userId from token
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.id;

        if (data.attendees && data.attendees.includes(userId)) {
          setAttending(true);
        }
      })
      .catch((error) => {
        console.error('Error fetching event:', error);
        setLoading(false);
      });
  }, [id, navigate]);

  const handleRegister = () => {
    const token = localStorage.getItem('token');
            fetch(`https://event-easy.onrender.com/Event-Easy/Event/events/${id}/attend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: 'attendeeUserId' }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setAttending(true);
          success('Successfully registered for the event!');
          // Redirect to attendee page for free events
          if (!event.price || !event.price.amount || event.price.amount === 0) {
            navigate('/attendee');
          }
        } else {
          error(data.message || 'Registration failed');
        }
      })
      .catch((err) => error('Error registering: ' + err.message));
  };

  const handleBuyTicket = () => {
    navigate(`/payment/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center text-xl text-gray-500 min-h-screen flex items-center justify-center">
        Event not found or has been removed.
      </div>
    );
  }

  // Format event location for Google Maps
  const eventLocation = event.location?.coordinates ? {
    lng: event.location.coordinates[0],
    lat: event.location.coordinates[1]
  } : null;

  return (
    <div className="bg-gradient-to-br from-gray-100 via-white to-indigo-100 dark:from-gray-900 dark:to-gray-800 min-h-screen py-10 px-6 flex justify-center items-start">
      <div className="max-w-4xl w-full space-y-8">
        {/* Organizer Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 space-y-5"
        >
          <div className="flex items-center gap-4">
            <img
              src={event.organizer?.profilePicture?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.organizer?.name || 'User')}&background=random&color=fff`}
              alt="Organizer"
              className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500"
            />
            <div>
              <p className="font-bold text-xl text-gray-900 dark:text-white">{event.organizer?.name || 'Unknown Organizer'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(event.time).toLocaleString()}</p>
            </div>
          </div>

          {/* Event Details */}
          <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-700 shadow-lg rounded-xl flex flex-col gap-4 mt-6">
            <h1 className="text-4xl font-bold text-center text-indigo-700 dark:text-indigo-300">{event.eventName}</h1>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">{event.category}</span>
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">{event.pattern}</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mt-4">{event.description || "No description provided."}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Event Details</h3>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-start">
                    <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">Date & Time:</span>
                    <span className="text-gray-600 dark:text-gray-400">{new Date(event.time).toLocaleString()}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">Price:</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {event.price?.amount ? `${event.price.amount} ${event.price.currency || 'ETB'}` : 'Free'}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">Attendees:</span>
                    <span className="text-gray-600 dark:text-gray-400">{event.attendees?.length || 0} registered</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">Capacity:</span>
                    <span className="text-gray-600 dark:text-gray-400">{event.attendees?.length || 0}/{event.capacity || 100} spots</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Organizer Info</h3>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-start">
                    <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">Name:</span>
                    <span className="text-gray-600 dark:text-gray-400">{event.organizer?.name || 'Unknown'}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">Email:</span>
                    <span className="text-gray-600 dark:text-gray-400">{event.organizer?.email || 'Not provided'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Event Location Map */}
          {eventLocation && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Event Location</h3>
              <LeafletMapComponent
                initialLocation={eventLocation}
                readOnly={true}
                height="400px"
              />
            </div>
          )}

          {/* Media Section (Vertical layout) */}
          {(event.imageUrl?.url || event.videoUrl?.url) && (
            <div className="flex flex-col gap-4 mt-6">
              {event.imageUrl?.url && (
                <img
                  src={event.imageUrl.url}
                  alt="Event"
                  className="rounded-xl object-cover border shadow-md"
                />
              )}
              {event.videoUrl?.url && (
                <video controls className="rounded-xl object-cover border shadow-md">
                  <source src={event.videoUrl.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-6 flex flex-col sm:flex-row justify-center gap-4">
            {attending ? (
              <button className="px-6 py-3 rounded-full font-medium text-lg bg-gray-500 text-white cursor-not-allowed" disabled>
                Already Registered
              </button>
            ) : (
              <>
                {/* Only show Register for Free if event is free */}
                {(!event.price || !event.price.amount || event.price.amount === 0) && (
                  <button
                    onClick={handleRegister}
                    className="px-6 py-3 rounded-full font-medium text-lg bg-indigo-600 text-white transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Register for Free
                  </button>
                )}
                {/* Only show Buy Ticket if event is paid */}
                {event.price?.amount > 0 && (
                  <button
                    onClick={handleBuyTicket}
                    className="px-6 py-3 rounded-full font-medium text-lg bg-orange-500 text-white transition-all hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    Buy Ticket ({event.price.amount} {event.price.currency || 'ETB'})
                  </button>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AttendeeEventPage;