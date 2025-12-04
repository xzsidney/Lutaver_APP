const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Question = sequelize.define('Question', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
    quiz_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'quizzes',
            key: 'id'
        },
        comment: 'FK para quiz (opcional)'
    },
    school_year: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Ano escolar (ex: 6º ano, 7º ano)'
    },
    difficulty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1,
            max: 5
        },
        comment: 'Dificuldade de 1 a 5'
    },
    question_text: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Texto da pergunta'
    },
    option_a: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Alternativa A'
    },
    option_b: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Alternativa B'
    },
    option_c: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Alternativa C'
    },
    option_d: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Alternativa D'
    },
    correct_option: {
        type: DataTypes.ENUM('A', 'B', 'C', 'D'),
        allowNull: false,
        comment: 'Alternativa correta'
    },
    explanation: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Explicação da resposta correta'
    }
}, {
    tableName: 'questions',
    timestamps: true
});

module.exports = Question;
