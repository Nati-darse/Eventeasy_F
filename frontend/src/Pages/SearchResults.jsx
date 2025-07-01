import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaFilter, FaListUl, FaMapMarked } from 'react-icons/fa';
import { motion } from 'framer-motion';
import LeafletMapComponent from '../Components/LeafletMapComponent.jsx';
import Navbar from '../Components/navBar.jsx';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [mapLocations, setMapLocations] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(query);
  
  const categories = [
    'All',
    'Educational/Academic Events',
    'Social & Cultural Events',
    'Sports & Recreational Events',
    'Entertainment Events',
    'Professional & Educational Events',
    'Religious',
  ];

  useEffect(() => {
    // Check if dark mode is stored in localStorage
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('darkMode', newMode);
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get('https://event-easy.onrender.com/Event-Easy/Event/events');
        let results = Array.isArray(response.data) ? response.data : [];
        
        // Filter by approved status
        results = results.filter(event => event.status === 'approved');
        
        // Filter by search query
        if (query) {
          const searchTerm = query.toLowerCase();
          results = results.filter(event => 
            event.eventName?.toLowerCase().includes(searchTerm) || 
            event.description?.toLowerCase().includes(searchTerm) ||
            event.category?.toLowerCase().includes(searchTerm) ||
            (event.location?.address && event.location.address.toLowerCase().includes(searchTerm))
          );
        }
        
        setEvents(results);
        
        // Prepare map locations
        const locations = results
          .filter(event => event.location?.coordinates?.length === 2)
          .map(event => ({
            coordinates: event.location.coordinates,
            title: event.eventName
          }));
        
        setMapLocations(locations);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Failed to fetch search results. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSearchResults();
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };
  
  // Apply filters to events
  const getFilteredEvents = () => {
    let filtered = [...events];
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }
    
    // Apply date filter
    const now = new Date();
    if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.time);
        return eventDate >= today && eventDate < tomorrow;
      });
    } else if (dateFilter === 'week') {
      const weekLater = new Date();
      weekLater.setDate(weekLater.getDate() + 7);
      
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.time);
        return eventDate >= now && eventDate <= weekLater;
      });
    } else if (dateFilter === 'month') {
      const monthLater = new Date();
      monthLater.setMonth(monthLater.getMonth() + 1);
      
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.time);
        return eventDate >= now && eventDate <= monthLater;
      });
    }
    
    return filtered;
  };
  
  const filteredEvents = getFilteredEvents();
  
  const toggleMapView = () => {
    setShowMap(!showMap);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <div className="container mx-auto px-4 py-6 pt-24">
        {/* Search Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                Search Results
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {query && <span>Query: <span className="font-medium">{query}</span></span>}
                {filteredEvents.length > 0 ? 
                  <span> • {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found</span> : 
                  <span> • No events found</span>
                }
              </p>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <FaFilter />
                <span>Filters</span>
              </button>
              
              <button
                onClick={toggleMapView}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                {showMap ? <FaListUl className="mr-1" /> : <FaMapMarked className="mr-1" />}
                {showMap ? 'List View' : 'Map View'}
              </button>
            </div>
          </div>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mt-4">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for events, locations, categories..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Search
              </button>
            </div>
          </form>
          
          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="w-full md:w-1/2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setDateFilter('all');
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg my-6">
            {error}
          </div>
        )}
        
        {/* Map View */}
        {!loading && !error && showMap && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
            <div className="h-[500px]">
              <LeafletMapComponent
                initialLocation={{ lat: 9.0222, lng: 38.7468 }} // Default to Addis Ababa
                readOnly={true}
                markerLocations={mapLocations}
                height="500px"
              />
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Showing {mapLocations.length} events on the map. Click on markers to see event details.
            </p>
          </div>
        )}
        
        {/* Results List */}
        {!loading && !error && !showMap && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {event.imageUrl?.url ? (
                    <img
                      src={event.imageUrl.url}
                      alt={event.eventName}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <FaCalendarAlt className="text-gray-400 dark:text-gray-500 text-4xl" />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1 line-clamp-1">
                          {event.eventName}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <FaCalendarAlt className="mr-1" />
                          {new Date(event.time).toLocaleDateString()} at {new Date(event.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                      
                      <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs rounded-full">
                        {event.category?.split(' ')[0] || 'Event'}
                      </span>
                    </div>
                    
                    <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                      {event.description || 'No description available.'}
                    </p>
                    
                    {event.location && (
                      <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm flex items-start">
                        <FaMapMarkerAlt className="mr-1 mt-1 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {event.location.address || 'Location available'}
                        </span>
                      </p>
                    )}
                    
                    <div className="mt-4 flex justify-between items-center">
                      <div>
                        {event.price?.amount > 0 ? (
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            {event.price.amount} {event.price.currency || 'ETB'}
                          </span>
                        ) : (
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            Free
                          </span>
                        )}
                      </div>
                      
                      <Link
                        to={`/attend/${event._id}`}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-12">
                <FaSearch className="text-gray-400 text-5xl mb-4" />
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No events found</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                  We couldn't find any events matching your search criteria. Try adjusting your filters or search terms.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;