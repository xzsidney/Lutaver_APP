const express = require('express');
const router = express.Router();
const ShopController = require('../controllers/ShopController');
const { authMiddleware } = require('../middlewares/auth');

// Protect all routes (player must be logged in)
router.use(authMiddleware);

// Shop index
router.get('/:characterId', ShopController.index);

// Buy item
router.post('/:characterId/buy/:itemId', ShopController.buy);

module.exports = router;
