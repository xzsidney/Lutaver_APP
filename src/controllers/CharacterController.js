const Character = require('../models/Character');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

const MAX_CHARACTERS_PER_USER = process.env.MAX_CHARACTERS_PER_USER || 1;

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
                activeCharacterId: req.session.activeCharacterId || null,
                maxCharacters: MAX_CHARACTERS_PER_USER
            });
        } catch (error) {
            console.error('Error loading characters:', error);
            return res.status(500).send('Erro ao carregar personagens');
        }
    },

    // Exibir formulário de criação
    async create(req, res) {
        try {
            const userId = req.session.user.id;
            const count = await Character.count({ where: { user_id: userId } });

            if (count >= MAX_CHARACTERS_PER_USER) {
                return res.redirect('/player/characters');
            }

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

            // Validate character limit
            const count = await Character.count({ where: { user_id: userId } });
            if (count >= MAX_CHARACTERS_PER_USER) {
                return res.status(403).render('player/character/index', {
                    layout: 'layouts/player',
                    title: 'Meus Personagens',
                    user: req.session.user,
                    characters: await Character.findAll({ where: { user_id: userId } }),
                    activeCharacterId: req.session.activeCharacterId || null,
                    maxCharacters: MAX_CHARACTERS_PER_USER,
                    error: 'Limite de personagens atingido.'
                });
            }

            const { name } = req.body;
            // Forçar 1º Ano sempre na criação
            const school_year = 1;

            // Validação básica
            if (!name) {
                return res.render('player/character/new', {
                    layout: 'layouts/player',
                    title: 'Criar Personagem',
                    user: req.session.user,
                    error: 'Nome do personagem é obrigatório'
                });
            }

            // Pegar atributos do body, convertendo para inteiro e garantindo mínimo 1
            const strength = parseInt(req.body.strength) || 1;
            const dexterity = parseInt(req.body.dexterity) || 1;
            const constitution = parseInt(req.body.constitution) || 1;
            const intelligence = parseInt(req.body.intelligence) || 1;
            const reasoning = parseInt(req.body.reasoning) || 1;
            const luck = parseInt(req.body.luck) || 1;

            // Validar total de pontos
            // Base = 6 (1 para cada um dos 6 atributos)
            // Pontos extras = 10
            // Total permitido = 16
            const totalStats = strength + dexterity + constitution + intelligence + reasoning + luck;
            if (totalStats !== 16) {
                return res.render('player/character/new', {
                    layout: 'layouts/player',
                    title: 'Criar Personagem',
                    user: req.session.user,
                    error: 'A soma dos atributos deve utilizar exatamente os 10 pontos disponíveis.'
                });
            }

            const character = await Character.create({
                user_id: userId,
                name,
                school_year,
                level: 1,
                total_xp: 0,
                coins: 100, // Moedas iniciais
                strength,
                dexterity,
                constitution,
                intelligence,
                reasoning,
                luck,
                evolution_points: 0 // Pontos já foram distribuídos na criação
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
