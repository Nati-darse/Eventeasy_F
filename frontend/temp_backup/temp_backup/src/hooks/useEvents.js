import { useState, useEffect } from 'react';
import { eventAPI } from '../services/api';

/**
 * Events Hook
 * Provides event-related state and methods
 */
export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all events
   */
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await eventAPI.getAllEvents();
      setEvents(Array.isArray(response) ? response : response.events || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch single event by ID
   * @param {string} eventId - Event ID
   * @returns {Promise<object|null>} Event data
   */
  const fetchEventById = async (eventId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await eventAPI.getEventById(eventId);
      return response;
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch event:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create new event
   * @param {FormData} eventData - Event form data
   * @param {function} onProgress - Upload progress callback
   * @returns {Promise<boolean>} Success status
   */
  const createEvent = async (eventData, onProgress = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await eventAPI.createEvent(eventData, onProgress);
      
      if (response.success || response.message?.includes('success')) {
        await fetchEvents(); // Refresh events list
        return true;
      }
      
      throw new Error(response.message || 'Failed to create event');
    } catch (err) {
      setError(err.message);
      console.error('Failed to create event:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update event
   * @param {string} eventId - Event ID
   * @param {object} updateData - Update data
   * @returns {Promise<boolean>} Success status
   */
  const updateEvent = async (eventId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await eventAPI.updateEvent(eventId, updateData);
      
      if (response.success || response.message?.includes('success')) {
        await fetchEvents(); // Refresh events list
        return true;
      }
      
      throw new Error(response.message || 'Failed to update event');
    } catch (err) {
      setError(err.message);
      console.error('Failed to update event:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete event
   * @param {string} eventId - Event ID
   * @returns {Promise<boolean>} Success status
   */
  const deleteEvent = async (eventId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await eventAPI.deleteEvent(eventId);
      
      if (response.success || response.message?.includes('success')) {
        setEvents(prev => prev.filter(event => event._id !== eventId));
        return true;
      }
      
      throw new Error(response.message || 'Failed to delete event');
    } catch (err) {
      setError(err.message);
      console.error('Failed to delete event:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Attend event
   * @param {string} eventId - Event ID
   * @returns {Promise<boolean>} Success status
   */
  const attendEvent = async (eventId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await eventAPI.attendEvent(eventId);
      
      if (response.success) {
        await fetchEvents(); // Refresh to get updated attendee list
        return true;
      }
      
      throw new Error(response.message || 'Failed to attend event');
    } catch (err) {
      setError(err.message);
      console.error('Failed to attend event:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Leave event
   * @param {string} eventId - Event ID
   * @returns {Promise<boolean>} Success status
   */
  const leaveEvent = async (eventId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await eventAPI.leaveEvent(eventId);
      
      if (response.success || response.message?.includes('success')) {
        await fetchEvents(); // Refresh to get updated attendee list
        return true;
      }
      
      throw new Error(response.message || 'Failed to leave event');
    } catch (err) {
      setError(err.message);
      console.error('Failed to leave event:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update event status (admin only)
   * @param {string} eventId - Event ID
   * @param {string} status - New status
   * @returns {Promise<boolean>} Success status
   */
  const updateEventStatus = async (eventId, status) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await eventAPI.updateEventStatus(eventId, status);
      
      if (response.success || response.message?.includes('success')) {
        await fetchEvents(); // Refresh events list
        return true;
      }
      
      throw new Error(response.message || 'Failed to update event status');
    } catch (err) {
      setError(err.message);
      console.error('Failed to update event status:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter events by category
   * @param {string} category - Category to filter by
   * @returns {array} Filtered events
   */
  const filterEventsByCategory = (category) => {
    if (!category || category === 'All') {
      return events;
    }
    return events.filter(event => event.category === category);
  };

  /**
   * Filter events by status
   * @param {string} status - Status to filter by
   * @returns {array} Filtered events
   */
  const filterEventsByStatus = (status) => {
    if (!status || status === 'All') {
      return events;
    }
    return events.filter(event => event.status === status);
  };

  /**
   * Get upcoming events
   * @returns {array} Upcoming events
   */
  const getUpcomingEvents = () => {
    const now = new Date();
    return events.filter(event => new Date(event.time) > now);
  };

  /**
   * Search events
   * @param {string} query - Search query
   * @returns {array} Matching events
   */
  const searchEvents = (query) => {
    if (!query.trim()) {
      return events;
    }
    
    const searchTerm = query.toLowerCase();
    return events.filter(event => 
      event.eventName?.toLowerCase().includes(searchTerm) ||
      event.description?.toLowerCase().includes(searchTerm) ||
      event.category?.toLowerCase().includes(searchTerm) ||
      event.organizer?.name?.toLowerCase().includes(searchTerm)
    );
  };

  // Auto-fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    // State
    events,
    loading,
    error,
    
    // Methods
    fetchEvents,
    fetchEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    attendEvent,
    leaveEvent,
    updateEventStatus,
    
    // Utilities
    filterEventsByCategory,
    filterEventsByStatus,
    getUpcomingEvents,
    searchEvents,
    clearError: () => setError(null),
    
    // Computed values
    approvedEvents: events.filter(event => event.status === 'approved'),
    pendingEvents: events.filter(event => event.status === 'pending'),
    rejectedEvents: events.filter(event => event.status === 'rejected'),
    upcomingEvents: getUpcomingEvents(),
  };
};

export default useEvents;