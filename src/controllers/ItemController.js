const Item = require('../models/Item');
const Effect = require('../models/Effect');

module.exports = {
    // LISTA – GET /admin/items
    async index(req, res) {
        try {
            const items = await Item.findAll({
                include: [
                    { model: Effect, as: 'effect' }
                ],
                order: [['id', 'ASC']]
            });

            return res.render('admin/items/index', {
                title: 'Itens - Painel Admin',
                items
            });
        } catch (error) {
            console.error('Erro ao carregar itens:', error);
            return res.status(500).send('Erro ao carregar itens.');
        }
    },

    // FORM NOVO – GET /admin/items/new
    async create(req, res) {
        try {
            const effects = await Effect.findAll({
                order: [['name', 'ASC']]
            });

            return res.render('admin/items/new', {
                title: 'Novo Item',
                effects
            });
        } catch (error) {
            console.error('Erro ao carregar formulário de item:', error);
            return res.status(500).send('Erro ao carregar formulário.');
        }
    },

    // SALVAR – POST /admin/items
    async store(req, res) {
        try {
            const {
                name,
                description,
                price,
                rarity,
                effect_id,
                is_consumable,
                is_active
            } = req.body;

            await Item.create({
                name,
                description,
                price: price || 0,
                rarity: rarity || null,
                effect_id: effect_id || null,
                is_consumable: is_consumable === 'on',
                is_active: is_active === 'on'
            });

            return res.redirect('/admin/items');
        } catch (error) {
            console.error('Erro ao criar item:', error);
            return res.status(500).send('Erro ao criar item.');
        }
    },

    // FORM EDIT – GET /admin/items/:id/edit
    async edit(req, res) {
        try {
            const item = await Item.findByPk(req.params.id, {
                include: [{ model: Effect, as: 'effect' }]
            });

            if (!item) {
                return res.status(404).send('Item não encontrado.');
            }

            const effects = await Effect.findAll({
                order: [['name', 'ASC']]
            });

            return res.render('admin/items/edit', {
                title: 'Editar Item',
                item,
                effects
            });
        } catch (error) {
            console.error('Erro ao carregar item para edição:', error);
            return res.status(500).send('Erro ao carregar item.');
        }
    },

    // ATUALIZAR – POST /admin/items/:id
    async update(req, res) {
        try {
            const {
                name,
                description,
                price,
                rarity,
                effect_id,
                is_consumable,
                is_active
            } = req.body;

            await Item.update(
                {
                    name,
                    description,
                    price: price || 0,
                    rarity: rarity || null,
                    effect_id: effect_id || null,
                    is_consumable: is_consumable === 'on',
                    is_active: is_active === 'on'
                },
                { where: { id: req.params.id } }
            );

            return res.redirect('/admin/items');
        } catch (error) {
            console.error('Erro ao atualizar item:', error);
            return res.status(500).send('Erro ao atualizar item.');
        }
    },

    // EXCLUIR – GET /admin/items/:id/delete
    async destroy(req, res) {
        try {
            await Item.destroy({ where: { id: req.params.id } });
            return res.redirect('/admin/items');
        } catch (error) {
            console.error('Erro ao excluir item:', error);
            return res.status(500).send('Erro ao excluir item.');
        }
    }
};
