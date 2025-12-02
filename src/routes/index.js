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
const powerRoutes = require('./powerRoutes');
router.use('/admin/powers', powerRoutes);
const effectRoutes = require('./effectRoutes');
router.use('/admin/effects', effectRoutes);
const itemRoutes = require('./itemRoutes');
router.use('/admin/items', itemRoutes);

const adminNpcRoutes = require('./adminNpcRoutes');
router.use('/admin/npcs', adminNpcRoutes);

// Character Routes
router.use('/my/characters', myCharacterRoutes);
router.use('/admin/characters', adminCharacterRoutes);

// Shop Routes
const shopRoutes = require('./shopRoutes');
router.use('/shop', shopRoutes);

// Inventory Routes
const inventoryRoutes = require('./inventoryRoutes');
router.use('/inventory', inventoryRoutes);



// Teacher Routes
const teacherRoutes = require('./teacherRoutes');
router.use('/teacher', teacherRoutes);

router.use('/admin', sceneRoutes); // Scenes are nested under adventures but also have global routes

// Root route - Landing Page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/landing.html'));
});

module.exports = router;
