import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom blue marker icon for event locations
const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Map click handler component
function MapClickHandler({ onLocationSelect, readOnly }) {
  useMapEvents({
    click: (e) => {
      if (!readOnly && onLocationSelect) {
        const newLocation = {
          lat: e.latlng.lat,
          lng: e.latlng.lng
        };
        onLocationSelect(newLocation);
      }
    },
  });
  return null;
}

const LeafletMapComponent = ({ 
  initialLocation, 
  onLocationSelect, 
  readOnly = false,
  markerLocations = [],
  height = '400px'
}) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [center, setCenter] = useState(initialLocation || { lat: 9.0222, lng: 38.7468 }); // Default to Addis Ababa

  // Update center if initialLocation changes
  useEffect(() => {
    if (initialLocation) {
      setCenter(initialLocation);
      setSelectedLocation(initialLocation);
    }
  }, [initialLocation]);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCenter(userLocation);
          if (!readOnly) {
            setSelectedLocation(userLocation);
            if (onLocationSelect) {
              onLocationSelect(userLocation);
            }
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="relative">
      <MapContainer
        center={center}
        zoom={14}
        style={{ height, width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onLocationSelect={handleLocationSelect} readOnly={readOnly} />

        {/* Selected location marker */}
        {selectedLocation && (
          <Marker 
            position={[selectedLocation.lat, selectedLocation.lng]} 
            icon={customIcon}
          >
            <Popup>
              Selected Location<br />
              Lat: {selectedLocation.lat.toFixed(6)}<br />
              Lng: {selectedLocation.lng.toFixed(6)}
            </Popup>
          </Marker>
        )}

        {/* Multiple markers for event locations */}
        {markerLocations.map((location, index) => {
          const coords = location.coordinates ? 
            [location.coordinates[1], location.coordinates[0]] : // [lat, lng] from [lng, lat]
            [location.lat, location.lng];
          
          return (
            <Marker
              key={index}
              position={coords}
              icon={blueIcon}
            >
              <Popup>
                <div className="text-center">
                  <strong>{location.title || `Event ${index + 1}`}</strong>
                  <br />
                  <small className="text-gray-600">
                    Lat: {coords[0].toFixed(6)}<br />
                    Lng: {coords[1].toFixed(6)}
                  </small>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {!readOnly && (
        <button
          onClick={getCurrentLocation}
          className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-md shadow-md hover:bg-blue-700 transition-colors z-[1000]"
        >
          Use My Location
        </button>
      )}
    </div>
  );
};

export default LeafletMapComponent; 