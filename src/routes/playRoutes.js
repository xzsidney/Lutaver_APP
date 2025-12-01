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

// Start specific adventure (Legacy Scene Mode)
router.get('/adventure/:adventureId', authMiddleware, PlayController.startAdventure);

// Process scene interaction (Legacy Scene Mode)
router.post('/adventure/:adventureId/scene/:sceneId', authMiddleware, PlayController.processScene);

// =================================================================
// QUIZ ROUTES
// =================================================================

// Start Quiz (Initializes session)
router.get('/quiz/:adventureId/:characterId', authMiddleware, PlayController.startQuiz);

// Show Current Question
router.get('/quiz/:adventureId/:characterId/question', authMiddleware, PlayController.showQuestion);

// Process Answer
router.post('/quiz/:adventureId/:characterId/answer', authMiddleware, PlayController.processAnswer);

// Show Result
router.get('/quiz/:adventureId/:characterId/result', authMiddleware, PlayController.showResult);

module.exports = router;
