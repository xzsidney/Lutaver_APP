const express = require('express');
const router = express.Router();

const { adminMiddleware } = require('../middlewares/authMiddleware');
const AdventureController = require('../controllers/AdventureController');

// LISTA – GET /admin/adventures
router.get('/', adminMiddleware, AdventureController.index);

// FORM NOVA – GET /admin/adventures/new
router.get('/new', adminMiddleware, AdventureController.create);

// SALVAR NOVA – POST /admin/adventures
router.post('/', adminMiddleware, AdventureController.store);

// FORM EDITAR – GET /admin/adventures/:id/edit
router.get('/:id/edit', adminMiddleware, AdventureController.edit);

// ATUALIZAR – POST /admin/adventures/:id
router.post('/:id', adminMiddleware, AdventureController.update);

// EXCLUIR – GET /admin/adventures/:id/delete
router.get('/:id/delete', adminMiddleware, AdventureController.destroy);

module.exports = router;
