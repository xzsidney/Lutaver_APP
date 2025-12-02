'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('stories', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            required_grade: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            starting_scene_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            reward_xp: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false
            },
            reward_coins: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false
            },
            reward_item_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
                allowNull: false
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
        await queryInterface.dropTable('stories');
    }
};
