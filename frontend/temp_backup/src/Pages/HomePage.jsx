import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useScroll } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaBolt, FaBell, FaMapMarkerAlt, FaUsers, FaLock, FaStar, FaSearch, FaMapMarker } from 'react-icons/fa';
import { FiCalendar, FiMapPin } from 'react-icons/fi';
import bg_1 from '../assets/bg_1.jpg'; 
import bg_2 from '../assets/bg_2.webp'; 
import bg_3 from '../assets/bg_3.jpg';
import Navbar from '../Components/navBar';

const EventEasyLanding = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [bgImage, setBgImage] = useState(0);
  const images = [bg_1, bg_2, bg_3];
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };
    
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  // Background image rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setBgImage((prev) => (prev + 1) % images.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Dark mode toggle
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('darkMode', newMode);
  };


  // Features data
  const features = [
    {
      icon: <FaBolt className="text-2xl" />,
      title: "Quick Discovery",
      description: "Find events tailored to your interests in seconds with our smart recommendation engine."
    },
    {
      icon: <FaBell className="text-2xl" />,
      title: "Real-Time Updates",
      description: "Get instant notifications about event changes, cancellations, or new tickets available."
    },
    {
      icon: <FaMapMarkerAlt className="text-2xl" />,
      title: "Location-Based",
      description: "See only events near you or search any location with our interactive maps."
    },
    {
      icon: <FaUsers className="text-2xl" />,
      title: "Social Features",
      description: "See which friends are going, share events, and connect with like-minded people."
    },
    {
      icon: <FaLock className="text-2xl" />,
      title: "Secure Booking",
      description: "100% secure ticketing with verified organizers and fraud protection."
    },
    {
      icon: <FaStar className="text-2xl" />,
      title: "Ratings & Reviews",
      description: "Make informed decisions with authentic attendee feedback."
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      quote: "Event Easy has completely changed how I find things to do. The personalized recommendations are spot on!",
      name: "Sarah J.",
      role: "Music Enthusiast"
    },
    {
      quote: "As an event organizer, Event Easy has helped me reach the right audience. Ticket sales increased by 40%!",
      name: "Michael T.",
      role: "Event Organizer"
    }
  ];

  return (
    <div className="font-sans text-gray-900 dark:text-gray-100 min-h-screen">
      {/* Custom Cursor */}
      <motion.div
        className="fixed w-8 h-8 border-2 border-orange-400 rounded-full pointer-events-none z-50"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          background: 'radial-gradient(circle, rgba(147,51,234,0.3) 0%, transparent 70%)'
        }}
      />

      {/* Navigation */}
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center text-white">
        <div className="absolute inset-0 bg-black/30 dark:bg-black/50"></div>
        <motion.div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${images[bgImage]})` }}
          key={bgImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Discover Amazing Events Near You
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 text-blue-100 dark:text-blue-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Event Easy connects you with the best concerts, workshops, sports games, and more in your area.
          </motion.p>
          <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="flex flex-col sm:flex-row justify-center gap-4"
              >
                <Link 
                  to="/Login_Attendee" // replace with your actual route
                  className="bg-white text-orange-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-lg"
                >
                  Find Events
                </Link>
                <Link 
                  to="/Login_Organizer" // replace with your actual route
                  className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition shadow-lg"
                >
                  Organize Event
                </Link>
              </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Why Choose Event Easy
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="text-pink-800 dark:text-purple-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-red-500 dark:text-indigo-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>
          <div className="flex flex-col md:flex-row justify-between gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "Create Your Profile",
                description: "Tell us your interests and preferences to get personalized recommendations."
              },
              {
                title: "Browse Events",
                description: "Explore thousands of events near you or search by category, date, or location."
              },
              {
                title: "Book Tickets",
                description: "Secure your spot with our easy checkout process and mobile tickets."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="text-center flex-1"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 bg-orange-800 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Popular Events Near You
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                date: "June 15, 2023",
                title: "Summer Music Festival",
                location: "Central Park, New York",
                price: "49.99"
              },
              {
                image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                date: "June 22, 2023",
                title: "Tech Conference 2023",
                location: "Convention Center, San Francisco",
                price: "199.99"
              },
              {
                image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                date: "July 5, 2023",
                title: "Food & Wine Expo",
                location: "Downtown, Chicago",
                price: "29.99"
              }
            ].map((event, index) => (
              <motion.div
                key={index}
                className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <div className="flex items-center text-purple-600 dark:text-purple-400 mb-3">
                    <FiCalendar className="mr-2" />
                    <span>{event.date}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{event.title}</h3>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                    <FiMapPin className="mr-2" />
                    <span>{event.location}</span>
                  </div>
                  <div className="text-green-600 dark:text-green-400 font-bold mb-5">From ${event.price}</div>
                  <a href="#" className="block w-full bg-teal-500 text-orange-900 text-center py-2 rounded-lg font-medium hover:bg-teal-600 transition">
                    Book Now
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <a href="#" className="inline-block bg-orange-600 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-700 transition shadow-lg">
              View All Events
            </a>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            What Our Users Say
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <p className="italic text-gray-700 dark:text-gray-300 mb-6">"{testimonial.quote}"</p>
                <div className="font-semibold text-indigo-800 dark:text-indigo-300">
                  {testimonial.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {testimonial.role}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="container mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Experience the Difference?
            </h2>
            <p className="text-orange-100 text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of event organizers and attendees using Event Easy
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-white text-orange-600 font-bold rounded-full shadow-lg"
            >
              Get Started Today
            </motion.button>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FaCalendarAlt className="text-pink-500 mr-2" />
                Event Easy
              </h3>
              <p className="text-gray-400">Making event discovery simple, personalized, and fun.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Explore</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">All Events</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Popular Events</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Nearby Events</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Organizers</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Create Event</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Event Easy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EventEasyLanding;
