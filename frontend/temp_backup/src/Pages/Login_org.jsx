import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import bg_1 from "../assets/bg_1.jpg";
import { appContent } from "../context/AppContext";
import { FaCalendarAlt, FaEye, FaEyeSlash } from "react-icons/fa";

export default function OrganizerLogin() {
  const { setIsLoggedin, getUserData } = useContext(appContent);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const [state, setState] = useState("Sign In");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      axios.defaults.withCredentials = true;

      if (state === "Sign Up") {
        if (formData.password !== formData.confirmPassword) {
          alert("Passwords do not match!");
          return;
        }


        // Step 2: Explicitly set the role to "organizer"
        const role = "organizer"; // Explicitly defining the role

        // Step 3: Send registration request for organizer
        const { data } = await axios.post("http://localhost:5000/Event-Easy/users/register", {

 
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "organizer",
        });

        if (data.message === "User created successfully") {
          alert("Signup successful!");
          setIsLoggedin(true);

          if (data.token) {
            localStorage.setItem("token", data.token);
            axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
          }

          await getUserData();
          await sendVerificationOtp(formData.email);
          navigate("/email-verify");
        } else {
          alert("Signup failed: " + data.message);
        }
        return;
      }

      // Login logic
      const response = await axios.post(

        "http://localhost:5000/Event-Easy/users/login",
        // "http://localhost:5000/Event-Easy/organizer/login",
        formData,
        { withCredentials: true }
      );

      if (response.data?.token) {
        const token = response.data.token;
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setIsLoggedin(true);
        await getUserData();
        alert("Login successful! Welcome back! 🎉");
        navigate("/Organizer_Dashboard");
      }

    } catch (error) {
      console.error("Auth error:", error);
      if (error.response?.data) {
        alert(`Error: ${error.response.data.message || "Unknown error"}`);
      } else {
        alert("Connection issue. Is the server running?");
      }
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Custom cursor with better color scheme
  const CustomCursor = () => (
    <>
      <motion.div
        className="fixed w-8 h-8 rounded-full pointer-events-none z-50 mix-blend-difference"
        style={{
          left: mousePos.x - 16,
          top: mousePos.y - 16,
          background: 'radial-gradient(circle, rgba(251,146,60,0.8) 0%, rgba(234,88,12,0.6) 70%)',
          boxShadow: '0 0 15px rgba(251,146,60,0.5), 0 0 30px rgba(234,88,12,0.3)'
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="fixed w-4 h-4 rounded-full pointer-events-none z-50 mix-blend-difference"
        style={{
          left: mousePos.x - 8,
          top: mousePos.y - 8,
          background: 'white',
          boxShadow: '0 0 10px white'
        }}
      />
    </>
  );

  const sendVerificationOtp = async (email) => {
    try {
      axios.defaults.withCredentials = true;

      const { data } = await axios.post(
        'http://localhost:5000/Event-Easy/users/send-verify-otp',
        { email },  // Send the email as part of the body
        'http://localhost:5000/Event-Easy/organizer/send-verify-otp',
        { email },
        { withCredentials: true }
      );

      if (data.success) {
        console.log("Verification email sent successfully:", data.message);
        alert("An OTP has been sent to your email address. Please verify your email.");
      } else {
        console.error("Failed to send verification email:", data.message);
        alert("Failed to send verification OTP. Please try again.");
      }

    } catch (error) {
      console.error("Error sending verification email:", error);
      alert("There was an error sending the OTP. Please try again.");
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <CustomCursor />
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl  flex flex-col md:flex-row">
        {/* Left Side - Form */}
        <div className="flex-1 p-6 flex flex-col justify-center">
          <div className="flex items-center mb-6">
            <FaCalendarAlt className="text-orange-500 text-2xl mr-2" />
            <h1 className="text-2xl font-bold text-orange-600 dark:text-orange-400">Event Easy</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
              {state === "Sign Up" ? "Join the Event Organizer Family!" : "Welcome Back, Organizer"}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {state === "Sign Up" 
                ? "Create your organizer account and start managing amazing events!" 
                : "Log in to your account and manage your events."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 px-4">
            {state === "Sign Up" && (
              <div className="relative">
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            )}

            <div className="relative">
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                type="email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="relative">
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white pr-10"
                required
              />
              <button
                type="button"
                className="absolute right-4 top-4 text-gray-500 dark:text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {state === "Sign Up" && (
              <div className="relative">
                <input
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500 dark:text-gray-400"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            )}

            <motion.button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {state}
            </motion.button>

            {state === "Sign In" && (
              <div className="text-center">
                <motion.a
                  href="#"
                  className="text-sm text-orange-500 hover:underline"
                  whileHover={{ color: "#ea580c" }}
                >
                  Forgot password?
                </motion.a>
              </div>
            )}
          </form>

          <div className="my-6 flex items-center px-4">
            <div className="flex-1 border-t border-gray-300 dark:border-gray-500"></div>
            <span className="px-4 text-gray-500 dark:text-gray-400 text-sm">OR</span>
            <div className="flex-1 border-t border-gray-300 dark:border-gray-500"></div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center w-full border border-gray-300 dark:border-gray-500 px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 mx-4"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png"
              alt="Google Logo"
              className="w-5 h-5 mr-2"
            />
            {state} with Google
          </motion.button>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {state === "Sign Up" ? "Already have an account?" : "New to Event Easy?"}{" "}
            </span>
            <motion.button
              onClick={() => setState(state === "Sign In" ? "Sign Up" : "Sign In")}
              className="text-orange-500 font-medium hover:underline"
              whileHover={{ color: "#ea580c" }}
            >
              {state === "Sign In" ? "Sign Up" : "Sign In"}
            </motion.button>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden md:block flex-1 relative bg-gradient-to-br from-purple-900 to-indigo-900">
          <motion.img
            src={bg_1}
            alt="Event Background"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 1 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8">
            <motion.p
              className="text-white text-xl font-medium"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              "Organize events with ease, success, and fun! 🎉"
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}