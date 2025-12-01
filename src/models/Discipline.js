const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Discipline = sequelize.define('Discipline', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
        comment: 'Código curto da disciplina (ex: MAT, PORT, HIST)'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    school_level: {
        type: DataTypes.ENUM('fundamental_1', 'fundamental_2', 'medio'),
        allowNull: false,
        defaultValue: 'fundamental_2',
        comment: 'Nível escolar: fundamental_1 (1º-5º), fundamental_2 (6º-9º), medio'
    },
    color_theme: {
        type: DataTypes.STRING(7),
        allowNull: true,
        defaultValue: '#1E90FF',
        comment: 'Cor tema da disciplina em hexadecimal (ex: #1E90FF)'
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Emoji ou ícone da disciplina (ex: 📐, 📚, 🧪)'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'disciplines',
    timestamps: true
});

module.exports = Discipline;
