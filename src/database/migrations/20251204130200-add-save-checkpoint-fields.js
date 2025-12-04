'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add choices_history column
        await queryInterface.addColumn('story_progress', 'choices_history', {
            type: Sequelize.JSON,
            allowNull: true,
            defaultValue: [],
            comment: 'Array of choice IDs made during the story'
        });

        // Add scenes_visited column
        await queryInterface.addColumn('story_progress', 'scenes_visited', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Number of scenes visited in this playthrough'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('story_progress', 'choices_history');
        await queryInterface.removeColumn('story_progress', 'scenes_visited');
    }
};
