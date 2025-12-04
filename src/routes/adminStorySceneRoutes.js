const express = require('express');
const router = express.Router();

const { adminMiddleware } = require('../middlewares/authMiddleware');
const AdminStorySceneController = require('../controllers/AdminStorySceneController');

// LISTA – /admin/story-scenes
router.get('/', adminMiddleware, AdminStorySceneController.index);

// NOVA – /admin/story-scenes/new
router.get('/new', adminMiddleware, AdminStorySceneController.create);

// SALVAR – POST /admin/story-scenes
router.post('/', adminMiddleware, AdminStorySceneController.store);

// EDITAR – /admin/story-scenes/:id/edit
router.get('/:id/edit', adminMiddleware, AdminStorySceneController.edit);

// ATUALIZAR – POST /admin/story-scenes/:id
router.post('/:id', adminMiddleware, AdminStorySceneController.update);

// EXCLUIR – /admin/story-scenes/:id/delete
router.get('/:id/delete', adminMiddleware, AdminStorySceneController.destroy);

module.exports = router;
