const express = require('express');
const router = express.Router();

const { adminMiddleware } = require('../middlewares/authMiddleware');
const AdminCharacterController = require('../controllers/AdminCharacterController');

// LISTA – /admin/characters
router.get('/', adminMiddleware, AdminCharacterController.index);

// OPCIONAIS (se quiser CRUD completo)
router.get('/new', adminMiddleware, AdminCharacterController.create);
router.post('/', adminMiddleware, AdminCharacterController.store);
router.get('/:id/edit', adminMiddleware, AdminCharacterController.edit);
router.post('/:id', adminMiddleware, AdminCharacterController.update);
router.get('/:id/delete', adminMiddleware, AdminCharacterController.destroy);

module.exports = router;
