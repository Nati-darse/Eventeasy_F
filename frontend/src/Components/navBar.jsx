import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaCalendarAlt,
  FaSearch,
  FaSun,
  FaMoon,
  FaBars,
  FaTimes,
  FaUser,
  FaSignOutAlt,
} from 'react-icons/fa';
import { AppContent } from '../context/AppContext.jsx';
import axios from 'axios';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const { userData, setUserData, setIsLoggedin } = useContext(AppContent);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery) return;
    
    setIsSearching(true);
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setIsSearching(false);
  };

  const logout = async () => {
    try {
      await axios.post(
        'http://localhost:5000/Event-Easy/users/logout',
        {},
        { withCredentials: true }
      );
      
      localStorage.removeItem('token');
      setUserData(null);
      setIsLoggedin(false);
      navigate('/');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <nav className="fixed w-full bg-white dark:bg-gray-900 shadow-md z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center text-2xl font-bold text-orange-600 dark:text-orange-400"
        >
          <FaCalendarAlt className="text-orange-500 mr-2" />
          <span className="hidden sm:inline">Event Easy</span>
        </Link>

        {/* Search - Desktop */}
        <div className="hidden md:flex flex-1 mx-6 max-w-xl">
          <form onSubmit={handleSearch} className="w-full">
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
                placeholder="Search events, locations, categories..."
                className="w-full py-2 px-2 text-sm bg-transparent outline-none placeholder-orange-400 dark:placeholder-orange-300 text-gray-800 dark:text-gray-200"
              />
              <button 
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 transition-all flex items-center justify-center"
                disabled={isSearching}
              >
                {isSearching ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaSearch className="w-4 h-4" />
                )}
              </button>
            </motion.div>
          </form>
        </div>

        {/* Right Items - Desktop */}
        <div className="hidden md:flex space-x-6 items-center">
          {userData ? (
            <div className="relative">
              <button 
                onClick={toggleUserMenu}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400"
              >
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-800 flex items-center justify-center text-orange-600 dark:text-orange-300">
                  {userData.name ? userData.name.charAt(0).toUpperCase() : <FaUser />}
                </div>
                <span className="font-medium">{userData.name}</span>
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
                  {userData.role === 'attendee' && (
                    <Link to="/Attendee" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      My Events
                    </Link>
                  )}
                  {userData.role === 'organizer' && (
                    <Link to="/Organizer_Dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      Dashboard
                    </Link>
                  )}
                  {userData.role === 'admin' && (
                    <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      Admin Panel
                    </Link>
                  )}
                  <button 
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FaSignOutAlt className="inline mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/Login_Attendee" className="font-medium hover:text-orange-600 dark:hover:text-orange-400 transition">
                Login
              </Link>
              <Link to="/Classify" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full transition-colors">
                Sign Up
              </Link>
            </>
          )}
          
          {/* Dark Mode Toggle */}
          <motion.button
            onClick={toggleDarkMode}
            className="text-2xl text-gray-700 dark:text-gray-200 transition"
            whileHover={{ scale: 1.2 }}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-500" />}
          </motion.button>
        </div>

        {/* Mobile Right Menu */}
        <div className="flex items-center md:hidden">
          {userData && (
            <button 
              onClick={toggleUserMenu}
              className="mr-3 text-gray-700 dark:text-gray-200"
            >
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-800 flex items-center justify-center text-orange-600 dark:text-orange-300">
                {userData.name ? userData.name.charAt(0).toUpperCase() : <FaUser />}
              </div>
            </button>
          )}
          
          {/* Dark Mode Toggle - Mobile */}
          <motion.button
            onClick={toggleDarkMode}
            className="mr-3 text-2xl text-gray-700 dark:text-gray-200"
            whileHover={{ scale: 1.2 }}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-500" />}
          </motion.button>
          
          {/* Hamburger Menu - Mobile */}
          <button
            onClick={toggleMenu}
            className="text-gray-700 dark:text-gray-200 text-2xl focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden w-full px-4 py-2 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSearch} className="w-full">
          <div className="flex border border-orange-300 dark:border-orange-500 rounded-full overflow-hidden bg-white dark:bg-gray-800">
            <div className="flex items-center px-3 text-orange-500">
              <FaSearch className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events, locations..."
              className="w-full py-2 px-2 text-sm bg-transparent outline-none placeholder-orange-400 dark:placeholder-orange-300 text-gray-800 dark:text-gray-200"
            />
            <button 
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 transition-all flex items-center justify-center"
              disabled={isSearching}
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FaSearch className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Mobile Menu Links */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-md px-6 py-4 space-y-3 text-gray-800 dark:text-gray-100 border-t border-gray-200 dark:border-gray-700">
          {!userData ? (
            <>
              <Link to="/Login_Attendee" className="block py-2 hover:text-orange-600 dark:hover:text-orange-400">
                Login
              </Link>
              <Link to="/Classify" className="block py-2 hover:text-orange-600 dark:hover:text-orange-400">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {userData.role === 'attendee' && (
                <Link to="/Attendee" className="block py-2 hover:text-orange-600 dark:hover:text-orange-400">
                  My Events
                </Link>
              )}
              {userData.role === 'organizer' && (
                <Link to="/Organizer_Dashboard" className="block py-2 hover:text-orange-600 dark:hover:text-orange-400">
                  Dashboard
                </Link>
              )}
              {userData.role === 'admin' && (
                <Link to="/admin" className="block py-2 hover:text-orange-600 dark:hover:text-orange-400">
                  Admin Panel
                </Link>
              )}
              <button 
                onClick={logout}
                className="block w-full text-left py-2 text-red-600 hover:text-red-700"
              >
                <FaSignOutAlt className="inline mr-2" /> Logout
              </button>
            </>
          )}
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <Link to="/" className="block py-2 hover:text-orange-600 dark:hover:text-orange-400">
              Home
            </Link>
            <a href="#features" className="block py-2 hover:text-orange-600 dark:hover:text-orange-400">
              Features
            </a>
            <a href="#events" className="block py-2 hover:text-orange-600 dark:hover:text-orange-400">
              Events
            </a>
            <a href="#how-it-works" className="block py-2 hover:text-orange-600 dark:hover:text-orange-400">
              How It Works
            </a>
            <a href="#testimonials" className="block py-2 hover:text-orange-600 dark:hover:text-orange-400">
              Testimonials
            </a>
          </div>
        </div>
      )}
      
      {/* User Menu - Mobile */}
      {userMenuOpen && userData && (
        <div className="md:hidden absolute right-4 top-16 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
          {userData.role === 'attendee' && (
            <Link to="/Attendee" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
              My Events
            </Link>
          )}
          {userData.role === 'organizer' && (
            <Link to="/Organizer_Dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
              Dashboard
            </Link>
          )}
          {userData.role === 'admin' && (
            <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
              Admin Panel
            </Link>
          )}
          <button 
            onClick={logout}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FaSignOutAlt className="inline mr-2" /> Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;