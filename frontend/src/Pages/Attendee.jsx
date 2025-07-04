import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from "date-fns";
import { Link } from 'react-router-dom';
import LeafletMapComponent from '../Components/LeafletMapComponent.jsx';
import SimpleEventFilter from '../Components/SimpleEventFilter.jsx';
import { useToast } from '../hooks/useToast.jsx';

// Define categories for filtering
const categories = [
  'Educational/Academic Events',
  'Social & Cultural Events',
  'Sports & Recreational Events',
  'Entertainment Events',
  'Professional & Educational Events',
  'Religious',
];

// Define reasons for reporting, matching the backend enum
const reportReasons = [
  'Inappropriate Content',
  'Misleading Information',
  'Safety Concern',
  'Spam',
  'Fraudulent Event',
  'Organizer Issue',
  'Venue Problem',
  'Technical Issue',
  'Other'
];

const AttendeePage = () => {
  // State for events and filtering
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [showMap, setShowMap] = useState(false);

  // State for reviews
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const [reviews, setReviews] = useState({});
  const [showAllComments, setShowAllComments] = useState({});

  // State for event reporting modal and form
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingEvent, setReportingEvent] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportStatusMessage, setReportStatusMessage] = useState('');

  const { success, error } = useToast();

  // --- Filter Functions ---
  const applyFilters = (filters) => {
    let filtered = [...events];

    // Apply search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.eventName?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.organizer?.name?.toLowerCase().includes(query) ||
        event.category?.toLowerCase().includes(query) ||
        event.pattern?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filters.category !== 'All') {
      console.log('🔍 Filtering by category:', filters.category);
      console.log('📊 Total events before category filter:', filtered.length);
      filtered = filtered.filter(event => event.category === filters.category);
      console.log('📊 Events after category filter:', filtered.length);
      console.log('📋 Available categories in filtered events:', [...new Set(filtered.map(e => e.category))]);
    }

    // Apply date filter
    const now = new Date();
    if (filters.dateRange === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.time);
        return eventDate >= today && eventDate < tomorrow;
      });
    } else if (filters.dateRange === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
      
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.time);
        return eventDate >= tomorrow && eventDate < dayAfterTomorrow;
      });
    } else if (filters.dateRange === 'week') {
      const weekLater = new Date();
      weekLater.setDate(weekLater.getDate() + 7);
      
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.time);
        return eventDate >= now && eventDate <= weekLater;
      });
    } else if (filters.dateRange === 'month') {
      const monthLater = new Date();
      monthLater.setMonth(monthLater.getMonth() + 1);
      
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.time);
        return eventDate >= now && eventDate <= monthLater;
      });
    } else if (filters.dateRange === 'custom') {
      if (filters.customDateFrom && filters.customDateTo) {
        const fromDate = new Date(filters.customDateFrom);
        const toDate = new Date(filters.customDateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.time);
          return eventDate >= fromDate && eventDate <= toDate;
        });
      }
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.time) - new Date(a.time));

    setFilteredEvents(filtered);
  };

  // --- Review Functions ---
  const toggleShowAll = (eventId) => {
    setShowAllComments(prev => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  const handleRatingChange = (eventId, value) => {
    setRatings({ ...ratings, [eventId]: value });
  };

  const handleCommentChange = (eventId, text) => {
    setComments({ ...comments, [eventId]: text });
  };

  const handleSubmitReview = async (eventId) => {
    const rating = ratings[eventId] || 0;
    const comment = comments[eventId] || '';
    const reviewData = { rating, comment };
    const token = localStorage.getItem('token');

    if (!rating) {
        alert('Please select a rating.');
        return;
    }

    try {
              const res = await fetch(`https://event-easy.onrender.com/Event-Easy/review/${eventId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      });

      if (res.ok) {
        success('Review submitted successfully!');
        setComments((prev) => ({ ...prev, [eventId]: '' }));
        setRatings((prev) => ({ ...prev, [eventId]: ''}));
        fetchReviews(eventId);
      } else {
        const errorData = await res.json();
        error(`Failed to submit review: ${errorData.message || 'Please try again.'}`);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      error('An error occurred while submitting your review.');
    }
  };

  const fetchReviews = async (eventId) => {
    try {
              const response = await axios.get(`https://event-easy.onrender.com/Event-Easy/review/${eventId}/reviews`);
      setReviews((prev) => ({ ...prev, [eventId]: response.data.reviews || [] }));
    } catch (error) {
      console.error(`Error fetching reviews for event ${eventId}:`, error);
      setReviews((prev) => ({ ...prev, [eventId]: [] }));
    }
  };

  const calculateAverageRating = (eventId) => {
    const eventReviews = reviews[eventId];
    if (!eventReviews || eventReviews.length === 0) return null;
    const total = eventReviews.reduce((sum, r) => sum + r.rating, 0);
    return (total / eventReviews.length).toFixed(1);
  };

  // --- Event Reporting Functions ---
  const handleOpenReportModal = (event) => {
    setReportingEvent(event);
    setShowReportModal(true);
    setReportReason('');
    setReportDescription('');
    setReportStatusMessage('');
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setReportingEvent(null);
  };

  const handleSubmitReport = async () => {
    if (!reportingEvent || !reportReason || !reportDescription) {
      setReportStatusMessage('Reason and description are required.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setReportStatusMessage('You must be logged in to report an event.');
      return;
    }

    try {
              const response = await axios.post(`https://event-easy.onrender.com/Event-Easy/report/${reportingEvent._id}`, {
        reason: reportReason,
        description: reportDescription,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        success('Event reported successfully!');
        handleCloseReportModal();
      } else {
        setReportStatusMessage(response.data.message || 'Failed to report event. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting report:', error.response?.data?.message || error.message);
      setReportStatusMessage(error.response?.data?.message || 'An error occurred while reporting the event.');
    }
  };

  // --- Effects and Event Fetching ---
  useEffect(() => {
            fetch('https://event-easy.onrender.com/Event-Easy/Event/events')
      .then((res) => res.json())
      .then((data) => {
        const allEvents = Array.isArray(data) ? data : (data.events || []);
        const approvedEvents = allEvents.filter((event) => event.status === 'approved');
        
        // Debug: Log available categories
        const availableCategories = [...new Set(approvedEvents.map(e => e.category))];
        console.log('🏷️ Available categories in database:', availableCategories);
        
        setEvents(approvedEvents);
        setFilteredEvents(approvedEvents);
        
        // Fetch reviews for each event
        approvedEvents.forEach((event) => fetchReviews(event._id));
      })
      .catch((error) => console.error('Error fetching events:', error));
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-100 via-white to-indigo-100 dark:from-gray-900 dark:to-gray-800 min-h-screen py-10 px-4 sm:px-6 flex justify-center items-start">
      <div className="max-w-5xl w-full space-y-8">
        {/* Filter Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-indigo-700 dark:text-indigo-300">🎯 Discover Events</h3>
          </div>
          
          <SimpleEventFilter onFilterChange={applyFilters} />
        </div>

        {/* Map View */}
        {/* {showMap && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Event Locations</h3>
            <div className="h-[600px]">
              <LeafletMapComponent
                initialLocation={{ lat: 9.0222, lng: 38.7468 }} // Default to Addis Ababa
                readOnly={true}
                markerLocations={mapLocations}
                height="600px"
              />
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Showing {mapLocations.length} events on the map. Click on markers to see event details.
            </p>
          </div>
        )} */}

        {/* Event Cards */}
        {filteredEvents.map((event) => {
          const organizerName = event.organizer?.name || 'Unknown Organizer';
          const organizerImage = event.organizer?.profilePicture?.url || event.organizerImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(organizerName)}&background=random&color=fff`;
          const eventReviews = reviews[event._id] || [];
          const visibleReviews = eventReviews.slice(0, showAllComments[event._id] ? eventReviews.length : 1);

          return (
            <div key={event._id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-4 sm:p-6 space-y-5 border border-gray-200 dark:border-gray-700">
              {/* Organizer Info */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                <img src={organizerImage} alt={organizerName} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover" onError={(e) => e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(organizerName)}&background=random&color=fff`} />
                <div>
                  <p className="text-md sm:text-lg font-bold text-gray-900 dark:text-white">{organizerName}</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {event.createdAt ? formatDistanceToNow(new Date(event.createdAt), { addSuffix: true }) : 'Date not available'}
                  </p>
                </div>
              </div>

              {/* Event Content */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{event.eventName || event.title || 'Event Title Missing'}</h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{event.description || 'No description available.'}</p>
              </div>

              {/* Event Details Row */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Event Price */}
                {event.price?.amount > 0 && (
                  <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {event.price.amount} {event.price.currency || 'ETB'}
                  </div>
                )}

                {/* Free Event Badge */}
                {(!event.price?.amount || event.price.amount === 0) && (
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    🆓 Free Event
                  </div>
                )}

                {/* Capacity Info */}
                <div className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  👥 {event.attendees?.length || 0}/{event.capacity || 100} spots
                </div>
              </div>

              {/* Event Location Map (small preview) */}
              {event.location?.coordinates?.length === 2 && (
                <div className="h-40 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                  <LeafletMapComponent
                    initialLocation={{
                      lng: event.location.coordinates[0],
                      lat: event.location.coordinates[1]
                    }}
                    readOnly={true}
                    height="160px"
                  />
                </div>
              )}

              {/* Media: Image and Video */}
              {(event.imageUrl?.url || event.videoUrl?.url) && (
                <div className="flex flex-col md:flex-row gap-4">
                  {event.imageUrl?.url && (
                    <img
                      src={event.imageUrl.url}
                      alt={event.eventName || event.title || "Event Image"}
                      className="rounded-xl w-full md:w-1/2 h-48 sm:h-64 object-cover border dark:border-gray-600"
                      onError={(e) => e.target.style.display='none'}
                    />
                  )}
                  {event.videoUrl?.url && (
                    <video controls className="rounded-xl w-full md:w-1/2 h-48 sm:h-64 object-cover border dark:border-gray-600">
                      <source src={event.videoUrl.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              )}

              {/* Review Section */}
              <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 text-yellow-500 dark:text-yellow-400">
                  <span className="text-md sm:text-lg font-semibold">Average Rating:</span>
                  {calculateAverageRating(event._id) ? (
                    <span className="flex items-center gap-1 text-lg sm:text-xl font-bold">
                      ⭐ {calculateAverageRating(event._id)} / 5
                    </span>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Not rated yet</span>
                  )}
                </div>

                <h3 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white tracking-wide">💬 Reviews</h3>
                {visibleReviews && visibleReviews.length > 0 ? (
                  <>
                    {visibleReviews.map((review) => (
                      <div key={review._id} className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl p-3 sm:p-5 mb-3 sm:mb-4 shadow-md hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-between items-start sm:items-center mb-2 flex-col sm:flex-row">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-md sm:text-lg">
                              {review.userId?.name?.[0]?.toUpperCase() || "A"}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm sm:text-base font-semibold text-indigo-700 dark:text-indigo-300">
                                {review.userId?.name || "Anonymous"}
                              </span>
                              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic">
                                {review.createdAt ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true }) : ''}
                              </span>
                            </div>
                          </div>
                          <span className="text-yellow-500 dark:text-yellow-400 font-medium text-xs sm:text-sm mt-1 sm:mt-0">
                            ⭐ {review.rating}/5
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mt-2">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                    {eventReviews.length > 1 && (
                      <button
                        onClick={() => toggleShowAll(event._id)}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium text-xs sm:text-sm"
                      >
                        {showAllComments[event._id] ? "See Less 🔽" : `See ${eventReviews.length - visibleReviews.length} More Comment${eventReviews.length - visibleReviews.length > 1 ? 's' : ''} 💬`}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm italic">No reviews yet. Be the first to share your thoughts! 📝</p>
                )}

                {/* Add Review Form */}
                <div className="pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-md sm:text-lg font-semibold text-gray-800 dark:text-white mb-3">🌟 Leave a Review</h4>
                  <div className="grid gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Your Rating</label>
                      <select
                        value={ratings[event._id] || ''}
                        onChange={(e) => handleRatingChange(event._id, Number(e.target.value))}
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                      >
                        <option value="">Select rating...</option>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <option key={star} value={star}>
                            {star} Star{star > 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Your Comment</label>
                      <textarea
                        value={comments[event._id] || ''}
                        onChange={(e) => handleCommentChange(event._id, e.target.value)}
                        rows="3"
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                        placeholder="Share your experience..."
                      />
                    </div>
                    {/* Action Buttons: Attend, Submit Review, Report Event */}
                    <div className="flex flex-col sm:flex-row justify-end items-center gap-3 sm:gap-4 mt-2 sm:mt-4">
                      <Link
                        to={`/attend/${event._id}`}
                        className="text-center w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl border border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 font-semibold text-xs sm:text-sm transition-colors duration-300"
                        title="View Details & Attend"
                      >
                        View Details
                      </Link>
                      
                      {event.price?.amount > 0 && (
                        <Link
                          to={`/payment/${event._id}`}
                          className="text-center w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs sm:text-sm transition-colors duration-300"
                          title="Buy Ticket"
                        >
                          Buy Ticket ({event.price.amount} {event.price.currency || 'ETB'})
                        </Link>
                      )}
                      
                      <button
                        onClick={() => handleSubmitReview(event._id)}
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 text-white font-semibold px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl shadow-md hover:shadow-lg text-xs sm:text-sm"
                        title="Submit your review"
                      >
                        Submit Review ✍️
                      </button>
                      
                      <button
                        onClick={() => handleOpenReportModal(event)}
                        className="w-full sm:w-auto bg-red-500 hover:bg-red-600 transition-all duration-300 text-white font-semibold px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl shadow-md hover:shadow-lg text-xs sm:text-sm"
                        title="Report this event"
                      >
                        Report 🚩
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredEvents.length === 0 && (
          <div className="text-center py-10">
            <p className="text-xl text-gray-600 dark:text-gray-400">No events found for the selected filters. Try adjusting your criteria! ✨</p>
          </div>
        )}
      </div>

      {/* Report Event Modal */}
      {showReportModal && reportingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center p-4 z-50 transition-opacity duration-300 ease-in-out">
          <div className="bg-white dark:bg-gray-800 p-5 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg space-y-5 transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalEnter">
            <div className="flex justify-between items-center">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                Report: <span className="text-indigo-600 dark:text-indigo-400">{reportingEvent.eventName || reportingEvent.title}</span>
              </h3>
              <button onClick={handleCloseReportModal} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl">&times;</button>
            </div>
            
            {reportStatusMessage && (
              <p className={`text-sm p-3 rounded-md ${reportStatusMessage.includes('success') ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'}`}>
                {reportStatusMessage}
              </p>
            )}

            <div>
              <label htmlFor="reportReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason for reporting</label>
              <select
                id="reportReason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a reason...</option>
                {reportReasons.map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="reportDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Detailed description</label>
              <textarea
                id="reportDescription"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows="4"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Please provide as much detail as possible about the issue."
              />
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={handleCloseReportModal}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes modalEnter {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modalEnter {
          animation: modalEnter 0.3s forwards;
        }
      `}</style>
    </div>
  );
};

export default AttendeePage;