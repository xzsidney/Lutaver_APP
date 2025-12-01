const Character = require('../models/Character');
const CharacterAffinity = require('../models/CharacterAffinity');
const Power = require('../models/Power');
const CharacterPower = require('../models/CharacterPower');
const Discipline = require('../models/Discipline');
const User = require('../models/User');

const MyCharacterController = {
    /**
     * List my characters
     */
    list: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const characters = await Character.findAll({
                where: { user_id: userId },
                order: [['createdAt', 'DESC']]
            });
            res.render('player/characters/index', {
                characters,
                user: req.session.user
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao listar seus personagens');
        }
    },

    /**
     * Show create form
     */
    createPage: (req, res) => {
        res.render('player/characters/form', {
            error: null,
            user: req.session.user,
            character: null
        });
    },

    /**
     * Create new character
     */
    create: async (req, res) => {
        const { name, school_year } = req.body;
        const userId = req.session.user.id;

        try {
            const character = await Character.create({
                name,
                school_year,
                user_id: userId,
                evolution_points: 10 // Bonus inicial
            });

            // Initialize affinities
            const disciplines = await Discipline.findAll({ where: { is_active: true } });
            for (const disc of disciplines) {
                await CharacterAffinity.create({
                    character_id: character.id,
                    discipline_id: disc.id,
                    affinity_level: 0
                });
            }

            res.redirect(`/my/characters/${character.id}`);
        } catch (error) {
            console.error(error);
            res.render('player/characters/form', {
                error: 'Erro ao criar personagem',
                user: req.session.user,
                character: null
            });
        }
    },

    /**
     * Show Character Sheet
     */
    show: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const characterId = req.params.id;

            const character = await Character.findOne({
                where: { id: characterId, user_id: userId },
                include: [
                    {
                        model: CharacterAffinity,
                        as: 'affinities',
                        include: [{ model: Discipline, as: 'discipline' }]
                    },
                    {
                        model: Power,
                        as: 'powers',
                        through: { attributes: [] }
                    }
                ]
            });

            if (!character) return res.status(403).send('Personagem não encontrado ou acesso negado');

            // Power logic (same as before)
            const allPowers = await Power.findAll({
                include: [{ model: Discipline, as: 'discipline' }]
            });

            const learnedPowerIds = character.powers.map(p => p.id);

            const availablePowers = allPowers.filter(power => {
                if (learnedPowerIds.includes(power.id)) return false;
                const affinity = character.affinities.find(a => a.discipline_id === power.discipline_id);
                const affinityLevel = affinity ? affinity.affinity_level : 0;
                return affinityLevel >= power.required_affinity;
            });

            const lockedPowers = allPowers.filter(power => {
                if (learnedPowerIds.includes(power.id)) return false;
                const affinity = character.affinities.find(a => a.discipline_id === power.discipline_id);
                const affinityLevel = affinity ? affinity.affinity_level : 0;
                return affinityLevel < power.required_affinity;
            });

            // Note: We are keeping the 'show' view in 'my/characters/show' or should we move it?
            // The plan said "Create index.ejs and form.ejs for 'My Characters' in views/player/characters/".
            // It didn't explicitly mention 'show.ejs' but it's likely needed.
            // The previous code rendered 'my/characters/show'.
            // I should probably move it to 'player/characters/show.ejs' as well for consistency.
            // But I haven't created it yet. I'll stick to the existing path if I don't create it, 
            // OR I should create it now.
            // Given I am overhauling, I should probably create it.
            // But for now, let's assume I'll create it in the next step or reuse if it exists.
            // Wait, I haven't created 'player/characters/show.ejs'.
            // I will render 'player/characters/show' and I will create it next.
            res.render('player/characters/show', {
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
     * Edit Page
     */
    editPage: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const character = await Character.findOne({
                where: { id: req.params.id, user_id: userId }
            });

            if (!character) return res.status(403).send('Acesso negado');

            res.render('player/characters/form', { character, error: null, user: req.session.user });
        } catch (error) {
            res.redirect('/my/characters');
        }
    },

    /**
     * Update Character
     */
    update: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const character = await Character.findOne({
                where: { id: req.params.id, user_id: userId }
            });

            if (!character) return res.status(403).send('Acesso negado');

            await character.update(req.body);
            res.redirect(`/my/characters/${req.params.id}`);
        } catch (error) {
            res.status(500).send('Erro ao atualizar');
        }
    },

    /**
     * Delete Character
     */
    delete: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const character = await Character.findOne({
                where: { id: req.params.id, user_id: userId }
            });

            if (!character) return res.status(403).send('Acesso negado');

            await character.destroy();
            res.redirect('/my/characters');
        } catch (error) {
            res.status(500).send('Erro ao excluir');
        }
    },

    /**
     * Upgrade Attribute
     */
    upgradeAttribute: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const character = await Character.findOne({
                where: { id: req.params.id, user_id: userId }
            });

            if (!character) return res.status(403).send('Acesso negado');

            const { attribute } = req.body;
            const validAttributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'reasoning', 'luck'];

            if (validAttributes.includes(attribute) && character.evolution_points > 0) {
                character[attribute] += 1;
                character.evolution_points -= 1;
                await character.save();
            }

            res.redirect(`/my/characters/${character.id}`);
        } catch (error) {
            res.status(500).send('Erro ao evoluir atributo');
        }
    },

    /**
     * Learn Power
     */
    learnPower: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const character = await Character.findOne({
                where: { id: req.params.id, user_id: userId },
                include: [{ model: CharacterAffinity, as: 'affinities' }]
            });

            if (!character) return res.status(403).send('Acesso negado');

            const { power_id } = req.body;
            const power = await Power.findByPk(power_id);
            if (!power) return res.status(404).send('Poder não encontrado');

            const affinity = character.affinities.find(a => a.discipline_id === power.discipline_id);
            const affinityLevel = affinity ? affinity.affinity_level : 0;

            if (affinityLevel >= power.required_affinity) {
                await CharacterPower.findOrCreate({
                    where: { character_id: character.id, power_id: power.id }
                });
            }

            res.redirect(`/my/characters/${character.id}`);
        } catch (error) {
            res.status(500).send('Erro ao aprender poder');
        }
    }
};

module.exports = MyCharacterController;
