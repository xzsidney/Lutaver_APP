'use strict';

/**
 * Migration: Add time_cost and hint_text to story_scenes
 * 
 * This migration adds support for:
 * - time_cost: Time consumed when entering this scene (in minutes)
 * - hint_text: Hint text in Portuguese to help the player choose the next location
 */

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('story_scenes', 'time_cost', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 30,
            comment: 'Time consumed when entering this scene (minutes)'
        });

        await queryInterface.addColumn('story_scenes', 'hint_text', {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Hint text in Portuguese to help the player'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('story_scenes', 'time_cost');
        await queryInterface.removeColumn('story_scenes', 'hint_text');
    }
};
