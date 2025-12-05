const Story = require('../models/Story');
const Item = require('../models/Item');

module.exports = {
    // LISTA – GET /admin/stories
    async index(req, res) {
        try {
            const stories = await Story.findAll({
                include: [
                    { model: Item, as: 'rewardItem' }
                ],
                order: [['id', 'ASC']]
            });

            return res.render('admin/stories/index', {
                title: 'Histórias - Painel Admin',
                stories
            });
        } catch (error) {
            console.error('Erro ao carregar histórias (admin):', error);
            return res.status(500).send('Erro ao carregar histórias.');
        }
    },

    // FORM NOVA – GET /admin/stories/new
    async create(req, res) {
        try {
            const items = await Item.findAll({
                order: [['name', 'ASC']]
            });

            return res.render('admin/stories/new', {
                title: 'Nova História',
                items
            });
        } catch (error) {
            console.error('Erro ao carregar form de nova história:', error);
            return res.status(500).send('Erro ao carregar formulário.');
        }
    },

    // SALVAR – POST /admin/stories
    async store(req, res) {
        try {
            const {
                title,
                description,
                is_active,
                school_year,
                reward_xp,
                reward_coins,
                reward_item_id,
                starting_scene_id
            } = req.body;

            await Story.create({
                title,
                description,
                is_active: is_active === 'on',
                school_year: school_year || null,
                reward_xp: reward_xp || 0,
                reward_coins: reward_coins || 0,
                reward_item_id: reward_item_id || null,
                starting_scene_id: starting_scene_id || null
            });

            return res.redirect('/admin/stories');
        } catch (error) {
            console.error('Erro ao criar história:', error);
            return res.status(500).send('Erro ao criar história.');
        }
    },

    // FORM EDITAR – GET /admin/stories/:id/edit
    async edit(req, res) {
        try {
            const story = await Story.findByPk(req.params.id, {
                include: [{ model: Item, as: 'rewardItem' }]
            });

            if (!story) {
                return res.status(404).send('História não encontrada.');
            }

            const items = await Item.findAll({
                order: [['name', 'ASC']]
            });

            return res.render('admin/stories/edit', {
                title: 'Editar História',
                story,
                items
            });
        } catch (error) {
            console.error('Erro ao carregar história para edição:', error);
            return res.status(500).send('Erro ao carregar história.');
        }
    },

    // ATUALIZAR – POST /admin/stories/:id
    async update(req, res) {
        try {
            const {
                title,
                description,
                is_active,
                school_year,
                reward_xp,
                reward_coins,
                reward_item_id,
                starting_scene_id
            } = req.body;

            await Story.update(
                {
                    title,
                    description,
                    is_active: is_active === 'on',
                    school_year: school_year || null,
                    reward_xp: reward_xp || 0,
                    reward_coins: reward_coins || 0,
                    reward_item_id: reward_item_id || null,
                    starting_scene_id: starting_scene_id || null
                },
                { where: { id: req.params.id } }
            );

            return res.redirect('/admin/stories');
        } catch (error) {
            console.error('Erro ao atualizar história:', error);
            return res.status(500).send('Erro ao atualizar história.');
        }
    },

    // EXCLUIR – GET /admin/stories/:id/delete
    async destroy(req, res) {
        try {
            await Story.destroy({ where: { id: req.params.id } });
            return res.redirect('/admin/stories');
        } catch (error) {
            console.error('Erro ao excluir história:', error);
            return res.status(500).send('Erro ao excluir história.');
        }
    },

    // ============================================
    // STORY EDITOR - Visual Interface
    // ============================================

    // Editor visual da história
    async editor(req, res) {
        try {
            const { id } = req.params;
            const StoryScene = require('../models/StoryScene');
            const StoryChoice = require('../models/StoryChoice');
            const Npc = require('../models/Npc');

            const story = await Story.findByPk(id);
            if (!story) {
                return res.status(404).send('História não encontrada.');
            }

            // Buscar todas as cenas da história
            const scenes = await StoryScene.findAll({
                where: { story_id: id },
                include: [{ model: Npc, as: 'npc' }],
                order: [['id', 'ASC']]
            });

            // Para cada cena, buscar suas choices
            for (let scene of scenes) {
                scene.choices = await StoryChoice.findAll({
                    where: { story_scene_id: scene.id },
                    order: [['id', 'ASC']]
                });
            }

            // Buscar NPCs para selects
            const npcs = await Npc.findAll({ order: [['name', 'ASC']] });

            // Lista simplificada de cenas para selects de next_scene
            const allScenes = scenes.map(s => ({ id: s.id, title: s.title }));

            return res.render('admin/stories/editor', {
                title: `Editor: ${story.title}`,
                story,
                scenes: scenes.map(s => s.toJSON()),
                npcs,
                allScenes
            });
        } catch (error) {
            console.error('Erro ao carregar editor:', error);
            return res.status(500).send('Erro ao carregar editor.');
        }
    },

    // Atualizar dados gerais da história
    async updateGeneral(req, res) {
        try {
            const { id } = req.params;
            const { title, description, required_grade, time_limit, reward_xp, reward_coins, reward_item_id, starting_scene_id, is_active } = req.body;

            await Story.update({
                title,
                description,
                required_grade: required_grade || null,
                time_limit: time_limit || 480,
                reward_xp: reward_xp || 0,
                reward_coins: reward_coins || 0,
                reward_item_id: reward_item_id || null,
                starting_scene_id: starting_scene_id || null,
                is_active: is_active === 'on'
            }, { where: { id } });

            return res.redirect(`/admin/stories/${id}/editor`);
        } catch (error) {
            console.error('Erro ao atualizar história:', error);
            return res.status(500).send('Erro ao atualizar história.');
        }
    },

    // SCENES

    async createScene(req, res) {
        try {
            const { storyId } = req.params;
            const StoryScene = require('../models/StoryScene');
            const { title, text, npc_id, hint_text, time_cost, is_ending, ending_type } = req.body;

            const scene = await StoryScene.create({
                story_id: storyId,
                title: title || 'Nova Cena',
                text: text || 'Texto da cena...',
                npc_id: npc_id || null,
                hint_text: hint_text || null,
                time_cost: time_cost || 0,
                is_ending: is_ending === 'on',
                ending_type: ending_type || null
            });

            return res.json({ success: true, scene });
        } catch (error) {
            console.error('Erro ao criar cena:', error);
            return res.status(500).json({ success: false, message: 'Erro ao criar cena.' });
        }
    },

    async updateScene(req, res) {
        try {
            const { sceneId } = req.params;
            const StoryScene = require('../models/StoryScene');
            const { title, text, npc_id, hint_text, time_cost, is_ending, ending_type } = req.body;

            await StoryScene.update({
                title,
                text,
                npc_id: npc_id || null,
                hint_text: hint_text || null,
                time_cost: time_cost || 0,
                is_ending: is_ending === 'on',
                ending_type: ending_type || null
            }, { where: { id: sceneId } });

            return res.json({ success: true, message: 'Cena atualizada!' });
        } catch (error) {
            console.error('Erro ao atualizar cena:', error);
            return res.status(500).json({ success: false, message: 'Erro ao atualizar cena.' });
        }
    },

    async deleteScene(req, res) {
        try {
            const { sceneId } = req.params;
            const StoryScene = require('../models/StoryScene');
            const StoryChoice = require('../models/StoryChoice');

            // Deletar choices primeiro
            await StoryChoice.destroy({ where: { story_scene_id: sceneId } });

            // Deletar cena
            await StoryScene.destroy({ where: { id: sceneId } });

            return res.json({ success: true, message: 'Cena removida!' });
        } catch (error) {
            console.error('Erro ao deletar cena:', error);
            return res.status(500).json({ success: false, message: 'Erro ao deletar cena.' });
        }
    },

    // CHOICES

    async createChoice(req, res) {
        try {
            const { storyId } = req.params;
            const StoryChoice = require('../models/StoryChoice');
            const { story_scene_id, label, time_cost, requires_test, test_attribute, test_difficulty, next_scene_id, success_scene_id, failure_scene_id } = req.body;

            const choice = await StoryChoice.create({
                story_scene_id,
                label: label || 'Nova escolha',
                time_cost: time_cost || 0,
                requires_test: requires_test === 'on',
                test_attribute: test_attribute || null,
                test_difficulty: test_difficulty || null,
                next_scene_id: next_scene_id || null,
                success_scene_id: success_scene_id || null,
                failure_scene_id: failure_scene_id || null
            });

            return res.json({ success: true, choice });
        } catch (error) {
            console.error('Erro ao criar escolha:', error);
            return res.status(500).json({ success: false, message: 'Erro ao criar escolha.' });
        }
    },

    async updateChoice(req, res) {
        try {
            const { choiceId } = req.params;
            const StoryChoice = require('../models/StoryChoice');
            const { label, time_cost, requires_test, test_attribute, test_difficulty, next_scene_id, success_scene_id, failure_scene_id } = req.body;

            await StoryChoice.update({
                label,
                time_cost: time_cost || 0,
                requires_test: requires_test === 'on',
                test_attribute: test_attribute || null,
                test_difficulty: test_difficulty || null,
                next_scene_id: next_scene_id || null,
                success_scene_id: success_scene_id || null,
                failure_scene_id: failure_scene_id || null
            }, { where: { id: choiceId } });

            return res.json({ success: true, message: 'Escolha atualizada!' });
        } catch (error) {
            console.error('Erro ao atualizar escolha:', error);
            return res.status(500).json({ success: false, message: 'Erro ao atualizar escolha.' });
        }
    },

    async deleteChoice(req, res) {
        try {
            const { choiceId } = req.params;
            const StoryChoice = require('../models/StoryChoice');

            await StoryChoice.destroy({ where: { id: choiceId } });

            return res.json({ success: true, message: 'Escolha removida!' });
        } catch (error) {
            console.error('Erro ao deletar escolha:', error);
            return res.status(500).json({ success: false, message: 'Erro ao deletar escolha.' });
        }
    }
};
