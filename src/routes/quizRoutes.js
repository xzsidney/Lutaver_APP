const express = require('express');
const router = express.Router();

const { adminMiddleware } = require('../middlewares/authMiddleware');
const QuizController = require('../controllers/QuizController');

// LISTA – GET /admin/quizzes
router.get('/', adminMiddleware, QuizController.index);

// FORM NOVA – GET /admin/quizzes/new
router.get('/new', adminMiddleware, QuizController.create);

// SALVAR NOVA – POST /admin/quizzes
router.post('/', adminMiddleware, QuizController.store);

// FORM EDITAR – GET /admin/quizzes/:id/edit
router.get('/:id/edit', adminMiddleware, QuizController.edit);

// ATUALIZAR – POST /admin/quizzes/:id
router.post('/:id', adminMiddleware, QuizController.update);

// EXCLUIR – GET /admin/quizzes/:id/delete
router.get('/:id/delete', adminMiddleware, QuizController.destroy);

module.exports = router;
