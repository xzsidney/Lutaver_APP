const express = require('express');
const router = express.Router();

const {
    authMiddleware,
    playerOnlyMiddleware
} = require('../middlewares/authMiddleware');

const playRoutes = require('./playRoutes');
const myCharacterRoutes = require('./myCharacterRoutes');
const shopRoutes = require('./shopRoutes');
const inventoryRoutes = require('./inventoryRoutes');

// ===================================================================
// /player → home do jogador
// ===================================================================

router.get('/', authMiddleware, (req, res) => {
    // você pode ter uma view dedicada do player, tipo: views/player/home.ejs
    return res.render('player/home', {
        title: 'Área do Aluno',
        user: req.session.user
    });
});

// ===================================================================
// Subrotas do jogador
// ===================================================================

// Tela principal de jogo
router.use('/play', playerOnlyMiddleware, playRoutes);           // /player/play/...

// Personagens do jogador
router.use('/characters', playerOnlyMiddleware, myCharacterRoutes); // /player/characters/...

// Loja do jogador
router.use('/shop', playerOnlyMiddleware, shopRoutes);           // /player/shop/...

// Inventário do jogador
router.use('/inventory', playerOnlyMiddleware, inventoryRoutes); // /player/inventory/...

module.exports = router;
