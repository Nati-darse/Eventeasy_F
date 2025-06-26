import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContent } from '../context/AppContext.jsx';
import { motion } from 'framer-motion';
import { FaCalendarPlus, FaUsers, FaChartLine, FaCheckCircle, FaHourglassHalf, FaTimesCircle } from 'react-icons/fa';

const Organizer = () => {
  const { userData } = useContext(AppContent);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    eventName: '',
    time: '',
    category: '',
    pattern: '',
    description: '',
    updates: '',
  });

  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [location, setLocation] = useState('');
  
  // Dashboard stats
  const [stats, setStats] = useState({
    totalEvents: 0,
    pendingEvents: 0,
    approvedEvents: 0,
    rejectedEvents: 0,
    totalAttendees: 0
  });
  
  // Check if user is logged in and is an organizer
  useEffect(() => {
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
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/Event-Easy/Event/organizer-events', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        const events = response.data.events;
        
        // Calculate stats
        const pendingEvents = events.filter(event => event.status === 'pending');
        const approvedEvents = events.filter(event => event.status === 'approved');
        const rejectedEvents = events.filter(event => event.status === 'rejected');
        
        // Calculate total attendees across all events
        const totalAttendees = events.reduce((sum, event) => sum + event.attendees.length, 0);
        
        setStats({
          totalEvents: events.length,
          pendingEvents: pendingEvents.length,
          approvedEvents: approvedEvents.length,
          rejectedEvents: rejectedEvents.length,
          totalAttendees
        });
      }
    } catch (err) {
      console.error('Error fetching organizer events:', err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (e.target.name === 'imageUrl') {
      setImage(file);
    } else if (e.target.name === 'videoUrl') {
      setVideo(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
  
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
  
    if (image) {
      formData.append('imageUrl', image);
    }
  
    if (video) {
      formData.append('videoUrl', video);
    }
  
    formData.append('organizer', userData?.name || '');
    formData.append('location', location);
  
    try {
      const res = await axios.post(
        'http://localhost:5000/Event-Easy/Event/createEvents',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      setMsg('✅ Event created successfully!');
      // Reset form after successful submission
      setForm({
        eventName: '',
        time: '',
        category: '',
        pattern: '',
        description: '',
        updates: '',
      });
      setLocation('');
      setImage(null);
      setVideo(null);
      
      // Refresh stats
      fetchOrganizerEvents();
    } catch (err) {
      console.error('Event creation error:', err);
      setMsg('❌ Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Organizer Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome back, {userData?.name || 'Organizer'}!
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Link
              to="/Organizer_Dashboard/attendees"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FaUsers className="mr-2" />
              View Attendees
            </Link>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border-l-4 border-indigo-500"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 mr-4">
                <FaCalendarPlus className="text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalEvents}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border-l-4 border-green-500"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 mr-4">
                <FaCheckCircle className="text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.approvedEvents}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border-l-4 border-yellow-500"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 mr-4">
                <FaHourglassHalf className="text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.pendingEvents}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border-l-4 border-blue-500"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-4">
                <FaUsers className="text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Attendees</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalAttendees}</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Create Event Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-center text-indigo-700 dark:text-indigo-400 mb-6">
            🎉 Create a New Event
          </h2>

          <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
            {/* Event Name */}
            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300 font-semibold">Event Name</label>
              <input
                type="text"
                name="eventName"
                value={form.eventName}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
                placeholder="Name of the Event"
                onChange={handleChange}
                required
              />
            </div>

            {/* Time */}
            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300 font-semibold">Time</label>
              <input
                type="datetime-local"
                name="time"
                value={form.time}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
                onChange={handleChange}
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300 font-semibold">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">-- Select Category --</option>
                <option value="Educational/Academic Events">Educational</option>
                <option value="Social & Cultural Events">Cultural</option>
                <option value="Sports & Recreational Events">Sports</option>
                <option value=" Entertainment Events">Entertainment</option>
                <option value="Professional & Educational Events">Professional</option>
                <option value="religous">Religious</option>
              </select>
            </div>

            {/* Pattern */}
            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300 font-semibold">Pattern</label>
              <input
                type="text"
                name="pattern"
                value={form.pattern}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
                placeholder="e.g. Workshop / Conference"
                onChange={handleChange}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300 font-semibold">Description</label>
              <textarea
                name="description"
                rows="3"
                value={form.description}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
                placeholder="Tell us about the event..."
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300 font-semibold">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter event location (e.g., Addis Ababa)"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Updates */}
            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300 font-semibold">Updates</label>
              <textarea
                name="updates"
                rows="2"
                value={form.updates}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
                placeholder="Any new updates?"
                onChange={handleChange}
              />
            </div>       

            {/* Image Upload */}
            <div>
              <label className="block mb-2 text-gray-700 dark:text-gray-300 font-semibold">📷 Upload Image</label>
              <input
                type="file"
                name="imageUrl"
                accept="image/*"
                className="w-full px-3 py-2 border border-dashed border-gray-400 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                onChange={handleFileChange}
              />
            </div>

            {/* Video Upload */}
            <div>
              <label className="block mb-2 text-gray-700 dark:text-gray-300 font-semibold">🎥 Upload Video (optional)</label>
              <input
                type="file"
                name="videoUrl"
                accept="video/*"
                className="w-full px-3 py-2 border border-dashed border-gray-400 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                onChange={handleFileChange}
              />
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 font-bold text-white rounded-md transition duration-300 ${
                  loading
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800'
                }`}
              >
                {loading ? 'Submitting...' : '🚀 Create Event'}
              </button>
            </div>
          </form>

          {/* Message */}
          {msg && (
            <div className={`mt-6 text-center text-lg font-semibold ${
              msg.includes('✅') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Organizer;