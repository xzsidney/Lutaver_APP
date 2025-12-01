const Character = require('../models/Character');
const CharacterAffinity = require('../models/CharacterAffinity');
const Power = require('../models/Power');
const CharacterPower = require('../models/CharacterPower');
const Discipline = require('../models/Discipline');
const User = require('../models/User');

const CharacterController = {
    /**
     * List all characters
     */
    list: async (req, res) => {
        try {
            const characters = await Character.findAll({
                include: [{ model: User, as: 'user' }],
                order: [['createdAt', 'DESC']]
            });
            res.render('characters/list', {
                characters,
                user: req.session.user
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao listar personagens');
        }
    },

    /**
     * Show create form
     */
    createPage: (req, res) => {
        res.render('characters/new', {
            error: null,
            user: req.session.user
        });
    },

    /**
     * Create new character
     */
    create: async (req, res) => {
        const { name, school_year } = req.body;
        const userId = req.session.user.id; // Assume logged in user

        try {
            // Check if user already has a character (optional rule, but good for RPGs)
            // const existing = await Character.findOne({ where: { user_id: userId } });
            // if (existing) return res.render('characters/new', { error: 'Você já tem um personagem!', user: req.session.user });

            const character = await Character.create({
                name,
                school_year,
                user_id: userId,
                // Initial stats are default 1
                evolution_points: 10 // Bonus inicial
            });

            // Initialize affinities for all active disciplines
            const disciplines = await Discipline.findAll({ where: { is_active: true } });
            for (const disc of disciplines) {
                await CharacterAffinity.create({
                    character_id: character.id,
                    discipline_id: disc.id,
                    affinity_level: 0
                });
            }

            res.redirect(`/characters/${character.id}`);
        } catch (error) {
            console.error(error);
            res.render('characters/new', {
                error: 'Erro ao criar personagem',
                user: req.session.user
            });
        }
    },

    /**
     * Show Character Sheet (Minha Ficha)
     */
    show: async (req, res) => {
        try {
            const character = await Character.findByPk(req.params.id, {
                include: [
                    {
                        model: CharacterAffinity,
                        as: 'affinities',
                        include: [{ model: Discipline, as: 'discipline' }]
                    },
                    {
                        model: Power,
                        as: 'powers',
                        through: { attributes: [] } // Don't need join table data
                    }
                ]
            });

            if (!character) return res.redirect('/characters');

            // Fetch all available powers to check what can be learned
            const allPowers = await Power.findAll({
                include: [{ model: Discipline, as: 'discipline' }]
            });

            // Logic to determine available (learnable) powers
            // Power is available if:
            // 1. Not already learned
            // 2. Character has required affinity in that discipline
            const learnedPowerIds = character.powers.map(p => p.id);

            const availablePowers = allPowers.filter(power => {
                if (learnedPowerIds.includes(power.id)) return false; // Already learned

                const affinity = character.affinities.find(a => a.discipline_id === power.discipline_id);
                const affinityLevel = affinity ? affinity.affinity_level : 0;

                return affinityLevel >= power.required_affinity;
            });

            // Also get locked powers for display (optional)
            const lockedPowers = allPowers.filter(power => {
                if (learnedPowerIds.includes(power.id)) return false;
                const affinity = character.affinities.find(a => a.discipline_id === power.discipline_id);
                const affinityLevel = affinity ? affinity.affinity_level : 0;
                return affinityLevel < power.required_affinity;
            });

            res.render('characters/show', {
                character,
                availablePowers,
                lockedPowers,
                user: req.session.user
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao carregar ficha');
        }
    },

    /**
     * Upgrade Attribute
     */
    upgradeAttribute: async (req, res) => {
        const { id } = req.params;
        const { attribute } = req.body; // strength, dexterity, etc.

        const validAttributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'reasoning', 'luck'];
        if (!validAttributes.includes(attribute)) {
            return res.status(400).send('Atributo inválido');
        }

        try {
            const character = await Character.findByPk(id);
            if (!character) return res.status(404).send('Personagem não encontrado');

            if (character.evolution_points > 0) {
                character[attribute] += 1;
                character.evolution_points -= 1;
                await character.save();
            }

            res.redirect(`/characters/${id}`);
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao evoluir atributo');
        }
    },

    /**
     * Learn Power
     */
    learnPower: async (req, res) => {
        const { id } = req.params;
        const { power_id } = req.body;

        try {
            const character = await Character.findByPk(id, {
                include: [{ model: CharacterAffinity, as: 'affinities' }]
            });
            const power = await Power.findByPk(power_id);

            if (!character || !power) return res.status(404).send('Erro ao aprender poder');

            // Check affinity requirement
            const affinity = character.affinities.find(a => a.discipline_id === power.discipline_id);
            const affinityLevel = affinity ? affinity.affinity_level : 0;

            if (affinityLevel < power.required_affinity) {
                return res.status(400).send('Afinidade insuficiente');
            }

            // Check if already learned
            const alreadyLearned = await CharacterPower.findOne({
                where: { character_id: id, power_id: power_id }
            });

            if (!alreadyLearned) {
                await CharacterPower.create({
                    character_id: id,
                    power_id: power_id
                });
            }

            res.redirect(`/characters/${id}`);
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao aprender poder');
        }
    },

    // Edit and Delete methods would go here (standard CRUD)
    editPage: async (req, res) => {
        try {
            const character = await Character.findByPk(req.params.id);
            if (!character) return res.redirect('/characters');
            res.render('characters/edit', { character, error: null, user: req.session.user });
        } catch (error) {
            res.redirect('/characters');
        }
    },

    update: async (req, res) => {
        try {
            const character = await Character.findByPk(req.params.id);
            if (character) {
                await character.update(req.body);
            }
            res.redirect(`/characters/${req.params.id}`);
        } catch (error) {
            res.status(500).send('Erro ao atualizar');
        }
    },

    delete: async (req, res) => {
        try {
            await Character.destroy({ where: { id: req.params.id } });
            res.redirect('/characters');
        } catch (error) {
            res.status(500).send('Erro ao excluir');
        }
    }
};

module.exports = CharacterController;
