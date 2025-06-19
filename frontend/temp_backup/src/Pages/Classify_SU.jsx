import { Link } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function EventbriteClone() {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode is stored in localStorage and set the state accordingly
    const savedMode = localStorage.getItem('darkMode');
    setDarkMode(savedMode === 'true');
  }, []);

  useEffect(() => {
    // Apply or remove the 'dark' class based on darkMode state
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-[#]'} flex flex-col items-center justify-center relative overflow-hidden`}>
      {/* Floating Cursor */}
      <motion.div
        className={`absolute w-10 h-10 ${darkMode ? 'bg-yellow-500' : 'bg-blue-500'} rounded-full mix-blend-difference opacity-70 pointer-events-none`}
        style={{
          left: cursorPosition.x - 10,
          top: cursorPosition.y - 10,
        }}
        animate={{
          x: cursorPosition.x - 10,
          y: cursorPosition.y - 10,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      />

      {/* Wavy Background */}
      <div className="absolute top-0 left-0 w-full h-64 z-0">
        <svg viewBox="0 0 1440 320" className="w-full h-full">
          <path
            fill="#33cccc"
            d="M0,128L48,138.7C96,149,192,171,288,186.7C384,203,480,213,576,186.7C672,160,768,96,864,74.7C960,53,1056,75,1152,106.7C1248,139,1344,181,1392,202.7L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>

      {/* Header */}
      <div className="relative z-10 text-center mt-16">
        <motion.h1
          className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-[#1d1c1d]'} mb-4 cursor-pointer`}
          whileHover={{
            y: [-10, 0],
            x: [10, 0],
            rotate: [0, 5, -5, 0],
            color: "#00ffff",
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Welcome to Event-Easy! <span className="animate-wave">👋</span>
        </motion.h1>
        <motion.p
          className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
          whileHover={{ scale: 1.05, rotate: 3 }}
        >
          We're glad you're here! What can we help you with first?
        </motion.p>
      </div>

      {/* Find Experience Card */}
      <div className="relative z-10 flex flex-col md:flex-row gap-6 mt-12">
        <motion.div
          className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} rounded-xl shadow-md p-6 w-72 flex flex-col items-center`}
          whileHover={{
            scale: 1.05,
            rotate: 3,
            backgroundColor: "#e0e0e0",
          }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.img
            src="https://cdn-icons-png.flaticon.com/512/3050/3050525.png"
            alt="Find Experience"
            className="w-24 h-24 mb-4 cursor-pointer"
            whileHover={{ rotate: 360 }}
          />
          <motion.h2
            className="text-xl font-semibold mb-2"
            whileHover={{ x: [0, 10, -10, 0], y: [0, -10, 10, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Find all events and experience here
          </motion.h2>
          <Link to="/Login_Attendee">
          <motion.button
            className={`mt-2 px-4 py-2 border border-gray-400 rounded hover:bg-gray-100 transition-all ${darkMode ? 'dark:hover:bg-gray-600' : ''}`}
            whileHover={{
              scale: 1.1,
              backgroundColor: "#ff6347",
              color: "#fff",
              rotate: 5,
            }}
          >
            go forward to find your trending events
          </motion.button>
          </Link>
        </motion.div>

        {/* Organize Event Card */}
        <motion.div
          className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} rounded-xl shadow-md p-6 w-72 flex flex-col items-center`}
          whileHover={{
            scale: 1.05,
            rotate: -3,
            backgroundColor: "#f0f0f0",
          }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.img
            src="https://cdn-icons-png.flaticon.com/512/3437/3437369.png"
            alt="Organize Event"
            className="w-24 h-24 mb-4 cursor-pointer"
            whileHover={{ rotate: -360 }}
          />
          <motion.h2
            className="text-xl font-semibold mb-2"
            whileHover={{ x: [0, 10, -10, 0], y: [0, -10, 10, 0], rotate: [0, -5, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Organize an event
          </motion.h2>
          <Link to="/Login_Organizer">
          <motion.button
            className={`mt-2 px-4 py-2 border border-gray-400 rounded hover:bg-gray-100 transition-all ${darkMode ? 'dark:hover:bg-gray-600' : ''}`}
            whileHover={{
              scale: 1.1,
              backgroundColor: "#008CBA",
              color: "#fff",
              rotate: -5,
            }}
          >
            Plan your best event ever
          </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
