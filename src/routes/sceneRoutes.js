const express = require('express');
const router = express.Router();

const { adminMiddleware } = require('../middlewares/authMiddleware');
const SceneController = require('../controllers/SceneController');

// LISTA – GET /admin/scenes
router.get('/', adminMiddleware, SceneController.index);

module.exports = router;
