const Story = require('../models/Story');
const StoryScene = require('../models/StoryScene');
const StoryChoice = require('../models/StoryChoice');
const StoryProgress = require('../models/StoryProgress');
const Character = require('../models/Character');
const CharacterItem = require('../models/CharacterItem');
const CharacterAffinity = require('../models/CharacterAffinity');
const Npc = require('../models/Npc');
const Item = require('../models/Item');
const Question = require('../models/Question');
const sequelize = require('../config/database');

// Valid attributes for test validation
const VALID_ATTRIBUTES = ['strength', 'dexterity', 'constitution', 'intelligence', 'reasoning', 'luck'];

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
     * Verifica se existe progresso salvo e oferece continuar
     */
    play: async (req, res) => {
        try {
            const { storyId } = req.params;
            const user = req.session.user;
            const forceRestart = req.query.restart === 'true';
            const continueGame = req.query.continue === 'true';

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

            // Buscar progresso existente (não completado)
            let progress = await StoryProgress.findOne({
                where: {
                    character_id: activeCharacter.id,
                    story_id: storyId,
                    is_completed: false
                }
            });

            // Se forceRestart, deletar progresso existente
            if (forceRestart && progress) {
                await progress.destroy();
                progress = null;
            }

            // Se existe progresso salvo e não está continuando, mostrar tela de resumo
            if (progress && progress.current_scene_id && !continueGame && !req.query.sceneId) {
                const savedScene = await StoryScene.findByPk(progress.current_scene_id);
                return res.render('player/story/resume', {
                    user,
                    story,
                    character: activeCharacter,
                    progress,
                    savedScene,
                    lastPlayed: progress.last_played_at
                });
            }

            // Determinar qual cena mostrar
            let currentSceneId = story.starting_scene_id;

            // Se continuando do progresso salvo
            if (continueGame && progress && progress.current_scene_id) {
                currentSceneId = progress.current_scene_id;
            }
            // Se a cena está sendo passada por query (após uma escolha)
            else if (req.query.sceneId) {
                currentSceneId = parseInt(req.query.sceneId);
            }

            // Se não existe progresso, criar um novo
            if (!progress) {
                progress = await StoryProgress.create({
                    character_id: activeCharacter.id,
                    story_id: storyId,
                    current_scene_id: currentSceneId,
                    is_completed: false,
                    scenes_visited: 1,
                    choices_history: [],
                    last_played_at: new Date()
                });
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
                testResult,
                progress // Passar progresso para mostrar informações de save
            });
        } catch (error) {
            console.error('Error playing story:', error);
            res.status(500).send('Erro ao carregar história.');
        }
    },
    /**
     * Processar escolha do jogador
     * Executa teste de atributo se necessário
     * Auto-salva progresso após cada escolha
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
                const testAttribute = choice.test_attribute?.toLowerCase();
                const difficulty = choice.test_difficulty;

                // Validate attribute
                if (!VALID_ATTRIBUTES.includes(testAttribute)) {
                    console.error(`Invalid test attribute: ${choice.test_attribute}`);
                    return res.status(400).send('Erro: Atributo de teste inválido configurado.');
                }

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

            // ========== AUTO-SAVE PROGRESS ==========
            // Buscar ou criar progresso
            let progress = await StoryProgress.findOne({
                where: {
                    character_id: activeCharacter.id,
                    story_id: storyId,
                    is_completed: false
                }
            });

            if (progress) {
                // Atualizar progresso existente
                const choicesHistory = progress.choices_history || [];
                choicesHistory.push({
                    choice_id: parseInt(choiceId),
                    scene_id: choice.story_scene_id,
                    next_scene_id: nextSceneId,
                    timestamp: new Date().toISOString(),
                    test_result: testResult ? testResult.success : null
                });

                progress.current_scene_id = nextSceneId;
                progress.scenes_visited = (progress.scenes_visited || 0) + 1;
                progress.choices_history = choicesHistory;
                progress.last_played_at = new Date();
                await progress.save();
            }
            // ========================================

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
     * Agora verifica se já completou para evitar exploit de recompensas
     */
    finish: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const { storyId } = req.params;
            const user = req.session.user;

            // Buscar história
            const story = await Story.findByPk(storyId);
            if (!story) {
                await transaction.rollback();
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
                await transaction.rollback();
                return res.status(404).send('Personagem não encontrado.');
            }

            // Verificar se já completou esta história com este personagem
            const existingProgress = await StoryProgress.findOne({
                where: {
                    character_id: activeCharacter.id,
                    story_id: storyId,
                    is_completed: true
                }
            });

            let rewards = {
                xp: 0,
                coins: 0,
                item: null,
                leveledUp: false,
                alreadyCompleted: false
            };

            if (existingProgress) {
                // Já completou antes - não dar recompensas novamente
                rewards.alreadyCompleted = true;
            } else {
                // Primeira conclusão - aplicar recompensas
                const oldLevel = activeCharacter.level;
                const xpReward = story.reward_xp || 0;
                const coinsReward = story.reward_coins || 0;

                activeCharacter.total_xp += xpReward;
                activeCharacter.coins += coinsReward;

                // Verificar level ups em loop (corrige bug de múltiplos níveis)
                let levelsGained = 0;
                while (activeCharacter.total_xp >= activeCharacter.level * 100) {
                    activeCharacter.level += 1;
                    activeCharacter.evolution_points += 5;
                    levelsGained++;
                }

                await activeCharacter.save({ transaction });

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
                            await existingItem.save({ transaction });
                        } else {
                            // Criar novo item no inventário
                            await CharacterItem.create({
                                character_id: activeCharacter.id,
                                item_id: rewardItem.id,
                                quantity: 1,
                                is_equipped: false
                            }, { transaction });
                        }
                    }
                }

                // Registrar progresso
                await StoryProgress.create({
                    character_id: activeCharacter.id,
                    story_id: storyId,
                    is_completed: true,
                    ending_type: 'success',
                    xp_earned: xpReward,
                    coins_earned: coinsReward,
                    item_rewarded: !!rewardItem,
                    completed_at: new Date()
                }, { transaction });

                // Preparar informações de recompensas
                rewards = {
                    xp: xpReward,
                    coins: coinsReward,
                    item: rewardItem,
                    leveledUp: activeCharacter.level > oldLevel,
                    levelsGained: levelsGained,
                    alreadyCompleted: false
                };
            }

            await transaction.commit();

            res.render('player/story/finish', {
                user,
                story,
                character: activeCharacter,
                rewards
            });

        } catch (error) {
            await transaction.rollback();
            console.error('Error finishing story:', error);
            res.status(500).send('Erro ao finalizar história.');
        }
    }
};

module.exports = PlayerStoryController;
