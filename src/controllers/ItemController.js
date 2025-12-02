const Item = require('../models/Item');
const Effect = require('../models/Effect');

const ItemController = {
    // List all items
    index: async (req, res) => {
        try {
            const { type, rarity } = req.query;
            const where = {};

            if (type) where.type = type;
            if (rarity) where.rarity = rarity;

            const items = await Item.findAll({
                where,
                include: [{ model: Effect, as: 'effect' }],
                order: [['rarity', 'DESC'], ['name', 'ASC']]
            });

            res.render('admin/items/index', {
                items,
                user: req.session.user,
                title: 'Gerenciar Itens',
                filters: { type, rarity }
            });
        } catch (error) {
            console.error('Error fetching items:', error);
            res.status(500).send('Erro ao buscar itens');
        }
    },

    // Show form for new item
    newForm: async (req, res) => {
        try {
            const effects = await Effect.findAll({ order: [['name', 'ASC']] });

            res.render('admin/items/form', {
                item: {},
                effects,
                user: req.session.user,
                title: 'Novo Item',
                action: '/admin/items'
            });
        } catch (error) {
            console.error('Error loading new item form:', error);
            res.status(500).send('Erro ao carregar formulário');
        }
    },

    // Create new item
    create: async (req, res) => {
        try {
            const {
                name, type, description, effect_id, bonus_json,
                price, rarity, icon, stackable, max_stack, slot, is_unique
            } = req.body;

            // Validation
            if (!name || !type) {
                return res.redirect('/admin/items/new');
            }

            // Equipment must have slot
            if (type === 'equipment' && !slot) {
                return res.redirect('/admin/items/new');
            }

            await Item.create({
                name,
                type,
                description,
                effect_id: effect_id || null,
                bonus_json: bonus_json ? JSON.parse(bonus_json) : null,
                price: parseInt(price) || 0,
                rarity,
                icon: icon || '📦',
                stackable: stackable === 'on',
                max_stack: stackable === 'on' ? parseInt(max_stack) || 99 : 1,
                slot: type === 'equipment' ? slot : null,
                is_unique: is_unique === 'on'
            });

            res.redirect('/admin/items');
        } catch (error) {
            console.error('Error creating item:', error);
            res.status(500).send('Erro ao criar item');
        }
    },

    // Show form for editing item
    editForm: async (req, res) => {
        try {
            const { id } = req.params;
            const item = await Item.findByPk(id, {
                include: [{ model: Effect, as: 'effect' }]
            });

            if (!item) {
                return res.status(404).send('Item não encontrado');
            }

            const effects = await Effect.findAll({ order: [['name', 'ASC']] });

            res.render('admin/items/form', {
                item,
                effects,
                user: req.session.user,
                title: 'Editar Item',
                action: `/admin/items/${id}`
            });
        } catch (error) {
            console.error('Error loading edit item form:', error);
            res.status(500).send('Erro ao carregar formulário');
        }
    },

    // Update item
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                name, type, description, effect_id, bonus_json,
                price, rarity, icon, stackable, max_stack, slot, is_unique
            } = req.body;

            const item = await Item.findByPk(id);
            if (!item) {
                return res.status(404).send('Item não encontrado');
            }

            await item.update({
                name,
                type,
                description,
                effect_id: effect_id || null,
                bonus_json: bonus_json ? JSON.parse(bonus_json) : null,
                price: parseInt(price) || 0,
                rarity,
                icon,
                stackable: stackable === 'on',
                max_stack: stackable === 'on' ? parseInt(max_stack) || 99 : 1,
                slot: type === 'equipment' ? slot : null,
                is_unique: is_unique === 'on'
            });

            res.redirect('/admin/items');
        } catch (error) {
            console.error('Error updating item:', error);
            res.status(500).send('Erro ao atualizar item');
        }
    },

    // Delete item
    destroy: async (req, res) => {
        try {
            const { id } = req.params;
            const item = await Item.findByPk(id);

            if (item) {
                await item.destroy();
            }

            res.redirect('/admin/items');
        } catch (error) {
            console.error('Error deleting item:', error);
            res.status(500).send('Erro ao excluir item');
        }
    }
};

module.exports = ItemController;
