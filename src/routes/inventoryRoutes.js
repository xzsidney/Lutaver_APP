const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/InventoryController');
const { authMiddleware } = require('../middlewares/auth');

// Protect all routes (player must be logged in)
router.use(authMiddleware);

// Inventory index
router.get('/:characterId', InventoryController.index);

// Use consumable item
router.post('/:characterId/use/:itemId', InventoryController.useItem);

// Equip equipment item
router.post('/:characterId/equip/:itemId', InventoryController.equipItem);

// Unequip equipment item
router.post('/:characterId/unequip/:itemId', InventoryController.unequipItem);

// Discard item
router.post('/:characterId/discard/:itemId', InventoryController.discardItem);

module.exports = router;
