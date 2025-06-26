const express = require('express');
const AdminController = require('../controllers/adminController');
const userAuth = require('../middlewares/userAuth');

const router = express.Router();

// Middleware to check if user is admin or super admin
const requireAdmin = (req, res, next) => {
  if (!['admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }
  next();
};

// User management routes
router.get('/users', userAuth, requireAdmin, AdminController.getAllUsers);
router.post('/users/admin', userAuth, requireAdmin, AdminController.createAdmin);
router.put('/users/:userId/permissions', userAuth, requireAdmin, AdminController.updateAdminPermissions);
router.put('/users/:userId/suspension', userAuth, requireAdmin, AdminController.toggleUserSuspension);
router.delete('/users/:userId', userAuth, requireAdmin, AdminController.deleteUser);

// Analytics routes
router.get('/analytics', userAuth, requireAdmin, AdminController.getDashboardAnalytics);

module.exports = router;