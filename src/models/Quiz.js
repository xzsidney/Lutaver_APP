const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quiz = sequelize.define('Quiz', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    discipline_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'disciplines',
            key: 'id'
        },
        comment: 'FK para disciplina'
    },
    school_year: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Ano escolar recomendado (ex: 6º ano, 7º ano)'
    },
    difficulty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1,
            max: 5
        },
        comment: 'Dificuldade de 1 a 5 estrelas'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    objectives: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Objetivos de aprendizagem'
    },
    reward_xp: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100,
        comment: 'XP ganho ao completar'
    },
    reward_coins: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50,
        comment: 'Moedas ganhas ao completar'
    },
    reward_item: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Item especial de recompensa'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'quizzes',
    timestamps: true
});

module.exports = Quiz;
