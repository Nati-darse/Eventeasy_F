import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { DATE_FORMATS, FILE_LIMITS } from './constants';

/**
 * Utility Helper Functions
 * Common utility functions used across the application
 */

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {string} formatType - Format type from DATE_FORMATS
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatType = DATE_FORMATS.DISPLAY) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) return '';
    
    if (formatType === DATE_FORMATS.RELATIVE) {
      return formatDistanceToNow(dateObj, { addSuffix: true });
    }
    
    return format(dateObj, formatType);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Validation result
 */
export const isValidEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with strength score
 */
export const validatePassword = (password) => {
  const result = {
    isValid: false,
    score: 0,
    feedback: [],
  };

  if (!password) {
    result.feedback.push('Password is required');
    return result;
  }

  if (password.length < 6) {
    result.feedback.push('Password must be at least 6 characters long');
  } else {
    result.score += 1;
  }

  if (!/[a-z]/.test(password)) {
    result.feedback.push('Password must contain at least one lowercase letter');
  } else {
    result.score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    result.feedback.push('Password must contain at least one uppercase letter');
  } else {
    result.score += 1;
  }

  if (!/\d/.test(password)) {
    result.feedback.push('Password must contain at least one number');
  } else {
    result.score += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.feedback.push('Consider adding special characters for stronger security');
  } else {
    result.score += 1;
  }

  result.isValid = result.score >= 3 && password.length >= 6;
  
  return result;
};

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {string} type - Expected file type ('image' or 'video')
 * @returns {object} Validation result
 */
export const validateFile = (file, type = 'image') => {
  const result = {
    isValid: false,
    error: null,
  };

  if (!file) {
    result.error = 'No file selected';
    return result;
  }

  // Check file size
  if (file.size > FILE_LIMITS.MAX_SIZE) {
    result.error = `File size exceeds ${formatFileSize(FILE_LIMITS.MAX_SIZE)} limit`;
    return result;
  }

  // Check file type
  const allowedTypes = type === 'image' 
    ? FILE_LIMITS.ALLOWED_IMAGE_TYPES 
    : FILE_LIMITS.ALLOWED_VIDEO_TYPES;

  if (!allowedTypes.includes(file.type)) {
    result.error = `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
    return result;
  }

  result.isValid = true;
  return result;
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Debounce function
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 * @param {function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Generate random ID
 * @param {number} length - ID length
 * @returns {string} Random ID
 */
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Convert string to slug
 * @param {string} str - String to convert
 * @returns {string} Slug string
 */
export const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Deep clone object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * Check if object is empty
 * @param {object} obj - Object to check
 * @returns {boolean} Whether object is empty
 */
export const isEmpty = (obj) => {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  return Object.keys(obj).length === 0;
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'ETB') => {
  if (typeof amount !== 'number') return '0';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'ETB' ? 'USD' : currency, // Fallback for ETB
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount).replace('$', currency === 'ETB' ? 'ETB ' : '');
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export const getInitials = (name) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

/**
 * Generate avatar URL
 * @param {string} name - User name
 * @param {string} size - Avatar size
 * @returns {string} Avatar URL
 */
export const generateAvatarUrl = (name, size = '40') => {
  const initials = getInitials(name);
  const colors = ['FF6B6B', '4ECDC4', '45B7D1', '96CEB4', 'FFEAA7', 'DDA0DD', 'FFB347'];
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
  const backgroundColor = colors[colorIndex];
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=${backgroundColor}&color=fff&bold=true`;
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy text:', error);
    return false;
  }
};

/**
 * Scroll to element smoothly
 * @param {string} elementId - Element ID to scroll to
 * @param {number} offset - Offset from top
 */
export const scrollToElement = (elementId, offset = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth',
    });
  }
};

/**
 * Check if user is on mobile device
 * @returns {boolean} Whether user is on mobile
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Get browser information
 * @returns {object} Browser information
 */
export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';

  if (userAgent.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
    browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Safari') > -1) {
    browserName = 'Safari';
    browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Edge') > -1) {
    browserName = 'Edge';
    browserVersion = userAgent.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
  }

  return {
    name: browserName,
    version: browserVersion,
    userAgent,
    isMobile: isMobile(),
  };
};

export default {
  formatDate,
  isValidEmail,
  validatePassword,
  validateFile,
  formatFileSize,
  debounce,
  throttle,
  generateId,
  capitalize,
  truncateText,
  slugify,
  deepClone,
  isEmpty,
  formatCurrency,
  getInitials,
  generateAvatarUrl,
  copyToClipboard,
  scrollToElement,
  isMobile,
  getBrowserInfo,
};