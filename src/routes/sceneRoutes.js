const express = require('express');
const router = express.Router();

const { adminMiddleware } = require('../middlewares/authMiddleware');
const SceneController = require('../controllers/SceneController');

// LISTA – GET /admin/scenes
router.get('/', adminMiddleware, SceneController.index);

// FORM NOVA – GET /admin/scenes/new
router.get('/new', adminMiddleware, SceneController.create);

// SALVAR NOVA – POST /admin/scenes
router.post('/', adminMiddleware, SceneController.store);

// FORM EDITAR – GET /admin/scenes/:id/edit
router.get('/:id/edit', adminMiddleware, SceneController.edit);

// ATUALIZAR – POST /admin/scenes/:id
router.post('/:id', adminMiddleware, SceneController.update);

// EXCLUIR – GET /admin/scenes/:id/delete
router.get('/:id/delete', adminMiddleware, SceneController.destroy);

module.exports = router;
