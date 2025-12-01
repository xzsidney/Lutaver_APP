const Character = require('../models/Character');
const User = require('../models/User');

const AdminCharacterController = {
    /**
     * List all characters (Admin)
     */
    list: async (req, res) => {
        try {
            const characters = await Character.findAll({
                include: [{ model: User, as: 'user' }],
                order: [['createdAt', 'DESC']]
            });
            res.render('admin/characters/index', {
                characters,
                user: req.session.user
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao listar personagens');
        }
    },

    /**
     * Show character details (Admin)
     */
    show: async (req, res) => {
        try {
            const character = await Character.findByPk(req.params.id, {
                include: [
                    { model: User, as: 'user' },
                    {
                        model: require('../models/CharacterAffinity'),
                        as: 'affinities',
                        include: [{ model: require('../models/Discipline'), as: 'discipline' }]
                    },
                    {
                        model: require('../models/Power'),
                        as: 'powers'
                    }
                ]
            });

            if (!character) {
                return res.redirect('/admin/characters');
            }

            res.render('admin/characters/show', {
                character,
                user: req.session.user
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao exibir detalhes do personagem');
        }
    },

    /**
     * Delete character (Admin)
     */
    delete: async (req, res) => {
        try {
            await Character.destroy({ where: { id: req.params.id } });
            res.redirect('/admin/characters');
        } catch (error) {
            res.status(500).send('Erro ao excluir personagem');
        }
    }
};

module.exports = AdminCharacterController;
