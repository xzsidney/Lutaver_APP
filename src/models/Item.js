const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Item = sequelize.define('Item', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('consumable', 'equipment', 'key', 'cosmetic'),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    effect_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'effects',
            key: 'id'
        }
    },
    bonus_json: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Simple stat bonuses, e.g., {"str": 2, "hp": 10}'
    },
    price: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    rarity: {
        type: DataTypes.ENUM('comum', 'raro', 'épico', 'lendário'),
        defaultValue: 'comum',
        allowNull: false
    },
    icon: {
        type: DataTypes.STRING,
        defaultValue: '📦',
        allowNull: false
    },
    stackable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    max_stack: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false
    },
    slot: {
        type: DataTypes.ENUM('head', 'body', 'feet', 'accessory'),
        allowNull: true,
        comment: 'Only for equipment type items'
    },
    is_unique: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'If true, player can only own one'
    }
}, {
    tableName: 'items',
    timestamps: true
});

module.exports = Item;
