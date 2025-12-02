const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CharacterItem = sequelize.define('CharacterItem', {
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
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'items',
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    is_equipped: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
}, {
    tableName: 'character_items',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['character_id', 'item_id', 'is_equipped'],
            name: 'unique_character_item_equipped'
        }
    ]
});

module.exports = CharacterItem;
