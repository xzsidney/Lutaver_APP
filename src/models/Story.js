const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Story = sequelize.define('Story', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Título da história narrativa'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Resumo/sinopse da história'
    },
    required_grade: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Série mínima requerida (6, 7, 8, 9)'
    },
    starting_scene_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID da cena inicial da história'
    },
    reward_xp: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: 'XP ganho ao completar a história'
    },
    reward_coins: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: 'Moedas ganhas ao completar a história'
    },
    reward_item_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do item especial de recompensa (FK para items)'
    },
    time_limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 480,
        comment: 'Tempo total em minutos para completar a história (ex: 480 = 8 horas)'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: 'Se a história está disponível para jogar'
    }
}, {
    tableName: 'stories',
    timestamps: true
});

// Associations will be defined in index.js or here if circular dependency is handled
// Story.hasMany(models.StoryScene, { foreignKey: 'story_id' });

module.exports = Story;
