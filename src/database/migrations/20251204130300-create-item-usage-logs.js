'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('item_usage_logs', {
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
            item_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'items',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            item_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            bonus_applied: {
                type: Sequelize.JSON,
                allowNull: true
            },
            success: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            error_message: {
                type: Sequelize.STRING,
                allowNull: true
            },
            used_at: {
                type: Sequelize.DATE,
                allowNull: false,
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

        // Add indexes
        await queryInterface.addIndex('item_usage_logs', ['character_id']);
        await queryInterface.addIndex('item_usage_logs', ['item_id']);
        await queryInterface.addIndex('item_usage_logs', ['used_at']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('item_usage_logs');
    }
};
