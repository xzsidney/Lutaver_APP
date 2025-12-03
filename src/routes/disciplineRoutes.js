const express = require('express');
const router = express.Router();

const { adminMiddleware } = require('../middlewares/authMiddleware');
const DisciplineController = require('../controllers/DisciplineController');

// LISTA – GET /admin/disciplines
router.get('/', adminMiddleware, DisciplineController.index);

// FORM NOVO – GET /admin/disciplines/new
router.get('/new', adminMiddleware, DisciplineController.create);

// SALVAR – POST /admin/disciplines
router.post('/', adminMiddleware, DisciplineController.store);

// FORM EDIT – GET /admin/disciplines/:id/edit
router.get('/:id/edit', adminMiddleware, DisciplineController.edit);

// ATUALIZAR – POST /admin/disciplines/:id
router.post('/:id', adminMiddleware, DisciplineController.update);

// EXCLUIR – GET /admin/disciplines/:id/delete
router.get('/:id/delete', adminMiddleware, DisciplineController.destroy);

module.exports = router;
