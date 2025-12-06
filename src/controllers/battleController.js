// controllers/battleController.js
const Character = require('../models/Character');
const Npc = require('../models/Npc');

module.exports = {
    async showBattle(req, res) {
        try {
            const userId = req.session.userId;
            if (!userId) {
                return res.redirect('/login');
            }

            // 1) Buscar o personagem do jogador
            const character = await Character.findOne({
                where: { user_id: userId }
            });

            if (!character) {
                return res.redirect('/player/characters/new');
            }


            // 2) Escolher o NPC (por enquanto, pega o primeiro que participa de batalha)
            const npc = await Npc.findOne({
                where: { participates_in_battle: 1 }
            });

            // 3) Renderizar a view de batalha
            res.render('player/battle', {
                character,
                npc
            });

        } catch (error) {
            console.error('Error in showBattle:', error);
            res.status(500).send('Erro ao carregar batalha.');
        }
    }
};
