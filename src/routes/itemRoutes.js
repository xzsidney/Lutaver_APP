const express = require('express');
const router = express.Router();

const { adminMiddleware } = require('../middlewares/authMiddleware');
const ItemController = require('../controllers/ItemController');

// LISTA – /admin/items
router.get('/', adminMiddleware, ItemController.index);

// NOVO – /admin/items/new
router.get('/new', adminMiddleware, ItemController.create);

// SALVAR – POST /admin/items
router.post('/', adminMiddleware, ItemController.store);

// EDITAR – /admin/items/:id/edit
router.get('/:id/edit', adminMiddleware, ItemController.edit);

// ATUALIZAR – POST /admin/items/:id
router.post('/:id', adminMiddleware, ItemController.update);

// EXCLUIR – /admin/items/:id/delete
router.get('/:id/delete', adminMiddleware, ItemController.destroy);

module.exports = router;
