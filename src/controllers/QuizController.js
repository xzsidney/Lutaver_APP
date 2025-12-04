const Quiz = require('../models/Quiz');
const Discipline = require('../models/Discipline');

module.exports = {

    // LISTA – GET /admin/quizzes
    async index(req, res) {
        try {
            const quizzes = await Quiz.findAll({
                include: [
                    { model: Discipline, as: 'discipline' }
                ],
                order: [['id', 'ASC']]
            });

            return res.render('admin/quizzes/index', {
                title: 'Quizzes - Painel Admin',
                quizzes
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao carregar quizzes');
        }
    },

    // FORM NOVA – GET /admin/quizzes/new
    async create(req, res) {
        try {
            const disciplines = await Discipline.findAll({
                order: [['name', 'ASC']]
            });

            return res.render('admin/quizzes/new', {
                title: 'Novo Quiz',
                disciplines
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao carregar formulário de quiz');
        }
    },

    // SALVAR – POST /admin/quizzes
    async store(req, res) {
        try {
            const { title, description, difficulty, school_year, discipline_id, reward_xp, reward_coins } = req.body;

            await Quiz.create({
                title,
                description,
                difficulty,
                school_year,
                discipline_id,
                reward_xp,
                reward_coins
            });

            return res.redirect('/admin/quizzes');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao criar quiz');
        }
    },

    // FORM EDITAR – GET /admin/quizzes/:id/edit
    async edit(req, res) {
        try {
            const quiz = await Quiz.findByPk(req.params.id, {
                include: [{ model: Discipline, as: 'discipline' }]
            });

            if (!quiz) {
                return res.status(404).send('Quiz não encontrado');
            }

            const disciplines = await Discipline.findAll({
                order: [['name', 'ASC']]
            });

            return res.render('admin/quizzes/edit', {
                title: 'Editar Quiz',
                quiz,
                disciplines
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao carregar quiz');
        }
    },

    // ATUALIZAR – POST /admin/quizzes/:id
    async update(req, res) {
        try {
            const { title, description, difficulty, school_year, discipline_id, reward_xp, reward_coins } = req.body;

            await Quiz.update(
                { title, description, difficulty, school_year, discipline_id, reward_xp, reward_coins },
                { where: { id: req.params.id } }
            );

            return res.redirect('/admin/quizzes');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao atualizar quiz');
        }
    },

    // EXCLUIR – GET /admin/quizzes/:id/delete
    async destroy(req, res) {
        try {
            await Quiz.destroy({ where: { id: req.params.id } });
            return res.redirect('/admin/quizzes');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao excluir quiz');
        }
    }
};
