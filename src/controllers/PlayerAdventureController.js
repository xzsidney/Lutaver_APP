const Adventure = require('../models/Adventure');
const Character = require('../models/Character');
const Question = require('../models/Question');
const AdventureProgress = require('../models/AdventureProgress');
const Discipline = require('../models/Discipline');

module.exports = {
    // Listar aventuras disponíveis
    async index(req, res) {
        try {
            const activeCharacterId = req.session.activeCharacterId;

            if (!activeCharacterId) {
                return res.redirect('/player/characters');
            }

            const character = await Character.findByPk(activeCharacterId);
            const adventures = await Adventure.findAll({
                where: { is_active: true },
                include: [{ model: Discipline, as: 'discipline' }],
                order: [['difficulty', 'ASC']]
            });

            // Buscar progresso do personagem
            const progress = await AdventureProgress.findAll({
                where: { character_id: activeCharacterId }
            });

            const completedAdventureIds = progress
                .filter(p => p.is_completed)
                .map(p => p.adventure_id);

            return res.render('player/adventure/index', {
                layout: 'layouts/player',
                title: 'Aventuras',
                user: req.session.user,
                character,
                adventures,
                completedAdventureIds
            });
        } catch (error) {
            console.error('Error loading adventures:', error);
            return res.status(500).send('Erro ao carregar aventuras');
        }
    },

    // Exibir detalhes da aventura
    async show(req, res) {
        try {
            const activeCharacterId = req.session.activeCharacterId;
            const { id } = req.params;

            if (!activeCharacterId) {
                return res.redirect('/player/characters');
            }

            const character = await Character.findByPk(activeCharacterId);
            const adventure = await Adventure.findByPk(id, {
                include: [{ model: Discipline, as: 'discipline' }]
            });

            if (!adventure) {
                return res.status(404).send('Aventura não encontrada');
            }

            // Verificar se já completou
            const progress = await AdventureProgress.findOne({
                where: {
                    character_id: activeCharacterId,
                    adventure_id: id,
                    is_completed: true
                }
            });

            return res.render('player/adventure/show', {
                layout: 'layouts/player',
                title: adventure.title,
                user: req.session.user,
                character,
                adventure,
                isCompleted: !!progress,
                progress
            });
        } catch (error) {
            console.error('Error loading adventure:', error);
            return res.status(500).send('Erro ao carregar aventura');
        }
    },

    // Iniciar quiz
    async startQuiz(req, res) {
        try {
            const activeCharacterId = req.session.activeCharacterId;
            const { id } = req.params;

            if (!activeCharacterId) {
                return res.redirect('/player/characters');
            }

            const character = await Character.findByPk(activeCharacterId);
            const adventure = await Adventure.findByPk(id);

            if (!adventure) {
                return res.status(404).send('Aventura não encontrada');
            }

            // Buscar questões
            const questions = await Question.findAll({
                where: { adventure_id: id }
            });

            if (questions.length === 0) {
                return res.send('Esta aventura ainda não possui questões');
            }

            // Inicializar quiz na sessão
            req.session.quiz = {
                adventureId: id,
                characterId: activeCharacterId,
                questions: questions.map(q => q.toJSON()),
                currentIndex: 0,
                score: 0,
                answers: []
            };

            return res.redirect(`/player/adventures/${id}/quiz`);
        } catch (error) {
            console.error('Error starting quiz:', error);
            return res.status(500).send('Erro ao iniciar quiz');
        }
    },

    // Exibir questão do quiz
    async showQuiz(req, res) {
        try {
            const { id } = req.params;
            const quiz = req.session.quiz;

            if (!quiz || quiz.adventureId != id) {
                return res.redirect(`/player/adventures/${id}`);
            }

            // Se terminou, redirecionar para resultados
            if (quiz.currentIndex >= quiz.questions.length) {
                return res.redirect(`/player/adventures/${id}/results`);
            }

            const character = await Character.findByPk(quiz.characterId);
            const adventure = await Adventure.findByPk(id);
            const currentQuestion = quiz.questions[quiz.currentIndex];

            return res.render('player/adventure/quiz', {
                layout: 'layouts/player',
                title: `Quiz - ${adventure.title}`,
                user: req.session.user,
                character,
                adventure,
                question: currentQuestion,
                questionIndex: quiz.currentIndex + 1,
                totalQuestions: quiz.questions.length
            });
        } catch (error) {
            console.error('Error showing quiz:', error);
            return res.status(500).send('Erro ao exibir quiz');
        }
    },

    // Processar resposta
    async submitAnswer(req, res) {
        try {
            const { id } = req.params;
            const { answer } = req.body;
            const quiz = req.session.quiz;

            if (!quiz || quiz.adventureId != id) {
                return res.redirect(`/player/adventures/${id}`);
            }

            const currentQuestion = quiz.questions[quiz.currentIndex];
            const isCorrect = answer === currentQuestion.correct_option;

            if (isCorrect) {
                quiz.score++;
            }

            quiz.answers.push({
                questionId: currentQuestion.id,
                userAnswer: answer,
                correctAnswer: currentQuestion.correct_option,
                isCorrect
            });

            quiz.currentIndex++;

            // Se terminou, redirecionar para resultados
            if (quiz.currentIndex >= quiz.questions.length) {
                return res.redirect(`/player/adventures/${id}/results`);
            }

            // Próxima questão
            return res.redirect(`/player/adventures/${id}/quiz`);
        } catch (error) {
            console.error('Error submitting answer:', error);
            return res.status(500).send('Erro ao processar resposta');
        }
    },

    // Exibir resultados
    async showResults(req, res) {
        try {
            const { id } = req.params;
            const quiz = req.session.quiz;

            if (!quiz || quiz.adventureId != id) {
                return res.redirect(`/player/adventures/${id}`);
            }

            const character = await Character.findByPk(quiz.characterId);
            const adventure = await Adventure.findByPk(id);

            const percentage = (quiz.score / quiz.questions.length) * 100;
            const PASS_THRESHOLD = 70;
            const isPassed = percentage >= PASS_THRESHOLD;

            let xpEarned = 0;
            let coinsEarned = 0;

            if (isPassed && !quiz.saved) {
                xpEarned = adventure.reward_xp || 100;
                coinsEarned = adventure.reward_item || 50;

                // Salvar progresso
                await AdventureProgress.create({
                    character_id: quiz.characterId,
                    adventure_id: id,
                    total_questions: quiz.questions.length,
                    correct_answers: quiz.score,
                    percentage: percentage,
                    is_completed: true,
                    xp_earned: xpEarned
                });

                // Atualizar personagem
                character.total_xp = (character.total_xp || 0) + xpEarned;
                character.coins = (character.coins || 0) + coinsEarned;
                await character.save();

                quiz.saved = true;
            }

            return res.render('player/adventure/results', {
                layout: 'layouts/player',
                title: 'Resultados',
                user: req.session.user,
                character,
                adventure,
                score: quiz.score,
                total: quiz.questions.length,
                percentage,
                isPassed,
                xpEarned,
                coinsEarned,
                passThreshold: PASS_THRESHOLD
            });
        } catch (error) {
            console.error('Error showing results:', error);
            return res.status(500).send('Erro ao exibir resultados');
        }
    }
};
