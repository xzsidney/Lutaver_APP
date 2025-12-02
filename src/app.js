require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const sequelize = require('./config/database');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'lutaver_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// Static files (if needed later)
app.use(express.static(path.join(__dirname, 'public')));

// Model associations
const Discipline = require('./models/Discipline');
const Adventure = require('./models/Adventure');
const Scene = require('./models/Scene');
const Question = require('./models/Question');

// Define relationships
Adventure.belongsTo(Discipline, {
    foreignKey: 'discipline_id',
    as: 'discipline'
});

Discipline.hasMany(Adventure, {
    foreignKey: 'discipline_id',
    as: 'adventures'
});

Scene.belongsTo(Adventure, {
    foreignKey: 'adventure_id',
    as: 'adventure'
});

Adventure.hasMany(Scene, {
    foreignKey: 'adventure_id',
    as: 'scenes'
});

// Self-referencing for scene branching
Scene.belongsTo(Scene, {
    foreignKey: 'success_scene_id',
    as: 'successScene'
});

Scene.belongsTo(Scene, {
    foreignKey: 'failure_scene_id',
    as: 'failureScene'
});

// Question relationships
Question.belongsTo(Discipline, {
    foreignKey: 'discipline_id',
    as: 'discipline'
});

Discipline.hasMany(Question, {
    foreignKey: 'discipline_id',
    as: 'questions'
});

Question.belongsTo(Adventure, {
    foreignKey: 'adventure_id',
    as: 'adventure'
});

Adventure.hasMany(Question, {
    foreignKey: 'adventure_id',
    as: 'questions'
});

// Character Module Models
const Character = require('./models/Character');
const CharacterAffinity = require('./models/CharacterAffinity');
const Power = require('./models/Power');
const CharacterPower = require('./models/CharacterPower');
const User = require('./models/User');

// Character Relationships
User.hasMany(Character, { foreignKey: 'user_id', as: 'characters' });
Character.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Affinities
Character.hasMany(CharacterAffinity, { foreignKey: 'character_id', as: 'affinities' });
CharacterAffinity.belongsTo(Character, { foreignKey: 'character_id' });
CharacterAffinity.belongsTo(Discipline, { foreignKey: 'discipline_id', as: 'discipline' });
Discipline.hasMany(CharacterAffinity, { foreignKey: 'discipline_id' });

// Powers
Discipline.hasMany(Power, { foreignKey: 'discipline_id', as: 'powers' });
Power.belongsTo(Discipline, { foreignKey: 'discipline_id', as: 'discipline' });

// Character Powers (Many-to-Many through CharacterPower)
Character.belongsToMany(Power, { through: CharacterPower, foreignKey: 'character_id', as: 'powers' });
Power.belongsToMany(Character, { through: CharacterPower, foreignKey: 'power_id', as: 'characters' });
Character.hasMany(CharacterPower, { foreignKey: 'character_id' }); // Direct access if needed

// Adventure Progress
const AdventureProgress = require('./models/AdventureProgress');
Character.hasMany(AdventureProgress, { foreignKey: 'character_id', as: 'progress' });
AdventureProgress.belongsTo(Character, { foreignKey: 'character_id', as: 'character' });
Adventure.hasMany(AdventureProgress, { foreignKey: 'adventure_id', as: 'progress' });
AdventureProgress.belongsTo(Adventure, { foreignKey: 'adventure_id', as: 'adventure' });

// Effects System
const Effect = require('./models/Effect');
const PowerEffect = require('./models/PowerEffect');
const ActiveEffect = require('./models/ActiveEffect');

// Power <-> Effect (Many-to-Many)
Power.belongsToMany(Effect, { through: PowerEffect, foreignKey: 'power_id', as: 'effects' });
Effect.belongsToMany(Power, { through: PowerEffect, foreignKey: 'effect_id', as: 'powers' });
Power.hasMany(PowerEffect, { foreignKey: 'power_id' }); // Direct access for managing junction data
Effect.hasMany(PowerEffect, { foreignKey: 'effect_id' });

// Active Effects
Character.hasMany(ActiveEffect, { foreignKey: 'character_id', as: 'activeEffects' });
ActiveEffect.belongsTo(Character, { foreignKey: 'character_id' });
ActiveEffect.belongsTo(Effect, { foreignKey: 'effect_id', as: 'effect' });

// Items and Shop System
const Item = require('./models/Item');
const CharacterItem = require('./models/CharacterItem');

// Item <-> Effect (optional)
Item.belongsTo(Effect, { foreignKey: 'effect_id', as: 'effect' });

// Character <-> Item (Many-to-Many through CharacterItem for inventory)
Character.belongsToMany(Item, { through: CharacterItem, foreignKey: 'character_id', as: 'items' });
Item.belongsToMany(Character, { through: CharacterItem, foreignKey: 'item_id', as: 'owners' });
Character.hasMany(CharacterItem, { foreignKey: 'character_id', as: 'inventory' });
CharacterItem.belongsTo(Character, { foreignKey: 'character_id', as: 'character' });
CharacterItem.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });
Item.hasMany(CharacterItem, { foreignKey: 'item_id' });


// Narrative Story System
const Story = require('./models/Story');
const StoryScene = require('./models/StoryScene');
const StoryChoice = require('./models/StoryChoice');

// Story <-> StoryScene
Story.hasMany(StoryScene, { foreignKey: 'story_id', as: 'scenes' });
StoryScene.belongsTo(Story, { foreignKey: 'story_id', as: 'story' });

// StoryScene <-> StoryChoice
StoryScene.hasMany(StoryChoice, { foreignKey: 'story_scene_id', as: 'choices' });
StoryChoice.belongsTo(StoryScene, { foreignKey: 'story_scene_id', as: 'scene' });

// StoryScene Self-referencing (Success/Failure scenes)
StoryScene.belongsTo(StoryScene, { foreignKey: 'success_scene_id', as: 'successScene' });
StoryScene.belongsTo(StoryScene, { foreignKey: 'failure_scene_id', as: 'failureScene' });

// StoryChoice -> StoryScene (Next scene)
StoryChoice.belongsTo(StoryScene, { foreignKey: 'next_scene_id', as: 'nextScene' });
StoryChoice.belongsTo(StoryScene, { foreignKey: 'success_scene_id', as: 'successScene' });
StoryChoice.belongsTo(StoryScene, { foreignKey: 'failure_scene_id', as: 'failureScene' });

// Story <-> Item (Reward)
Story.belongsTo(Item, { foreignKey: 'reward_item_id', as: 'rewardItem' });

// StoryScene <-> NPC
StoryScene.belongsTo(require('./models/Npc'), { foreignKey: 'npc_id', as: 'npc' });


// Routes
app.use('/', routes);

// Database sync and server start
sequelize.sync() // Removed { alter: true } to prevent ER_TOO_MANY_KEYS error on disciplines table
    .then(() => {
        console.log('✅ Database connected and synchronized');
        const HOST = process.env.HOST || '0.0.0.0';
        app.listen(PORT, HOST, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`🎮 Lutaver is ready!`);
        });
    })
    .catch(err => {
        console.error('❌ Database connection error:', err);
    });
