const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { adminMiddleware } = require('../middlewares/authMiddleware');

// LISTA DE USUÁRIOS – /admin/users
router.get('/', adminMiddleware, async (req, res) => {
    try {
        const users = await User.findAll();

        return res.render('admin/users/index', {
            title: 'Usuários - Painel Admin',
            users
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Erro ao carregar usuários');
    }
});

module.exports = router;
