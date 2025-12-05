const express = require('express');
const router = express.Router();
const PlayerStoryController = require('../controllers/PlayerStoryController');
const { authMiddleware } = require('../middlewares/auth');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Lista todas as histórias disponíveis
router.get('/', PlayerStoryController.index);

// Jogar história específica (carrega cena atual)
router.get('/:storyId/play', PlayerStoryController.play);

// Processar escolha
router.post('/:storyId/choice/:choiceId', PlayerStoryController.choose);

// Tela de finalização
router.get('/:storyId/finish', PlayerStoryController.finish);

// Tela de timeout (tempo esgotado)
router.get('/:storyId/timeout', PlayerStoryController.timeout);

module.exports = router;
