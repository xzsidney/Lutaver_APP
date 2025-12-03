const Npc = require('../models/Npc');

module.exports = {
    // LISTA – GET /admin/npcs
    async index(req, res) {
        try {
            const npcs = await Npc.findAll({
                order: [['id', 'ASC']]
            });

            return res.render('admin/npcs/index', {
                title: 'NPCs - Painel Admin',
                npcs
            });
        } catch (error) {
            console.error('Erro ao carregar NPCs:', error);
            return res.status(500).send('Erro ao carregar NPCs.');
        }
    },

    // FORM NOVO – GET /admin/npcs/new
    async create(req, res) {
        try {
            return res.render('admin/npcs/new', {
                title: 'Novo NPC'
            });
        } catch (error) {
            console.error('Erro ao carregar formulário de NPC:', error);
            return res.status(500).send('Erro ao carregar formulário.');
        }
    },

    // SALVAR – POST /admin/npcs
    async store(req, res) {
        try {
            const {
                name,
                npc_type,
                role,
                mood,
                description,
                location,
                is_active
            } = req.body;

            await Npc.create({
                name,
                npc_type: npc_type || null,
                role: role || null,
                mood: mood || null,
                description,
                location: location || null,
                is_active: is_active === 'on'
            });

            return res.redirect('/admin/npcs');
        } catch (error) {
            console.error('Erro ao criar NPC:', error);
            return res.status(500).send('Erro ao criar NPC.');
        }
    },

    // FORM EDIT – GET /admin/npcs/:id/edit
    async edit(req, res) {
        try {
            const npc = await Npc.findByPk(req.params.id);

            if (!npc) {
                return res.status(404).send('NPC não encontrado.');
            }

            return res.render('admin/npcs/edit', {
                title: 'Editar NPC',
                npc
            });
        } catch (error) {
            console.error('Erro ao carregar NPC para edição:', error);
            return res.status(500).send('Erro ao carregar NPC.');
        }
    },

    // ATUALIZAR – POST /admin/npcs/:id
    async update(req, res) {
        try {
            const {
                name,
                npc_type,
                role,
                mood,
                description,
                location,
                is_active
            } = req.body;

            await Npc.update(
                {
                    name,
                    npc_type: npc_type || null,
                    role: role || null,
                    mood: mood || null,
                    description,
                    location: location || null,
                    is_active: is_active === 'on'
                },
                { where: { id: req.params.id } }
            );

            return res.redirect('/admin/npcs');
        } catch (error) {
            console.error('Erro ao atualizar NPC:', error);
            return res.status(500).send('Erro ao atualizar NPC.');
        }
    },

    // EXCLUIR – GET /admin/npcs/:id/delete
    async destroy(req, res) {
        try {
            await Npc.destroy({ where: { id: req.params.id } });
            return res.redirect('/admin/npcs');
        } catch (error) {
            console.error('Erro ao excluir NPC:', error);
            return res.status(500).send('Erro ao excluir NPC.');
        }
    }
};
