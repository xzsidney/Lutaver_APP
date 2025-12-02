const express = require('express');
const router = express.Router();
const PowerController = require('../controllers/PowerController');
const { teacherOrAdminMiddleware } = require('../middlewares/auth');

// Protect all routes with teacherOrAdminMiddleware
router.use(teacherOrAdminMiddleware);

// List powers
router.get('/', PowerController.index);

// New power form
router.get('/new', PowerController.newForm);

// Create power
router.post('/', PowerController.create);

// Edit power form
router.get('/:id/edit', PowerController.editForm);

// Update power
router.post('/:id', PowerController.update);

// Delete power
router.post('/:id/delete', PowerController.destroy);

module.exports = router;
