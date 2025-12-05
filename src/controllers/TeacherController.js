const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Discipline = require('../models/Discipline');
const User = require('../models/User');
const Character = require('../models/Character');

const TeacherController = {
    // --- Dashboard ---
    dashboard: async (req, res) => {
        try {
            const stats = {
                quizzesCount: await Quiz.count(),
                questionsCount: await Question.count(),
                studentsCount: await User.count({ where: { role: 'player' } })
            };
            res.render('teacher/dashboard', { user: req.session.user, stats });
        } catch (error) {
            console.error(error);
            res.render('teacher/dashboard', { user: req.session.user, stats: {} });
        }
    },

    // --- Quizzes ---
    listQuizzes: async (req, res) => {
        try {
            const { discipline_id, school_year, is_active } = req.query;
            const where = {};
            if (discipline_id) where.discipline_id = discipline_id;
            if (school_year) where.school_year = school_year;
            if (is_active) where.is_active = is_active === '1';

            const quizzes = await Quiz.findAll({
                where,
                include: [{ model: Discipline, as: 'discipline' }],
                order: [['createdAt', 'DESC']]
            });
            const disciplines = await Discipline.findAll({ where: { is_active: true } });

            res.render('teacher/quizzes/index', { quizzes, disciplines, user: req.session.user });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao listar quizzes');
        }
    },

    createQuizPage: async (req, res) => {
        const disciplines = await Discipline.findAll({ where: { is_active: true } });
        res.render('teacher/quizzes/form', { quiz: null, disciplines, user: req.session.user });
    },

    createQuiz: async (req, res) => {
        try {
            const { title, discipline_id, school_year, difficulty, description, objectives, xp_reward, item_reward, is_active } = req.body;
            await Quiz.create({
                title, discipline_id, school_year, difficulty, description, objectives,
                reward_xp: xp_reward, reward_item: item_reward, is_active: is_active === 'on'
            });
            res.redirect('/teacher/quizzes');
        } catch (error) {
            console.error(error);
            res.redirect('/teacher/quizzes/new');
        }
    },

    editQuizPage: async (req, res) => {
        try {
            const quiz = await Quiz.findByPk(req.params.id);
            const disciplines = await Discipline.findAll({ where: { is_active: true } });
            res.render('teacher/quizzes/form', { quiz, disciplines, user: req.session.user });
        } catch (error) {
            res.redirect('/teacher/quizzes');
        }
    },

    updateQuiz: async (req, res) => {
        try {
            const { id } = req.params;
            const { title, discipline_id, school_year, difficulty, description, objectives, xp_reward, item_reward, is_active } = req.body;
            await Quiz.update({
                title, discipline_id, school_year, difficulty, description, objectives,
                reward_xp: xp_reward, reward_item: item_reward, is_active: is_active === 'on'
            }, { where: { id } });
            res.redirect('/teacher/quizzes');
        } catch (error) {
            res.redirect(`/teacher/quizzes/${req.params.id}/edit`);
        }
    },

    deleteQuiz: async (req, res) => {
        await Quiz.destroy({ where: { id: req.params.id } });
        res.redirect('/teacher/quizzes');
    },

    // --- Questions ---
    listQuestions: async (req, res) => {
        try {
            const { discipline_id, quiz_id, school_year, difficulty } = req.query;
            const where = {};
            if (discipline_id) where.discipline_id = discipline_id;
            if (quiz_id) where.quiz_id = quiz_id;
            if (school_year) where.school_year = school_year;
            if (difficulty) where.difficulty = difficulty;

            const questions = await Question.findAll({
                where,
                include: [
                    { model: Discipline, as: 'discipline' },
                    { model: Quiz, as: 'quiz' }
                ],
                order: [['createdAt', 'DESC']]
            });
            const disciplines = await Discipline.findAll({ where: { is_active: true } });
            const quizzes = await Quiz.findAll({ where: { is_active: true } });

            res.render('teacher/questions/index', { questions, disciplines, quizzes, user: req.session.user });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao listar questões');
        }
    },

    createQuestionPage: async (req, res) => {
        const disciplines = await Discipline.findAll({ where: { is_active: true } });
        const quizzes = await Quiz.findAll({ where: { is_active: true } });
        res.render('teacher/questions/form', { question: null, disciplines, quizzes, user: req.session.user });
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
            const quizzes = await Quiz.findAll({ where: { is_active: true } });
            res.render('teacher/questions/form', { question, disciplines, quizzes, user: req.session.user });
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

    reportQuizzes: async (req, res) => {
        const quizzes = await Quiz.findAll({
            include: [{ model: Discipline, as: 'discipline' }]
        });

        const quizStats = quizzes.map(quiz => ({
            id: quiz.id,
            title: quiz.title,
            discipline_name: quiz.discipline ? quiz.discipline.name : 'Geral',
            color_theme: quiz.discipline ? quiz.discipline.color_theme : '#6c757d',
            players_count: Math.floor(Math.random() * 50), // Mock
            avg_accuracy: Math.floor(Math.random() * 100) // Mock
        }));

        res.render('teacher/reports/quizzes', { quizStats, user: req.session.user });
    },

    reportQuestions: async (req, res) => {
        const questions = await Question.findAll({
            include: [
                { model: Discipline, as: 'discipline' },
                { model: Quiz, as: 'quiz' }
            ],
            limit: 20
        });

        const questionStats = questions.map(q => ({
            id: q.id,
            question_text: q.question_text,
            discipline_name: q.discipline ? q.discipline.name : 'Geral',
            quiz_title: q.quiz ? q.quiz.title : null,
            attempts: Math.floor(Math.random() * 100), // Mock
            accuracy_rate: Math.floor(Math.random() * 100) // Mock
        }));

        res.render('teacher/reports/questions', { questionStats, user: req.session.user });
    }
};

module.exports = TeacherController;
