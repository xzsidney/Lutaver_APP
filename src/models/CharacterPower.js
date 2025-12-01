const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CharacterPower = sequelize.define('CharacterPower', {
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
    power_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'powers',
            key: 'id'
        }
    },
    learned_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'character_powers',
    timestamps: true
});

module.exports = CharacterPower;
