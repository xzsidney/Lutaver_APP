const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Power = sequelize.define('Power', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    discipline_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'disciplines',
            key: 'id'
        }
    },
    required_affinity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    effect: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Efeito técnico (ex: +2 STR, unlock_map_2)'
    },
    icon: {
        type: DataTypes.STRING,
        defaultValue: '⚡'
    }
}, {
    tableName: 'powers',
    timestamps: true
});

module.exports = Power;
