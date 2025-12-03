const express = require('express');
const router = express.Router();
const AccountController = require('../controllers/AccountController');
const { authMiddleware } = require('../middlewares/auth');

/**
 * Account Management Routes
 * All routes are protected by authMiddleware
 */

// View profile
router.get('/profile', authMiddleware, AccountController.showProfile);

// Edit profile form
router.get('/edit', authMiddleware, AccountController.editProfile);

// Update profile
router.post('/update', authMiddleware, AccountController.updateProfile);

// Change password
router.post('/change-password', authMiddleware, AccountController.changePassword);

module.exports = router;
