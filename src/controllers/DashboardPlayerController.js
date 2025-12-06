const Character = require('../models/Character');
const Quiz = require('../models/Quiz');
const Story = require('../models/Story');
const Discipline = require('../models/Discipline');

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
    }
};
