const Adventure = require('../models/Adventure');
const Discipline = require('../models/Discipline');
const Scene = require('../models/Scene');
const Character = require('../models/Character');

const PlayController = {
    /**
     * Main Play Dashboard - List available adventures
     */
    index: async (req, res) => {
        try {
            // Get user's active character
            const character = await Character.findOne({
                where: { user_id: req.session.user.id }
            });

            // Get all active adventures
            const adventures = await Adventure.findAll({
                where: { is_active: true },
                include: [{ model: Discipline, as: 'discipline' }],
                order: [['difficulty', 'ASC']]
            });

            res.render('play/index', {
                adventures,
                character,
                user: req.session.user
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao carregar aventuras');
        }
    },

    /**
     * Start/Continue Adventure
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
    }
};

module.exports = PlayController;
