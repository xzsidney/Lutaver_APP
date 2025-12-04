const express = require('express');
const router = express.Router();

const { adminMiddleware } = require('../middlewares/authMiddleware');
const AdminStoryChoiceController = require('../controllers/AdminStoryChoiceController');

// LISTA – /admin/story-choices
router.get('/', adminMiddleware, AdminStoryChoiceController.index);

// NOVA – /admin/story-choices/new
router.get('/new', adminMiddleware, AdminStoryChoiceController.create);

// SALVAR – POST /admin/story-choices
router.post('/', adminMiddleware, AdminStoryChoiceController.store);

// EDITAR – /admin/story-choices/:id/edit
router.get('/:id/edit', adminMiddleware, AdminStoryChoiceController.edit);

// ATUALIZAR – POST /admin/story-choices/:id
router.post('/:id', adminMiddleware, AdminStoryChoiceController.update);

// EXCLUIR – /admin/story-choices/:id/delete
router.get('/:id/delete', adminMiddleware, AdminStoryChoiceController.destroy);

module.exports = router;
