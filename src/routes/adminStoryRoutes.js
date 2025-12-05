const express = require('express');
const router = express.Router();

const { adminMiddleware } = require('../middlewares/authMiddleware');
const AdminStoryController = require('../controllers/AdminStoryController');

// LISTA – /admin/stories
router.get('/', adminMiddleware, AdminStoryController.index);

// NOVA – /admin/stories/new
router.get('/new', adminMiddleware, AdminStoryController.create);

// SALVAR – POST /admin/stories
router.post('/', adminMiddleware, AdminStoryController.store);

// EDITAR – /admin/stories/:id/edit
router.get('/:id/edit', adminMiddleware, AdminStoryController.edit);

// ATUALIZAR – POST /admin/stories/:id
router.post('/:id', adminMiddleware, AdminStoryController.update);

// EXCLUIR – /admin/stories/:id/delete
router.get('/:id/delete', adminMiddleware, AdminStoryController.destroy);

// ============================================
// STORY EDITOR - Visual Interface
// ============================================

// Editor visual da história
router.get('/:id/editor', adminMiddleware, AdminStoryController.editor);

// Atualizar dados gerais da história
router.post('/:id/update-general', adminMiddleware, AdminStoryController.updateGeneral);

// SCENES
router.post('/:storyId/scenes/create', adminMiddleware, AdminStoryController.createScene);
router.post('/:storyId/scenes/:sceneId', adminMiddleware, AdminStoryController.updateScene);
router.delete('/:storyId/scenes/:sceneId', adminMiddleware, AdminStoryController.deleteScene);

// CHOICES
router.post('/:storyId/choices/create', adminMiddleware, AdminStoryController.createChoice);
router.post('/:storyId/choices/:choiceId', adminMiddleware, AdminStoryController.updateChoice);
router.delete('/:storyId/choices/:choiceId', adminMiddleware, AdminStoryController.deleteChoice);

module.exports = router;
