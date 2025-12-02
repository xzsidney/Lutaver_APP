const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActiveEffect = sequelize.define('ActiveEffect', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    character_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'characters',
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
    source_power_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Which power caused this effect, if any'
    },
    remaining_turns: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_expired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'active_effects',
    timestamps: true
});

module.exports = ActiveEffect;
