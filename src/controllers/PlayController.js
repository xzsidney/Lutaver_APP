const Adventure = require('../models/Adventure');
const Discipline = require('../models/Discipline');
const Scene = require('../models/Scene');
const Character = require('../models/Character');
const Question = require('../models/Question');
const AdventureProgress = require('../models/AdventureProgress');
const CharacterAffinity = require('../models/CharacterAffinity');

const PlayController = {
    /**
     * Main Play Dashboard - List available adventures
     */
    index: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user) return res.redirect('/login');

            // Get user's characters to select who is playing
            const characters = await Character.findAll({
                where: { user_id: user.id }
            });

            // If no characters, redirect to create one
            if (characters.length === 0) {
                return res.redirect('/my/characters/new');
            }

            // Get active character from query or session or default to first
            let activeCharacterId = req.query.character_id || req.session.activeCharacterId || characters[0].id;

            // Validate if the character belongs to user
            const activeCharacter = characters.find(c => c.id == activeCharacterId) || characters[0];
            req.session.activeCharacterId = activeCharacter.id;

            const adventures = await Adventure.findAll({
                where: { is_active: true },
                include: [{ model: Discipline, as: 'discipline' }],
                order: [['difficulty', 'ASC']]
            });

            // Load completed adventures for active character
            const completedAdventures = await AdventureProgress.findAll({
                where: {
                    character_id: activeCharacter.id,
                    is_completed: true
                }
            });

            const completedAdventureIds = completedAdventures.map(p => p.adventure_id);

            res.render('play/index', {
                user,
                characters,
                activeCharacter,
                adventures,
                completedAdventureIds,
                path: '/play'
            });
        } catch (error) {
            console.error('Error listing adventures:', error);
            res.status(500).send('Server Error');
        }
    },

    /**
     * Start/Continue Adventure (Legacy Scene Mode - Optional)
     */
    startAdventure: async (req, res) => {
        try {
            const { adventureId } = req.params;
            const adventure = await Adventure.findByPk(adventureId, {
                include: [{ model: Discipline, as: 'discipline' }]
            });

            if (!adventure) return res.redirect('/play');

            // Find the first scene (or current scene if we had progress tracking)
            const firstScene = await Scene.findOne({
                where: { adventure_id: adventureId },
                order: [['order_index', 'ASC']]
            });

            if (!firstScene) {
                return res.send('Esta aventura ainda não tem cenas!');
            }

            res.render('play/scene', {
                adventure,
                scene: firstScene,
                character: null, // TODO: Pass character stats
                user: req.session.user
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao iniciar aventura');
        }
    },

    /**
     * Process Scene Interaction
     */
    processScene: async (req, res) => {
        // TODO: Implement logic for choices/tests
        res.send('Processando cena... (Em construção)');
    },

    // =================================================================
    // QUIZ FUNCTIONALITY
    // =================================================================

    // Start or Resume Quiz
    startQuiz: async (req, res) => {
        try {
            const { adventureId, characterId } = req.params;
            const user = req.session.user;

            if (!user) return res.redirect('/login');

            // Verify character ownership
            const character = await Character.findOne({
                where: { id: characterId, user_id: user.id }
            });

            if (!character) {
                return res.status(403).send('Personagem não encontrado ou não pertence a você.');
            }

            // Check if adventure is already completed
            const existingProgress = await AdventureProgress.findOne({
                where: {
                    character_id: characterId,
                    adventure_id: adventureId,
                    is_completed: true
                }
            });

            if (existingProgress) {
                return res.render('play/quiz/blocked', {
                    user,
                    character,
                    adventure: await Adventure.findByPk(adventureId, {
                        include: [{ model: Discipline, as: 'discipline' }]
                    }),
                    progress: existingProgress,
                    path: '/play'
                });
            }

            const adventure = await Adventure.findByPk(adventureId, {
                include: [{ model: Discipline, as: 'discipline' }]
            });

            if (!adventure) {
                return res.status(404).send('Aventura não encontrada.');
            }

            // Load questions
            const questions = await Question.findAll({
                where: { adventure_id: adventureId }
            });

            if (questions.length === 0) {
                return res.send('Esta aventura ainda não tem questões cadastradas.');
            }

            // Initialize Quiz Session State
            req.session.quiz = {
                adventureId,
                characterId,
                questions: questions.map(q => q.toJSON()),
                currentIndex: 0,
                score: 0,
                answers: [],
                startTime: Date.now()
            };

            res.redirect(`/play/quiz/${adventureId}/${characterId}/question`);
        } catch (error) {
            console.error('Error starting quiz:', error);
            res.status(500).send('Server Error');
        }
    },

    // Show Current Question
    showQuestion: async (req, res) => {
        try {
            const { adventureId, characterId } = req.params;
            const quiz = req.session.quiz;

            // Validate session
            if (!quiz || quiz.adventureId != adventureId || quiz.characterId != characterId) {
                return res.redirect(`/play/quiz/${adventureId}/${characterId}`); // Restart if session invalid
            }

            // Check if finished
            if (quiz.currentIndex >= quiz.questions.length) {
                return res.redirect(`/play/quiz/${adventureId}/${characterId}/result`);
            }

            const currentQuestion = quiz.questions[quiz.currentIndex];
            const character = await Character.findByPk(characterId);
            const adventure = await Adventure.findByPk(adventureId, {
                include: [{ model: Discipline, as: 'discipline' }]
            });

            res.render('play/quiz/question', {
                user: req.session.user,
                character,
                adventure,
                question: currentQuestion,
                questionIndex: quiz.currentIndex + 1,
                totalQuestions: quiz.questions.length,
                showFeedback: false, // Default state
                path: '/play'
            });
        } catch (error) {
            console.error('Error showing question:', error);
            res.status(500).send('Server Error');
        }
    },

    // Process Answer
    processAnswer: async (req, res) => {
        try {
            const { adventureId, characterId } = req.params;
            const { answer } = req.body;
            const quiz = req.session.quiz;

            if (!quiz) return res.redirect(`/play`);

            const currentQuestion = quiz.questions[quiz.currentIndex];
            const isCorrect = answer === currentQuestion.correct_option;

            // Update state
            if (isCorrect) quiz.score++;

            quiz.answers.push({
                questionId: currentQuestion.id,
                userAnswer: answer,
                correctAnswer: currentQuestion.correct_option,
                isCorrect
            });

            // Render feedback view
            const character = await Character.findByPk(characterId);
            const adventure = await Adventure.findByPk(adventureId, {
                include: [{ model: Discipline, as: 'discipline' }]
            });

            res.render('play/quiz/question', {
                user: req.session.user,
                character,
                adventure,
                question: currentQuestion,
                questionIndex: quiz.currentIndex + 1,
                totalQuestions: quiz.questions.length,
                showFeedback: true,
                isCorrect,
                userAnswer: answer,
                explanation: currentQuestion.explanation,
                path: '/play'
            });

            // Increment index AFTER rendering feedback so next GET request loads next question
            quiz.currentIndex++;

        } catch (error) {
            console.error('Error processing answer:', error);
            res.status(500).send('Server Error');
        }
    },

    // Show Results
    showResult: async (req, res) => {
        try {
            const { adventureId, characterId } = req.params;
            const quiz = req.session.quiz;

            if (!quiz) return res.redirect(`/play`);

            // Prevent re-saving if user refreshes
            if (!quiz.saved) {
                const character = await Character.findByPk(characterId);
                const adventure = await Adventure.findByPk(adventureId);

                const percentage = (quiz.score / quiz.questions.length) * 100;
                const PASS_THRESHOLD = 70;
                const isPassed = percentage >= PASS_THRESHOLD;

                let xpEarned = 0;
                let affinityGain = 0;

                if (isPassed) {
                    // PASSED: Grant rewards and mark as completed
                    xpEarned = adventure.reward_xp;

                    // Save Progress with completion flag
                    await AdventureProgress.create({
                        character_id: characterId,
                        adventure_id: adventureId,
                        total_questions: quiz.questions.length,
                        correct_answers: quiz.score,
                        percentage: percentage,
                        is_completed: true,
                        xp_earned: xpEarned
                    });

                    // Update Character XP
                    character.experience = (character.experience || 0) + xpEarned;

                    // Update Affinity if Discipline exists
                    if (adventure.discipline_id) {
                        let affinity = await CharacterAffinity.findOne({
                            where: {
                                character_id: characterId,
                                discipline_id: adventure.discipline_id
                            }
                        });

                        affinityGain = Math.round(percentage / 10); // Max 10% increase

                        if (affinity) {
                            affinity.affinity_level = Math.min(100, affinity.affinity_level + affinityGain);
                            await affinity.save();
                        } else {
                            await CharacterAffinity.create({
                                character_id: characterId,
                                discipline_id: adventure.discipline_id,
                                affinity_level: affinityGain
                            });
                        }
                    }

                    await character.save();
                } else {
                    // FAILED: No rewards, no progress saved
                    // Player can retry
                }

                quiz.saved = true;
                quiz.xpEarned = xpEarned;
                quiz.percentage = percentage;
                quiz.isPassed = isPassed;
                quiz.affinityGain = affinityGain;
            }

            const character = await Character.findByPk(characterId);
            const adventure = await Adventure.findByPk(adventureId, {
                include: [{ model: Discipline, as: 'discipline' }]
            });

            res.render('play/quiz/result', {
                user: req.session.user,
                character,
                adventure,
                score: quiz.score,
                total: quiz.questions.length,
                percentage: quiz.percentage,
                xpEarned: quiz.xpEarned,
                isPassed: quiz.isPassed,
                affinityGain: quiz.affinityGain || 0,
                passThreshold: 70,
                path: '/play'
            });

        } catch (error) {
            console.error('Error showing results:', error);
            res.status(500).send('Server Error');
        }
    }
};

module.exports = PlayController;
