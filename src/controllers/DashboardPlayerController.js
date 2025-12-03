const Character = require('../models/Character');
const Adventure = require('../models/Adventure');
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

            // Get available adventures
            const adventures = await Adventure.findAll({
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

            return res.render('player/dashboard', {
                layout: 'layouts/player',
                title: 'Área do Jogador',
                user: req.session.user,
                characters,
                activeCharacter,
                adventures,
                stories
            });
        } catch (error) {
            console.error('Error loading player dashboard:', error);
            return res.status(500).send('Erro ao carregar dashboard');
        }
    }
};
