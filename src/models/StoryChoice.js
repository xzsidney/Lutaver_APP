const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StoryChoice = sequelize.define('StoryChoice', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    story_scene_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK para story_scenes.id'
    },
    label: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Texto do botão de escolha (ex: "Ir pela direita")'
    },
    next_scene_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da próxima cena ao escolher esta opção'
    },
    requires_test: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'Se esta escolha exige teste de atributo'
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
        comment: 'ID da cena em caso de sucesso (se requires_test = true)'
    },
    failure_scene_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID da cena em caso de falha (se requires_test = true)'
    }
}, {
    tableName: 'story_choices',
    timestamps: true
});

module.exports = StoryChoice;
