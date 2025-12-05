const Question = require('../models/Question');
const Discipline = require('../models/Discipline');
const Quiz = require('../models/Quiz');

module.exports = {

    // GET /admin/questions
    async index(req, res) {
        try {
            const questions = await Question.findAll({
                include: [
                    { model: Discipline, as: 'discipline' },
                    { model: Quiz, as: 'quiz' }
                ],
                order: [['id', 'ASC']]
            });

            return res.render('admin/questions/index', {
                title: 'Questões - Painel Admin',
                questions
            });

        } catch (err) {
            console.error(err);
            return res.status(500).send("Erro ao carregar questões");
        }
    },


    // GET /admin/questions/new
    new(req, res) {
        return res.render('admin/questions/new', {
            title: 'Nova Questão'
        });
    },


    // POST /admin/questions
    async create(req, res) {
        try {
            const { question_text, correct_answer, discipline_id, quiz_id } = req.body;

            await Question.create({
                question_text,
                correct_answer,
                discipline_id,
                quiz_id
            });

            return res.redirect('/admin/questions');

        } catch (err) {
            console.error(err);
            return res.status(500).send("Erro ao criar questão");
        }
    },


    // GET /admin/questions/:id/edit
    async edit(req, res) {
        try {
            const question = await Question.findByPk(req.params.id, {
                include: [
                    { model: Discipline, as: 'discipline' },
                    { model: Quiz, as: 'quiz' }
                ]
            });

            if (!question)
                return res.status(404).send("Questão não encontrada");

            return res.render('admin/questions/edit', {
                title: 'Editar Questão',
                question
            });

        } catch (err) {
            console.error(err);
            return res.status(500).send("Erro ao carregar questão");
        }
    },


    // POST /admin/questions/:id/edit
    async update(req, res) {
        try {
            const { question_text, correct_answer, discipline_id, quiz_id } = req.body;

            await Question.update(
                {
                    question_text,
                    correct_answer,
                    discipline_id,
                    quiz_id
                },
                { where: { id: req.params.id } }
            );

            return res.redirect('/admin/questions');

        } catch (err) {
            console.error(err);
            return res.status(500).send("Erro ao atualizar questão");
        }
    },


    // GET /admin/questions/:id/delete
    async delete(req, res) {
        try {
            await Question.destroy({ where: { id: req.params.id } });
            return res.redirect('/admin/questions');

        } catch (err) {
            console.error(err);
            return res.status(500).send("Erro ao excluir questão");
        }
    }
};
