'use strict';

/**
 * Migration: Add time_cost to story_choices
 * 
 * This migration adds support for:
 * - time_cost: Additional time consumed when making this choice (in minutes)
 */

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('story_choices', 'time_cost', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Additional time consumed by this choice (minutes)'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('story_choices', 'time_cost');
    }
};
