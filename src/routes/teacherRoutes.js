const express = require('express');
const router = express.Router();

const {
    teacherOrAdminMiddleware
} = require('../middlewares/authMiddleware');

// /teacher → painel do professor
router.get('/', teacherOrAdminMiddleware, (req, res) => {
    return res.render('teacher/dashboard', {
        title: 'Painel do Professor',
        user: req.session.user
    });
});

// Aqui no futuro você pode adicionar rotas:
// router.use('/questions', teacherOrAdminMiddleware, teacherQuestionRoutes);
// router.use('/classes', teacherOrAdminMiddleware, teacherClassRoutes);

module.exports = router;
