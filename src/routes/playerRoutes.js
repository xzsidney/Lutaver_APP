const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');

// Import sub-routes
const accountRoutes = require('./accountRoutes');
const characterRoutes = require('./characterRoutes');
const playerQuizRoutes = require('./playerQuizRoutes');
const playerShopRoutes = require('./playerShopRoutes');
const playerStoryRoutes = require('./playerStoryRoutes');
const DashboardPlayerController = require('../controllers/DashboardPlayerController');
const battleController = require('../controllers/battleController');


/**
 * Player Routes
 * Base path: /player
 * All routes are protected by authMiddleware
 */

// Dashboard (home page for player)
router.get('/dashboard', authMiddleware, DashboardPlayerController.dashboard);
router.get('/', authMiddleware, DashboardPlayerController.dashboard); // Alias
router.get('/battle', authMiddleware, DashboardPlayerController.battle);
// Versão sem parâmetro na URL
router.get('/player/battle', authMiddleware, battleController.showBattle);




// Account management: /player/account/*
router.use('/account', accountRoutes);

// Character management: /player/characters/*
router.use('/characters', characterRoutes);

// Quizzes: /player/quizzes/*
router.use('/quizzes', playerQuizRoutes);

// Stories: /player/stories/*
router.use('/stories', playerStoryRoutes);

// Shop: /player/shop/*
router.use('/shop', playerShopRoutes);

module.exports = router;
