const Npc = require('../models/Npc');

const NpcController = {
    // List all NPCs
    index: async (req, res) => {
        try {
            const npcs = await Npc.findAll({ order: [['name', 'ASC']] });
            res.render('admin/npcs/index', { npcs, user: req.session.user });
        } catch (error) {
            console.error('Error listing NPCs:', error);
            res.status(500).send('Erro ao listar NPCs');
        }
    },

    // Show NPC details
    show: async (req, res) => {
        try {
            const { id } = req.params;
            const npc = await Npc.findByPk(id);
            if (!npc) {
                return res.status(404).send('NPC não encontrado');
            }
            res.render('admin/npcs/show', { npc, user: req.session.user });
        } catch (error) {
            console.error('Error showing NPC:', error);
            res.status(500).send('Erro ao exibir NPC');
        }
    },

    // Show create form
    newForm: async (req, res) => {
        res.render('admin/npcs/form', { npc: null, user: req.session.user });
    },

    // Create new NPC
    create: async (req, res) => {
        try {
            const data = req.body;

            // Handle checkboxes for boolean fields if necessary (though HTML sends 'on' or nothing, usually handled by body parser or manual check)
            data.participates_in_battle = data.participates_in_battle === 'on' || data.participates_in_battle === true;

            await Npc.create(data);
            res.redirect('/admin/npcs');
        } catch (error) {
            console.error('Error creating NPC:', error);
            res.status(500).send('Erro ao criar NPC');
        }
    },

    // Show edit form
    editForm: async (req, res) => {
        try {
            const { id } = req.params;
            const npc = await Npc.findByPk(id);
            if (!npc) {
                return res.status(404).send('NPC não encontrado');
            }
            res.render('admin/npcs/form', { npc, user: req.session.user });
        } catch (error) {
            console.error('Error editing NPC:', error);
            res.status(500).send('Erro ao editar NPC');
        }
    },

    // Update NPC
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const data = req.body;

            const npc = await Npc.findByPk(id);
            if (!npc) {
                return res.status(404).send('NPC não encontrado');
            }

            // Handle boolean
            data.participates_in_battle = data.participates_in_battle === 'on' || data.participates_in_battle === true;
            // If checkbox is unchecked, it might not be sent, so we need to handle that if we were strictly binding. 
            // But here we are passing `data` which comes from req.body. 
            // If unchecked, req.body.participates_in_battle is undefined. 
            // We should explicitly set it to false if undefined, OR handle it carefully.
            // A safer way for checkboxes:
            data.participates_in_battle = !!req.body.participates_in_battle;

            await npc.update(data);
            res.redirect('/admin/npcs');
        } catch (error) {
            console.error('Error updating NPC:', error);
            res.status(500).send('Erro ao atualizar NPC');
        }
    },

    // Delete NPC
    destroy: async (req, res) => {
        try {
            const { id } = req.params;
            const npc = await Npc.findByPk(id);
            if (npc) {
                await npc.destroy();
            }
            res.redirect('/admin/npcs');
        } catch (error) {
            console.error('Error deleting NPC:', error);
            res.status(500).send('Erro ao deletar NPC');
        }
    }
};

module.exports = NpcController;
