const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * StoryProgress - Tracks player progress in narrative stories
 * Prevents reward exploitation by recording completed stories
 */
const StoryProgress = sequelize.define('StoryProgress', {
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
        },
        comment: 'FK to characters.id'
    },
    story_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'stories',
            key: 'id'
        },
        comment: 'FK to stories.id'
    },
    current_scene_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Current scene for save/resume functionality'
    },
    is_completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether the story has been completed'
    },
    ending_type: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Type of ending achieved: success, neutral, fail'
    },
    xp_earned: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'XP earned from completing this story'
    },
    coins_earned: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Coins earned from completing this story'
    },
    item_rewarded: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether reward item was given'
    },
    completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Timestamp of story completion'
    },
    last_played_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: 'Last time the story was played'
    },
    choices_history: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of choice IDs made during the story'
    },
    scenes_visited: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of scenes visited in this playthrough'
    }
}, {
    tableName: 'story_progress',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['character_id', 'story_id'],
            name: 'unique_character_story_progress'
        }
    ]
});

module.exports = StoryProgress;
