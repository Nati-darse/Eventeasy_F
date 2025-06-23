import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const SearchBar = ({ className, variant = 'default' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchQuery) return;
    
    setIsSearching(true);
    
    const searchParams = new URLSearchParams();
    if (searchQuery) searchParams.set('q', searchQuery);
    
    navigate(`/search?${searchParams.toString()}`);
    setIsSearching(false);
  };

  // Compact variant for mobile or smaller spaces
  if (variant === 'compact') {
    return (
      <form onSubmit={handleSearch} className={`w-full ${className}`}>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, locations, categories..."
            className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <button
            type="submit"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            disabled={isSearching}
          >
            {isSearching ? (
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FaSearch className="text-orange-500" />
            )}
          </button>
        </div>
      </form>
    );
  }

  // Default full variant
  return (
    <form onSubmit={handleSearch} className={`w-full ${className}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="flex w-full border border-orange-300 dark:border-orange-500 rounded-full overflow-hidden bg-white dark:bg-gray-800 shadow-md"
      >
        <div className="flex items-center px-4 text-orange-500">
          <FaSearch className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search events, locations, categories..."
          className="w-full py-3 px-2 text-sm bg-transparent outline-none placeholder-orange-400 dark:placeholder-orange-300 text-gray-800 dark:text-gray-200"
        />
        <button 
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 transition-all flex items-center justify-center"
          disabled={isSearching}
        >
          {isSearching ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span>Search</span>
          )}
        </button>
      </motion.div>
    </form>
  );
};

export default SearchBar;