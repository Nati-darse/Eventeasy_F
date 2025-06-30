import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaUsers, FaCalendarAlt, FaSearch, FaSort, FaDownload, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { AppContent } from '../context/AppContext.jsx';

const OrganizerAttendees = () => {
  const { userData } = useContext(AppContent);
  const navigate = useNavigate();
  
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [attendeeSearch, setAttendeeSearch] = useState('');
  
  useEffect(() => {
    // Check if user is logged in and is an organizer
    if (!userData) {
      navigate('/Login_Organizer');
      return;
    }
    
    if (userData.role !== 'organizer') {
      navigate('/');
      return;
    }
    
    fetchOrganizerEvents();
  }, [userData, navigate]);
  
  const fetchOrganizerEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('https://eventeasy-56uy.onrender.com/Event-Easy/Event/organizer-events', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setEvents(response.data.events);
      } else {
        setError('Failed to fetch events');
      }
    } catch (err) {
      console.error('Error fetching organizer events:', err);
      setError('Error fetching your events. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchEventAttendees = async (eventId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`https://eventeasy-56uy.onrender.com/Event-Easy/Event/events/${eventId}/attendees`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setAttendees(response.data.attendees);
        // Find and set the selected event
        const event = events.find(e => e._id === eventId);
        setSelectedEvent(event);
      } else {
        setError('Failed to fetch attendees');
      }
    } catch (err) {
      console.error('Error fetching event attendees:', err);
      setError('Error fetching attendees. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter events based on search query
  const filteredEvents = events.filter(event => 
    event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    new Date(event.time).toLocaleDateString().includes(searchQuery)
  );
  
  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'asc' 
        ? new Date(a.time) - new Date(b.time)
        : new Date(b.time) - new Date(a.time);
    } else if (sortBy === 'name') {
      return sortOrder === 'asc'
        ? a.eventName.localeCompare(b.eventName)
        : b.eventName.localeCompare(a.eventName);
    } else if (sortBy === 'attendees') {
      return sortOrder === 'asc'
        ? a.attendees.length - b.attendees.length
        : b.attendees.length - a.attendees.length;
    }
    return 0;
  });
  
  // Filter attendees based on search
  const filteredAttendees = attendees.filter(attendee =>
    attendee.name.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
    attendee.email.toLowerCase().includes(attendeeSearch.toLowerCase())
  );
  
  // Export attendees to CSV
  const exportToCSV = () => {
    if (!selectedEvent || !attendees.length) return;
    
    const headers = ['Name', 'Email', 'Joined Date'];
    const csvData = attendees.map(attendee => [
      attendee.name,
      attendee.email,
      new Date(attendee.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedEvent.eventName}-attendees.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
              Attendee Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View and manage attendees for your events
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Link
              to="/Organizer_Dashboard"
              className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Events List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 lg:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Your Events
              </h2>
              <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {events.length} Total
              </span>
            </div>
            
            {/* Search and Sort */}
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="flex items-center mt-2">
                <label className="text-sm text-gray-600 dark:text-gray-400 mr-2">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-1"
                >
                  <option value="date">Date</option>
                  <option value="name">Name</option>
                  <option value="attendees">Attendees</option>
                </select>
                
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="ml-2 p-1 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <FaSort />
                </button>
              </div>
            </div>
            
            {/* Events List */}
            <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
              {sortedEvents.length > 0 ? (
                sortedEvents.map((event) => (
                  <motion.div
                    key={event._id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedEvent?._id === event._id
                        ? 'bg-indigo-100 dark:bg-indigo-900 border-l-4 border-indigo-500'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => fetchEventAttendees(event._id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white">
                          {event.eventName}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                          <FaCalendarAlt className="mr-1" />
                          {new Date(event.time).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        <FaUsers className="mr-1" />
                        {event.attendees.length}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs rounded-full">
                        {event.category.split(' ')[0]}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        event.status === 'approved' 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                          : event.status === 'pending'
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    {events.length === 0 
                      ? "You haven't created any events yet." 
                      : "No events match your search."}
                  </p>
                  {events.length === 0 && (
                    <Link
                      to="/Organizer_Dashboard"
                      className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Create Your First Event
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Attendees List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 lg:col-span-2">
            {selectedEvent ? (
              <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {selectedEvent.eventName}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(selectedEvent.time).toLocaleDateString()} at {new Date(selectedEvent.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  
                  <div className="mt-2 md:mt-0 flex items-center">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-2.5 py-0.5 rounded-full mr-2">
                      {attendees.length} Attendees
                    </span>
                    
                    <button
                      onClick={exportToCSV}
                      disabled={!attendees.length}
                      className={`ml-2 p-2 rounded-lg ${
                        attendees.length 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      } transition-colors`}
                      title="Export to CSV"
                    >
                      <FaDownload />
                    </button>
                  </div>
                </div>
                
                {/* Attendee Search */}
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={attendeeSearch}
                      onChange={(e) => setAttendeeSearch(e.target.value)}
                      placeholder="Search attendees..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                
                {/* Attendees Table */}
                <div className="overflow-x-auto">
                  {attendees.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Email
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredAttendees.map((attendee) => (
                          <tr key={attendee._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-semibold">
                                  {attendee.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {attendee.name}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Joined {new Date(attendee.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">{attendee.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                attendee.isVerified
                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                  : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                              }`}>
                                {attendee.isVerified ? 'Verified' : 'Unverified'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <a
                                href={`mailto:${attendee.email}`}
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4"
                              >
                                <FaEnvelope className="inline mr-1" />
                                Email
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-12">
                      <FaUsers className="mx-auto text-gray-400 text-5xl mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Attendees Yet</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        This event doesn't have any attendees yet.
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <FaCalendarAlt className="mx-auto text-gray-400 text-5xl mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Select an Event</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Choose an event from the list to view its attendees.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerAttendees;