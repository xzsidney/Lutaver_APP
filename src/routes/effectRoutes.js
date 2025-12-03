const express = require('express');
const router = express.Router();

const { adminMiddleware } = require('../middlewares/authMiddleware');
const EffectController = require('../controllers/EffectController');

// LISTA – /admin/effects
router.get('/', adminMiddleware, EffectController.index);

// NOVO – /admin/effects/new
router.get('/new', adminMiddleware, EffectController.create);

// SALVAR – POST /admin/effects
router.post('/', adminMiddleware, EffectController.store);

// EDITAR – /admin/effects/:id/edit
router.get('/:id/edit', adminMiddleware, EffectController.edit);

// ATUALIZAR – POST /admin/effects/:id
router.post('/:id', adminMiddleware, EffectController.update);

// EXCLUIR – /admin/effects/:id/delete
router.get('/:id/delete', adminMiddleware, EffectController.destroy);

module.exports = router;
