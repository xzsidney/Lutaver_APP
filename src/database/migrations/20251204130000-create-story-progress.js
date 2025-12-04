'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('story_progress', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            character_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'characters',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            story_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'stories',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            current_scene_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            is_completed: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            ending_type: {
                type: Sequelize.STRING,
                allowNull: true
            },
            xp_earned: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            coins_earned: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            item_rewarded: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            completed_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            last_played_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            }
        });

        // Add unique constraint for character + story combination
        await queryInterface.addIndex('story_progress', ['character_id', 'story_id'], {
            unique: true,
            name: 'unique_character_story_progress'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('story_progress');
    }
};
