const express = require('express');
const router = express.Router();

const { adminMiddleware } = require('../middlewares/authMiddleware');
const QuestionController = require('../controllers/QuestionController');

// LISTAGEM
router.get('/', adminMiddleware, QuestionController.index);

// FORM NOVA QUESTÃO
router.get('/new', adminMiddleware, QuestionController.new);

// SALVAR QUESTÃO
router.post('/', adminMiddleware, QuestionController.create);

// EDITAR QUESTÃO
router.get('/:id/edit', adminMiddleware, QuestionController.edit);
router.post('/:id/edit', adminMiddleware, QuestionController.update);

// DELETAR QUESTÃO
router.get('/:id/delete', adminMiddleware, QuestionController.delete);

module.exports = router;
