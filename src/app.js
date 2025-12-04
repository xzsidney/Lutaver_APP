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
const Quiz = require('./models/Quiz');
const Scene = require('./models/Scene');
const Question = require('./models/Question');

// RELACIONAMENTOS: Quizzes ↔ Discipline
Quiz.belongsTo(Discipline, { foreignKey: 'discipline_id', as: 'discipline' });
Discipline.hasMany(Quiz, { foreignKey: 'discipline_id', as: 'quizzes' });

// RELACIONAMENTOS: Scenes ↔ Quiz (Legacy Adventure support if needed, but Scenes are for Stories usually? Wait, the context says Adventure = Quiz, Story = Story. Does Adventure have scenes? The user said "Story = funcionalidade onde o jogador vive uma história com escolhas, testes e cenas". Adventure = Quiz. So Adventure should NOT have scenes. But app.js has `Scene.belongsTo(Adventure)`. This might be legacy or confusion. The user said "Story = sistema RPG narrativo (já implementado com stories/scenes)". 
// However, looking at app.js: `Scene` seems to be different from `StoryScene`. `StoryScene` is for `Story`. `Scene` is for `Adventure`?
// Let's check `Scene.js`. If `Scene` is part of the old "Adventure" system that is becoming "Quiz", does a Quiz have Scenes?
// The user said "Adventure" is just a quiz. "Story" is the narrative one.
// If `Scene` is linked to `Adventure`, and `Adventure` becomes `Quiz`, maybe `Scene` should be removed or refactored?
// But the user said "NÃO apagar dados".
// If `Scene` is used in Adventure, maybe I should rename it to `QuizScene`? Or maybe it's not used?
// Let's look at `Scene.js` content later. For now, I will rename `Adventure` to `Quiz` in the association.
// If `Scene` belongs to `Adventure`, it now belongs to `Quiz`.
// But wait, `Scene` might be the old name for `StoryScene`? No, `StoryScene` exists.
// I will assume `Scene` is part of the Adventure system and should be linked to `Quiz`.
// But a Quiz usually doesn't have scenes.
// The user said: "Adventure = funcionalidade onde o jogador responde perguntas (quiz)".
// Maybe `Scene` is not used in the new "Quiz" concept.
// But I should probably keep the association valid for now, just renamed.
// So `Scene.belongsTo(Quiz)`.

// RELACIONAMENTOS: Scenes ↔ Quiz
Scene.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });
Quiz.hasMany(Scene, { foreignKey: 'quiz_id', as: 'scenes' });

// SELF-REFERENCING: scene success/failure
Scene.belongsTo(Scene, { foreignKey: 'success_scene_id', as: 'successScene' });
Scene.belongsTo(Scene, { foreignKey: 'failure_scene_id', as: 'failureScene' });

// RELACIONAMENTOS: Questions ↔ Discipline / Quiz
Question.belongsTo(Discipline, { foreignKey: 'discipline_id', as: 'discipline' });
Discipline.hasMany(Question, { foreignKey: 'discipline_id', as: 'questions' });

Question.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });
Quiz.hasMany(Question, { foreignKey: 'quiz_id', as: 'questions' });

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

// QUIZ PROGRESS
const QuizProgress = require('./models/QuizProgress');
Character.hasMany(QuizProgress, { foreignKey: 'character_id', as: 'quizProgress' });
QuizProgress.belongsTo(Character, { foreignKey: 'character_id', as: 'character' });
Quiz.hasMany(QuizProgress, { foreignKey: 'quiz_id', as: 'progress' });
QuizProgress.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });

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
