const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Character = sequelize.define('Character', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Pode ser nulo se criado por admin sem vincular user ainda
        comment: 'Dono do personagem'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Aventureiro Iniciante'
    },
    school_year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 6
    },
    current_map: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Vila Inicial'
    },
    // Atributos
    strength: { type: DataTypes.INTEGER, defaultValue: 1 },
    dexterity: { type: DataTypes.INTEGER, defaultValue: 1 },
    constitution: { type: DataTypes.INTEGER, defaultValue: 1 },
    intelligence: { type: DataTypes.INTEGER, defaultValue: 1 },
    reasoning: { type: DataTypes.INTEGER, defaultValue: 1 },
    luck: { type: DataTypes.INTEGER, defaultValue: 1 },

    // Pontos e Progresso
    evolution_points: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    total_xp: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    coins: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: 'In-game currency for shop purchases'
    },
    inventory_json: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    }
}, {
    tableName: 'characters',
    timestamps: true
});

module.exports = Character;
