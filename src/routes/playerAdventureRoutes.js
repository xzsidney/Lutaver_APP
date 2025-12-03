const express = require('express');
const router = express.Router();
const PlayerAdventureController = require('../controllers/PlayerAdventureController');
const { authMiddleware } = require('../middlewares/auth');

/**
 * Player Adventure/Quiz Routes
 * All routes are protected by authMiddleware
 */

// List all available adventures
router.get('/', authMiddleware, PlayerAdventureController.index);

// Show adventure details
router.get('/:id', authMiddleware, PlayerAdventureController.show);

// Start quiz (initializes session)
router.get('/:id/start', authMiddleware, PlayerAdventureController.startQuiz);

// Show current quiz question
router.get('/:id/quiz', authMiddleware, PlayerAdventureController.showQuiz);

// Submit answer
router.post('/:id/answer', authMiddleware, PlayerAdventureController.submitAnswer);

// Show quiz results
router.get('/:id/results', authMiddleware, PlayerAdventureController.showResults);

module.exports = router;
