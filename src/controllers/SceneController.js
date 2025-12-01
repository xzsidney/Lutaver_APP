const Scene = require('../models/Scene');
const Adventure = require('../models/Adventure');

const SceneController = {
    /**
     * List all scenes for an adventure
     */
    list: async (req, res) => {
        const { adventureId } = req.params;

        try {
            const adventure = await Adventure.findByPk(adventureId);
            if (!adventure) {
                return res.redirect('/admin/adventures');
            }

            const scenes = await Scene.findAll({
                where: { adventure_id: adventureId },
                order: [['order_index', 'ASC']]
            });

            res.render('admin/scenes/index', {
                adventure,
                scenes,
                selectedAdventureId: adventureId,
                adventures: [], // We might need this if we want to show the filter dropdown in this view too, but usually this route is nested
                user: req.session.user
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao listar cenas');
        }
    },

    /**
     * List ALL scenes (Global view for Admin/Teacher)
     */
    listAll: async (req, res) => {
        const { adventure_id } = req.query;

        try {
            const where = {};
            if (adventure_id) {
                where.adventure_id = adventure_id;
            }

            const scenes = await Scene.findAll({
                where,
                include: [{ model: Adventure, as: 'adventure' }],
                order: [
                    [{ model: Adventure, as: 'adventure' }, 'title', 'ASC'],
                    ['order_index', 'ASC']
                ]
            });

            const adventures = await Adventure.findAll({
                order: [['title', 'ASC']]
            });

            res.render('admin/scenes/index', {
                scenes,
                adventures,
                selectedAdventureId: adventure_id || '',
                user: req.session.user
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao listar todas as cenas');
        }
    },

    /**
     * Show create form
     */
    createPage: async (req, res) => {
        // This might come from nested route /adventures/:id/scenes/new OR global /scenes/new
        // If nested, we have adventureId. If global, we might need to select adventure.
        // The current implementation assumes nested route for createPage in previous code.
        // But for admin overhaul, we might want a global create page where you select adventure.
        // Let's support both or stick to the global one which is more flexible.
        // However, the previous code used req.params.adventureId.

        // Let's check if we have adventureId in params (nested) or query (global)
        const adventureId = req.params.adventureId || req.query.adventure_id;

        try {
            const adventures = await Adventure.findAll({
                order: [['title', 'ASC']]
            });

            let existingScenes = [];
            let otherScenes = []; // For next scene selection

            if (adventureId) {
                existingScenes = await Scene.findAll({
                    where: { adventure_id: adventureId },
                    order: [['order_index', 'ASC']]
                });
                otherScenes = existingScenes;
            }

            res.render('admin/scenes/form', {
                scene: null,
                adventures,
                existingScenes,
                otherScenes,
                selectedAdventureId: adventureId,
                error: null,
                user: req.session.user
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao carregar formulário');
        }
    },

    /**
     * Create new scene
     */
    create: async (req, res) => {
        // If nested, adventureId is in params. If global, it's in body.
        let { adventure_id } = req.body;
        if (!adventure_id && req.params.adventureId) {
            adventure_id = req.params.adventureId;
        }

        const {
            order_index, title, npc_name, npc_mood, environment_description,
            player_feeling, scene_text, test_type, difficulty, attribute_used,
            next_scene_success_id, next_scene_failure_id, is_end_scene
        } = req.body;

        try {
            await Scene.create({
                adventure_id,
                order_index: parseInt(order_index) || 1,
                title,
                npc_name,
                npc_mood,
                environment_description,
                player_feeling,
                scene_text,
                test_type,
                difficulty: difficulty ? parseInt(difficulty) : null,
                attribute_used,
                next_scene_success_id: next_scene_success_id || null,
                next_scene_failure_id: next_scene_failure_id || null,
                is_end_scene: is_end_scene === 'on'
            });

            res.redirect('/admin/scenes?adventure_id=' + adventure_id);
        } catch (error) {
            console.error(error);
            const adventures = await Adventure.findAll({ order: [['title', 'ASC']] });
            res.render('admin/scenes/form', {
                scene: null,
                adventures,
                existingScenes: [],
                otherScenes: [],
                selectedAdventureId: adventure_id,
                error: 'Erro ao criar cena',
                user: req.session.user
            });
        }
    },

    /**
     * Show edit form
     */
    editPage: async (req, res) => {
        try {
            const scene = await Scene.findByPk(req.params.id, {
                include: [{
                    model: Adventure,
                    as: 'adventure'
                }]
            });

            if (!scene) {
                return res.redirect('/admin/scenes');
            }

            const adventures = await Adventure.findAll({
                order: [['title', 'ASC']]
            });

            // Get all scenes from same adventure for linking (excluding itself to avoid loops if we were strict, but simple list is fine)
            const otherScenes = await Scene.findAll({
                where: {
                    adventure_id: scene.adventure_id,
                    id: { [require('sequelize').Op.ne]: scene.id }
                },
                order: [['order_index', 'ASC']]
            });

            res.render('admin/scenes/form', {
                scene,
                adventures,
                otherScenes,
                existingScenes: otherScenes, // Alias for compatibility if needed
                selectedAdventureId: scene.adventure_id,
                error: null,
                user: req.session.user
            });
        } catch (error) {
            console.error(error);
            res.redirect('/admin/scenes');
        }
    },

    /**
     * Update scene
     */
    update: async (req, res) => {
        const { id } = req.params;
        const {
            adventure_id, order_index, title, npc_name, npc_mood, environment_description,
            player_feeling, scene_text, test_type, difficulty, attribute_used,
            next_scene_success_id, next_scene_failure_id, is_end_scene
        } = req.body;

        try {
            const scene = await Scene.findByPk(id);
            if (!scene) {
                return res.redirect('/admin/scenes');
            }

            scene.adventure_id = adventure_id;
            scene.order_index = parseInt(order_index) || 1;
            scene.title = title;
            scene.npc_name = npc_name;
            scene.npc_mood = npc_mood;
            scene.environment_description = environment_description;
            scene.player_feeling = player_feeling;
            scene.scene_text = scene_text;
            scene.test_type = test_type;
            scene.difficulty = difficulty ? parseInt(difficulty) : null;
            scene.attribute_used = attribute_used;
            scene.next_scene_success_id = next_scene_success_id || null;
            scene.next_scene_failure_id = next_scene_failure_id || null;
            scene.is_end_scene = is_end_scene === 'on';

            await scene.save();

            res.redirect('/admin/scenes?adventure_id=' + adventure_id);
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao atualizar cena');
        }
    },

    /**
     * Delete scene
     */
    delete: async (req, res) => {
        const { id } = req.params;
        try {
            const scene = await Scene.findByPk(id);
            const adventureId = scene.adventure_id;
            await Scene.destroy({ where: { id } });
            res.redirect('/admin/scenes?adventure_id=' + adventureId);
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao excluir cena');
        }
    }
};

module.exports = SceneController;
