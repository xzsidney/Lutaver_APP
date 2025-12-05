/**
 * StoryRewardService
 * 
 * Service for granting rewards upon story completion
 * Prevents reward exploitation by checking completion status
 */

const Character = require('../models/Character');
const CharacterItem = require('../models/CharacterItem');

class StoryRewardService {
    /**
     * Grant rewards to character upon story completion
     * @param {Object} character - Character instance
     * @param {Object} story - Story instance
     * @param {Object} storyProgress - StoryProgress instance
     * @returns {Object} Rewards granted
     */
    static async grantRewards(character, story, storyProgress) {
        // Check if already completed to prevent duplicate rewards
        if (storyProgress.is_completed) {
            return {
                alreadyCompleted: true,
                message: 'Recompensas já foram recebidas anteriormente.'
            };
        }

        const rewards = {
            xp: 0,
            coins: 0,
            item: null,
            levelUp: false,
            newLevel: character.level
        };

        // Grant XP
        if (story.reward_xp > 0) {
            character.total_xp += story.reward_xp;
            rewards.xp = story.reward_xp;

            // Check for level up (simple formula: level up every 1000 XP)
            const newLevel = Math.floor(character.total_xp / 1000) + 1;
            if (newLevel > character.level) {
                character.level = newLevel;
                rewards.levelUp = true;
                rewards.newLevel = newLevel;
            }
        }

        // Grant coins
        if (story.reward_coins > 0) {
            character.coins += story.reward_coins;
            rewards.coins = story.reward_coins;
        }

        // Grant item (if specified)
        if (story.reward_item_id) {
            try {
                // Add item to character's inventory
                await CharacterItem.create({
                    character_id: character.id,
                    item_id: story.reward_item_id,
                    quantity: 1
                });
                rewards.item = story.reward_item_id;
            } catch (error) {
                console.error('Error granting reward item:', error);
                // Continue even if item grant fails
            }
        }

        // Save character
        await character.save();

        // Update story progress
        storyProgress.is_completed = true;
        storyProgress.xp_earned = rewards.xp;
        storyProgress.coins_earned = rewards.coins;
        storyProgress.item_rewarded = !!story.reward_item_id;
        storyProgress.completed_at = new Date();
        await storyProgress.save();

        return rewards;
    }

    /**
     * Format rewards for display in Portuguese
     * @param {Object} rewards - Rewards object
     * @returns {string} Formatted rewards text
     */
    static formatRewardsDisplay(rewards) {
        const parts = [];

        if (rewards.xp > 0) {
            parts.push(`${rewards.xp} XP`);
        }

        if (rewards.coins > 0) {
            parts.push(`${rewards.coins} moedas`);
        }

        if (rewards.item) {
            parts.push('1 item especial');
        }

        if (parts.length === 0) {
            return 'Nenhuma recompensa';
        }

        return parts.join(', ');
    }
}

module.exports = StoryRewardService;
