const Character = require('../models/Character');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

module.exports = {
    // Listar personagens do jogador
    async index(req, res) {
        try {
            const userId = req.session.user.id;

            const characters = await Character.findAll({
                where: { user_id: userId },
                order: [['createdAt', 'ASC']]
            });

            return res.render('player/character/index', {
                layout: 'layouts/player',
                title: 'Meus Personagens',
                user: req.session.user,
                characters,
                activeCharacterId: req.session.activeCharacterId || null
            });
        } catch (error) {
            console.error('Error loading characters:', error);
            return res.status(500).send('Erro ao carregar personagens');
        }
    },

    // Exibir formulário de criação
    async create(req, res) {
        try {
            return res.render('player/character/new', {
                layout: 'layouts/player',
                title: 'Criar Personagem',
                user: req.session.user,
                error: null
            });
        } catch (error) {
            console.error('Error loading create form:', error);
            return res.status(500).send('Erro ao carregar formulário');
        }
    },

    // Salvar novo personagem
    async store(req, res) {
        try {
            const userId = req.session.user.id;
            const { name, school_year } = req.body;

            // Validação básica
            if (!name || !school_year) {
                return res.render('player/character/new', {
                    layout: 'layouts/player',
                    title: 'Criar Personagem',
                    user: req.session.user,
                    error: 'Nome e ano escolar são obrigatórios'
                });
            }

            const character = await Character.create({
                user_id: userId,
                name,
                school_year,
                level: 1,
                total_xp: 0,
                coins: 100, // Moedas iniciais
                strength: 1,
                dexterity: 1,
                constitution: 1,
                intelligence: 1,
                reasoning: 1,
                luck: 1,
                evolution_points: 10
            });

            // Definir como personagem ativo se for o primeiro
            if (!req.session.activeCharacterId) {
                req.session.activeCharacterId = character.id;
            }

            // Handle file upload
            if (req.file) {
                const oldPath = req.file.path;
                const extension = path.extname(req.file.originalname);
                const newPath = path.join('src/public/img/player', `${character.id}${extension}`);

                // Remove existing files with same ID but different extensions (cleanup)
                ['.jpg', '.jpeg', '.png', '.gif'].forEach(ext => {
                    const existingPath = path.join('src/public/img/player', `${character.id}${ext}`);
                    if (fs.existsSync(existingPath)) {
                        fs.unlinkSync(existingPath);
                    }
                });

                fs.renameSync(oldPath, newPath);
            }

            return res.redirect('/player/characters');
        } catch (error) {
            console.error('Error creating character:', error);
            return res.render('player/character/new', {
                layout: 'layouts/player',
                title: 'Criar Personagem',
                user: req.session.user,
                error: 'Erro ao criar personagem'
            });
        }
    },

    // Exibir detalhes do personagem
    async show(req, res) {
        try {
            const userId = req.session.user.id;
            const { id } = req.params;

            const character = await Character.findOne({
                where: { id, user_id: userId }
            });

            if (!character) {
                return res.status(404).send('Personagem não encontrado');
            }

            return res.render('player/character/show', {
                layout: 'layouts/player',
                title: character.name,
                user: req.session.user,
                character
            });
        } catch (error) {
            console.error('Error loading character:', error);
            return res.status(500).send('Erro ao carregar personagem');
        }
    },

    // Exibir formulário de edição
    async edit(req, res) {
        try {
            const userId = req.session.user.id;
            const { id } = req.params;

            const character = await Character.findOne({
                where: { id, user_id: userId }
            });

            if (!character) {
                return res.status(404).send('Personagem não encontrado');
            }

            return res.render('player/character/edit', {
                layout: 'layouts/player',
                title: 'Editar Personagem',
                user: req.session.user,
                character,
                error: null
            });
        } catch (error) {
            console.error('Error loading edit form:', error);
            return res.status(500).send('Erro ao carregar formulário');
        }
    },

    // Atualizar personagem
    async update(req, res) {
        try {
            const userId = req.session.user.id;
            const { id } = req.params;
            const { name, school_year } = req.body;

            const character = await Character.findOne({
                where: { id, user_id: userId }
            });

            if (!character) {
                return res.status(404).send('Personagem não encontrado');
            }

            await character.update({ name, school_year });

            // Handle file upload
            if (req.file) {
                const oldPath = req.file.path;
                const extension = path.extname(req.file.originalname);
                const newPath = path.join('src/public/img/player', `${character.id}${extension}`);

                // Remove existing files with same ID but different extensions (cleanup)
                ['.jpg', '.jpeg', '.png', '.gif'].forEach(ext => {
                    const existingPath = path.join('src/public/img/player', `${character.id}${ext}`);
                    if (fs.existsSync(existingPath)) {
                        fs.unlinkSync(existingPath);
                    }
                });

                fs.renameSync(oldPath, newPath);
            }

            return res.redirect(`/player/characters/${id}`);
        } catch (error) {
            console.error('Error updating character:', error);
            return res.status(500).send('Erro ao atualizar personagem');
        }
    },

    // Deletar personagem
    async destroy(req, res) {
        try {
            const userId = req.session.user.id;
            const { id } = req.params;

            const character = await Character.findOne({
                where: { id, user_id: userId }
            });

            if (!character) {
                return res.status(404).send('Personagem não encontrado');
            }

            await character.destroy();

            // Se era o personagem ativo, limpar da sessão
            if (req.session.activeCharacterId == id) {
                delete req.session.activeCharacterId;
            }

            return res.redirect('/player/characters');
        } catch (error) {
            console.error('Error deleting character:', error);
            return res.status(500).send('Erro ao deletar personagem');
        }
    },

    // Selecionar personagem ativo
    async selectActive(req, res) {
        try {
            const userId = req.session.user.id;
            const { characterId } = req.body;

            // Verificar se o personagem pertence ao usuário
            const character = await Character.findOne({
                where: { id: characterId, user_id: userId }
            });

            if (!character) {
                return res.status(404).send('Personagem não encontrado');
            }

            // Definir como ativo na sessão
            req.session.activeCharacterId = characterId;

            return res.redirect('/player/characters');
        } catch (error) {
            console.error('Error selecting character:', error);
            return res.status(500).send('Erro ao selecionar personagem');
        }
    },

    // Allocate evolution points to attributes
    async allocateAttribute(req, res) {
        try {
            const userId = req.session.user.id;
            const { characterId } = req.params;
            const { attribute } = req.body;

            // Valid attributes
            const validAttributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'reasoning', 'luck'];

            if (!validAttributes.includes(attribute)) {
                return res.status(400).json({ error: 'Atributo inválido' });
            }

            // Find character and verify ownership
            const character = await Character.findOne({
                where: { id: characterId, user_id: userId }
            });

            if (!character) {
                return res.status(404).json({ error: 'Personagem não encontrado' });
            }

            // Check if has evolution points
            if (character.evolution_points <= 0) {
                return res.status(400).json({ error: 'Sem pontos de evolução disponíveis' });
            }

            // Allocate point
            character[attribute] = character[attribute] + 1;
            character.evolution_points = character.evolution_points - 1;
            await character.save();

            return res.json({
                success: true,
                character: {
                    id: character.id,
                    evolution_points: character.evolution_points,
                    strength: character.strength,
                    dexterity: character.dexterity,
                    constitution: character.constitution,
                    intelligence: character.intelligence,
                    reasoning: character.reasoning,
                    luck: character.luck
                }
            });
        } catch (error) {
            console.error('Error allocating attribute:', error);
            return res.status(500).json({ error: 'Erro ao alocar atributo' });
        }
    }
};
