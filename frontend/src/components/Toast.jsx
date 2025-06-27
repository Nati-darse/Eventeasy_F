import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <FaCheck />,
          bgColor: 'bg-green-500',
          textColor: 'text-white',
          borderColor: 'border-green-600'
        };
      case 'error':
        return {
          icon: <FaTimes />,
          bgColor: 'bg-red-500',
          textColor: 'text-white',
          borderColor: 'border-red-600'
        };
      case 'warning':
        return {
          icon: <FaExclamationTriangle />,
          bgColor: 'bg-yellow-500',
          textColor: 'text-white',
          borderColor: 'border-yellow-600'
        };
      default:
        return {
          icon: <FaInfoCircle />,
          bgColor: 'bg-blue-500',
          textColor: 'text-white',
          borderColor: 'border-blue-600'
        };
    }
  };

  const config = getToastConfig();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className={`fixed top-4 right-4 z-50 ${config.bgColor} ${config.textColor} px-6 py-4 rounded-lg shadow-lg border-l-4 ${config.borderColor} max-w-sm`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-3">
              {config.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{message}</p>
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="ml-3 flex-shrink-0 text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default Toast;