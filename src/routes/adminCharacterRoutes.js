const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');
const AdminCharacterController = require('../controllers/AdminCharacterController');

// All routes protected by login AND admin role
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

// List all characters
router.get('/', AdminCharacterController.list);

// Show character details
router.get('/:id', AdminCharacterController.show);

// Delete character
router.post('/:id/delete', AdminCharacterController.delete);

module.exports = router;
