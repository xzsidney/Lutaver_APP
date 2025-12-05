const User = require('../models/User');
const Discipline = require('../models/Discipline');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Character = require('../models/Character');
const Power = require('../models/Power');
const Npc = require('../models/Npc');

const DashboardController = {
    /**
     * Main dashboard - redirects to role-specific dashboard
     */
    index: (req, res) => {
        const userRole = req.session.user.role;

        switch (userRole) {
            case 'admin':
                return res.redirect('/admin/dashboard');
            case 'teacher':
                return res.redirect('/teacher/dashboard');
            case 'player':
                return res.redirect('/player/dashboard');
            default:
                return res.redirect('/login');
        }
    },

    /**
     * Admin Dashboard
     */
    adminDashboard: async (req, res) => {
        try {
            const stats = {
                usersCount: await User.count(),
                disciplinesCount: await Discipline.count(),
                quizzesCount: await Quiz.count(),
                questionsCount: await Question.count(),
                charactersCount: await Character.count(),
                powersCount: await Power.count(),
                npcsCount: await Npc.count()
            };

            res.render('admin/dashboard', {
                user: req.session.user,
                stats
            });
        } catch (error) {
            console.error(error);
            res.render('admin/dashboard', {
                user: req.session.user,
                stats: {}
            });
        }
    },

    /**
     * Teacher Dashboard
     */
    teacherDashboard: (req, res) => {
        res.render('dashboard/teacher', { user: req.session.user });
    },

    /**
     * Player Dashboard
     */
    playerDashboard: (req, res) => {
        res.render('dashboard/player', { user: req.session.user });
    }
};

module.exports = DashboardController;
