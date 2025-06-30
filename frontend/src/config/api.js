// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/Event-Easy/users/login`,
  REGISTER: `${API_BASE_URL}/Event-Easy/users/register`,
  LOGOUT: `${API_BASE_URL}/Event-Easy/users/logout`,
  IS_AUTH: `${API_BASE_URL}/Event-Easy/users/is-auth`,
  USER_DATA: `${API_BASE_URL}/Event-Easy/user/data`,
  GOOGLE_AUTH: `${API_BASE_URL}/Event-Easy/auth/google`,
  
  // Email verification
  VERIFY_OTP: `${API_BASE_URL}/Event-Easy/users/verify-otp`,
  SEND_VERIFY_OTP: `${API_BASE_URL}/Event-Easy/users/send-verify-otp`,
  
  // Events
  EVENTS: `${API_BASE_URL}/Event-Easy/Event/events`,
  EVENT_DETAIL: (id) => `${API_BASE_URL}/Event-Easy/Event/events/${id}`,
  CREATE_EVENT: `${API_BASE_URL}/Event-Easy/Event/createEvents`,
  ORGANIZER_EVENTS: `${API_BASE_URL}/Event-Easy/Event/organizer-events`,
  EVENT_ATTEND: (id) => `${API_BASE_URL}/Event-Easy/Event/events/${id}/attend`,
  EVENT_STATUS: (id) => `${API_BASE_URL}/Event-Easy/Event/events/${id}/status`,
  EVENT_ATTENDEES: (id) => `${API_BASE_URL}/Event-Easy/Event/events/${id}/attendees`,
  
  // Users
  USERS: `${API_BASE_URL}/Event-Easy/users/users`,
  USER_DETAIL: (id) => `${API_BASE_URL}/Event-Easy/users/users/${id}`,
  
  // Admin
  ADMIN_ANALYTICS: `${API_BASE_URL}/Event-Easy/admin/analytics`,
  ADMIN_USERS: `${API_BASE_URL}/Event-Easy/admin/users`,
  ADMIN_CREATE: `${API_BASE_URL}/Event-Easy/admin/users/admin`,
  ADMIN_PERMISSIONS: (id) => `${API_BASE_URL}/Event-Easy/admin/users/${id}/permissions`,
  ADMIN_SUSPENSION: (id) => `${API_BASE_URL}/Event-Easy/admin/users/${id}/suspension`,
  ADMIN_DELETE: (id) => `${API_BASE_URL}/Event-Easy/admin/users/${id}`,
  
  // Reviews
  REVIEWS: (eventId) => `${API_BASE_URL}/Event-Easy/review/${eventId}/reviews`,
  CREATE_REVIEW: (eventId) => `${API_BASE_URL}/Event-Easy/review/${eventId}/review`,
  
  // Reports
  CREATE_REPORT: (eventId) => `${API_BASE_URL}/Event-Easy/report/${eventId}`,
  
  // Payments
  PAYMENT_VERIFY: `${API_BASE_URL}/Event-Easy/payment/verify-identity`,
  PAYMENT_INITIALIZE: (eventId) => `${API_BASE_URL}/Event-Easy/payment/initialize/${eventId}`,
  PAYMENT_STATUS: (txRef) => `${API_BASE_URL}/Event-Easy/payment/status/${txRef}`,
};

export default API_BASE_URL; 