import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import GoogleMapComponent from '../components/GoogleMapComponent';

const Organizer = ({ user }) => {
  const { userData } = useContext(AppContent);

  const [form, setForm] = useState({
    eventName: '',
    time: '',
    category: '',
    pattern: '',
    description: '',
    updates: '',
    price: {
      amount: 100,
      currency: 'ETB'
    }
  });

  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [location, setLocation] = useState({ lat: 9.0222, lng: 38.7468 }); // Default to Addis Ababa

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      setForm({ ...form, price: { ...form.price, amount: parseFloat(value) } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (e.target.name === 'imageUrl') {
      setImage(file);
    } else if (e.target.name === 'videoUrl') {
      setVideo(file);
    }
  };

  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
  
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'price') {
        formData.append('price[amount]', value.amount);
        formData.append('price[currency]', value.currency);
      } else {
        formData.append(key, value);
      }
    });
  
    // Add location data
    formData.append('longitude', location.lng);
    formData.append('latitude', location.lat);
  
    if (image) {
      formData.append('imageUrl', image);
    }
  
    if (video) {
      formData.append('videoUrl', video);
    }
  
    formData.append('organizer', userData._id);
  
    try {
      const res = await axios.post(
        'http://localhost:5000/Event-Easy/Event/createEvents',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        }
      );
  
      setMsg('✅ Event created successfully!');
      // Reset form
      setForm({
        eventName: '',
        time: '',
        category: '',
        pattern: '',
        description: '',
        updates: '',
        price: {
          amount: 100,
          currency: 'ETB'
        }
      });
      setImage(null);
      setVideo(null);
    } catch (err) {
      console.error('Event creation error:', err);
      setMsg('❌ Failed to create event: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10 border border-gray-200">
      <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8">
        🎉 Create a New Event
      </h2>

      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
        {/* Event Name */}
        <div>
          <label className="block mb-1 text-gray-700 font-semibold">Event Name</label>
          <input
            type="text"
            name="eventName"
            value={form.eventName}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Name of the Event"
            onChange={handleChange}
            required
          />
        </div>

        {/* Time */}
        <div>
          <label className="block mb-1 text-gray-700 font-semibold">Time</label>
          <input
            type="datetime-local"
            name="time"
            value={form.time}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onChange={handleChange}
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block mb-1 text-gray-700 font-semibold">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
          <label className="block mb-1 text-gray-700 font-semibold">Pattern</label>
          <input
            type="text"
            name="pattern"
            value={form.pattern}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="e.g. Workshop / Conference"
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 text-gray-700 font-semibold">Description</label>
          <textarea
            name="description"
            value={form.description}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Tell us about the event..."
            onChange={handleChange}
          />
        </div>

        {/* Price */}
        <div>
          <label className="block mb-1 text-gray-700 font-semibold">Ticket Price (ETB)</label>
          <input
            type="number"
            name="price"
            value={form.price.amount}
            min="0"
            step="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Enter ticket price in ETB"
            onChange={handleChange}
          />
        </div>

        {/* Location Map */}
        <div>
          <label className="block mb-2 text-gray-700 font-semibold">Event Location</label>
          <p className="text-sm text-gray-500 mb-2">Click on the map to select the event location</p>
          <GoogleMapComponent
            apiKey="YOUR_GOOGLE_MAPS_API_KEY" // Replace with your API key
            initialLocation={location}
            onLocationSelect={handleLocationSelect}
          />
          <div className="mt-2 text-sm text-gray-500">
            Selected coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </div>
        </div>

        {/* Updates */}
        <div>
          <label className="block mb-1 text-gray-700 font-semibold">Updates</label>
          <textarea
            name="updates"
            value={form.updates}
            rows="2"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Any new updates?"
            onChange={handleChange}
          />
        </div>       

        {/* Image Upload */}
        <div>
          <label className="block mb-2 text-gray-700 font-semibold">📷 Upload Image</label>
          <input
            type="file"
            name="imageUrl"
            accept="image/*"
            className="w-full px-3 py-2 border border-dashed border-gray-400 rounded-lg bg-gray-50"
            onChange={handleFileChange}
          />
        </div>

        {/* Video Upload */}
        <div>
          <label className="block mb-2 text-gray-700 font-semibold">🎥 Upload Video (optional)</label>
          <input
            type="file"
            name="videoUrl"
            accept="video/*"
            className="w-full px-3 py-2 border border-dashed border-gray-400 rounded-lg bg-gray-50"
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
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Submitting...' : '🚀 Create Event'}
          </button>
        </div>
      </form>

      {/* Message */}
      {msg && (
        <div className={`mt-6 text-center text-lg font-semibold ${msg.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {msg}
        </div>
      )}
    </div>
  );
};

export default Organizer;