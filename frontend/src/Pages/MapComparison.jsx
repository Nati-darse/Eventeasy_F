import React, { useState } from 'react';
import LeafletMapComponent from '../Components/LeafletMapComponent';

const MapComparison = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const testLocations = [
    {
      coordinates: [38.7468, 9.0222], // Addis Ababa
      title: "Addis Ababa"
    },
    {
      coordinates: [38.7636, 9.1450], // Another location in Addis
      title: "Event Location 1"
    }
  ];

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    console.log('Selected location:', location);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
          React Leaflet Map Implementation
        </h1>

        {/* Selected Location Display */}
        {selectedLocation && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Selected Location:
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Latitude: {selectedLocation.lat.toFixed(6)} | Longitude: {selectedLocation.lng.toFixed(6)}
            </p>
          </div>
        )}

        {/* Map Display */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            React Leaflet Implementation
          </h2>
          
          <div className="h-[500px] rounded-lg overflow-hidden">
            <LeafletMapComponent
              initialLocation={{ lat: 9.0222, lng: 38.7468 }}
              onLocationSelect={handleLocationSelect}
              readOnly={false}
              markerLocations={testLocations}
              height="500px"
            />
          </div>

          {/* Map Features */}
          <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
              React Leaflet Features:
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Free and open source</li>
              <li>• No API key required</li>
              <li>• OpenStreetMap tiles</li>
              <li>• Highly customizable</li>
              <li>• No usage limits</li>
              <li>• Interactive markers and popups</li>
              <li>• Geolocation support</li>
            </ul>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            Instructions:
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <li>• Click on the map to select a location</li>
            <li>• Use the "Use My Location" button to get your current location</li>
            <li>• Click on markers to see event details</li>
            <li>• All map functionality is now powered by React Leaflet</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MapComparison; 