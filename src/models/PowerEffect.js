const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PowerEffect = sequelize.define('PowerEffect', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    power_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'powers',
            key: 'id'
        }
    },
    effect_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'effects',
            key: 'id'
        }
    },
    chance: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
        validate: {
            min: 0,
            max: 100
        }
    },
    override_value: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'If set, overrides the base_value of the effect'
    }
}, {
    tableName: 'power_effects',
    timestamps: true
});

module.exports = PowerEffect;
