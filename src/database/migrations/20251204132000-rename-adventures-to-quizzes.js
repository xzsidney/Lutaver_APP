'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Rename table adventures -> quizzes
        await queryInterface.renameTable('adventures', 'quizzes');

        // 2. Rename table adventure_progress -> quiz_progress
        await queryInterface.renameTable('adventure_progress', 'quiz_progress');

        // 3. Rename column adventure_id -> quiz_id in questions
        // Note: We might need to handle foreign key constraints depending on the DB engine, 
        // but usually renameColumn handles the column itself. 
        // Ideally we should drop FK, rename column, add FK back, but for simplicity in this refactor request we try renameColumn first.
        // If it fails due to FK, we might need a more complex migration.
        // However, Sequelize renameColumn often works if the DB supports it.
        await queryInterface.renameColumn('questions', 'adventure_id', 'quiz_id');

        // 4. Rename column adventure_id -> quiz_id in quiz_progress
        await queryInterface.renameColumn('quiz_progress', 'adventure_id', 'quiz_id');
    },

    down: async (queryInterface, Sequelize) => {
        // Revert 4
        await queryInterface.renameColumn('quiz_progress', 'quiz_id', 'adventure_id');

        // Revert 3
        await queryInterface.renameColumn('questions', 'quiz_id', 'adventure_id');

        // Revert 2
        await queryInterface.renameTable('quiz_progress', 'adventure_progress');

        // Revert 1
        await queryInterface.renameTable('quizzes', 'adventures');
    }
};
