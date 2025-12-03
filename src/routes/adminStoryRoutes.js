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

module.exports = router;
