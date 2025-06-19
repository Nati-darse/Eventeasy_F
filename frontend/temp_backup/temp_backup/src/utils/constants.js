/**
 * Application Constants
 * Centralized constants for the application
 */

// Event Categories
export const EVENT_CATEGORIES = [
  'Educational/Academic Events',
  'Social & Cultural Events',
  'Sports & Recreational Events',
  'Entertainment Events',
  'Professional & Educational Events',
  'religous',
];

// Event Status Options
export const EVENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

// User Roles
export const USER_ROLES = {
  ATTENDEE: 'attendee',
  ORGANIZER: 'organizer',
  ADMIN: 'admin',
};

// Report Reasons
export const REPORT_REASONS = [
  'Inappropriate Content',
  'Misleading Information',
  'Safety Concern',
  'Spam',
  'Fraudulent Event',
  'Organizer Issue',
  'Venue Problem',
  'Technical Issue',
  'Other',
];

// Report Status
export const REPORT_STATUS = {
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under Review',
  RESOLVED: 'Resolved',
  DISMISSED: 'Dismissed',
};

// File Upload Limits
export const FILE_LIMITS = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/Event-Easy/users/register',
  LOGIN: '/Event-Easy/users/login',
  LOGOUT: '/Event-Easy/users/logout',
  VERIFY_OTP: '/Event-Easy/users/verify-otp',
  SEND_OTP: '/Event-Easy/users/send-verify-otp',
  
  // Events
  EVENTS: '/Event-Easy/Event/events',
  CREATE_EVENT: '/Event-Easy/Event/createEvents',
  
  // Reviews
  REVIEWS: '/Event-Easy/review',
  
  // Reports
  REPORTS: '/Event-Easy/report',
  
  // Admin
  USERS: '/Event-Easy/users/users',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_DATA: 'userData',
  THEME: 'darkMode',
  LANGUAGE: 'language',
};

// Theme Configuration
export const THEME = {
  COLORS: {
    PRIMARY: '#f97316', // Orange
    SECONDARY: '#3b82f6', // Blue
    SUCCESS: '#10b981', // Green
    WARNING: '#f59e0b', // Amber
    ERROR: '#ef4444', // Red
    INFO: '#06b6d4', // Cyan
  },
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
  },
};

// Validation Rules
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 6,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    MESSAGE: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  },
  EMAIL: {
    PATTERN: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    MESSAGE: 'Please provide a valid email address',
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    MESSAGE: 'Name must be between 2 and 50 characters',
  },
  EVENT_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
    MESSAGE: 'Event name must be between 3 and 100 characters',
  },
};

// Date and Time Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  ISO: 'yyyy-MM-dd',
  ISO_WITH_TIME: "yyyy-MM-dd'T'HH:mm",
  RELATIVE: 'relative', // For date-fns formatDistanceToNow
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  MAX_PAGE_SIZE: 100,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. Insufficient permissions.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An unexpected server error occurred.',
  VALIDATION: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Please select a valid file.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful! Welcome back!',
  REGISTER: 'Registration successful! Please verify your email.',
  LOGOUT: 'Logged out successfully.',
  EMAIL_VERIFIED: 'Email verified successfully!',
  EVENT_CREATED: 'Event created successfully!',
  EVENT_UPDATED: 'Event updated successfully!',
  EVENT_DELETED: 'Event deleted successfully!',
  REVIEW_SUBMITTED: 'Review submitted successfully!',
  REPORT_SUBMITTED: 'Report submitted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
};

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

// Animation Durations (in milliseconds)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
};

// Social Media Links (for future use)
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/eventeasy',
  TWITTER: 'https://twitter.com/eventeasy',
  INSTAGRAM: 'https://instagram.com/eventeasy',
  LINKEDIN: 'https://linkedin.com/company/eventeasy',
};

// Contact Information
export const CONTACT_INFO = {
  EMAIL: 'support@eventeasy.com',
  PHONE: '+251-911-123456',
  ADDRESS: 'Addis Ababa, Ethiopia',
};

export default {
  EVENT_CATEGORIES,
  EVENT_STATUS,
  USER_ROLES,
  REPORT_REASONS,
  REPORT_STATUS,
  FILE_LIMITS,
  API_ENDPOINTS,
  STORAGE_KEYS,
  THEME,
  VALIDATION,
  DATE_FORMATS,
  PAGINATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_STATES,
  ANIMATION,
  SOCIAL_LINKS,
  CONTACT_INFO,
};