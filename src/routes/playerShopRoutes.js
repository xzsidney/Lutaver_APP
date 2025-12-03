const express = require('express');
const router = express.Router();
const ShopController = require('../controllers/ShopController');
const { authMiddleware } = require('../middlewares/auth');

/**
 * Shop Routes
 * All routes are protected by authMiddleware
 */

// View shop for a specific character
router.get('/:characterId', authMiddleware, ShopController.index);

// Buy an item
router.post('/:characterId/buy/:itemId', authMiddleware, ShopController.buy);

module.exports = router;
