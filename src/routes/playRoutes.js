const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');

//const PlayController = require('../controllers/PlayController');

router.get('/stories/play-test', (req, res) => {
    const user = req.session.user || { name: 'Jogador Teste' }; // mock simples

    res.render('player/story/play', {
        user, // <<< IMPORTANTE
        story: {
            title: "Teste: Meu Primeiro Dia de Aula",
            discipline_name: "Português"
        },
        character: {
            name: "Joãozinho",
            school_year: "1º Ano",
            current_map: "Bloco A"
        },
        scene: {
            title: "Cena 1 – Entrada da Escola",
            text: "Você chega animado para o seu primeiro dia de aula. A escola está cheia de alunos correndo pelos corredores.",
            requires_test: false,
            is_final: false
        },
        npc: {
            name: "Professora Ana",
            type: "Professora",
            dialog: "Bom dia! Você parece novo por aqui.",
        },
        choices: [
            { text: "Seguir pelo corredor principal" },
            { text: "Ir até a secretaria" }
        ]
    });
});


/**
 * Game/Play Routes
 * Accessible by any authenticated user (player, teacher, admin).
 

// Main play page (List adventures)
router.get('/', authMiddleware, PlayController.index);

// Alias for "Aventuras Disponíveis" link
router.get('/adventures/available', authMiddleware, (req, res) => {
    res.redirect('/play');
});

// Start specific adventure (Legacy Scene Mode)
router.get('/adventure/:adventureId', authMiddleware, PlayController.startAdventure);

// Process scene interaction (Legacy Scene Mode)
router.post('/adventure/:adventureId/scene/:sceneId', authMiddleware, PlayController.processScene);

// =================================================================
// QUIZ ROUTES
// =================================================================

// Start Quiz (Initializes session)
router.get('/quiz/:adventureId/:characterId', authMiddleware, PlayController.startQuiz);

// Show Current Question
router.get('/quiz/:adventureId/:characterId/question', authMiddleware, PlayController.showQuestion);

// Process Answer
router.post('/quiz/:adventureId/:characterId/answer', authMiddleware, PlayController.processAnswer);

// Show Result
router.get('/quiz/:adventureId/:characterId/result', authMiddleware, PlayController.showResult);
*/

module.exports = router;
