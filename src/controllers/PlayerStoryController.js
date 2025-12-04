const Story = require('../models/Story');
const StoryScene = require('../models/StoryScene');
const StoryChoice = require('../models/StoryChoice');
const Character = require('../models/Character');
const CharacterItem = require('../models/CharacterItem');
const CharacterAffinity = require('../models/CharacterAffinity');
const Npc = require('../models/Npc');
const Item = require('../models/Item');
const Question = require('../models/Question');

const PlayerStoryController = {
    /**
     * Lista todas as histórias disponíveis
     * Filtra por nível do personagem ativo
     */
    index: async (req, res) => {
        try {
            const user = req.session.user;

            // Buscar personagem ativo do jogador
            let activeCharacter = null;
            if (req.session.activeCharacterId) {
                activeCharacter = await Character.findByPk(req.session.activeCharacterId);
            } else {
                // Se não tem personagem ativo, pegar o primeiro do usuário
                activeCharacter = await Character.findOne({
                    where: { user_id: user.id },
                    order: [['createdAt', 'ASC']]
                });
            }

            // Buscar histórias ativas
            let stories = await Story.findAll({
                where: { is_active: true },
                order: [['required_grade', 'ASC'], ['title', 'ASC']]
            });

            // Filtrar por nível do personagem (se houver)
            if (activeCharacter && activeCharacter.school_year) {
                stories = stories.filter(story => {
                    return !story.required_grade || story.required_grade <= activeCharacter.school_year;
                });
            }

            res.render('player/story/index', {
                user,
                character: activeCharacter,
                stories
            });
        } catch (error) {
            console.error('Error listing stories:', error);
            res.status(500).send('Erro ao listar histórias.');
        }
    },

    /**
     * Jogar história - carrega a cena atual
     * Se é a primeira vez, carrega a cena inicial
     */
    play: async (req, res) => {
        try {
            const { storyId } = req.params;
            const user = req.session.user;

            // Buscar história
            const story = await Story.findByPk(storyId);
            if (!story) {
                return res.status(404).send('História não encontrada.');
            }

            // Buscar personagem ativo
            let activeCharacter = null;
            if (req.session.activeCharacterId) {
                activeCharacter = await Character.findByPk(req.session.activeCharacterId);
            } else {
                activeCharacter = await Character.findOne({
                    where: { user_id: user.id },
                    order: [['createdAt', 'ASC']]
                });
            }

            if (!activeCharacter) {
                return res.status(404).send('Personagem não encontrado. Crie um personagem primeiro.');
            }

            // Determinar qual cena mostrar
            // Por simplicidade, sempre começamos pela cena inicial
            // Em uma versão futura, podemos salvar o progresso
            let currentSceneId = story.starting_scene_id;

            // Se a cena está sendo passada por query (após uma escolha), usar ela
            if (req.query.sceneId) {
                currentSceneId = parseInt(req.query.sceneId);
            }

            // Buscar cena atual
            const scene = await StoryScene.findOne({
                where: {
                    id: currentSceneId,
                    story_id: storyId
                }
            });

            if (!scene) {
                return res.status(404).send('Cena não encontrada.');
            }

            // Buscar NPC da cena (se houver)
            let npc = null;
            if (scene.npc_id) {
                npc = await Npc.findByPk(scene.npc_id);
            }

            // Buscar escolhas disponíveis nesta cena
            const choices = await StoryChoice.findAll({
                where: { story_scene_id: scene.id },
                order: [['id', 'ASC']]
            });

            // Buscar quiz (se houver) - Por enquanto não implementado
            // Pode ser adicionado futuramente linkando Question à cena
            const question = null;

            // Verificar se há informação de teste na sessão
            const testResult = req.session.storyTestResult || null;
            delete req.session.storyTestResult; // Limpar após usar

            res.render('player/story/play', {
                user,
                story,
                character: activeCharacter,
                scene,
                npc,
                choices,
                question,
                testResult
            });
        } catch (error) {
            console.error('Error playing story:', error);
            res.status(500).send('Erro ao carregar história.');
        }
    },

    /**
     * Processar escolha do jogador
     * Executa teste de atributo se necessário
     */
    choose: async (req, res) => {
        try {
            const { storyId, choiceId } = req.params;
            const user = req.session.user;

            // Buscar escolha
            const choice = await StoryChoice.findByPk(choiceId);
            if (!choice) {
                return res.status(404).send('Escolha não encontrada.');
            }

            // Buscar personagem ativo
            let activeCharacter = null;
            if (req.session.activeCharacterId) {
                activeCharacter = await Character.findByPk(req.session.activeCharacterId);
            } else {
                activeCharacter = await Character.findOne({
                    where: { user_id: user.id },
                    order: [['createdAt', 'ASC']]
                });
            }

            if (!activeCharacter) {
                return res.status(404).send('Personagem não encontrado.');
            }

            let nextSceneId = choice.next_scene_id;
            let testResult = null;

            // Verificar se a escolha requer teste de atributo
            if (choice.requires_test) {
                const testAttribute = choice.test_attribute;
                const difficulty = choice.test_difficulty;

                // Pegar valor do atributo do personagem
                const attributeValue = activeCharacter[testAttribute] || 0;

                // Rolar d10
                const d10 = Math.floor(Math.random() * 10) + 1;
                const total = d10 + attributeValue;

                // Determinar sucesso ou falha
                const success = total >= difficulty;

                // Determinar próxima cena baseado no resultado
                if (success) {
                    nextSceneId = choice.success_scene_id;
                    testResult = {
                        success: true,
                        message: `Você rolou ${d10} + ${attributeValue} (${testAttribute}) = ${total}. Sucesso! (Dificuldade: ${difficulty})`
                    };
                } else {
                    nextSceneId = choice.failure_scene_id;
                    testResult = {
                        success: false,
                        message: `Você rolou ${d10} + ${attributeValue} (${testAttribute}) = ${total}. Falha! (Dificuldade: ${difficulty})`
                    };
                }

                // Salvar resultado na sessão para mostrar na próxima página
                req.session.storyTestResult = testResult;
            }

            // Verificar se a próxima cena é final
            const nextScene = await StoryScene.findByPk(nextSceneId);
            if (nextScene && nextScene.is_ending) {
                // Redirecionar para tela de finalização
                return res.redirect(`/player/stories/${storyId}/finish`);
            }

            // Redirecionar para a próxima cena
            res.redirect(`/player/stories/${storyId}/play?sceneId=${nextSceneId}`);

        } catch (error) {
            console.error('Error choosing option:', error);
            res.status(500).send('Erro ao processar escolha.');
        }
    },

    /**
     * Tela de finalização da história
     * Aplica recompensas e mostra estatísticas
     */
    finish: async (req, res) => {
        try {
            const { storyId } = req.params;
            const user = req.session.user;

            // Buscar história
            const story = await Story.findByPk(storyId);
            if (!story) {
                return res.status(404).send('História não encontrada.');
            }

            // Buscar personagem ativo
            let activeCharacter = null;
            if (req.session.activeCharacterId) {
                activeCharacter = await Character.findByPk(req.session.activeCharacterId);
            } else {
                activeCharacter = await Character.findOne({
                    where: { user_id: user.id },
                    order: [['createdAt', 'ASC']]
                });
            }

            if (!activeCharacter) {
                return res.status(404).send('Personagem não encontrado.');
            }

            // Aplicar recompensas
            const oldXP = activeCharacter.total_xp;
            const oldCoins = activeCharacter.coins;
            const oldLevel = activeCharacter.level;

            activeCharacter.total_xp += story.reward_xp || 0;
            activeCharacter.coins += story.reward_coins || 0;

            // Verificar level up (XP necessário = level * 100)
            const xpForNextLevel = activeCharacter.level * 100;
            if (activeCharacter.total_xp >= xpForNextLevel) {
                activeCharacter.level += 1;
                activeCharacter.evolution_points += 5; // Bônus de pontos de evolução
            }

            await activeCharacter.save();

            // Processar item de recompensa (se houver)
            let rewardItem = null;
            if (story.reward_item_id) {
                rewardItem = await Item.findByPk(story.reward_item_id);

                if (rewardItem) {
                    // Verificar se o personagem já possui o item
                    const existingItem = await CharacterItem.findOne({
                        where: {
                            character_id: activeCharacter.id,
                            item_id: rewardItem.id
                        }
                    });

                    if (existingItem) {
                        // Incrementar quantidade
                        existingItem.quantity += 1;
                        await existingItem.save();
                    } else {
                        // Criar novo item no inventário
                        await CharacterItem.create({
                            character_id: activeCharacter.id,
                            item_id: rewardItem.id,
                            quantity: 1,
                            is_equipped: false
                        });
                    }
                }
            }

            // Preparar informações de recompensas
            const rewards = {
                xp: story.reward_xp || 0,
                coins: story.reward_coins || 0,
                item: rewardItem,
                leveledUp: activeCharacter.level > oldLevel
            };

            res.render('player/story/finish', {
                user,
                story,
                character: activeCharacter,
                rewards
            });

        } catch (error) {
            console.error('Error finishing story:', error);
            res.status(500).send('Erro ao finalizar história.');
        }
    }
};

module.exports = PlayerStoryController;
