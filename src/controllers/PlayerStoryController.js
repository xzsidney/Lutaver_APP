const Story = require('../models/Story');
const StoryScene = require('../models/StoryScene');
const StoryChoice = require('../models/StoryChoice');
const StoryProgress = require('../models/StoryProgress');
const Character = require('../models/Character');
const CharacterItem = require('../models/CharacterItem');
const Npc = require('../models/Npc');
const Item = require('../models/Item');
const sequelize = require('../config/database');

// Import Services
const StoryTestService = require('../services/StoryTestService');
const StoryTimeService = require('../services/StoryTimeService');
const StoryRewardService = require('../services/StoryRewardService');

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

            // Para cada história, verificar se já completou
            const storiesWithProgress = await Promise.all(stories.map(async (story) => {
                const progress = await StoryProgress.findOne({
                    where: {
                        character_id: activeCharacter?.id,
                        story_id: story.id,
                        is_completed: true
                    }
                });

                return {
                    ...story.toJSON(),
                    isCompleted: !!progress
                };
            }));

            res.render('player/story/index', {
                user,
                character: activeCharacter,
                stories: storiesWithProgress
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
                    lastPlayed: progress.last_played_at,
                    timeRemaining: StoryTimeService.formatTimeDisplay(progress.time_remaining || 0),
                    timeStatus: StoryTimeService.getTimeStatus(progress.time_remaining || 0)
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
                    time_remaining: StoryTimeService.TOTAL_TIME,
                    locations_visited: [currentSceneId],
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

            // Verificar se há informação de teste na sessão
            const testResult = req.session.storyTestResult || null;
            delete req.session.storyTestResult; // Limpar após usar

            // Formatar tempo para exibição
            const timeRemaining = StoryTimeService.formatTimeDisplay(progress.time_remaining || 0);
            const timeStatus = StoryTimeService.getTimeStatus(progress.time_remaining || 0);

            res.render('player/story/play', {
                user,
                story,
                character: activeCharacter,
                scene,
                npc,
                choices,
                testResult,
                progress,
                timeRemaining,
                timeStatus,
                StoryTestService // Pass service to view for attribute name translation
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
     * Gerencia tempo restante
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

            // Buscar progresso
            let progress = await StoryProgress.findOne({
                where: {
                    character_id: activeCharacter.id,
                    story_id: storyId,
                    is_completed: false
                }
            });

            if (!progress) {
                return res.status(404).send('Progresso não encontrado. Por favor, inicie a história novamente.');
            }

            let nextSceneId = choice.next_scene_id;
            let testResult = null;

            // Verificar se a escolha requer teste de atributo
            if (choice.requires_test) {
                const testAttribute = choice.test_attribute?.toLowerCase();
                const difficulty = choice.test_difficulty;

                try {
                    // Usar o StoryTestService para realizar o teste
                    testResult = StoryTestService.performAttributeTest(
                        activeCharacter,
                        testAttribute,
                        difficulty
                    );

                    // Determinar próxima cena baseado no resultado
                    if (testResult.success) {
                        nextSceneId = choice.success_scene_id;
                    } else {
                        nextSceneId = choice.failure_scene_id;
                    }

                    // Salvar resultado na sessão para mostrar na próxima página
                    req.session.storyTestResult = {
                        success: testResult.success,
                        roll: testResult.roll,
                        attributeValue: testResult.attributeValue,
                        total: testResult.total,
                        difficulty: testResult.difficulty,
                        attribute: testResult.attribute,
                        attributeNamePT: StoryTestService.getAttributeNamePT(testResult.attribute)
                    };

                } catch (error) {
                    console.error('Error performing attribute test:', error);
                    return res.status(400).send('Erro ao realizar teste de atributo.');
                }
            }

            // Buscar próxima cena para obter time_cost
            const nextScene = await StoryScene.findByPk(nextSceneId);
            if (!nextScene) {
                return res.status(404).send('Cena de destino não encontrada.');
            }

            // Calcular tempo total consumido
            const timeConsumed = (choice.time_cost || 0) + (nextScene.time_cost || 0);

            // Consumir tempo
            StoryTimeService.consumeTime(progress, timeConsumed);

            // Verificar se o tempo acabou
            if (!StoryTimeService.hasTimeRemaining(progress)) {
                progress.is_completed = true;
                progress.ending_type = 'timeout';
                await progress.save();
                return res.redirect(`/player/stories/${storyId}/timeout`);
            }

            // Atualizar progresso
            const choicesHistory = progress.choices_history || [];
            choicesHistory.push({
                choice_id: parseInt(choiceId),
                scene_id: choice.story_scene_id,
                next_scene_id: nextSceneId,
                timestamp: new Date().toISOString(),
                test_result: testResult ? testResult.success : null,
                test_details: testResult ? {
                    roll: testResult.roll,
                    attributeValue: testResult.attributeValue,
                    total: testResult.total,
                    difficulty: testResult.difficulty,
                    attribute: testResult.attribute
                } : null,
                time_consumed: timeConsumed
            });

            const locationsVisited = progress.locations_visited || [];
            if (!locationsVisited.includes(nextSceneId)) {
                locationsVisited.push(nextSceneId);
            }

            progress.current_scene_id = nextSceneId;
            progress.scenes_visited = (progress.scenes_visited || 0) + 1;
            progress.choices_history = choicesHistory;
            progress.locations_visited = locationsVisited;
            progress.last_played_at = new Date();
            await progress.save();

            // Verificar se a próxima cena é final
            if (nextScene.is_ending) {
                // Redirecionar para tela de finalização
                return res.redirect(`/player/stories/${storyId}/finish`);
            }

            // Se teve teste, redirecionar para página de resultado
            if (testResult) {
                // Adicionar nextSceneId à sessão
                req.session.storyTestResult.nextSceneId = nextSceneId;
                req.session.storyTestResult.storyId = storyId;
                return res.redirect(`/player/stories/${storyId}/test-result`);
            }

            // Redirecionar para a próxima cena (sem teste)
            res.redirect(`/player/stories/${storyId}/play?sceneId=${nextSceneId}`);

        } catch (error) {
            console.error('Error choosing option:', error);
            res.status(500).send('Erro ao processar escolha.');
        }
    },

    /**
     * Tela de finalização da história (sucesso)
     * Aplica recompensas usando StoryRewardService
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
                activeCharacter = await Character.findByPk(req.session.activeCharacterId, { transaction });
            } else {
                activeCharacter = await Character.findOne({
                    where: { user_id: user.id },
                    order: [['createdAt', 'ASC']],
                    transaction
                });
            }

            if (!activeCharacter) {
                await transaction.rollback();
                return res.status(404).send('Personagem não encontrado.');
            }

            // Buscar progresso atual
            const progress = await StoryProgress.findOne({
                where: {
                    character_id: activeCharacter.id,
                    story_id: storyId,
                    is_completed: false
                },
                transaction
            });

            // Usar StoryRewardService para aplicar recompensas
            const rewards = await StoryRewardService.grantRewards(
                activeCharacter,
                story,
                progress || { is_completed: false }
            );

            await transaction.commit();

            res.render('player/story/finish', {
                user,
                story,
                character: activeCharacter,
                rewards,
                rewardsDisplay: StoryRewardService.formatRewardsDisplay(rewards)
            });

        } catch (error) {
            await transaction.rollback();
            console.error('Error finishing story:', error);
            res.status(500).send('Erro ao finalizar história.');
        }
    },

    /**
     * Tela de resultado do teste de atributo
     * Mostra animação de dado e resultado antes de continuar
     */
    showTestResult: async (req, res) => {
        try {
            const { storyId } = req.params;
            const user = req.session.user;

            // Buscar resultado do teste na sessão
            const testResult = req.session.storyTestResult;
            if (!testResult) {
                // Se não há resultado na sessão, redirecionar para a história
                return res.redirect(`/player/stories/${storyId}/play`);
            }

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

            // Renderizar página de resultado
            res.render('player/story/test-result', {
                user,
                story,
                character: activeCharacter,
                testResult
            });

        } catch (error) {
            console.error('Error showing test result:', error);
            res.status(500).send('Erro ao exibir resultado do teste.');
        }
    },

    /**
     * Tela de timeout (tempo acabou)
     */
    timeout: async (req, res) => {
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

            res.render('player/story/timeout', {
                user,
                story,
                character: activeCharacter
            });

        } catch (error) {
            console.error('Error showing timeout screen:', error);
            res.status(500).send('Erro ao carregar tela de timeout.');
        }
    }
};

module.exports = PlayerStoryController;
