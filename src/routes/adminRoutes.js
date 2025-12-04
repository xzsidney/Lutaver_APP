const express = require('express');
const router = express.Router();

const {
    adminMiddleware
} = require('../middlewares/authMiddleware');

// Rotas internas (já existentes)
const dashboardRoutes = require('./dashboardRoutes');
const userRoutes = require('./userRoutes');
const questionRoutes = require('./questionRoutes');
const disciplineRoutes = require('./disciplineRoutes');
const adventureRoutes = require('./adventureRoutes');
const sceneRoutes = require('./sceneRoutes');
const powerRoutes = require('./powerRoutes');
const effectRoutes = require('./effectRoutes');
const itemRoutes = require('./itemRoutes');
const adminNpcRoutes = require('./adminNpcRoutes');
const adminCharacterRoutes = require('./adminCharacterRoutes');
const adminStoryRoutes = require('./adminStoryRoutes');
const adminStoryChoiceRoutes = require('./adminStoryChoiceRoutes');
const adminStorySceneRoutes = require('./adminStorySceneRoutes');

// ===================================================================
// /admin  → dashboard principal
// ===================================================================

router.get('/', adminMiddleware, (req, res) => {
    return res.render('admin/dashboard', {
        title: 'Painel Administrativo',
        user: req.session.user
    });
});

// Se você já tem um dashboardRoutes com páginas extras, pode pendurar aqui:
router.use('/dashboard', adminMiddleware, dashboardRoutes);

// ===================================================================
// Submódulos administrativos
// (as rotas internas desses arquivos NÃO devem começar com /admin)
// ===================================================================

router.use('/users', adminMiddleware, userRoutes);              // /admin/users/...
router.use('/questions', adminMiddleware, questionRoutes);      // /admin/questions/...
router.use('/disciplines', adminMiddleware, disciplineRoutes);  // /admin/disciplines/...
router.use('/adventures', adminMiddleware, adventureRoutes);    // /admin/adventures/...
router.use('/scenes', adminMiddleware, sceneRoutes);            // /admin/scenes/...
router.use('/powers', adminMiddleware, powerRoutes);            // /admin/powers/...
router.use('/effects', adminMiddleware, effectRoutes);          // /admin/effects/...
router.use('/items', adminMiddleware, itemRoutes);              // /admin/items/...
router.use('/npcs', adminMiddleware, adminNpcRoutes);           // /admin/npcs/...
router.use('/characters', adminMiddleware, adminCharacterRoutes); // /admin/characters/...
router.use('/stories', adminMiddleware, adminStoryRoutes);
router.use('/story-scenes', adminMiddleware, adminStorySceneRoutes); // /admin/story-scenes/...
router.use('/story-choices', adminMiddleware, adminStoryChoiceRoutes); // /admin/story-choices/...

module.exports = router;
