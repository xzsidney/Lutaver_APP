const Discipline = require('../models/Discipline');

module.exports = {
    // LISTAGEM – usado em GET /admin/disciplines
    async index(req, res) {
        try {
            const disciplines = await Discipline.findAll({
                order: [['id', 'ASC']]
            });

            return res.render('admin/disciplines/index', {
                title: 'Disciplinas - Painel Admin',
                disciplines
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao carregar disciplinas');
        }
    },

    // FORM NOVO – GET /admin/disciplines/new
    create(req, res) {
        return res.render('admin/disciplines/new', {
            title: 'Nova disciplina'
        });
    },

    // SALVAR – POST /admin/disciplines
    async store(req, res) {
        try {
            const { name, code, is_active } = req.body;

            await Discipline.create({
                name,
                code,
                is_active: is_active === 'on' ? true : false
            });

            return res.redirect('/admin/disciplines');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao criar disciplina');
        }
    },

    // EDITAR – GET /admin/disciplines/:id/edit
    async edit(req, res) {
        try {
            const discipline = await Discipline.findByPk(req.params.id);

            if (!discipline) {
                return res.status(404).send('Disciplina não encontrada');
            }

            return res.render('admin/disciplines/edit', {
                title: 'Editar disciplina',
                discipline
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao carregar disciplina');
        }
    },

    // ATUALIZAR – POST /admin/disciplines/:id
    async update(req, res) {
        try {
            const { name, code, is_active } = req.body;

            await Discipline.update(
                {
                    name,
                    code,
                    is_active: is_active === 'on' ? true : false
                },
                { where: { id: req.params.id } }
            );

            return res.redirect('/admin/disciplines');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao atualizar disciplina');
        }
    },

    // DELETAR – GET /admin/disciplines/:id/delete
    async destroy(req, res) {
        try {
            await Discipline.destroy({ where: { id: req.params.id } });
            return res.redirect('/admin/disciplines');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao excluir disciplina');
        }
    }
};
