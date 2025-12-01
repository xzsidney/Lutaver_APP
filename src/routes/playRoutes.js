const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');

const PlayController = require('../controllers/PlayController');

/**
 * Game/Play Routes
 * Accessible by any authenticated user (player, teacher, admin).
 */

// Main play page (List adventures)
router.get('/', authMiddleware, PlayController.index);

// Alias for "Aventuras Disponíveis" link
router.get('/adventures/available', authMiddleware, (req, res) => {
    res.redirect('/play');
});

// Start specific adventure
router.get('/adventure/:adventureId', authMiddleware, PlayController.startAdventure);

// Process scene interaction
router.post('/adventure/:adventureId/scene/:sceneId', authMiddleware, PlayController.processScene);

module.exports = router;
