const Question = require('../models/Question');
const Discipline = require('../models/Discipline');
const Adventure = require('../models/Adventure');

const QuestionController = {
    /**
     * List all questions with filters
     */
    list: async (req, res) => {
        try {
            const { discipline_id, adventure_id, school_year, difficulty } = req.query;

            // Build filter object
            const where = {};
            if (discipline_id) where.discipline_id = discipline_id;
            if (adventure_id) where.adventure_id = adventure_id;
            if (school_year) where.school_year = school_year;
            if (difficulty) where.difficulty = parseInt(difficulty);

            const questions = await Question.findAll({
                where,
                include: [
                    {
                        model: Discipline,
                        as: 'discipline'
                    },
                    {
                        model: Adventure,
                        as: 'adventure',
                        required: false
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            // Get all disciplines and adventures for filters
            const disciplines = await Discipline.findAll({
                where: { is_active: true },
                order: [['name', 'ASC']]
            });
            const adventures = await Adventure.findAll({
                where: { is_active: true },
                order: [['title', 'ASC']]
            });

            res.render('admin/questions/index', {
                questions,
                disciplines,
                adventures,
                filters: { discipline_id, adventure_id, school_year, difficulty },
                user: req.session.user
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao listar questões');
        }
    },

    /**
     * Show create form
     */
    createPage: async (req, res) => {
        try {
            const disciplines = await Discipline.findAll({
                where: { is_active: true },
                order: [['name', 'ASC']]
            });
            const adventures = await Adventure.findAll({
                where: { is_active: true },
                order: [['title', 'ASC']]
            });

            res.render('admin/questions/form', {
                disciplines,
                adventures,
                error: null,
                user: req.session.user,
                question: null
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao carregar formulário');
        }
    },

    /**
     * Create new question
     */
    create: async (req, res) => {
        const {
            discipline_id, adventure_id, school_year, difficulty, question_text,
            option_a, option_b, option_c, option_d,
            correct_option, explanation
        } = req.body;

        try {
            await Question.create({
                discipline_id,
                adventure_id: adventure_id || null,
                school_year,
                difficulty: parseInt(difficulty),
                question_text,
                option_a,
                option_b,
                option_c,
                option_d,
                correct_option,
                explanation
            });

            res.redirect('/admin/questions');
        } catch (error) {
            console.error(error);
            const disciplines = await Discipline.findAll({
                where: { is_active: true },
                order: [['name', 'ASC']]
            });
            const adventures = await Adventure.findAll({
                where: { is_active: true },
                order: [['title', 'ASC']]
            });
            res.render('admin/questions/form', {
                disciplines,
                adventures,
                error: 'Erro ao criar questão',
                user: req.session.user,
                question: null
            });
        }
    },

    /**
     * Show edit form
     */
    editPage: async (req, res) => {
        try {
            const question = await Question.findByPk(req.params.id, {
                include: [
                    { model: Discipline, as: 'discipline' },
                    { model: Adventure, as: 'adventure' }
                ]
            });

            if (!question) {
                return res.redirect('/admin/questions');
            }

            const disciplines = await Discipline.findAll({
                where: { is_active: true },
                order: [['name', 'ASC']]
            });
            const adventures = await Adventure.findAll({
                where: { is_active: true },
                order: [['title', 'ASC']]
            });

            res.render('admin/questions/form', {
                question,
                disciplines,
                adventures,
                error: null,
                user: req.session.user
            });
        } catch (error) {
            console.error(error);
            res.redirect('/admin/questions');
        }
    },

    /**
     * Update question
     */
    update: async (req, res) => {
        const { id } = req.params;
        const {
            discipline_id, adventure_id, school_year, difficulty, question_text,
            option_a, option_b, option_c, option_d,
            correct_option, explanation
        } = req.body;

        try {
            const question = await Question.findByPk(id);
            if (!question) {
                return res.redirect('/admin/questions');
            }

            question.discipline_id = discipline_id;
            question.adventure_id = adventure_id || null;
            question.school_year = school_year;
            question.difficulty = parseInt(difficulty);
            question.question_text = question_text;
            question.option_a = option_a;
            question.option_b = option_b;
            question.option_c = option_c;
            question.option_d = option_d;
            question.correct_option = correct_option;
            question.explanation = explanation;

            await question.save();

            res.redirect('/admin/questions');
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao atualizar questão');
        }
    },

    /**
     * Delete question
     */
    delete: async (req, res) => {
        const { id } = req.params;
        try {
            await Question.destroy({ where: { id } });
            res.redirect('/admin/questions');
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao excluir questão');
        }
    }
};

module.exports = QuestionController;
