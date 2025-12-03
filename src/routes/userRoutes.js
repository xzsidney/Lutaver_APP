// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();

const { adminMiddleware } = require('../middlewares/authMiddleware');
const AdminUserController = require('../controllers/AdminUserController');

// LISTA – /admin/users
router.get('/', adminMiddleware, AdminUserController.index);

// NOVO – /admin/users/new
router.get('/new', adminMiddleware, AdminUserController.create);

// SALVAR – /admin/users
router.post('/', adminMiddleware, AdminUserController.store);

// EDITAR – /admin/users/:id/edit
router.get('/:id/edit', adminMiddleware, AdminUserController.edit);

// ATUALIZAR – /admin/users/:id
router.post('/:id', adminMiddleware, AdminUserController.update);

// CONFIRMAR EXCLUSÃO – /admin/users/:id/delete
router.get('/:id/delete', adminMiddleware, AdminUserController.confirmDelete);

// EXCLUIR – /admin/users/:id/delete (pode ser POST se quiser)
router.post('/:id/delete', adminMiddleware, AdminUserController.destroy);

module.exports = router;
