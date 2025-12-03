const Power = require('../models/Power');
const Discipline = require('../models/Discipline');
const Effect = require('../models/Effect');

module.exports = {

    // LISTA – GET /admin/powers
    async index(req, res) {
        try {
            const powers = await Power.findAll({
                include: [
                    { model: Discipline, as: 'discipline' },
                    { model: Effect, as: 'effects' } // se a associação Many-to-Many com alias "effects" estiver configurada
                ],
                order: [['id', 'ASC']]
            });

            return res.render('admin/powers/index', {
                title: 'Poderes - Painel Admin',
                powers
            });
        } catch (error) {
            console.error('Erro ao carregar poderes:', error);
            return res.status(500).send('Erro ao carregar poderes.');
        }
    },

    // FORM NOVO – GET /admin/powers/new
    async create(req, res) {
        try {
            const disciplines = await Discipline.findAll({
                order: [['name', 'ASC']]
            });

            const effects = await Effect.findAll({
                order: [['name', 'ASC']]
            });

            return res.render('admin/powers/new', {
                title: 'Novo Poder',
                disciplines,
                effects
            });
        } catch (error) {
            console.error('Erro ao carregar formulário de poder:', error);
            return res.status(500).send('Erro ao carregar formulário.');
        }
    },

    // SALVAR – POST /admin/powers
    async store(req, res) {
        try {
            const {
                name,
                description,
                discipline_id,
                power_type,
                mana_cost,
                cooldown,
                base_damage,
                is_active
            } = req.body;

            const power = await Power.create({
                name,
                description,
                discipline_id: discipline_id || null,
                power_type: power_type || null,
                mana_cost: mana_cost || 0,
                cooldown: cooldown || 0,
                base_damage: base_damage || 0,
                is_active: is_active === 'on'
            });

            // ⚠️ Se quiser vincular efeitos aqui (Many-to-Many),
            // você pode tratar `req.body.effects_ids` depois.
            // Exemplo: await power.setEffects([...ids])

            return res.redirect('/admin/powers');
        } catch (error) {
            console.error('Erro ao criar poder:', error);
            return res.status(500).send('Erro ao criar poder.');
        }
    },

    // FORM EDITAR – GET /admin/powers/:id/edit
    async edit(req, res) {
        try {
            const power = await Power.findByPk(req.params.id, {
                include: [
                    { model: Discipline, as: 'discipline' },
                    { model: Effect, as: 'effects' }
                ]
            });

            if (!power) {
                return res.status(404).send('Poder não encontrado.');
            }

            const disciplines = await Discipline.findAll({
                order: [['name', 'ASC']]
            });

            const effects = await Effect.findAll({
                order: [['name', 'ASC']]
            });

            return res.render('admin/powers/edit', {
                title: 'Editar Poder',
                power,
                disciplines,
                effects
            });
        } catch (error) {
            console.error('Erro ao carregar poder para edição:', error);
            return res.status(500).send('Erro ao carregar poder.');
        }
    },

    // ATUALIZAR – POST /admin/powers/:id
    async update(req, res) {
        try {
            const {
                name,
                description,
                discipline_id,
                power_type,
                mana_cost,
                cooldown,
                base_damage,
                is_active
            } = req.body;

            await Power.update(
                {
                    name,
                    description,
                    discipline_id: discipline_id || null,
                    power_type: power_type || null,
                    mana_cost: mana_cost || 0,
                    cooldown: cooldown || 0,
                    base_damage: base_damage || 0,
                    is_active: is_active === 'on'
                },
                { where: { id: req.params.id } }
            );

            // ⚠️ Se tiver Many-to-Many com Effect, aqui você também pode
            // atualizar a lista de efeitos relacionados.

            return res.redirect('/admin/powers');
        } catch (error) {
            console.error('Erro ao atualizar poder:', error);
            return res.status(500).send('Erro ao atualizar poder.');
        }
    },

    // EXCLUIR – GET /admin/powers/:id/delete
    async destroy(req, res) {
        try {
            await Power.destroy({ where: { id: req.params.id } });
            return res.redirect('/admin/powers');
        } catch (error) {
            console.error('Erro ao excluir poder:', error);
            return res.status(500).send('Erro ao excluir poder.');
        }
    }
};
