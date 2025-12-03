require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const sequelize = require('./config/database');
const routes = require('./routes');

// Middleware: escolhe layout conforme role
const { setUserLayout } = require('./middlewares/auth.js');

// Layout Engine
const expressLayouts = require("express-ejs-layouts");

const app = express();
const PORT = process.env.PORT || 3000;

/* ============================================================
   1. VIEW ENGINE
   ============================================================ */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/* ============================================================
   2. MIDDLEWARES BÁSICOS
   ============================================================ */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* ============================================================
   3. SESSION (PRECISA VIR ANTES DO setUserLayout)
   ============================================================ */
app.use(session({
    secret: process.env.SESSION_SECRET || 'lutaver_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 24h
    }
}));

/* ============================================================
   4. LAYOUT ENGINE (express-ejs-layouts)
   ============================================================ */
app.use(expressLayouts);
app.set("layout", "layouts/main"); // layout padrão

/* ============================================================
   5. SET LAYOUT AUTOMÁTICO POR ROLE
   ============================================================ */
app.use(setUserLayout);

/* ============================================================
   6. ARQUIVOS ESTÁTICOS
   ============================================================ */
app.use(express.static(path.join(__dirname, 'public')));

/* ============================================================
   7. SEQUELIZE RELATIONSHIPS
   ============================================================ */

// Models principais
const Discipline = require('./models/Discipline');
const Adventure = require('./models/Adventure');
const Scene = require('./models/Scene');
const Question = require('./models/Question');

// RELACIONAMENTOS: Adventures ↔ Discipline
Adventure.belongsTo(Discipline, { foreignKey: 'discipline_id', as: 'discipline' });
Discipline.hasMany(Adventure, { foreignKey: 'discipline_id', as: 'adventures' });

// RELACIONAMENTOS: Scenes ↔ Adventure
Scene.belongsTo(Adventure, { foreignKey: 'adventure_id', as: 'adventure' });
Adventure.hasMany(Scene, { foreignKey: 'adventure_id', as: 'scenes' });

// SELF-REFERENCING: scene success/failure
Scene.belongsTo(Scene, { foreignKey: 'success_scene_id', as: 'successScene' });
Scene.belongsTo(Scene, { foreignKey: 'failure_scene_id', as: 'failureScene' });

// RELACIONAMENTOS: Questions ↔ Discipline / Adventure
Question.belongsTo(Discipline, { foreignKey: 'discipline_id', as: 'discipline' });
Discipline.hasMany(Question, { foreignKey: 'discipline_id', as: 'questions' });

Question.belongsTo(Adventure, { foreignKey: 'adventure_id', as: 'adventure' });
Adventure.hasMany(Question, { foreignKey: 'adventure_id', as: 'questions' });

// CHARACTER SYSTEM
const Character = require('./models/Character');
const CharacterAffinity = require('./models/CharacterAffinity');
const Power = require('./models/Power');
const CharacterPower = require('./models/CharacterPower');
const User = require('./models/User');

// USER ↔ CHARACTER
User.hasMany(Character, { foreignKey: 'user_id', as: 'characters' });
Character.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// CHARACTER ↔ AFFINITIES
Character.hasMany(CharacterAffinity, { foreignKey: 'character_id', as: 'affinities' });
CharacterAffinity.belongsTo(Character, { foreignKey: 'character_id' });
CharacterAffinity.belongsTo(Discipline, { foreignKey: 'discipline_id', as: 'discipline' });
Discipline.hasMany(CharacterAffinity, { foreignKey: 'discipline_id' });

// POWERS
Discipline.hasMany(Power, { foreignKey: 'discipline_id', as: 'powers' });
Power.belongsTo(Discipline, { foreignKey: 'discipline_id', as: 'discipline' });

// CHARACTER ↔ POWER (Many-to-Many)
Character.belongsToMany(Power, { through: CharacterPower, foreignKey: 'character_id', as: 'powers' });
Power.belongsToMany(Character, { through: CharacterPower, foreignKey: 'power_id', as: 'characters' });
Character.hasMany(CharacterPower, { foreignKey: 'character_id' });

// ADVENTURE PROGRESS
const AdventureProgress = require('./models/AdventureProgress');
Character.hasMany(AdventureProgress, { foreignKey: 'character_id', as: 'progress' });
AdventureProgress.belongsTo(Character, { foreignKey: 'character_id', as: 'character' });
Adventure.hasMany(AdventureProgress, { foreignKey: 'adventure_id', as: 'progress' });
AdventureProgress.belongsTo(Adventure, { foreignKey: 'adventure_id', as: 'adventure' });

// EFFECT SYSTEM
const Effect = require('./models/Effect');
const PowerEffect = require('./models/PowerEffect');
const ActiveEffect = require('./models/ActiveEffect');

// POWER ↔ EFFECT (Many-to-Many)
Power.belongsToMany(Effect, { through: PowerEffect, foreignKey: 'power_id', as: 'effects' });
Effect.belongsToMany(Power, { through: PowerEffect, foreignKey: 'effect_id', as: 'powers' });

// ACTIVE EFFECTS
Character.hasMany(ActiveEffect, { foreignKey: 'character_id', as: 'activeEffects' });
ActiveEffect.belongsTo(Character, { foreignKey: 'character_id' });
ActiveEffect.belongsTo(Effect, { foreignKey: 'effect_id', as: 'effect' });

// ITEMS (Inventory)
const Item = require('./models/Item');
const CharacterItem = require('./models/CharacterItem');

Item.belongsTo(Effect, { foreignKey: 'effect_id', as: 'effect' });

// Character inventory (Many-To-Many)
Character.belongsToMany(Item, { through: CharacterItem, foreignKey: 'character_id', as: 'items' });
Item.belongsToMany(Character, { through: CharacterItem, foreignKey: 'item_id', as: 'owners' });

Character.hasMany(CharacterItem, { foreignKey: 'character_id', as: 'inventory' });
CharacterItem.belongsTo(Character, { foreignKey: 'character_id', as: 'character' });
CharacterItem.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });
Item.hasMany(CharacterItem, { foreignKey: 'item_id' });

// STORY SYSTEM
const Story = require('./models/Story');
const StoryScene = require('./models/StoryScene');
const StoryChoice = require('./models/StoryChoice');

Story.hasMany(StoryScene, { foreignKey: 'story_id', as: 'scenes' });
StoryScene.belongsTo(Story, { foreignKey: 'story_id', as: 'story' });

StoryScene.hasMany(StoryChoice, { foreignKey: 'story_scene_id', as: 'choices' });
StoryChoice.belongsTo(StoryScene, { foreignKey: 'story_scene_id', as: 'scene' });

StoryScene.belongsTo(StoryScene, { foreignKey: 'success_scene_id', as: 'successScene' });
StoryScene.belongsTo(StoryScene, { foreignKey: 'failure_scene_id', as: 'failureScene' });

StoryChoice.belongsTo(StoryScene, { foreignKey: 'next_scene_id', as: 'nextScene' });
StoryChoice.belongsTo(StoryScene, { foreignKey: 'success_scene_id', as: 'successScene' });
StoryChoice.belongsTo(StoryScene, { foreignKey: 'failure_scene_id', as: 'failureScene' });

Story.belongsTo(Item, { foreignKey: 'reward_item_id', as: 'rewardItem' });

StoryScene.belongsTo(require('./models/Npc'), { foreignKey: 'npc_id', as: 'npc' });

/* ============================================================
   8. ROTAS
   ============================================================ */
app.use('/', routes);

/* ============================================================
   9. SYNC + START
   ============================================================ */
sequelize.sync()
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
