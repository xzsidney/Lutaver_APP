const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CharacterAffinity = sequelize.define('CharacterAffinity', {
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
    discipline_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'disciplines',
            key: 'id'
        }
    },
    affinity_level: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    }
}, {
    tableName: 'character_affinities',
    timestamps: true
});

module.exports = CharacterAffinity;
