const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * ItemUsageLog - Registra o histórico de uso de itens consumíveis
 * Útil para análise de gameplay, debugging e prevenção de abusos
 */
const ItemUsageLog = sequelize.define('ItemUsageLog', {
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
        allowNull: true,
        references: {
            model: 'items',
            key: 'id'
        }
    },
    item_name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nome do item no momento do uso (para histórico)'
    },
    bonus_applied: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Detalhes dos bônus aplicados'
    },
    success: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    error_message: {
        type: DataTypes.STRING,
        allowNull: true
    },
    used_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'item_usage_logs',
    timestamps: true,
    indexes: [
        {
            fields: ['character_id']
        },
        {
            fields: ['item_id']
        },
        {
            fields: ['used_at']
        }
    ]
});

module.exports = ItemUsageLog;
