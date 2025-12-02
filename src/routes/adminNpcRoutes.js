const express = require('express');
const router = express.Router();
const NpcController = require('../controllers/NpcController');
const { authMiddleware, teacherOrAdminMiddleware } = require('../middlewares/auth');

// Protect all routes
router.use(authMiddleware);
router.use(teacherOrAdminMiddleware);

// List all NPCs
router.get('/', NpcController.index);

// Create NPC form
router.get('/new', NpcController.newForm);

// Save new NPC
router.post('/', NpcController.create);

// Show NPC details
router.get('/:id', NpcController.show);

// Edit NPC form
router.get('/:id/edit', NpcController.editForm);

// Update NPC
router.post('/:id', NpcController.update);

// Delete NPC
router.post('/:id/delete', NpcController.destroy);

module.exports = router;
