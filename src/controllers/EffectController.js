const Effect = require('../models/Effect');
const Power = require('../models/Power');

module.exports = {
    // LISTA – GET /admin/effects
    async index(req, res) {
        try {
            const effects = await Effect.findAll({
                order: [['id', 'ASC']]
            });

            return res.render('admin/effects/index', {
                title: 'Efeitos - Painel Admin',
                effects
            });
        } catch (error) {
            console.error('Erro ao carregar efeitos:', error);
            return res.status(500).send('Erro ao carregar efeitos.');
        }
    },

    // FORM NOVO – GET /admin/effects/new
    async create(req, res) {
        try {
            // Se quiser relacionar direto com poderes depois, pode carregar aqui:
            const powers = await Power.findAll({
                order: [['name', 'ASC']]
            });

            return res.render('admin/effects/new', {
                title: 'Novo Efeito',
                powers
            });
        } catch (error) {
            console.error('Erro ao carregar formulário de efeito:', error);
            return res.status(500).send('Erro ao carregar formulário.');
        }
    },

    // SALVAR – POST /admin/effects
    async store(req, res) {
        try {
            const {
                name,
                description,
                effect_type,
                value,
                duration,
                is_active
            } = req.body;

            await Effect.create({
                name,
                description,
                effect_type: effect_type || null,
                value: value || 0,
                duration: duration || 0,
                is_active: is_active === 'on'
            });

            return res.redirect('/admin/effects');
        } catch (error) {
            console.error('Erro ao criar efeito:', error);
            return res.status(500).send('Erro ao criar efeito.');
        }
    },

    // FORM EDIT – GET /admin/effects/:id/edit
    async edit(req, res) {
        try {
            const effect = await Effect.findByPk(req.params.id);

            if (!effect) {
                return res.status(404).send('Efeito não encontrado.');
            }

            const powers = await Power.findAll({
                order: [['name', 'ASC']]
            });

            return res.render('admin/effects/edit', {
                title: 'Editar Efeito',
                effect,
                powers
            });
        } catch (error) {
            console.error('Erro ao carregar efeito para edição:', error);
            return res.status(500).send('Erro ao carregar efeito.');
        }
    },

    // ATUALIZAR – POST /admin/effects/:id
    async update(req, res) {
        try {
            const {
                name,
                description,
                effect_type,
                value,
                duration,
                is_active
            } = req.body;

            await Effect.update(
                {
                    name,
                    description,
                    effect_type: effect_type || null,
                    value: value || 0,
                    duration: duration || 0,
                    is_active: is_active === 'on'
                },
                { where: { id: req.params.id } }
            );

            return res.redirect('/admin/effects');
        } catch (error) {
            console.error('Erro ao atualizar efeito:', error);
            return res.status(500).send('Erro ao atualizar efeito.');
        }
    },

    // EXCLUIR – GET /admin/effects/:id/delete
    async destroy(req, res) {
        try {
            await Effect.destroy({ where: { id: req.params.id } });
            return res.redirect('/admin/effects');
        } catch (error) {
            console.error('Erro ao excluir efeito:', error);
            return res.status(500).send('Erro ao excluir efeito.');
        }
    }
};
