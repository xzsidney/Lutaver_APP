'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('story_scenes', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
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
            title: {
                type: Sequelize.STRING,
                allowNull: false
            },
            text: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            npc_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            background_image: {
                type: Sequelize.STRING,
                allowNull: true
            },
            test_attribute: {
                type: Sequelize.STRING,
                allowNull: true
            },
            test_difficulty: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            success_scene_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            failure_scene_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            is_ending: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false
            },
            ending_type: {
                type: Sequelize.STRING,
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('story_scenes');
    }
};
