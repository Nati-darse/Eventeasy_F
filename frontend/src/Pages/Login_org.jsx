import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import bg_1 from "../assets/bg_1.jpg";
import { AppContent } from "../context/AppContext.jsx";
import { FaCalendarAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import GoogleAuth from "../components/GoogleAuth.jsx";
import { useFormValidation, ValidatedInput, validationRules } from "../components/FormValidation.jsx";
import { useToast } from "../hooks/useToast.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function OrganizerLogin() {
  const { setIsLoggedin, getUserData, login, register, loading, showError, showSuccess } = useContext(AppContent);
  const navigate = useNavigate();
  const [state, setState] = useState("Sign In");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  // Helper function to show error with fallback
  const displayError = (message) => {
    error(message);
    showError(message);
    // Fallback alert
    alert(`Error: ${message}`);
  };

  // Helper function to show success with fallback
  const displaySuccess = (message) => {
    success(message);
    showSuccess(message);
  };

  // Form validation
  const validationSchema = {
    name: state === 'Sign Up' ? validationRules.name : {},
    email: validationRules.email,
    password: validationRules.password,
    confirmPassword: state === 'Sign Up' ? validationRules.confirmPassword : {},
  };

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    validateAll,
    reset,
  } = useFormValidation({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  }, validationSchema);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAll()) {
      displayError('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      if (state === "Sign Up") {
        const result = await register({
          name: values.name,
          email: values.email,
          password: values.password,
          role: 'organizer',
        });

        if (result.success) {
          displaySuccess("Signup successful! Welcome to Event Easy! 🎉");
          navigate("/email-verify");
        } else {
          displayError(result.error || "Signup failed. Please try again.");
        }
      } else {
        const result = await login({
          email: values.email,
          password: values.password,
        });

        if (result.success) {
          displaySuccess("Login successful! Welcome back! 🎉");
          navigate("/Organizer_Dashboard");
        } else {
          displayError(result.error || "Login failed. Please check your credentials and try again.");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      displayError("An unexpected error occurred. Please try again or contact support if the problem persists.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (data) => {
    setIsLoggedin(true);
    await getUserData();
    displaySuccess("Google login successful! Welcome! 🎉");
    navigate("/Organizer_Dashboard");
  };

  const handleGoogleError = (errorMessage) => {
    displayError("Google login failed: " + errorMessage);
  };

  const handleStateChange = () => {
    setState(state === "Sign In" ? "Sign Up" : "Sign In");
    reset();
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row">
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
              <ValidatedInput
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Full Name"
                type="text"
                rules={validationRules.name}
                errors={errors.name}
                required
              />
            )}

            <ValidatedInput
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Email Address"
              type="email"
              rules={validationRules.email}
              errors={errors.email}
              required
            />

            <div className="relative">
              <ValidatedInput
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                rules={validationRules.password}
                errors={errors.password}
                className="pr-10"
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
                <ValidatedInput
                  name="confirmPassword"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  errors={errors.confirmPassword}
                  className="pr-10"
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
              disabled={isSubmitting || loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting || loading ? (
                <LoadingSpinner size="small" />
              ) : (
                state
              )}
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

          <div className="px-4">
            <GoogleAuth
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              role="organizer"
              buttonText={`${state} with Google`}
            />
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {state === "Sign Up" ? "Already have an account?" : "New to Event Easy?"}{" "}
            </span>
            <motion.button
              onClick={handleStateChange}
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