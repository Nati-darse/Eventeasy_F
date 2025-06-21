const express = require('express');
const router = express.Router();

// Import the controller functions for event reports
const {
  createEventReport,
  getAllEventReports,
  getEventReportById,
  updateEventReport,
  deleteEventReport,
} = require('../controllers/reportConroller');

// Import authentication and authorization middleware
const userAuth = require('../middlewares/userAuth');

// --- Event Report Routes ---

// @route   POST /api/reports
// @desc    Create a new event report
// @access  Private (User must be logged in)
router.post('/:eventId', userAuth, createEventReport);

module.exports = router;