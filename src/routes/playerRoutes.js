const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');

// Import sub-routes
const accountRoutes = require('./accountRoutes');
const characterRoutes = require('./characterRoutes');
const playerAdventureRoutes = require('./playerAdventureRoutes');
const playerShopRoutes = require('./playerShopRoutes');
const DashboardPlayerController = require('../controllers/DashboardPlayerController');

/**
 * Player Routes
 * Base path: /player
 * All routes are protected by authMiddleware
 */

// Dashboard (home page for player)
router.get('/dashboard', authMiddleware, DashboardPlayerController.dashboard);
router.get('/', authMiddleware, DashboardPlayerController.dashboard); // Alias

// Account management: /player/account/*
router.use('/account', accountRoutes);

// Character management: /player/characters/*
router.use('/characters', characterRoutes);

// Adventures: /player/adventures/*
router.use('/adventures', playerAdventureRoutes);

// Shop: /player/shop/*
router.use('/shop', playerShopRoutes);

module.exports = router;
