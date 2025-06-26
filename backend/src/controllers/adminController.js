const User = require('../models/User');
const Event = require('../models/Event');
const Report = require('../models/reportModel');

/**
 * Admin Controller
 * Handles admin-specific operations
 */
class AdminController {
  /**
   * Get all users with pagination and filtering
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, role, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      
      // Check permissions
      if (!req.user.hasPermission('canManageUsers')) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to manage users',
        });
      }

      // Build query
      const query = {};
      if (role && role !== 'all') {
        query.role = role;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const users = await User.find(query)
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-password -verifyOtp -resetOtp')
        .populate('createdBy', 'name email');

      const total = await User.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          users,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total,
          },
        },
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message,
      });
    }
  }

  /**
   * Create admin user
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async createAdmin(req, res) {
    try {
      // Only super admin can create admins
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Only super admin can create admin users',
        });
      }

      const { name, email, password, adminPermissions } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email',
        });
      }

      // Create admin user
      const admin = new User({
        name,
        email,
        password,
        role: 'admin',
        adminPermissions: adminPermissions || {
          canManageUsers: false,
          canManageEvents: false,
          canManageReports: false,
          canViewAnalytics: false,
          canModerateContent: false,
        },
        isVerified: true,
        createdBy: req.user.id,
      });

      await admin.save();

      res.status(201).json({
        success: true,
        message: 'Admin user created successfully',
        user: admin.profile,
      });
    } catch (error) {
      console.error('Create admin error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create admin user',
        error: error.message,
      });
    }
  }

  /**
   * Update admin permissions
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async updateAdminPermissions(req, res) {
    try {
      // Only super admin can update admin permissions
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Only super admin can update admin permissions',
        });
      }

      const { userId } = req.params;
      const { adminPermissions } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (user.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'User is not an admin',
        });
      }

      user.adminPermissions = { ...user.adminPermissions, ...adminPermissions };
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Admin permissions updated successfully',
        user: user.profile,
      });
    } catch (error) {
      console.error('Update admin permissions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update admin permissions',
        error: error.message,
      });
    }
  }

  /**
   * Suspend/unsuspend user
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async toggleUserSuspension(req, res) {
    try {
      if (!req.user.hasPermission('canManageUsers')) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to manage users',
        });
      }

      const { userId } = req.params;
      const { suspend, reason } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Prevent suspending super admin
      if (user.role === 'super_admin') {
        return res.status(400).json({
          success: false,
          message: 'Cannot suspend super admin',
        });
      }

      // Prevent regular admin from suspending other admins
      if (user.role === 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Only super admin can suspend admin users',
        });
      }

      user.isSuspended = suspend;
      user.suspensionReason = suspend ? reason : undefined;
      await user.save();

      res.status(200).json({
        success: true,
        message: `User ${suspend ? 'suspended' : 'unsuspended'} successfully`,
        user: user.profile,
      });
    } catch (error) {
      console.error('Toggle user suspension error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user suspension status',
        error: error.message,
      });
    }
  }

  /**
   * Delete user
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async deleteUser(req, res) {
    try {
      if (!req.user.hasPermission('canManageUsers')) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to manage users',
        });
      }

      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Prevent deleting super admin
      if (user.role === 'super_admin') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete super admin',
        });
      }

      // Prevent regular admin from deleting other admins
      if (user.role === 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Only super admin can delete admin users',
        });
      }

      await User.findByIdAndDelete(userId);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error.message,
      });
    }
  }

  /**
   * Get admin dashboard analytics
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async getDashboardAnalytics(req, res) {
    try {
      if (!req.user.hasPermission('canViewAnalytics')) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to view analytics',
        });
      }

      // Get user statistics
      const userStats = await User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
          },
        },
      ]);

      // Get event statistics
      const eventStats = await Event.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      // Get recent activity
      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role createdAt');

      const recentEvents = await Event.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('eventName status organizer createdAt')
        .populate('organizer', 'name email');

      res.status(200).json({
        success: true,
        data: {
          userStats,
          eventStats,
          recentUsers,
          recentEvents,
        },
      });
    } catch (error) {
      console.error('Get dashboard analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard analytics',
        error: error.message,
      });
    }
  }
}

module.exports = AdminController;