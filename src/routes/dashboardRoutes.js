const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');
const { authMiddleware, adminMiddleware, teacherOrAdminMiddleware } = require('../middlewares/auth');

// Main dashboard - redirects based on role
router.get('/dashboard', authMiddleware, DashboardController.index);

// Admin dashboard
router.get('/admin/dashboard', authMiddleware, adminMiddleware, DashboardController.adminDashboard);

// Teacher dashboard
// Teacher dashboard route removed - handled by teacherRoutes.js

// Player dashboard
router.get('/player/dashboard', authMiddleware, DashboardController.playerDashboard);

module.exports = router;
