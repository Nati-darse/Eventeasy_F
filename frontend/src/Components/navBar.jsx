import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaCalendarAlt,
  FaSearch,
  FaMapMarker,
  FaSun,
  FaMoon,
  FaBars,
  FaTimes,
} from 'react-icons/fa';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const handleSearchToggle = () => setSearchOpen(!searchOpen);

  return (
    <nav className="fixed w-full bg-white dark:bg-gray-900 shadow-md z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#"
          className="flex items-center text-2xl font-bold text-orange-600 dark:text-orange-400"
        >
          <FaCalendarAlt className="text-orange-500 mr-2" />
          Event Easy
        </a>

        {/* Search - Desktop */}
        <div className="hidden md:flex flex-1 mx-6 max-w-xl">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex w-full border border-orange-300 dark:border-orange-500 rounded-full overflow-hidden bg-white dark:bg-gray-800"
          >
            <div className="flex items-center px-4 text-orange-500">
              <FaSearch className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="w-full py-2 px-2 text-sm bg-transparent outline-none placeholder-orange-400 dark:placeholder-orange-300"
            />
            <div className="flex items-center px-3 border-l border-orange-200 dark:border-orange-700">
              <FaMapMarker className="w-4 h-4 mr-2 text-orange-500" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Location"
                className="bg-transparent outline-none text-sm w-28 placeholder-orange-400 dark:placeholder-orange-300"
              />
            </div>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 transition-all">
              <FaSearch className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        {/* Right Items - Desktop */}
        <div className="hidden md:flex space-x-6 items-center">
          <a href="#features" className="font-medium hover:text-orange-600 dark:hover:text-orange-400 transition">
            Features
          </a>
          <a href="#events" className="font-medium hover:text-orange-600 dark:hover:text-orange-400 transition">
            Events
          </a>
          <a href="#how-it-works" className="font-medium hover:text-orange-600 dark:hover:text-orange-400 transition">
            How It Works
          </a>
          <a href="#testimonials" className="font-medium hover:text-orange-600 dark:hover:text-orange-400 transition">
            Testimonials
          </a>
        </div>

        {/* Dark Mode Toggle (no background) */}
        <motion.button
          onClick={toggleDarkMode}
          className="ml-4 text-2xl text-gray-700 dark:text-gray-200 transition"
          whileHover={{ scale: 1.2 }}
        >
          {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-300" />}
        </motion.button>

        {/* Hamburger Menu - Mobile */}
        <button
          onClick={toggleMenu}
          className="md:hidden ml-4 text-gray-700 dark:text-gray-200 text-2xl focus:outline-none"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Search Button on New Line */}
      <div className="md:hidden w-full px-4 mt-2">
        {!searchOpen ? (
          <div className="flex justify-start">
            <button
              onClick={handleSearchToggle}
              className="p-2 text-orange-600 dark:text-orange-400"
            >
              <FaSearch className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="w-full">
            <div className="flex border border-orange-300 dark:border-orange-500 rounded-full overflow-hidden bg-white dark:bg-gray-800">
              <div className="flex items-center px-4 text-orange-500">
                <FaSearch className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="w-full py-2 px-2 text-sm bg-transparent outline-none placeholder-orange-400 dark:placeholder-orange-300"
              />
              <button
                onClick={handleSearchToggle}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 transition-all"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Links */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-md px-6 py-4 space-y-3 text-center text-gray-800 dark:text-gray-100">
          <a href="#features" className="block hover:text-orange-600 dark:hover:text-orange-400">
            Features
          </a>
          <a href="#events" className="block hover:text-orange-600 dark:hover:text-orange-400">
            Events
          </a>
          <a href="#how-it-works" className="block hover:text-orange-600 dark:hover:text-orange-400">
            How It Works
          </a>
          <a href="#testimonials" className="block hover:text-orange-600 dark:hover:text-orange-400">
            Testimonials
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;