

const Story = require('../models/Story');
const StoryScene = require('../models/StoryScene');
const StoryChoice = require('../models/StoryChoice');
const Character = require('../models/Character');
const CharacterItem = require('../models/CharacterItem');
const Npc = require('../models/Npc');
const Item = require('../models/Item');

const storyController = {
    // List available stories
    listStories: async (req, res) => {
        try {
            // Assuming characterId is passed via query or session, but for now listing all active stories
            // In a real scenario, we might filter by character's school_year
            const stories = await Story.findAll({
                where: { is_active: true },
                include: [{ model: Item, as: 'rewardItem' }] // Assuming association exists or will be added
            });

            // If we have a characterId in query, pass it to the view
            const { characterId } = req.query;
            let character = null;
            if (characterId) {
                character = await Character.findByPk(characterId);
            }

            res.render('player/stories/index', { stories, character, user: req.session.user });
        } catch (error) {
            console.error('Error listing stories:', error);
            res.status(500).send('Erro ao listar histórias.');
        }
    },

    // Start a story
    startStory: async (req, res) => {
        try {
            const { storyId, characterId } = req.params;

            const story = await Story.findByPk(storyId);
            if (!story) {
                return res.status(404).send('História não encontrada.');
            }

            const character = await Character.findByPk(characterId);
            if (!character) {
                return res.status(404).send('Personagem não encontrado.');
            }

            // Redirect to the starting scene
            res.redirect(`/stories/${storyId}/scene/${story.starting_scene_id}/${characterId}`);
        } catch (error) {
            console.error('Error starting story:', error);
            res.status(500).send('Erro ao iniciar história.');
        }
    },

    // Show a specific scene
    showScene: async (req, res) => {
        try {
            const { storyId, sceneId, characterId } = req.params;

            const scene = await StoryScene.findOne({
                where: { id: sceneId, story_id: storyId },
                include: [
                    { model: StoryChoice, as: 'Choices' }, // Assuming alias 'Choices'
                    { model: Npc, as: 'Npc' } // Assuming alias 'Npc'
                ]
            });

            if (!scene) {
                return res.status(404).send('Cena não encontrada.');
            }

            const character = await Character.findByPk(characterId);

            // If it's an ending scene, we might want to redirect to the end handler or show a "Finish" button
            // But usually, the "Finish" button in the view will point to /end route

            res.render('player/stories/scene', { storyId, scene, character, user: req.session.user });
        } catch (error) {
            console.error('Error showing scene:', error);
            res.status(500).send('Erro ao carregar cena.');
        }
    },

    // Handle choice selection
    chooseOption: async (req, res) => {
        try {
            const { storyId, sceneId, characterId } = req.params;
            const { choiceId } = req.body;

            const choice = await StoryChoice.findByPk(choiceId);
            if (!choice) {
                return res.status(404).send('Opção inválida.');
            }

            const character = await Character.findByPk(characterId);

            let nextSceneId = choice.next_scene_id;

            // Logic for Attribute Test
            if (choice.requires_test) {
                const attribute = choice.test_attribute; // e.g., 'strength'
                const difficulty = choice.test_difficulty;
                const charAttrValue = character[attribute] || 0;

                // Roll d10
                const d10 = Math.floor(Math.random() * 10) + 1;
                const total = d10 + charAttrValue;

                console.log(`Test: ${attribute} (Val: ${charAttrValue}) + d10(${d10}) = ${total} vs Diff ${difficulty}`);

                if (total >= difficulty) {
                    // Success
                    nextSceneId = choice.success_scene_id;
                    // We could pass a flash message about success
                } else {
                    // Failure
                    nextSceneId = choice.failure_scene_id;
                    // We could pass a flash message about failure
                }
            }

            res.redirect(`/stories/${storyId}/scene/${nextSceneId}/${characterId}`);

        } catch (error) {
            console.error('Error choosing option:', error);
            res.status(500).send('Erro ao processar escolha.');
        }
    },

    // End story and apply rewards
    endStory: async (req, res) => {
        try {
            const { storyId, characterId } = req.params;

            const story = await Story.findByPk(storyId);
            const character = await Character.findByPk(characterId);

            if (!story || !character) {
                return res.status(404).send('Dados não encontrados.');
            }

            // Apply Rewards
            character.total_xp += story.reward_xp;
            character.coins += story.reward_coins;
            await character.save();

            let rewardItemName = null;
            if (story.reward_item_id) {
                // Check if item exists
                const item = await Item.findByPk(story.reward_item_id);
                if (item) {
                    // Add to character items
                    await CharacterItem.create({
                        character_id: character.id,
                        item_id: item.id,
                        quantity: 1,
                        is_equipped: false
                    });
                    rewardItemName = item.name;
                }
            }

            res.render('player/stories/end', { story, character, rewardItemName, user: req.session.user });

        } catch (error) {
            console.error('Error ending story:', error);
            res.status(500).send('Erro ao finalizar história.');
        }
    }
};

module.exports = storyController;
