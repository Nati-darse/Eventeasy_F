import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaCrosshairs, FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';

const LocationFilter = ({ onLocationFilter, events = [] }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10); // km
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showLocationFilter, setShowLocationFilter] = useState(false);

  // Get user's current location
  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setIsLoadingLocation(false);
          
          // Apply location filter
          filterEventsByLocation(location, searchRadius);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoadingLocation(false);
          alert('Unable to get your location. Please check your browser settings.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      setIsLoadingLocation(false);
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Filter events by location
  const filterEventsByLocation = (location, radius) => {
    if (!location || !events.length) return;

    const filteredEvents = events.filter(event => {
      if (!event.location?.coordinates?.length === 2) return false;
      
      const eventLat = event.location.coordinates[1];
      const eventLng = event.location.coordinates[0];
      
      const distance = calculateDistance(
        location.lat, 
        location.lng, 
        eventLat, 
        eventLng
      );
      
      return distance <= radius;
    });

    onLocationFilter(filteredEvents, location, radius);
  };

  // Handle radius change
  const handleRadiusChange = (newRadius) => {
    setSearchRadius(newRadius);
    if (userLocation) {
      filterEventsByLocation(userLocation, newRadius);
    }
  };

  // Clear location filter
  const clearLocationFilter = () => {
    setUserLocation(null);
    onLocationFilter(null, null, null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt className="text-red-500" />
          <h3 className="font-semibold text-gray-800 dark:text-white">Location Filter</h3>
        </div>
        <button
          onClick={() => setShowLocationFilter(!showLocationFilter)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {showLocationFilter ? 'Hide' : 'Show'}
        </button>
      </div>

      {showLocationFilter && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          {/* Current Location Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaCrosshairs className="text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {userLocation ? 'Location detected' : 'No location set'}
              </span>
            </div>
            
            {userLocation && (
              <button
                onClick={clearLocationFilter}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Get Location Button */}
          <button
            onClick={getCurrentLocation}
            disabled={isLoadingLocation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {isLoadingLocation ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FaCrosshairs />
            )}
            {isLoadingLocation ? 'Getting Location...' : 'Use My Location'}
          </button>

          {/* Radius Slider */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search Radius: {searchRadius} km
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={searchRadius}
              onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 km</span>
              <span>25 km</span>
              <span>50 km</span>
            </div>
          </div>

          {/* Location Info */}
          {userLocation && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>Your Location:</strong><br />
                Lat: {userLocation.lat.toFixed(6)}<br />
                Lng: {userLocation.lng.toFixed(6)}
              </p>
            </div>
          )}

          {/* Quick Radius Buttons */}
          <div className="flex gap-2">
            {[5, 10, 25].map((radius) => (
              <button
                key={radius}
                onClick={() => handleRadiusChange(radius)}
                className={`flex-1 px-3 py-1 text-xs rounded-lg transition-colors ${
                  searchRadius === radius
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                {radius} km
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LocationFilter; 