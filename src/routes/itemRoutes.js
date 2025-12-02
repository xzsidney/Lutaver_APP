const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/ItemController');
const { teacherOrAdminMiddleware } = require('../middlewares/auth');

// Protect all routes
router.use(teacherOrAdminMiddleware);

// List items
router.get('/', ItemController.index);

// New item form
router.get('/new', ItemController.newForm);

// Create item
router.post('/', ItemController.create);

// Edit item form
router.get('/:id/edit', ItemController.editForm);

// Update item
router.post('/:id', ItemController.update);

// Delete item
router.post('/:id/delete', ItemController.destroy);

module.exports = router;
