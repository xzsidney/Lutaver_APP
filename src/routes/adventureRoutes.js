const express = require('express');
const router = express.Router();
const { authMiddleware, teacherOrAdminMiddleware } = require('../middlewares/auth');
const AdventureController = require('../controllers/AdventureController');

/**
 * Adventures Management Routes (Teacher + Admin)
 */

// List all adventures
router.get('/', authMiddleware, teacherOrAdminMiddleware, AdventureController.list);

// Create adventure form
router.get('/new', authMiddleware, teacherOrAdminMiddleware, AdventureController.createPage);

// Create adventure
router.post('/', authMiddleware, teacherOrAdminMiddleware, AdventureController.create);

// Edit adventure form
router.get('/:id/edit', authMiddleware, teacherOrAdminMiddleware, AdventureController.editPage);

// Show adventure details
router.get('/:id', authMiddleware, teacherOrAdminMiddleware, AdventureController.show);

// Update adventure
router.post('/:id', authMiddleware, teacherOrAdminMiddleware, AdventureController.update);

// Delete adventure
router.post('/:id/delete', authMiddleware, teacherOrAdminMiddleware, AdventureController.delete);

module.exports = router;
