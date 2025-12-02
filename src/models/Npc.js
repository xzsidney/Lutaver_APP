const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Npc = sequelize.define('Npc', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // --- BLOCO 01: IDENTIDADE BÁSICA ---
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING, // 'teacher', 'student', 'staff', 'boss', 'npc'
        allowNull: false
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: true
    },
    grade_level: {
        type: DataTypes.STRING,
        allowNull: true
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    personality: {
        type: DataTypes.STRING,
        allowNull: true
    },
    short_description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    long_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // --- BLOCO 02: FUNÇÃO NO JOGO ---
    role_flags: {
        type: DataTypes.STRING, // 'quest_giver,shop,quiz,boss'
        allowNull: true
    },
    starts_adventure_ids: {
        type: DataTypes.TEXT, // JSON string of adventure IDs
        allowNull: true
    },
    shop_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    main_discipline: {
        type: DataTypes.STRING,
        allowNull: true
    },
    map_zone: {
        type: DataTypes.STRING,
        allowNull: false
    },

    // --- BLOCO 03: CARACTERÍSTICAS DE JOGO ---
    difficulty: {
        type: DataTypes.STRING, // 'easy', 'medium', 'hard', 'boss'
        defaultValue: 'medium'
    },
    participates_in_battle: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    stat_strength: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    stat_dexterity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    stat_constitution: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    stat_intelligence: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    stat_reasoning: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    stat_luck: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    math_affinity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    // --- BLOCO 04: COMPORTAMENTO E DIÁLOGOS ---
    dialogue_greeting: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    dialogue_farewell: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    dialogue_start_quest: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    dialogue_success: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    dialogue_failure: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // --- BLOCO 05: INTEGRAÇÕES FUTURAS ---
    linked_shop_key: {
        type: DataTypes.STRING,
        allowNull: true
    },
    linked_adventure_keys: {
        type: DataTypes.TEXT, // JSON string
        allowNull: true
    },
    linked_quiz_discipline: {
        type: DataTypes.STRING,
        allowNull: true
    },
    special_reward_info: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'npcs',
    timestamps: true
});

module.exports = Npc;
