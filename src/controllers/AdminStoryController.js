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
    }
};
