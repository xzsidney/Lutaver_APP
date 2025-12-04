const express = require('express');
const router = express.Router();

// ROTAS AGRUPADAS
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const teacherRoutes = require('./teacherRoutes');
const storyRoutes = require('./storyRoutes');
const playerRoutes = require('./playerRoutes');
const playRoutes = require('./playRoutes');

// ===================================================================
// 🏠 GUEST / PUBLIC ROUTES
// ===================================================================

// HOME – Landing Page
router.get('/', (req, res) => {
    res.render('home/index', {
        title: 'Lutaver - Jogo Educacional'
    });
});

// Autenticação: /login, /register, /logout etc.
router.use('/', authRoutes);

// Histórias públicas ou semi-públicas: /stories/...
router.use('/stories', storyRoutes);

// ===================================================================
// 👑 ADMIN / PROFESSOR / PLAYER
// ===================================================================

// Tudo que começa com /admin cai aqui
router.use('/admin', adminRoutes);

// Tudo que começa com /teacher cai aqui
router.use('/teacher', teacherRoutes);

// Tudo que começa com /player cai aqui
router.use('/player', playerRoutes);

// Tudo que começa com /play cai aqui
router.use('/play', playRoutes);

module.exports = router;
