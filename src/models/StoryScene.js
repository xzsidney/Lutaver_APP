const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StoryScene = sequelize.define('StoryScene', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    story_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK para stories.id'
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Título da cena (ex: "Corredor Principal")'
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Texto narrativo da cena'
    },
    npc_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'FK para npcs.id - NPC presente na cena'
    },
    background_image: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'URL ou caminho da imagem de fundo'
    },
    test_attribute: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Atributo para teste: strength, dexterity, constitution, intelligence, reasoning, luck'
    },
    test_difficulty: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Dificuldade do teste (ex: 6, 8, 10, 12)'
    },
    success_scene_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID da cena em caso de sucesso no teste'
    },
    failure_scene_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID da cena em caso de falha no teste'
    },
    is_ending: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'Se esta cena é final da história'
    },
    ending_type: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Tipo de final: success, neutral, fail'
    }
}, {
    tableName: 'story_scenes',
    timestamps: true
});

module.exports = StoryScene;
