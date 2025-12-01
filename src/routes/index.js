const express = require('express');
const router = express.Router();
const path = require('path');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const dashboardRoutes = require('./dashboardRoutes');

// Example routes demonstrating RBAC
const questionRoutes = require('./questionRoutes');
const playRoutes = require('./playRoutes');
const disciplineRoutes = require('./disciplineRoutes');
const adventureRoutes = require('./adventureRoutes');
const sceneRoutes = require('./sceneRoutes');
const myCharacterRoutes = require('./myCharacterRoutes');
const adminCharacterRoutes = require('./adminCharacterRoutes');

router.use('/', authRoutes);
router.use('/', dashboardRoutes);
router.use('/users', userRoutes);

// Protected routes
router.use('/admin/questions', questionRoutes);
router.use('/play', playRoutes);
router.use('/admin/disciplines', disciplineRoutes);
router.use('/admin/adventures', adventureRoutes);

// Character Routes
router.use('/my/characters', myCharacterRoutes);
router.use('/admin/characters', adminCharacterRoutes);

// Teacher Routes
const teacherRoutes = require('./teacherRoutes');
router.use('/teacher', teacherRoutes);

router.use('/admin', sceneRoutes); // Scenes are nested under adventures but also have global routes

// Root route - Landing Page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/landing.html'));
});

module.exports = router;
