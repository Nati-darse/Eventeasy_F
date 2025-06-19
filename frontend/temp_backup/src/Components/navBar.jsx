
// import { Link, Navigate } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
// import { useContext, useEffect, useRef, useState } from 'react';
// import { Menu, X, Moon, Sun, Search, MapPin } from 'lucide-react';
// import { motion, useMotionValue, useSpring } from 'framer-motion';
// import { AppContent } from '../context/AppContext';
// import axios from 'axios';
// import { AppContent } from '../context/AppContext';
// import axios from 'axios';

// export default function AnimatedNavbar() {

//   const navigate = useNavigate();

//   const navigate = useNavigate();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [darkMode, setDarkMode] = useState(false);

//   const cursorX = useMotionValue(0);
//   const cursorY = useMotionValue(0);
//   const springX = useSpring(cursorX, { stiffness: 200, damping: 20 });
//   const springY = useSpring(cursorY, { stiffness: 200, damping: 20 });

//   useEffect(() => {
//     const savedMode = localStorage.getItem('darkMode');
//     if (savedMode === 'true') {
//       setDarkMode(true);
//       document.documentElement.classList.add('dark');
//     }
//   }, []);

//   useEffect(() => {
//     const handleMouseMove = (e) => {
//       cursorX.set(e.clientX);
//       cursorY.set(e.clientY);
//     };
//     window.addEventListener('mousemove', handleMouseMove);
//     return () => window.removeEventListener('mousemove', handleMouseMove);
//   }, []);

//   const {userData} = useContext(AppContent);
//   console.log("User data in Navbar:", userData);

//   const { setUserData, setIsLoggedin } = useContext(AppContent);

//   const logout = async () => {
//     try {
//       // Just in case
//       axios.defaults.withCredentials = true;

//       const response = await axios.post(
//         'http://localhost:5000/Event-Easy/Attendee/logout',
//         {},
//         { withCredentials: true }
//       );

//       if (response.data.message === 'Logout successful!') {
//         console.log("✅ Logout successful (message-based fallback)");
      
//         localStorage.removeItem('token');
//         setUserData(null);
//         setIsLoggedin(false);
      
//         setTimeout(() => {
//           navigate('/Login_Attendee');
//         }, 100);
//       } else {
//         console.error("Logout failed:", response.data.message);
//       }
//     } catch (err) {
//       console.error("🔥 Logout error:", err);
//     }
//   };

//   const {userData} = useContext(AppContent);
//   console.log("User data in Navbar:", userData);

//   const { setUserData, setIsLoggedin } = useContext(AppContent);

//   const logout = async () => {
//     try {
//       // Just in case
//       axios.defaults.withCredentials = true;

//       const response = await axios.post(
//         'http://localhost:5000/Event-Easy/Attendee/logout',
//         {},
//         { withCredentials: true }
//       );

//       if (response.data.message === 'Logout successful!') {
//         console.log("✅ Logout successful (message-based fallback)");
      
//         localStorage.removeItem('token');
//         setUserData(null);
//         setIsLoggedin(false);
      
//         setTimeout(() => {
//           navigate('/Login_Attendee');
//         }, 100);
//       } else {
//         console.error("Logout failed:", response.data.message);
//       }
//     } catch (err) {
//       console.error("🔥 Logout error:", err);
//     }
//   };

//   return (
//     <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#0f2027] via-[#203a43] to-[#2c5364] dark:from-gray-800 dark:to-gray-900 shadow-md transition-all duration-500">
//       <motion.div
//         className="pointer-events-none fixed top-0 left-0 w-10 h-10 bg-blue-500 rounded-full mix-blend-difference opacity-70"
//         style={{ x: springX, y: springY }}
//       />

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-16">

//           <motion.a
//             href="#"
//             whileHover={{ x: [0, 10, -10, 0], y: [0, -10, 10, 0], rotate: [0, 5, -5, 0], color: "#00ffff" }}
//             transition={{ duration: 1.5, repeat: Infinity }}
//             className="text-xl font-bold text-white pixel-dance"
//           >
//             Event-Easy
//           </motion.a>

//           <div className="hidden md:flex flex-1 mx-4 max-w-3xl">
//             <motion.div
//               whileHover={{ scale: 1.05, rotate: 1 }}
//               className="flex w-full border border-gray-300 dark:border-gray-700 rounded-full overflow-hidden shadow-lg animate-gradient">

//               <div className="flex items-center px-4 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300">
//                 <Search className="w-5 h-5" />
//               </div>
//               <input
//                 type="text"
//                 placeholder="Search events"
//                 className="w-full py-2 px-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-400 outline-none"
//               />
//               <div className="w-px bg-gray-300 dark:bg-gray-600 my-2"></div>
//               <div className="flex items-center px-3 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300">
//                 <MapPin className="w-5 h-5 mr-1 animate-bounce" />
//                 <input
//                   type="text"
//                   placeholder="City"
//                   className="bg-transparent outline-none text-sm w-28 text-gray-700 dark:text-white placeholder-gray-400"
//                 />
//               </div>
//               <button className="bg-red-600 hover:bg-pink-600 text-white px-4 rounded-r-full transition-all flex items-center justify-center animate-pulse">
//                 <Search className="w-5 h-5" />
//               </button>
//             </motion.div>
//           </div>

//           <div className="hidden md:flex space-x-6 items-center">
//             {["Contact Sales", "Create Events", "Help Center", "Find my tickets"].map((item, i) => (
//               <motion.a
//                 key={i}
//                 href={`#${item.replace(/\s+/g, '-').toLowerCase()}`}
//                 whileHover={{ scale: 1.1, rotate: [0, 3, -3, 0], color: "#00ffee" }}
//                 className="text-white transition duration-500 ease-in-out cursor-pointer"
//               >
//                 {item}
//               </motion.a>
//             ))}

//             <button
//               onClick={() => {
//                 const newMode = !darkMode;
//                 setDarkMode(newMode);
//                 document.documentElement.classList.toggle('dark', newMode);
//                 localStorage.setItem('darkMode', newMode);
//               }}
//               className="text-white hover:text-yellow-400 transition-colors duration-500"
//             >
//               {darkMode ? <Sun size={18} /> : <Moon size={18} />}
//             </button>
//             {userData ? (
//               <>
//               <div className="text-white text-sm font-semibold ">
//                   {userData.name}
//                   <div className='absolute  goup-hover:block bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg rounded-lg p-4 mt-2'>
//                     <ul className="space-y-2 list-none m-0 p-2  text-sm">
//                       {!userData.isVerified && <li className='cursor-pointer'>Verify email</li>}
//                       <li className='list-none m-0 p-2  text-sm cursor-pointer' onClick = {logout}>Logout</li>
//                     </ul>
//                   </div>
//               </div>
//               </>
//           ) : (
//               <div className="block text-sm text-gray-700 dark:text-gray-200">
//                   <a href="/login" className="text-sm text-white hover:underline">Log In</a>
//                   <Link to="/Classify">
//                     <motion.div
//                       whileHover={{ scale: 1.1, backgroundColor: "#00ffff", color: "#000" }}
//                       className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-full transition duration-300 ease-in-out"
//                     >
//                       Sign Up
//                     </motion.div>
//                   </Link>
//               </div>
//           )}
//             {userData ? (
//               <>
//               <div className="text-white text-sm font-semibold ">
//                   {userData.name}
//                   <div className='absolute  goup-hover:block bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg rounded-lg p-4 mt-2'>
//                     <ul className="space-y-2 list-none m-0 p-2  text-sm">
//                       {!userData.isVerified && <li className='cursor-pointer'>Verify email</li>}
//                       <li className='list-none m-0 p-2  text-sm cursor-pointer' onClick = {logout}>Logout</li>
//                     </ul>
//                   </div>
//               </div>
//               </>
//           ) : (
//               <div className="flex items-center block text-sm text-gray-700 dark:text-gray-200">
//                   <a href="/login" className="text-sm text-white hover:underline">Log In</a>
//                   <Link to="/Classify">
//                     <motion.div
//                       whileHover={{ scale: 1.1, backgroundColor: "#00ffff", color: "#000" }}
//                       className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-full transition duration-300 ease-in-out"
//                     >
//                       Sign Up
//                     </motion.div>
//                   </Link>
//               </div>
//           )}
//           </div>

//           <div className="md:hidden">
//             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
//               {mobileMenuOpen ? <X /> : <Menu />}
//             </button>
//           </div>
//         </div>
//       </div>

//       {mobileMenuOpen && (
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="md:hidden bg-white dark:bg-gray-800 px-4 pt-2 pb-4 space-y-2 shadow-lg text-gray-900 dark:text-white"
//         >
//           {["Contact Sales", "Create Events", "Help Center", "Find my tickets"].map((item, i) => (
//             <motion.a
//               key={i}
//               whileHover={{ scale: 1.1, x: [0, 10, -10, 0] }}
//               href={`#${item.replace(/\s+/g, '-').toLowerCase()}`}
//               className="block hover:bg-blue-500 dark:hover:bg-blue-600 px-2 py-1 rounded"
//             >
//               {item}
//             </motion.a>
//           ))}

//           <button
//             onClick={() => {
//               const newMode = !darkMode;
//               setDarkMode(newMode);
//               document.documentElement.classList.toggle('dark', newMode);
//               localStorage.setItem('darkMode', newMode);
//             }}
//             className="block text-sm text-gray-700 dark:text-gray-200"
//           >
//             {darkMode ? 'Light Mode' : 'Dark Mode'}
//           </button>
//           {userData ? (
//               <>
//                   {userData.name}
//               </>
//           ) : (
//               <div className="block text-sm text-gray-700 dark:text-gray-200">
//                   <a href="/login">Log In</a>
//                   <a href="/signup">Sign Up</a>
//               </div>
//           )}


//           {userData ? (
//               <>
//                   {userData.name}
//               </>
//           ) : (
//               <div className="block text-sm text-gray-700 dark:text-gray-200">
//                   <a href="/login">Log In</a>
//                   <a href="/signup">Sign Up</a>
//               </div>
//           )}


//         </motion.div>
//       )}
//     </nav>
//   );
// }



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
