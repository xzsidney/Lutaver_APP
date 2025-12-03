const express = require('express');
const router = express.Router();

const { adminMiddleware } = require('../middlewares/authMiddleware');
const AdminNpcController = require('../controllers/AdminNpcController');

// LISTA – /admin/npcs
router.get('/', adminMiddleware, AdminNpcController.index);

// NOVO – /admin/npcs/new
router.get('/new', adminMiddleware, AdminNpcController.create);

// SALVAR – POST /admin/npcs
router.post('/', adminMiddleware, AdminNpcController.store);

// EDITAR – /admin/npcs/:id/edit
router.get('/:id/edit', adminMiddleware, AdminNpcController.edit);

// ATUALIZAR – POST /admin/npcs/:id
router.post('/:id', adminMiddleware, AdminNpcController.update);

// EXCLUIR – /admin/npcs/:id/delete
router.get('/:id/delete', adminMiddleware, AdminNpcController.destroy);

module.exports = router;
