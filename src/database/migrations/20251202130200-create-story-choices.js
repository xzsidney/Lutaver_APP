'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('story_choices', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            story_scene_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'story_scenes',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            label: {
                type: Sequelize.STRING,
                allowNull: false
            },
            next_scene_id: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            requires_test: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false
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
        await queryInterface.dropTable('story_choices');
    }
};
