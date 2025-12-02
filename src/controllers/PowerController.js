const Power = require('../models/Power');
const Discipline = require('../models/Discipline');
const Effect = require('../models/Effect');
const PowerEffect = require('../models/PowerEffect');

const PowerController = {
    index: async (req, res) => {
        try {
            const powers = await Power.findAll({
                include: [{ model: Discipline, as: 'discipline' }],
                order: [['name', 'ASC']]
            });
            res.render('admin/powers/index', { powers, user: req.session.user });
        } catch (error) {
            console.error('Error fetching powers:', error);
            res.status(500).send('Erro ao buscar poderes');
        }
    },

    newForm: async (req, res) => {
        try {
            const disciplines = await Discipline.findAll({ order: [['name', 'ASC']] });
            const effects = await Effect.findAll({ order: [['name', 'ASC']] });

            res.render('admin/powers/form', {
                power: {},
                disciplines,
                effects,
                user: req.session.user,
                title: 'Novo Poder',
                action: '/admin/powers'
            });
        } catch (error) {
            console.error('Error loading new power form:', error);
            res.status(500).send('Erro ao carregar formulário');
        }
    },

    create: async (req, res) => {
        try {
            const { name, discipline_id, required_affinity, description, effect, icon, power_effects } = req.body;

            const newPower = await Power.create({
                name,
                discipline_id,
                required_affinity,
                description,
                effect, // Now just flavor text
                icon
            });

            // Handle Effects
            if (power_effects) {
                const effectsData = JSON.parse(power_effects); // Expecting JSON string from frontend
                if (Array.isArray(effectsData) && effectsData.length > 0) {
                    const bulkData = effectsData.map(pe => ({
                        power_id: newPower.id,
                        effect_id: pe.effect_id,
                        chance: pe.chance || 100,
                        override_value: pe.override_value || null
                    }));
                    await PowerEffect.bulkCreate(bulkData);
                }
            }

            res.redirect('/admin/powers');
        } catch (error) {
            console.error('Error creating power:', error);
            res.status(500).send('Erro ao criar poder');
        }
    },

    editForm: async (req, res) => {
        try {
            const { id } = req.params;
            const power = await Power.findByPk(id, {
                include: [{
                    model: Effect,
                    as: 'effects',
                    through: { attributes: ['chance', 'override_value'] }
                }]
            });

            if (!power) {
                return res.status(404).send('Poder não encontrado');
            }

            const disciplines = await Discipline.findAll({ order: [['name', 'ASC']] });
            const effects = await Effect.findAll({ order: [['name', 'ASC']] });

            res.render('admin/powers/form', {
                power,
                disciplines,
                effects,
                user: req.session.user,
                title: 'Editar Poder',
                action: `/admin/powers/${id}`
            });
        } catch (error) {
            console.error('Error loading edit power form:', error);
            res.status(500).send('Erro ao carregar formulário');
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, discipline_id, required_affinity, description, effect, icon, power_effects } = req.body;

            const power = await Power.findByPk(id);
            if (!power) {
                return res.status(404).send('Poder não encontrado');
            }

            await power.update({
                name,
                discipline_id,
                required_affinity,
                description,
                effect,
                icon
            });

            // Update Effects (Clear and Re-add)
            await PowerEffect.destroy({ where: { power_id: id } });

            if (power_effects) {
                const effectsData = JSON.parse(power_effects);
                if (Array.isArray(effectsData) && effectsData.length > 0) {
                    const bulkData = effectsData.map(pe => ({
                        power_id: id,
                        effect_id: pe.effect_id,
                        chance: pe.chance || 100,
                        override_value: pe.override_value || null
                    }));
                    await PowerEffect.bulkCreate(bulkData);
                }
            }

            res.redirect('/admin/powers');
        } catch (error) {
            console.error('Error updating power:', error);
            res.status(500).send('Erro ao atualizar poder');
        }
    },

    destroy: async (req, res) => {
        try {
            const { id } = req.params;
            const power = await Power.findByPk(id);

            if (power) {
                await PowerEffect.destroy({ where: { power_id: id } });
                await power.destroy();
            }

            res.redirect('/admin/powers');
        } catch (error) {
            console.error('Error deleting power:', error);
            res.status(500).send('Erro ao excluir poder');
        }
    }
};

module.exports = PowerController;
