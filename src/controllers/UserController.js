const User = require('../models/User');

const UserController = {
    list: async (req, res) => {
        try {
            const users = await User.findAll();
            res.render('admin/users/index', { users, user: req.session.user });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao listar usuários');
        }
    },

    createPage: (req, res) => {
        res.render('admin/users/form', { error: null, user: req.session.user, userToEdit: null });
    },

    create: async (req, res) => {
        const { name, email, password, role, is_active } = req.body;

        try {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.render('admin/users/form', { error: 'E-mail já cadastrado', user: req.session.user, userToEdit: null });
            }

            await User.create({
                name,
                email,
                password_hash: password, // Will be hashed by hook
                role,
                is_active: is_active === 'on'
            });

            res.redirect('/admin/users');
        } catch (error) {
            console.error(error);
            res.render('admin/users/form', { error: 'Erro ao criar usuário', user: req.session.user, userToEdit: null });
        }
    },

    editPage: async (req, res) => {
        try {
            const userToEdit = await User.findByPk(req.params.id);
            if (!userToEdit) {
                return res.redirect('/admin/users');
            }
            res.render('admin/users/form', { userToEdit, error: null, user: req.session.user });
        } catch (error) {
            console.error(error);
            res.redirect('/admin/users');
        }
    },

    update: async (req, res) => {
        const { id } = req.params;
        const { name, email, password, role, is_active } = req.body;

        try {
            const userToUpdate = await User.findByPk(id);
            if (!userToUpdate) {
                return res.redirect('/admin/users');
            }

            userToUpdate.name = name;
            userToUpdate.email = email;
            userToUpdate.role = role;
            userToUpdate.is_active = is_active === 'on';

            if (password) {
                userToUpdate.password_hash = password; // Will be hashed by hook
            }

            await userToUpdate.save();

            res.redirect('/admin/users');
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao atualizar usuário');
        }
    },

    delete: async (req, res) => {
        const { id } = req.params;
        try {
            await User.destroy({ where: { id } });
            res.redirect('/admin/users');
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao excluir usuário');
        }
    }
};

module.exports = UserController;
