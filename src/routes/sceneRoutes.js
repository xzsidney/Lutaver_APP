const express = require('express');
const router = express.Router();
const { authMiddleware, teacherOrAdminMiddleware } = require('../middlewares/auth');
const SceneController = require('../controllers/SceneController');

/**
 * Scenes Management Routes (Teacher + Admin)
 * Base path: /admin (defined in index.js)
 */

// List all scenes (Global)
router.get('/scenes', authMiddleware, teacherOrAdminMiddleware, SceneController.listAll);

// List all scenes for an adventure
router.get('/adventures/:adventureId/scenes', authMiddleware, teacherOrAdminMiddleware, SceneController.list);

// Create scene form
router.get('/adventures/:adventureId/scenes/new', authMiddleware, teacherOrAdminMiddleware, SceneController.createPage);

// Create scene
router.post('/adventures/:adventureId/scenes', authMiddleware, teacherOrAdminMiddleware, SceneController.create);

// Edit scene form
router.get('/scenes/:id/edit', authMiddleware, teacherOrAdminMiddleware, SceneController.editPage);

// Update scene
router.post('/scenes/:id', authMiddleware, teacherOrAdminMiddleware, SceneController.update);

// Delete scene
router.post('/scenes/:id/delete', authMiddleware, teacherOrAdminMiddleware, SceneController.delete);

module.exports = router;
