const Effect = require('../models/Effect');

const EffectController = {
    // List all effects
    index: async (req, res) => {
        try {
            const effects = await Effect.findAll({
                order: [['name', 'ASC']]
            });

            res.render('admin/effects/index', {
                effects,
                user: req.session.user,
                title: 'Gerenciar Efeitos'
            });
        } catch (error) {
            console.error('Error fetching effects:', error);
            res.status(500).send('Erro ao buscar efeitos');
        }
    },

    // Show form for new effect
    newForm: async (req, res) => {
        try {
            res.render('admin/effects/form', {
                effect: {},
                user: req.session.user,
                title: 'Novo Efeito',
                action: '/admin/effects'
            });
        } catch (error) {
            console.error('Error loading new effect form:', error);
            res.status(500).send('Erro ao carregar formulário');
        }
    },

    // Create new effect
    create: async (req, res) => {
        try {
            const {
                name, effect_type, target_type, attribute_target,
                base_value, intensity_label, duration_type,
                duration_value, can_stack, description, icon
            } = req.body;

            // Basic validation
            if (!name || !effect_type || !target_type) {
                return res.redirect('/admin/effects/new');
            }

            await Effect.create({
                name,
                effect_type,
                target_type,
                attribute_target: attribute_target || null,
                base_value: base_value ? parseInt(base_value) : null,
                intensity_label: intensity_label || null,
                duration_type,
                duration_value: duration_value ? parseInt(duration_value) : null,
                can_stack: can_stack === 'on',
                description,
                icon: icon || '✨'
            });

            res.redirect('/admin/effects');
        } catch (error) {
            console.error('Error creating effect:', error);
            res.status(500).send('Erro ao criar efeito');
        }
    },

    // Show form for editing effect
    editForm: async (req, res) => {
        try {
            const { id } = req.params;
            const effect = await Effect.findByPk(id);

            if (!effect) {
                return res.status(404).send('Efeito não encontrado');
            }

            res.render('admin/effects/form', {
                effect,
                user: req.session.user,
                title: 'Editar Efeito',
                action: `/admin/effects/${id}`
            });
        } catch (error) {
            console.error('Error loading edit effect form:', error);
            res.status(500).send('Erro ao carregar formulário');
        }
    },

    // Update effect
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                name, effect_type, target_type, attribute_target,
                base_value, intensity_label, duration_type,
                duration_value, can_stack, description, icon
            } = req.body;

            const effect = await Effect.findByPk(id);
            if (!effect) {
                return res.status(404).send('Efeito não encontrado');
            }

            await effect.update({
                name,
                effect_type,
                target_type,
                attribute_target: attribute_target || null,
                base_value: base_value ? parseInt(base_value) : null,
                intensity_label: intensity_label || null,
                duration_type,
                duration_value: duration_value ? parseInt(duration_value) : null,
                can_stack: can_stack === 'on',
                description,
                icon
            });

            res.redirect('/admin/effects');
        } catch (error) {
            console.error('Error updating effect:', error);
            res.status(500).send('Erro ao atualizar efeito');
        }
    },

    // Delete effect
    destroy: async (req, res) => {
        try {
            const { id } = req.params;
            const effect = await Effect.findByPk(id);

            if (effect) {
                await effect.destroy();
            }

            res.redirect('/admin/effects');
        } catch (error) {
            console.error('Error deleting effect:', error);
            res.status(500).send('Erro ao excluir efeito');
        }
    }
};

module.exports = EffectController;
