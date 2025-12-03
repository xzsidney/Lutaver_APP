const Adventure = require('../models/Adventure');
const Discipline = require('../models/Discipline');

module.exports = {

    // LISTA – GET /admin/adventures
    async index(req, res) {
        try {
            const adventures = await Adventure.findAll({
                include: [
                    { model: Discipline, as: 'discipline' }
                ],
                order: [['id', 'ASC']]
            });

            return res.render('admin/adventures/index', {
                title: 'Aventuras - Painel Admin',
                adventures
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao carregar aventuras');
        }
    },

    // FORM NOVA – GET /admin/adventures/new
    async create(req, res) {
        try {
            const disciplines = await Discipline.findAll({
                order: [['name', 'ASC']]
            });

            return res.render('admin/adventures/new', {
                title: 'Nova aventura',
                disciplines
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao carregar formulário de aventura');
        }
    },

    // SALVAR – POST /admin/adventures
    async store(req, res) {
        try {
            const { name, description, difficulty, level, discipline_id } = req.body;

            await Adventure.create({
                name,
                description,
                difficulty,
                level,
                discipline_id
            });

            return res.redirect('/admin/adventures');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao criar aventura');
        }
    },

    // FORM EDITAR – GET /admin/adventures/:id/edit
    async edit(req, res) {
        try {
            const adventure = await Adventure.findByPk(req.params.id, {
                include: [{ model: Discipline, as: 'discipline' }]
            });

            if (!adventure) {
                return res.status(404).send('Aventura não encontrada');
            }

            const disciplines = await Discipline.findAll({
                order: [['name', 'ASC']]
            });

            return res.render('admin/adventures/edit', {
                title: 'Editar aventura',
                adventure,
                disciplines
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao carregar aventura');
        }
    },

    // ATUALIZAR – POST /admin/adventures/:id
    async update(req, res) {
        try {
            const { name, description, difficulty, level, discipline_id } = req.body;

            await Adventure.update(
                { name, description, difficulty, level, discipline_id },
                { where: { id: req.params.id } }
            );

            return res.redirect('/admin/adventures');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao atualizar aventura');
        }
    },

    // EXCLUIR – GET /admin/adventures/:id/delete
    async destroy(req, res) {
        try {
            await Adventure.destroy({ where: { id: req.params.id } });
            return res.redirect('/admin/adventures');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao excluir aventura');
        }
    }
};
