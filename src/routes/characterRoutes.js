const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const CharacterController = require('../controllers/CharacterController');

// All routes protected
router.use(authMiddleware);

// List
router.get('/', CharacterController.list);

// Create
router.get('/new', CharacterController.createPage);
router.post('/', CharacterController.create);

// Show (Sheet)
router.get('/:id', CharacterController.show);

// Edit
router.get('/:id/edit', CharacterController.editPage);
router.post('/:id', CharacterController.update);

// Delete
router.post('/:id/delete', CharacterController.delete);

// Actions
router.post('/:id/attributes', CharacterController.upgradeAttribute);
router.post('/:id/powers', CharacterController.learnPower);

module.exports = router;
