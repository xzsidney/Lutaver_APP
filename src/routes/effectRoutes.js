const express = require('express');
const router = express.Router();
const EffectController = require('../controllers/EffectController');
const { teacherOrAdminMiddleware } = require('../middlewares/auth');

// Protect all routes with teacherOrAdminMiddleware
router.use(teacherOrAdminMiddleware);

// List effects
router.get('/', EffectController.index);

// New effect form
router.get('/new', EffectController.newForm);

// Create effect
router.post('/', EffectController.create);

// Edit effect form
router.get('/:id/edit', EffectController.editForm);

// Update effect
router.post('/:id', EffectController.update);

// Delete effect
router.post('/:id/delete', EffectController.destroy);

module.exports = router;
