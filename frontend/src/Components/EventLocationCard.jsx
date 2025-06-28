import React, { useState } from 'react';
import { FaMapMarkerAlt, FaDirections, FaExpand, FaCompress, FaShare, FaCopy } from 'react-icons/fa';
import { motion } from 'framer-motion';
import LeafletMapComponent from './LeafletMapComponent';

const EventLocationCard = ({ event, expanded = false, onToggleExpand }) => {
  const [copied, setCopied] = useState(false);
  const [showFullMap, setShowFullMap] = useState(false);

  // Check if event has valid location data
  const hasLocation = event.location?.coordinates?.length === 2;
  const coordinates = hasLocation ? {
    lat: event.location.coordinates[1],
    lng: event.location.coordinates[0]
  } : null;

  const handleCopyAddress = async () => {
    if (event.location?.address) {
      try {
        await navigator.clipboard.writeText(event.location.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  const handleGetDirections = () => {
    if (coordinates) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
      window.open(url, '_blank');
    }
  };

  const handleShareLocation = () => {
    if (navigator.share && coordinates) {
      navigator.share({
        title: event.eventName,
        text: `Check out this event: ${event.eventName}`,
        url: `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`
      });
    } else {
      handleCopyAddress();
    }
  };

  if (!hasLocation) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
        <FaMapMarkerAlt className="text-gray-400 text-2xl mx-auto mb-2" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Location information not available
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
      {/* Location Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-red-500 text-lg" />
            <h3 className="font-semibold text-gray-800 dark:text-white">Event Location</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFullMap(!showFullMap)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title={showFullMap ? "Show small map" : "Show full map"}
            >
              {showFullMap ? <FaCompress /> : <FaExpand />}
            </button>
            {onToggleExpand && (
              <button
                onClick={onToggleExpand}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title={expanded ? "Collapse" : "Expand"}
              >
                {expanded ? <FaCompress /> : <FaExpand />}
              </button>
            )}
          </div>
        </div>

        {/* Address Display */}
        {event.location?.address && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {event.location.address}
            </p>
          </div>
        )}

        {/* Coordinates Display */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Lat: {coordinates.lat.toFixed(6)}</span>
          <span className="mx-2">•</span>
          <span>Lng: {coordinates.lng.toFixed(6)}</span>
        </div>
      </div>

      {/* Map Display */}
      <div className={`transition-all duration-300 ${showFullMap ? 'h-96' : 'h-48'}`}>
        <LeafletMapComponent
          initialLocation={coordinates}
          readOnly={true}
          height={showFullMap ? "384px" : "192px"}
          markerLocations={[{
            coordinates: [coordinates.lng, coordinates.lat],
            title: event.eventName
          }]}
        />
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700">
        <div className="flex flex-wrap gap-2">
          <motion.button
            onClick={handleGetDirections}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaDirections />
            Get Directions
          </motion.button>

          <motion.button
            onClick={handleShareLocation}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaShare />
            Share Location
          </motion.button>

          {event.location?.address && (
            <motion.button
              onClick={handleCopyAddress}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                copied 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaCopy />
              {copied ? 'Copied!' : 'Copy Address'}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventLocationCard; 