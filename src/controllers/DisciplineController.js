const Discipline = require('../models/Discipline');

const DisciplineController = {
    /**
     * List all disciplines
     */
    list: async (req, res) => {
        try {
            const disciplines = await Discipline.findAll({
                order: [['name', 'ASC']]
            });
            res.render('admin/disciplines/index', {
                disciplines,
                user: req.session.user
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao listar disciplinas');
        }
    },

    /**
     * Show create form
     */
    createPage: (req, res) => {
        res.render('admin/disciplines/form', {
            error: null,
            user: req.session.user,
            discipline: null
        });
    },

    /**
     * Create new discipline
     */
    create: async (req, res) => {
        const { name, code, description, school_level, color_theme, icon, is_active } = req.body;

        try {
            // Check if code already exists
            const existingDiscipline = await Discipline.findOne({ where: { code } });
            if (existingDiscipline) {
                return res.render('admin/disciplines/form', {
                    error: 'Código já cadastrado',
                    user: req.session.user,
                    discipline: null
                });
            }

            await Discipline.create({
                name,
                code: code.toUpperCase(),
                description,
                school_level,
                color_theme: color_theme || '#1E90FF',
                icon: icon || '📚',
                is_active: is_active === 'on'
            });

            res.redirect('/admin/disciplines');
        } catch (error) {
            console.error(error);
            res.render('admin/disciplines/form', {
                error: 'Erro ao criar disciplina',
                user: req.session.user,
                discipline: null
            });
        }
    },

    /**
     * Show edit form
     */
    editPage: async (req, res) => {
        try {
            const discipline = await Discipline.findByPk(req.params.id);
            if (!discipline) {
                return res.redirect('/admin/disciplines');
            }
            res.render('admin/disciplines/form', {
                discipline,
                error: null,
                user: req.session.user
            });
        } catch (error) {
            console.error(error);
            res.redirect('/admin/disciplines');
        }
    },

    /**
     * Update discipline
     */
    update: async (req, res) => {
        const { id } = req.params;
        const { name, code, description, school_level, color_theme, icon, is_active } = req.body;

        try {
            const discipline = await Discipline.findByPk(id);
            if (!discipline) {
                return res.redirect('/admin/disciplines');
            }

            // Check if code is being changed and if it already exists
            if (code.toUpperCase() !== discipline.code) {
                const existingDiscipline = await Discipline.findOne({ where: { code: code.toUpperCase() } });
                if (existingDiscipline) {
                    return res.render('admin/disciplines/form', {
                        discipline,
                        error: 'Código já cadastrado',
                        user: req.session.user
                    });
                }
            }

            discipline.name = name;
            discipline.code = code.toUpperCase();
            discipline.description = description;
            discipline.school_level = school_level;
            discipline.color_theme = color_theme || '#1E90FF';
            discipline.icon = icon || '📚';
            discipline.is_active = is_active === 'on';

            await discipline.save();

            res.redirect('/admin/disciplines');
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao atualizar disciplina');
        }
    },

    /**
     * Delete discipline
     */
    delete: async (req, res) => {
        const { id } = req.params;
        try {
            await Discipline.destroy({ where: { id } });
            res.redirect('/admin/disciplines');
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao excluir disciplina');
        }
    }
};

module.exports = DisciplineController;
