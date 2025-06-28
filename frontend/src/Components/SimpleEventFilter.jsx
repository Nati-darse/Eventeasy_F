import React, { useState } from 'react';
import { FaSearch, FaTags, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

const SimpleEventFilter = ({ onFilterChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    searchQuery: '',
    category: 'All',
    dateRange: 'all',
    customDateFrom: '',
    customDateTo: '',
    ...initialFilters,
  });

  const categories = [
    'All',
    'Educational/Academic Events',
    'Social & Cultural Events',
    'Sports & Recreational Events',
    'Entertainment Events',
    'Professional & Educational Events',
    'Religious',
  ];

  const dateRanges = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      searchQuery: '',
      category: 'All',
      dateRange: 'all',
      customDateFrom: '',
      customDateTo: '',
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category !== 'All') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.searchQuery) count++;
    if (filters.dateRange === 'custom' && (filters.customDateFrom || filters.customDateTo)) count++;
    return count;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FaSearch className="text-blue-500" />
          Search & Filter Events
        </h2>
        {getActiveFilterCount() > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <FaTimes />
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Search Bar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            🔍 Search Events
          </label>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            placeholder="Search by event name, description, organizer..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            🏷️ Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => handleFilterChange('category', category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filters.category === category
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            📅 Date Range
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            {dateRanges.map((range) => (
              <motion.button
                key={range.value}
                onClick={() => handleFilterChange('dateRange', range.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filters.dateRange === range.value
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {range.label}
              </motion.button>
            ))}
          </div>

          {/* Custom Date Range */}
          {filters.dateRange === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.customDateFrom}
                  onChange={(e) => handleFilterChange('customDateFrom', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.customDateTo}
                  onChange={(e) => handleFilterChange('customDateTo', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Active Filters Summary */}
        {getActiveFilterCount() > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
            {filters.category !== 'All' && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                Category: {filters.category}
              </span>
            )}
            {filters.dateRange !== 'all' && (
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                Date: {dateRanges.find(r => r.value === filters.dateRange)?.label}
              </span>
            )}
            {filters.searchQuery && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                Search: "{filters.searchQuery}"
              </span>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SimpleEventFilter; 