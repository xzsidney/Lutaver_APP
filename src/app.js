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

// Routes
app.use('/', routes);

// Database sync and server start
sequelize.sync({ alter: true }) // Use { alter: true } to update existing tables structure
    .then(() => {
        console.log('✅ Database connected and synchronized');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`🎮 Lutaver is ready!`);
        });
    })
    .catch(err => {
        console.error('❌ Database connection error:', err);
    });
