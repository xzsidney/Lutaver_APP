const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Scene = sequelize.define('Scene', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    adventure_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'adventures',
            key: 'id'
        },
        comment: 'FK para aventura'
    },
    order_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Ordem da cena na aventura'
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Título da cena'
    },
    npc_name: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Nome do NPC presente na cena'
    },
    npc_mood: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Humor/estado do NPC (ex: amigável, hostil, neutro)'
    },
    environment_description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descrição do ambiente da cena'
    },
    player_feeling: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Sentimento do jogador (ex: confiante, nervoso, curioso)'
    },
    scene_text: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Texto narrativo da cena'
    },
    test_type: {
        type: DataTypes.ENUM('fisico', 'mental', 'social', 'nenhum'),
        allowNull: false,
        defaultValue: 'nenhum',
        comment: 'Tipo de teste na cena'
    },
    difficulty: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 5
        },
        comment: 'Dificuldade do teste (1-5)'
    },
    attribute_used: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Atributo usado no teste (ex: Lógica, Criatividade, Memória)'
    },
    success_scene_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'scenes',
            key: 'id'
        },
        comment: 'ID da cena em caso de sucesso no teste'
    },
    failure_scene_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'scenes',
            key: 'id'
        },
        comment: 'ID da cena em caso de falha no teste'
    },
    is_ending: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Se é uma cena final da aventura'
    }
}, {
    tableName: 'scenes',
    timestamps: true
});

module.exports = Scene;
