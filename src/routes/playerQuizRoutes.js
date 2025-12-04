const express = require('express');
const router = express.Router();
const PlayerQuizController = require('../controllers/PlayerQuizController');
const { authMiddleware } = require('../middlewares/auth');

/**
 * Player Quiz Routes
 * All routes are protected by authMiddleware
 */

// List all available quizzes
router.get('/', authMiddleware, PlayerQuizController.index);

// Show quiz details
router.get('/:id', authMiddleware, PlayerQuizController.show);

// Start quiz (initializes session)
router.get('/:id/start', authMiddleware, PlayerQuizController.startQuiz);

// Show current quiz question
router.get('/:id/play', authMiddleware, PlayerQuizController.showQuiz);

// Submit answer
router.post('/:id/answer', authMiddleware, PlayerQuizController.submitAnswer);

// Show quiz results
router.get('/:id/results', authMiddleware, PlayerQuizController.showResults);

module.exports = router;
