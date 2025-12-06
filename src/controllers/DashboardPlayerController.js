const Character = require('../models/Character');
const Quiz = require('../models/Quiz');
const Story = require('../models/Story');
const Discipline = require('../models/Discipline');
const Npc = require('../models/Npc');
const Sequelize = require('sequelize');

module.exports = {
    // Player Dashboard
    async dashboard(req, res) {
        try {
            const userId = req.session.user.id;
            const activeCharacterId = req.session.activeCharacterId;

            // Get all user's characters
            const characters = await Character.findAll({
                where: { user_id: userId },
                order: [['createdAt', 'ASC']]
            });

            // Get active character if exists
            let activeCharacter = null;
            if (activeCharacterId) {
                activeCharacter = await Character.findByPk(activeCharacterId);
            }

            // Get available quizzes
            const quizzes = await Quiz.findAll({
                where: { is_active: true },
                include: [{ model: Discipline, as: 'discipline' }],
                limit: 8,
                order: [['createdAt', 'DESC']]
            });

            // Get stories (if Story model exists)
            let stories = [];
            try {
                stories = await Story.findAll({
                    where: { is_active: true },
                    limit: 8,
                    order: [['createdAt', 'DESC']]
                });
            } catch (error) {
                // Story model might not exist yet
                console.log('Stories not available');
            }

            // Notifications mock logic (can be replaced with real logic later)
            const notifications = {
                newQuiz: quizzes.length > 0,
                newItems: true, // Placeholder
                lastStoryCompleted: false // Placeholder
            };

            // Prepare active character data if exists
            let activeCharacterData = null;
            if (activeCharacter) {
                const nextLevelXp = activeCharacter.level * 100; // Formula example
                activeCharacterData = {
                    ...activeCharacter.toJSON(),
                    hpCurrent: activeCharacter.life,
                    hpMax: activeCharacter.max_life,
                    xp: activeCharacter.total_xp,
                    xpNextLevel: nextLevelXp
                };
            }

            return res.render('player/dashboard', {
                layout: 'layouts/player',
                title: 'Área do Jogador',
                user: req.session.user,
                characters,
                activeCharacter: activeCharacterData,
                quizzes,
                stories,
                notifications
            });
        } catch (error) {
            console.error('Error loading player dashboard:', error);
            return res.status(500).send('Erro ao carregar dashboard');
        }
    },

    // Battle View
    async battle(req, res) {
        try {
            const user = req.session.user;
            const userId = req.session.user.id;
            let activeCharacterId = req.session.activeCharacterId;
            let character;

            // 1. Try to fetch by Session ID first
            if (activeCharacterId) {
                character = await Character.findByPk(activeCharacterId);
            }

            // 2. If no valid character from session (or ID was invalid), try to fetch ANY character from user
            if (!character) {
                const userCharacters = await Character.findAll({
                    where: { user_id: userId },
                    order: [['updatedAt', 'DESC']], // Get most recently used/created
                    limit: 1
                });

                if (userCharacters.length > 0) {
                    character = userCharacters[0];
                    // Auto-set as active to persist selection for next time
                    req.session.activeCharacterId = character.id;
                }
            }

            // 3. If still no character, we can't battle.
            if (!character) {
                return res.redirect('/player/dashboard');
            }

            // Character is guaranteed to be set here due to checks above

            // Try to find a random NPC or creating a mock one if empty
            let npc = await Npc.findOne({
                order: [
                    [Sequelize.fn('RAND')]
                ]
            });

            if (!npc) {
                // Fallback Mock NPC if DB is empty
                npc = {
                    id: 999,
                    name: "Inimigo de Treino",
                    type: "creature",
                    subject: "Geral",
                    grade_level: 1,
                    stat_strength: 8,
                    stat_dexterity: 8,
                    stat_constitution: 20, // Hp base multiplier usually handles this
                    stat_intelligence: 5,
                    stat_reasoning: 5,
                    stat_luck: 5,
                    difficulty: "easy"
                };
            }

            return res.render('player/battle', {
                layout: 'layouts/player', // Maintain layout consistency
                title: 'Batalha',
                user,
                character: character.toJSON(),
                npc: npc.toJSON ? npc.toJSON() : npc
            });

        } catch (error) {
            console.error('Error loading battle:', error);
            // Fallback to dashboard on error
            return res.redirect('/player/dashboard');
        }
    }
};
