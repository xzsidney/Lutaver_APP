const Character = require('../models/Character');
const User = require('../models/User');
const Discipline = require('../models/Discipline');
const CharacterAffinity = require('../models/CharacterAffinity');

module.exports = {
    // LISTA – GET /admin/characters
    async index(req, res) {
        try {
            const characters = await Character.findAll({
                include: [
                    { model: User, as: 'user' },
                    {
                        model: CharacterAffinity,
                        as: 'affinities',
                        include: [{ model: Discipline, as: 'discipline' }]
                    }
                ],
                order: [['id', 'ASC']]
            });

            return res.render('admin/characters/index', {
                title: 'Personagens - Painel Admin',
                characters
            });
        } catch (error) {
            console.error('Erro ao carregar personagens:', error);
            return res.status(500).send('Erro ao carregar personagens.');
        }
    },

    // FORM NOVO – opcional (se quiser criar personagem pelo admin)
    async create(req, res) {
        try {
            const users = await User.findAll({ order: [['name', 'ASC']] });
            const disciplines = await Discipline.findAll({ order: [['name', 'ASC']] });

            return res.render('admin/characters/new', {
                title: 'Novo Personagem',
                users,
                disciplines
            });
        } catch (error) {
            console.error('Erro ao carregar form de personagem:', error);
            return res.status(500).send('Erro ao carregar formulário.');
        }
    },

    // SALVAR – opcional
    async store(req, res) {
        try {
            const {
                name,
                user_id,
                school_year,
                level,
                total_xp,
                coins,
                strength,
                dexterity,
                constitution,
                perception,
                cognition
            } = req.body;

            await Character.create({
                name,
                user_id,
                school_year: school_year || null,
                level: level || 1,
                total_xp: total_xp || 0,
                coins: coins || 0,
                strength: strength || 0,
                dexterity: dexterity || 0,
                constitution: constitution || 0,
                perception: perception || 0,
                cognition: cognition || 0
            });

            return res.redirect('/admin/characters');
        } catch (error) {
            console.error('Erro ao criar personagem:', error);
            return res.status(500).send('Erro ao criar personagem.');
        }
    },

    // FORM EDIT – opcional
    async edit(req, res) {
        try {
            const character = await Character.findByPk(req.params.id, {
                include: [{ model: User, as: 'user' }]
            });

            if (!character) {
                return res.status(404).send('Personagem não encontrado.');
            }

            const users = await User.findAll({ order: [['name', 'ASC']] });

            return res.render('admin/characters/edit', {
                title: 'Editar Personagem',
                character,
                users
            });
        } catch (error) {
            console.error('Erro ao carregar personagem para edição:', error);
            return res.status(500).send('Erro ao carregar personagem.');
        }
    },

    // ATUALIZAR – opcional
    async update(req, res) {
        try {
            const {
                name,
                user_id,
                school_year,
                level,
                total_xp,
                coins,
                strength,
                dexterity,
                constitution,
                perception,
                cognition
            } = req.body;

            await Character.update(
                {
                    name,
                    user_id,
                    school_year: school_year || null,
                    level: level || 1,
                    total_xp: total_xp || 0,
                    coins: coins || 0,
                    strength: strength || 0,
                    dexterity: dexterity || 0,
                    constitution: constitution || 0,
                    perception: perception || 0,
                    cognition: cognition || 0
                },
                { where: { id: req.params.id } }
            );

            return res.redirect('/admin/characters');
        } catch (error) {
            console.error('Erro ao atualizar personagem:', error);
            return res.status(500).send('Erro ao atualizar personagem.');
        }
    },

    // EXCLUIR – opcional
    async destroy(req, res) {
        try {
            await Character.destroy({ where: { id: req.params.id } });
            return res.redirect('/admin/characters');
        } catch (error) {
            console.error('Erro ao excluir personagem:', error);
            return res.status(500).send('Erro ao excluir personagem.');
        }
    }
};
