'use strict';

/**
 * Migration: Add time tracking to story_progress
 * 
 * This migration adds support for:
 * - time_remaining: Remaining time in minutes (starts at 480 = 8 hours)
 * - locations_visited: JSON array of scene_ids visited during the story
 */

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('story_progress', 'time_remaining', {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'Remaining time in minutes (starts with 480)'
        });

        await queryInterface.addColumn('story_progress', 'locations_visited', {
            type: Sequelize.JSON,
            allowNull: true,
            defaultValue: [],
            comment: 'Array of scene_ids visited'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('story_progress', 'time_remaining');
        await queryInterface.removeColumn('story_progress', 'locations_visited');
    }
};
