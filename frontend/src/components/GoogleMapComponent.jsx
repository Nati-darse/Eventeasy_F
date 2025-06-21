import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

// Default center (Addis Ababa, Ethiopia)
const defaultCenter = {
  lat: 9.0222,
  lng: 38.7468
};

const GoogleMapComponent = ({ 
  apiKey, 
  initialLocation, 
  onLocationSelect, 
  readOnly = false,
  markerLocations = []
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  });

  const [map, setMap] = useState(null);
  const [center, setCenter] = useState(initialLocation || defaultCenter);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);

  // Update center if initialLocation changes
  useEffect(() => {
    if (initialLocation) {
      setCenter(initialLocation);
      setSelectedLocation(initialLocation);
    }
  }, [initialLocation]);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const handleMapClick = useCallback((event) => {
    if (readOnly) return;
    
    const newLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    
    setSelectedLocation(newLocation);
    
    if (onLocationSelect) {
      onLocationSelect(newLocation);
    }
  }, [readOnly, onLocationSelect]);

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

  if (loadError) {
    return <div className="p-4 text-red-500">Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return <div className="p-4 text-gray-500">Loading Google Maps...</div>;
  }

  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          fullscreenControl: true,
          streetViewControl: true,
          mapTypeControl: true,
          zoomControl: true
        }}
      >
        {/* Selected location marker */}
        {selectedLocation && (
          <Marker
            position={selectedLocation}
            animation={window.google.maps.Animation.DROP}
          />
        )}

        {/* Multiple markers for event locations */}
        {markerLocations.map((location, index) => (
          <Marker
            key={index}
            position={location.coordinates ? 
              { lat: location.coordinates[1], lng: location.coordinates[0] } : 
              location
            }
            title={location.title || `Location ${index + 1}`}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }}
          />
        ))}
      </GoogleMap>

      {!readOnly && (
        <button
          onClick={getCurrentLocation}
          className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-md shadow-md hover:bg-blue-700 transition-colors"
        >
          Use My Location
        </button>
      )}
    </div>
  );
};

export default GoogleMapComponent;