const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const MyCharacterController = require('../controllers/MyCharacterController');

// All routes protected by login
router.use(authMiddleware);

// List my characters
router.get('/', MyCharacterController.list);

// Create new character
router.get('/new', MyCharacterController.createPage);
router.post('/', MyCharacterController.create);

// Show character sheet
router.get('/:id', MyCharacterController.show);

// Edit character
router.get('/:id/edit', MyCharacterController.editPage);
router.post('/:id', MyCharacterController.update);

// Delete character
router.post('/:id/delete', MyCharacterController.delete);

// Actions
router.post('/:id/attributes', MyCharacterController.upgradeAttribute);
router.post('/:id/powers', MyCharacterController.learnPower);

module.exports = router;
