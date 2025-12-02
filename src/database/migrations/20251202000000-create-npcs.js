'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('npcs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            // --- BLOCO 01: IDENTIDADE BÁSICA ---
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false
            },
            subject: {
                type: Sequelize.STRING,
                allowNull: true
            },
            grade_level: {
                type: Sequelize.STRING,
                allowNull: true
            },
            location: {
                type: Sequelize.STRING,
                allowNull: false
            },
            avatar: {
                type: Sequelize.STRING,
                allowNull: true
            },
            personality: {
                type: Sequelize.STRING,
                allowNull: true
            },
            short_description: {
                type: Sequelize.STRING,
                allowNull: false
            },
            long_description: {
                type: Sequelize.TEXT,
                allowNull: true
            },

            // --- BLOCO 02: FUNÇÃO NO JOGO ---
            role_flags: {
                type: Sequelize.STRING,
                allowNull: true
            },
            starts_adventure_ids: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            shop_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            main_discipline: {
                type: Sequelize.STRING,
                allowNull: true
            },
            map_zone: {
                type: Sequelize.STRING,
                allowNull: false
            },

            // --- BLOCO 03: CARACTERÍSTICAS DE JOGO ---
            difficulty: {
                type: Sequelize.STRING,
                defaultValue: 'medium'
            },
            participates_in_battle: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            stat_strength: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            stat_dexterity: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            stat_constitution: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            stat_intelligence: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            stat_reasoning: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            stat_luck: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            math_affinity: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },

            // --- BLOCO 04: COMPORTAMENTO E DIÁLOGOS ---
            dialogue_greeting: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            dialogue_farewell: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            dialogue_start_quest: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            dialogue_success: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            dialogue_failure: {
                type: Sequelize.TEXT,
                allowNull: true
            },

            // --- BLOCO 05: INTEGRAÇÕES FUTURAS ---
            linked_shop_key: {
                type: Sequelize.STRING,
                allowNull: true
            },
            linked_adventure_keys: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            linked_quiz_discipline: {
                type: Sequelize.STRING,
                allowNull: true
            },
            special_reward_info: {
                type: Sequelize.TEXT,
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
        await queryInterface.dropTable('npcs');
    }
};
