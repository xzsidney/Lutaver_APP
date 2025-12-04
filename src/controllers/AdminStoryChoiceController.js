const StoryChoice = require('../models/StoryChoice');
const Story = require('../models/Story');
const StoryScene = require('../models/StoryScene');

module.exports = {
    // LISTA – GET /admin/story-choices
    async index(req, res) {
        try {
            const { story_id, scene_id } = req.query;

            // Construir condição de filtro
            const where = {};
            if (story_id) {
                // Buscar todas as cenas dessa história primeiro
                const scenes = await StoryScene.findAll({
                    where: { story_id },
                    attributes: ['id']
                });
                const sceneIds = scenes.map(s => s.id);
                where.story_scene_id = sceneIds;
            } else if (scene_id) {
                where.story_scene_id = scene_id;
            }

            const choices = await StoryChoice.findAll({
                where,
                include: [
                    {
                        model: StoryScene,
                        as: 'scene',
                        include: [{ model: Story, as: 'story' }]
                    }
                ],
                order: [['id', 'ASC']]
            });

            return res.render('admin/storyChoices/index', {
                title: 'Story Choices - Painel Admin',
                choices,
                filters: { story_id, scene_id }
            });
        } catch (error) {
            console.error('Erro ao carregar story choices (admin):', error);
            return res.status(500).send('Erro ao carregar story choices.');
        }
    },

    // FORM NOVA – GET /admin/story-choices/new
    async create(req, res) {
        try {
            const stories = await Story.findAll({
                order: [['title', 'ASC']]
            });

            const scenes = await StoryScene.findAll({
                include: [{ model: Story, as: 'story' }],
                order: [['story_id', 'ASC'], ['id', 'ASC']]
            });

            return res.render('admin/storyChoices/new', {
                title: 'Nova Story Choice',
                stories,
                scenes
            });
        } catch (error) {
            console.error('Erro ao carregar form de nova story choice:', error);
            return res.status(500).send('Erro ao carregar formulário.');
        }
    },

    // SALVAR – POST /admin/story-choices
    async store(req, res) {
        try {
            const {
                story_scene_id,
                label,
                next_scene_id,
                requires_test,
                test_attribute,
                test_difficulty,
                success_scene_id,
                failure_scene_id
            } = req.body;

            await StoryChoice.create({
                story_scene_id: story_scene_id || null,
                label,
                next_scene_id: next_scene_id || null,
                requires_test: requires_test === 'on',
                test_attribute: test_attribute || null,
                test_difficulty: test_difficulty || null,
                success_scene_id: success_scene_id || null,
                failure_scene_id: failure_scene_id || null
            });

            return res.redirect('/admin/story-choices');
        } catch (error) {
            console.error('Erro ao criar story choice:', error);
            return res.status(500).send('Erro ao criar story choice.');
        }
    },

    // FORM EDITAR – GET /admin/story-choices/:id/edit
    async edit(req, res) {
        try {
            const choice = await StoryChoice.findByPk(req.params.id, {
                include: [
                    {
                        model: StoryScene,
                        as: 'scene',
                        include: [{ model: Story, as: 'story' }]
                    }
                ]
            });

            if (!choice) {
                return res.status(404).send('Story choice não encontrada.');
            }

            const stories = await Story.findAll({
                order: [['title', 'ASC']]
            });

            const scenes = await StoryScene.findAll({
                include: [{ model: Story, as: 'story' }],
                order: [['story_id', 'ASC'], ['id', 'ASC']]
            });

            return res.render('admin/storyChoices/edit', {
                title: 'Editar Story Choice',
                choice,
                stories,
                scenes
            });
        } catch (error) {
            console.error('Erro ao carregar story choice para edição:', error);
            return res.status(500).send('Erro ao carregar story choice.');
        }
    },

    // ATUALIZAR – POST /admin/story-choices/:id
    async update(req, res) {
        try {
            const {
                story_scene_id,
                label,
                next_scene_id,
                requires_test,
                test_attribute,
                test_difficulty,
                success_scene_id,
                failure_scene_id
            } = req.body;

            await StoryChoice.update(
                {
                    story_scene_id: story_scene_id || null,
                    label,
                    next_scene_id: next_scene_id || null,
                    requires_test: requires_test === 'on',
                    test_attribute: test_attribute || null,
                    test_difficulty: test_difficulty || null,
                    success_scene_id: success_scene_id || null,
                    failure_scene_id: failure_scene_id || null
                },
                { where: { id: req.params.id } }
            );

            return res.redirect('/admin/story-choices');
        } catch (error) {
            console.error('Erro ao atualizar story choice:', error);
            return res.status(500).send('Erro ao atualizar story choice.');
        }
    },

    // EXCLUIR – GET /admin/story-choices/:id/delete
    async destroy(req, res) {
        try {
            await StoryChoice.destroy({ where: { id: req.params.id } });
            return res.redirect('/admin/story-choices');
        } catch (error) {
            console.error('Erro ao excluir story choice:', error);
            return res.status(500).send('Erro ao excluir story choice.');
        }
    }
};
