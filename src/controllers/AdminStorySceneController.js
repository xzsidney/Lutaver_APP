const StoryScene = require('../models/StoryScene');
const Story = require('../models/Story');
const Npc = require('../models/Npc');

module.exports = {
    // LISTA – GET /admin/story-scenes
    async index(req, res) {
        try {
            const { story_id } = req.query;

            // Construir condição de filtro
            const where = {};
            if (story_id) {
                where.story_id = story_id;
            }

            const scenes = await StoryScene.findAll({
                where,
                include: [
                    { model: Story, as: 'story' },
                    { model: Npc, as: 'npc' }
                ],
                order: [['story_id', 'ASC'], ['id', 'ASC']]
            });

            const stories = await Story.findAll({
                order: [['title', 'ASC']]
            });

            return res.render('admin/storyScenes/index', {
                title: 'Story Scenes - Painel Admin',
                scenes,
                stories,
                filters: { story_id }
            });
        } catch (error) {
            console.error('Erro ao carregar story scenes (admin):', error);
            return res.status(500).send('Erro ao carregar story scenes.');
        }
    },

    // FORM NOVA – GET /admin/story-scenes/new
    async create(req, res) {
        try {
            const stories = await Story.findAll({
                order: [['title', 'ASC']]
            });

            const npcs = await Npc.findAll({
                order: [['name', 'ASC']]
            });

            const scenes = await StoryScene.findAll({
                include: [{ model: Story, as: 'story' }],
                order: [['story_id', 'ASC'], ['id', 'ASC']]
            });

            return res.render('admin/storyScenes/new', {
                title: 'Nova Story Scene',
                stories,
                npcs,
                scenes
            });
        } catch (error) {
            console.error('Erro ao carregar form de nova story scene:', error);
            return res.status(500).send('Erro ao carregar formulário.');
        }
    },

    // SALVAR – POST /admin/story-scenes
    async store(req, res) {
        try {
            const {
                story_id,
                title,
                text,
                npc_id,
                background_image,
                test_attribute,
                test_difficulty,
                success_scene_id,
                failure_scene_id,
                is_ending,
                ending_type
            } = req.body;

            await StoryScene.create({
                story_id: story_id || null,
                title,
                text,
                npc_id: npc_id || null,
                background_image: background_image || null,
                test_attribute: test_attribute || null,
                test_difficulty: test_difficulty || null,
                success_scene_id: success_scene_id || null,
                failure_scene_id: failure_scene_id || null,
                is_ending: is_ending === 'on',
                ending_type: ending_type || null
            });

            return res.redirect('/admin/story-scenes');
        } catch (error) {
            console.error('Erro ao criar story scene:', error);
            return res.status(500).send('Erro ao criar story scene.');
        }
    },

    // FORM EDITAR – GET /admin/story-scenes/:id/edit
    async edit(req, res) {
        try {
            const scene = await StoryScene.findByPk(req.params.id, {
                include: [
                    { model: Story, as: 'story' },
                    { model: Npc, as: 'npc' }
                ]
            });

            if (!scene) {
                return res.status(404).send('Story scene não encontrada.');
            }

            const stories = await Story.findAll({
                order: [['title', 'ASC']]
            });

            const npcs = await Npc.findAll({
                order: [['name', 'ASC']]
            });

            const scenes = await StoryScene.findAll({
                include: [{ model: Story, as: 'story' }],
                order: [['story_id', 'ASC'], ['id', 'ASC']]
            });

            return res.render('admin/storyScenes/edit', {
                title: 'Editar Story Scene',
                scene,
                stories,
                npcs,
                scenes
            });
        } catch (error) {
            console.error('Erro ao carregar story scene para edição:', error);
            return res.status(500).send('Erro ao carregar story scene.');
        }
    },

    // ATUALIZAR – POST /admin/story-scenes/:id
    async update(req, res) {
        try {
            const {
                story_id,
                title,
                text,
                npc_id,
                background_image,
                test_attribute,
                test_difficulty,
                success_scene_id,
                failure_scene_id,
                is_ending,
                ending_type
            } = req.body;

            await StoryScene.update(
                {
                    story_id: story_id || null,
                    title,
                    text,
                    npc_id: npc_id || null,
                    background_image: background_image || null,
                    test_attribute: test_attribute || null,
                    test_difficulty: test_difficulty || null,
                    success_scene_id: success_scene_id || null,
                    failure_scene_id: failure_scene_id || null,
                    is_ending: is_ending === 'on',
                    ending_type: ending_type || null
                },
                { where: { id: req.params.id } }
            );

            return res.redirect('/admin/story-scenes');
        } catch (error) {
            console.error('Erro ao atualizar story scene:', error);
            return res.status(500).send('Erro ao atualizar story scene.');
        }
    },

    // EXCLUIR – GET /admin/story-scenes/:id/delete
    async destroy(req, res) {
        try {
            await StoryScene.destroy({ where: { id: req.params.id } });
            return res.redirect('/admin/story-scenes');
        } catch (error) {
            console.error('Erro ao excluir story scene:', error);
            return res.status(500).send('Erro ao excluir story scene.');
        }
    }
};
