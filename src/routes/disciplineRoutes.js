const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const DisciplineController = require('../controllers/DisciplineController');

/**
 * Disciplines Management Routes (Admin Only)
 */

// List all disciplines (admin only)
router.get('/', authMiddleware, adminMiddleware, DisciplineController.list);

// Create discipline form (admin only)
router.get('/new', authMiddleware, adminMiddleware, DisciplineController.createPage);

// Create discipline (admin only)
router.post('/', authMiddleware, adminMiddleware, DisciplineController.create);

// Edit discipline form (admin only)
router.get('/:id/edit', authMiddleware, adminMiddleware, DisciplineController.editPage);

// Update discipline (admin only)
router.post('/:id', authMiddleware, adminMiddleware, DisciplineController.update);

// Delete discipline (admin only)
router.post('/:id/delete', authMiddleware, adminMiddleware, DisciplineController.delete);

module.exports = router;
