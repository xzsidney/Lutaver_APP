const Quiz = require('../models/Quiz');
const Character = require('../models/Character');
const Question = require('../models/Question');
const QuizProgress = require('../models/QuizProgress');
const Discipline = require('../models/Discipline');

module.exports = {
    // Listar quizzes disponíveis
    async index(req, res) {
        try {
            const activeCharacterId = req.session.activeCharacterId;

            if (!activeCharacterId) {
                return res.redirect('/player/characters');
            }

            const character = await Character.findByPk(activeCharacterId);
            const quizzes = await Quiz.findAll({
                where: { is_active: true },
                include: [{ model: Discipline, as: 'discipline' }],
                order: [['difficulty', 'ASC']]
            });

            // Buscar progresso do personagem
            const progress = await QuizProgress.findAll({
                where: { character_id: activeCharacterId }
            });

            const completedQuizIds = progress
                .filter(p => p.is_completed)
                .map(p => p.quiz_id);

            return res.render('player/quizzes/index', {
                layout: 'layouts/player',
                title: 'Quizzes',
                user: req.session.user,
                character,
                quizzes,
                completedQuizIds
            });
        } catch (error) {
            console.error('Error loading quizzes:', error);
            return res.status(500).send('Erro ao carregar quizzes');
        }
    },

    // Exibir detalhes do quiz
    async show(req, res) {
        try {
            const activeCharacterId = req.session.activeCharacterId;
            const { id } = req.params;

            if (!activeCharacterId) {
                return res.redirect('/player/characters');
            }

            const character = await Character.findByPk(activeCharacterId);
            const quiz = await Quiz.findByPk(id, {
                include: [{ model: Discipline, as: 'discipline' }]
            });

            if (!quiz) {
                return res.status(404).send('Quiz não encontrado');
            }

            // Verificar se já completou
            const progress = await QuizProgress.findOne({
                where: {
                    character_id: activeCharacterId,
                    quiz_id: id,
                    is_completed: true
                }
            });

            return res.render('player/quizzes/show', {
                layout: 'layouts/player',
                title: quiz.title,
                user: req.session.user,
                character,
                quiz,
                isCompleted: !!progress,
                progress
            });
        } catch (error) {
            console.error('Error loading quiz:', error);
            return res.status(500).send('Erro ao carregar quiz');
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
            const quiz = await Quiz.findByPk(id);

            if (!quiz) {
                return res.status(404).send('Quiz não encontrado');
            }

            // Buscar questões
            const questions = await Question.findAll({
                where: { quiz_id: id }
            });

            if (questions.length === 0) {
                return res.send('Este quiz ainda não possui questões');
            }

            // Inicializar quiz na sessão
            req.session.quiz = {
                quizId: id,
                characterId: activeCharacterId,
                questions: questions.map(q => q.toJSON()),
                currentIndex: 0,
                score: 0,
                answers: []
            };

            return res.redirect(`/player/quizzes/${id}/play`);
        } catch (error) {
            console.error('Error starting quiz:', error);
            return res.status(500).send('Erro ao iniciar quiz');
        }
    },

    // Exibir questão do quiz
    async showQuiz(req, res) {
        try {
            const { id } = req.params;
            const quizSession = req.session.quiz;

            if (!quizSession || quizSession.quizId != id) {
                return res.redirect(`/player/quizzes/${id}`);
            }

            // Se terminou, redirecionar para resultados
            if (quizSession.currentIndex >= quizSession.questions.length) {
                return res.redirect(`/player/quizzes/${id}/results`);
            }

            const character = await Character.findByPk(quizSession.characterId);
            const quiz = await Quiz.findByPk(id);
            const currentQuestion = quizSession.questions[quizSession.currentIndex];

            return res.render('player/quizzes/quiz', {
                layout: 'layouts/player',
                title: `Quiz - ${quiz.title}`,
                user: req.session.user,
                character,
                quiz,
                question: currentQuestion,
                questionIndex: quizSession.currentIndex + 1,
                totalQuestions: quizSession.questions.length
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
            const quizSession = req.session.quiz;

            if (!quizSession || quizSession.quizId != id) {
                return res.redirect(`/player/quizzes/${id}`);
            }

            const currentQuestion = quizSession.questions[quizSession.currentIndex];
            const isCorrect = answer === currentQuestion.correct_option;

            if (isCorrect) {
                quizSession.score++;
            }

            quizSession.answers.push({
                questionId: currentQuestion.id,
                userAnswer: answer,
                correctAnswer: currentQuestion.correct_option,
                isCorrect
            });

            quizSession.currentIndex++;

            // Se terminou, redirecionar para resultados
            if (quizSession.currentIndex >= quizSession.questions.length) {
                return res.redirect(`/player/quizzes/${id}/results`);
            }

            // Próxima questão
            return res.redirect(`/player/quizzes/${id}/play`);
        } catch (error) {
            console.error('Error submitting answer:', error);
            return res.status(500).send('Erro ao processar resposta');
        }
    },

    // Exibir resultados
    async showResults(req, res) {
        try {
            const { id } = req.params;
            const quizSession = req.session.quiz;

            if (!quizSession || quizSession.quizId != id) {
                return res.redirect(`/player/quizzes/${id}`);
            }

            const character = await Character.findByPk(quizSession.characterId);
            const quiz = await Quiz.findByPk(id);

            const percentage = (quizSession.score / quizSession.questions.length) * 100;
            const PASS_THRESHOLD = 70;
            const isPassed = percentage >= PASS_THRESHOLD;

            let xpEarned = 0;
            let coinsEarned = 0;

            if (isPassed && !quizSession.saved) {
                xpEarned = quiz.reward_xp || 100;
                coinsEarned = quiz.reward_coins || 50;

                // Salvar progresso
                await QuizProgress.create({
                    character_id: quizSession.characterId,
                    quiz_id: id,
                    total_questions: quizSession.questions.length,
                    correct_answers: quizSession.score,
                    percentage: percentage,
                    is_completed: true,
                    xp_earned: xpEarned
                });

                // Atualizar personagem
                character.total_xp = (character.total_xp || 0) + xpEarned;
                character.coins = (character.coins || 0) + coinsEarned;
                await character.save();

                quizSession.saved = true;
            }

            return res.render('player/quizzes/results', {
                layout: 'layouts/player',
                title: 'Resultados',
                user: req.session.user,
                character,
                quiz,
                score: quizSession.score,
                total: quizSession.questions.length,
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
