const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdventureProgress = sequelize.define('AdventureProgress', {
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
    adventure_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'adventures',
            key: 'id'
        }
    },
    total_questions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    correct_answers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
    },
    is_completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    xp_earned: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    completed_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'adventure_progress',
    timestamps: true
});

module.exports = AdventureProgress;
