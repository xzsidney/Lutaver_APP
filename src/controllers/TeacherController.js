const Adventure = require('../models/Adventure');
const Question = require('../models/Question');
const Discipline = require('../models/Discipline');
const User = require('../models/User');
const Character = require('../models/Character');

const TeacherController = {
    // --- Dashboard ---
    dashboard: async (req, res) => {
        try {
            const stats = {
                adventuresCount: await Adventure.count(),
                questionsCount: await Question.count(),
                studentsCount: await User.count({ where: { role: 'player' } }),
                quizzesCount: 0 // Placeholder
            };
            res.render('teacher/dashboard', { user: req.session.user, stats });
        } catch (error) {
            console.error(error);
            res.render('teacher/dashboard', { user: req.session.user, stats: {} });
        }
    },

    // --- Adventures ---
    listAdventures: async (req, res) => {
        try {
            const { discipline_id, school_year, is_active } = req.query;
            const where = {};
            if (discipline_id) where.discipline_id = discipline_id;
            if (school_year) where.school_year = school_year;
            if (is_active) where.is_active = is_active === '1';

            const adventures = await Adventure.findAll({
                where,
                include: [{ model: Discipline, as: 'discipline' }],
                order: [['createdAt', 'DESC']]
            });
            const disciplines = await Discipline.findAll({ where: { is_active: true } });

            res.render('teacher/adventures/index', { adventures, disciplines, user: req.session.user });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao listar aventuras');
        }
    },

    createAdventurePage: async (req, res) => {
        const disciplines = await Discipline.findAll({ where: { is_active: true } });
        res.render('teacher/adventures/form', { adventure: null, disciplines, user: req.session.user });
    },

    createAdventure: async (req, res) => {
        try {
            const { title, discipline_id, school_year, difficulty, description, objectives, xp_reward, item_reward, is_active } = req.body;
            await Adventure.create({
                title, discipline_id, school_year, difficulty, description, objectives,
                reward_xp: xp_reward, reward_item: item_reward, is_active: is_active === 'on'
            });
            res.redirect('/teacher/adventures');
        } catch (error) {
            console.error(error);
            res.redirect('/teacher/adventures/new');
        }
    },

    editAdventurePage: async (req, res) => {
        try {
            const adventure = await Adventure.findByPk(req.params.id);
            const disciplines = await Discipline.findAll({ where: { is_active: true } });
            res.render('teacher/adventures/form', { adventure, disciplines, user: req.session.user });
        } catch (error) {
            res.redirect('/teacher/adventures');
        }
    },

    updateAdventure: async (req, res) => {
        try {
            const { id } = req.params;
            const { title, discipline_id, school_year, difficulty, description, objectives, xp_reward, item_reward, is_active } = req.body;
            await Adventure.update({
                title, discipline_id, school_year, difficulty, description, objectives,
                reward_xp: xp_reward, reward_item: item_reward, is_active: is_active === 'on'
            }, { where: { id } });
            res.redirect('/teacher/adventures');
        } catch (error) {
            res.redirect(`/teacher/adventures/${req.params.id}/edit`);
        }
    },

    deleteAdventure: async (req, res) => {
        await Adventure.destroy({ where: { id: req.params.id } });
        res.redirect('/teacher/adventures');
    },

    // --- Questions ---
    listQuestions: async (req, res) => {
        try {
            const { discipline_id, adventure_id, school_year, difficulty } = req.query;
            const where = {};
            if (discipline_id) where.discipline_id = discipline_id;
            if (adventure_id) where.adventure_id = adventure_id;
            if (school_year) where.school_year = school_year;
            if (difficulty) where.difficulty = difficulty;

            const questions = await Question.findAll({
                where,
                include: [
                    { model: Discipline, as: 'discipline' },
                    { model: Adventure, as: 'adventure' }
                ],
                order: [['createdAt', 'DESC']]
            });
            const disciplines = await Discipline.findAll({ where: { is_active: true } });
            const adventures = await Adventure.findAll({ where: { is_active: true } });

            res.render('teacher/questions/index', { questions, disciplines, adventures, user: req.session.user });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao listar questões');
        }
    },

    createQuestionPage: async (req, res) => {
        const disciplines = await Discipline.findAll({ where: { is_active: true } });
        const adventures = await Adventure.findAll({ where: { is_active: true } });
        res.render('teacher/questions/form', { question: null, disciplines, adventures, user: req.session.user });
    },

    createQuestion: async (req, res) => {
        try {
            await Question.create(req.body);
            res.redirect('/teacher/questions');
        } catch (error) {
            console.error(error);
            res.redirect('/teacher/questions/new');
        }
    },

    editQuestionPage: async (req, res) => {
        try {
            const question = await Question.findByPk(req.params.id);
            const disciplines = await Discipline.findAll({ where: { is_active: true } });
            const adventures = await Adventure.findAll({ where: { is_active: true } });
            res.render('teacher/questions/form', { question, disciplines, adventures, user: req.session.user });
        } catch (error) {
            res.redirect('/teacher/questions');
        }
    },

    updateQuestion: async (req, res) => {
        try {
            await Question.update(req.body, { where: { id: req.params.id } });
            res.redirect('/teacher/questions');
        } catch (error) {
            res.redirect(`/teacher/questions/${req.params.id}/edit`);
        }
    },

    deleteQuestion: async (req, res) => {
        await Question.destroy({ where: { id: req.params.id } });
        res.redirect('/teacher/questions');
    },

    duplicateQuestion: async (req, res) => {
        try {
            const question = await Question.findByPk(req.params.id);
            if (question) {
                const newQuestion = question.toJSON();
                delete newQuestion.id;
                delete newQuestion.createdAt;
                delete newQuestion.updatedAt;
                newQuestion.question_text += ' (Cópia)';
                await Question.create(newQuestion);
            }
            res.redirect('/teacher/questions');
        } catch (error) {
            res.redirect('/teacher/questions');
        }
    },

    // --- Reports ---
    reportStudents: async (req, res) => {
        // Mock data for now as we don't have QuizResult model fully integrated in this context yet
        // In a real scenario, we would query QuizResult joined with User
        const students = await User.findAll({
            where: { role: 'player' },
            limit: 10
        });

        // Add mock stats
        const studentsWithStats = students.map(s => ({
            name: s.name,
            email: s.email,
            school_year: 6, // Mock
            quizzes_count: Math.floor(Math.random() * 20),
            accuracy_rate: Math.floor(Math.random() * 100),
            best_discipline: 'Matemática',
            worst_discipline: 'História'
        }));

        res.render('teacher/reports/students', { students: studentsWithStats, user: req.session.user });
    },

    reportAdventures: async (req, res) => {
        const adventures = await Adventure.findAll({
            include: [{ model: Discipline, as: 'discipline' }]
        });

        const adventureStats = adventures.map(adv => ({
            id: adv.id,
            title: adv.title,
            discipline_name: adv.discipline ? adv.discipline.name : 'Geral',
            color_theme: adv.discipline ? adv.discipline.color_theme : '#6c757d',
            players_count: Math.floor(Math.random() * 50), // Mock
            avg_accuracy: Math.floor(Math.random() * 100) // Mock
        }));

        res.render('teacher/reports/adventures', { adventureStats, user: req.session.user });
    },

    reportQuestions: async (req, res) => {
        const questions = await Question.findAll({
            include: [
                { model: Discipline, as: 'discipline' },
                { model: Adventure, as: 'adventure' }
            ],
            limit: 20
        });

        const questionStats = questions.map(q => ({
            id: q.id,
            question_text: q.question_text,
            discipline_name: q.discipline ? q.discipline.name : 'Geral',
            adventure_title: q.adventure ? q.adventure.title : null,
            attempts: Math.floor(Math.random() * 100), // Mock
            accuracy_rate: Math.floor(Math.random() * 100) // Mock
        }));

        res.render('teacher/reports/questions', { questionStats, user: req.session.user });
    }
};

module.exports = TeacherController;
