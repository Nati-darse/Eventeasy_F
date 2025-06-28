const Report = require('../models/reportModel');
const Event = require('../models/Event');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Report Controller
 * Handles event and user reports
 */
class ReportController {
  /**
   * Create a new report
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async createEventReport(req, res) {
    try {
      const { eventId } = req.params;
      const { reason, description, evidence } = req.body;
      const reportedBy = req.user.id;

      // Validate event exists
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }

      // Check if user already reported this event
      const existingReport = await Report.findOne({
        reportedBy,
        reportedEvent: eventId,
        status: { $in: ['pending', 'under_review'] }
      });

      if (existingReport) {
        return res.status(400).json({
          success: false,
          message: 'You have already reported this event',
        });
      }

      // Determine priority based on reason
      let priority = 'medium';
      if (['Safety Concern', 'Fraudulent Event', 'Harassment'].includes(reason)) {
        priority = 'high';
      } else if (['Spam', 'Technical Issue'].includes(reason)) {
        priority = 'low';
      }

      // Create report
      const report = new Report({
        reportType: 'event',
        reportedBy,
        reportedEvent: eventId,
        reason,
        description,
        evidence: evidence || [],
        priority,
      });

      await report.save();

      // Populate references
      await report.populate([
        { path: 'reportedBy', select: 'name email' },
        { path: 'reportedEvent', select: 'eventName organizer' }
      ]);

      res.status(201).json({
        success: true,
        message: 'Report submitted successfully',
        report,
      });
    } catch (error) {
      console.error('Create event report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit report',
        error: error.message,
      });
    }
  }

  /**
   * Create user report
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async createUserReport(req, res) {
    try {
      const { userId } = req.params;
      const { reason, description, evidence } = req.body;
      const reportedBy = req.user.id;

      // Validate user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Can't report yourself
      if (userId === reportedBy) {
        return res.status(400).json({
          success: false,
          message: 'You cannot report yourself',
        });
      }

      // Check if user already reported this user
      const existingReport = await Report.findOne({
        reportedBy,
        reportedUser: userId,
        status: { $in: ['pending', 'under_review'] }
      });

      if (existingReport) {
        return res.status(400).json({
          success: false,
          message: 'You have already reported this user',
        });
      }

      // Determine priority
      let priority = 'medium';
      if (['Harassment', 'Safety Concern'].includes(reason)) {
        priority = 'high';
      } else if (['Spam', 'Fake Profile'].includes(reason)) {
        priority = 'low';
      }

      // Create report
      const report = new Report({
        reportType: 'user',
        reportedBy,
        reportedUser: userId,
        reason,
        description,
        evidence: evidence || [],
        priority,
      });

      await report.save();

      // Populate references
      await report.populate([
        { path: 'reportedBy', select: 'name email' },
        { path: 'reportedUser', select: 'name email role' }
      ]);

      res.status(201).json({
        success: true,
        message: 'Report submitted successfully',
        report,
      });
    } catch (error) {
      console.error('Create user report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit report',
        error: error.message,
      });
    }
  }

  /**
   * Get all reports (admin only)
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async getAllReports(req, res) {
    try {
      // Check admin permissions
      if (!req.user.hasPermission('canManageReports')) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to view reports',
        });
      }

      const { 
        page = 1, 
        limit = 10, 
        status, 
        priority, 
        reportType,
        sortBy = 'createdAt',
        sortOrder = 'desc' 
      } = req.query;

      // Build query
      const query = {};
      if (status && status !== 'all') query.status = status;
      if (priority && priority !== 'all') query.priority = priority;
      if (reportType && reportType !== 'all') query.reportType = reportType;

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const reports = await Report.find(query)
        .populate('reportedBy', 'name email')
        .populate('reportedEvent', 'eventName organizer')
        .populate('reportedUser', 'name email role')
        .populate('assignedTo', 'name email')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Report.countDocuments(query);

      // Get statistics
      const stats = await Report.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      res.status(200).json({
        success: true,
        data: {
          reports,
          statistics: stats,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total,
          },
        },
      });
    } catch (error) {
      console.error('Get all reports error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reports',
        error: error.message,
      });
    }
  }

  /**
   * Update report status
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async updateReportStatus(req, res) {
    try {
      if (!req.user.hasPermission('canManageReports')) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to manage reports',
        });
      }

      const { reportId } = req.params;
      const { status, adminNote, resolution } = req.body;

      const report = await Report.findById(reportId);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found',
        });
      }

      // Update status
      report.status = status;

      // Add admin note if provided
      if (adminNote) {
        report.adminNotes.push({
          admin: req.user.id,
          note: adminNote,
        });
      }

      // Add resolution if provided
      if (resolution && status === 'resolved') {
        report.resolution = {
          ...resolution,
          resolvedBy: req.user.id,
          resolvedAt: new Date(),
        };
      }

      // Assign to current admin if not assigned
      if (!report.assignedTo) {
        report.assignedTo = req.user.id;
      }

      await report.save();

      // Populate references
      await report.populate([
        { path: 'reportedBy', select: 'name email' },
        { path: 'reportedEvent', select: 'eventName organizer' },
        { path: 'reportedUser', select: 'name email role' },
        { path: 'assignedTo', select: 'name email' }
      ]);

      res.status(200).json({
        success: true,
        message: 'Report updated successfully',
        report,
      });
    } catch (error) {
      console.error('Update report status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update report',
        error: error.message,
      });
    }
  }

  /**
   * Get report by ID
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async getReportById(req, res) {
    try {
      if (!req.user.hasPermission('canManageReports')) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to view reports',
        });
      }

      const { reportId } = req.params;

      const report = await Report.findById(reportId)
        .populate('reportedBy', 'name email profilePicture')
        .populate('reportedEvent', 'eventName organizer time category')
        .populate('reportedUser', 'name email role profilePicture')
        .populate('assignedTo', 'name email')
        .populate('adminNotes.admin', 'name email')
        .populate('resolution.resolvedBy', 'name email');

      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found',
        });
      }

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      console.error('Get report by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch report',
        error: error.message,
      });
    }
  }

  /**
   * Delete report
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async deleteReport(req, res) {
    try {
      if (!req.user.hasPermission('canManageReports')) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to delete reports',
        });
      }

      const { reportId } = req.params;

      const report = await Report.findById(reportId);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found',
        });
      }

      await Report.findByIdAndDelete(reportId);

      res.status(200).json({
        success: true,
        message: 'Report deleted successfully',
      });
    } catch (error) {
      console.error('Delete report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete report',
        error: error.message,
      });
    }
  }
}

module.exports = {
  createEventReport: ReportController.createEventReport,
  createUserReport: ReportController.createUserReport,
  getAllEventReports: ReportController.getAllReports,
  getEventReportById: ReportController.getReportById,
  updateEventReport: ReportController.updateReportStatus,
  deleteEventReport: ReportController.deleteReport,
};