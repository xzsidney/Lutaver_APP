const express = require('express');
const router = express.Router();

const { adminMiddleware } = require('../middlewares/authMiddleware');
const PowerController = require('../controllers/PowerController');

// LISTA – GET /admin/powers
router.get('/', adminMiddleware, PowerController.index);

// NOVO – GET /admin/powers/new
router.get('/new', adminMiddleware, PowerController.create);

// SALVAR – POST /admin/powers
router.post('/', adminMiddleware, PowerController.store);

// EDITAR – GET /admin/powers/:id/edit
router.get('/:id/edit', adminMiddleware, PowerController.edit);

// ATUALIZAR – POST /admin/powers/:id
router.post('/:id', adminMiddleware, PowerController.update);

// EXCLUIR – GET /admin/powers/:id/delete
router.get('/:id/delete', adminMiddleware, PowerController.destroy);

module.exports = router;
