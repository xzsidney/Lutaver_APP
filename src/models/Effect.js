const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Effect = sequelize.define('Effect', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    effect_type: {
        type: DataTypes.STRING, // 'status_negativo', 'status_positivo', 'dano', 'cura', 'buff', 'debuff'
        allowNull: false
    },
    target_type: {
        type: DataTypes.STRING, // 'self', 'ally', 'enemy', 'all'
        allowNull: false
    },
    attribute_target: {
        type: DataTypes.STRING, // 'hp', 'mp', 'forca', 'destreza', etc.
        allowNull: true
    },
    base_value: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    intensity_label: {
        type: DataTypes.STRING, // 'leve', 'médio', 'forte'
        allowNull: true
    },
    duration_type: {
        type: DataTypes.STRING, // 'instant', 'turns', 'scene', 'permanent'
        defaultValue: 'instant'
    },
    duration_value: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    can_stack: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    icon: {
        type: DataTypes.STRING,
        defaultValue: '✨'
    }
}, {
    tableName: 'effects',
    timestamps: true
});

module.exports = Effect;
