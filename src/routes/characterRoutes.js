const express = require('express');
const router = express.Router();
const CharacterController = require('../controllers/CharacterController');
const { authMiddleware } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/public/img/player');
    },
    filename: function (req, file, cb) {
        // Temporary name, will be renamed in controller
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'temp-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Apenas arquivos de imagem são permitidos!'));
    }
});

/**
 * Character Management Routes
 * All routes are protected by authMiddleware
 */

// List all characters
router.get('/', authMiddleware, CharacterController.index);

// Create new character form
router.get('/new', authMiddleware, CharacterController.create);

// Store new character
router.post('/', authMiddleware, upload.single('avatar'), CharacterController.store);

// Select active character
router.post('/select', authMiddleware, CharacterController.selectActive);

// Show character details
router.get('/:id', authMiddleware, CharacterController.show);

// Edit character form
router.get('/:id/edit', authMiddleware, CharacterController.edit);

// Update character
router.post('/:id', authMiddleware, upload.single('avatar'), CharacterController.update);

// Delete character
router.post('/:id/delete', authMiddleware, CharacterController.destroy);

// Allocate attribute point
router.post('/:characterId/allocate', authMiddleware, CharacterController.allocateAttribute);

module.exports = router;
