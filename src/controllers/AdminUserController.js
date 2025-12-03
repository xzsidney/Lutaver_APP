// src/controllers/AdminUserController.js
const User = require('../models/User');

module.exports = {
    // LISTA – GET /admin/users
    async index(req, res) {
        try {
            const users = await User.findAll({
                order: [['id', 'ASC']]
            });

            return res.render('admin/users/index', {
                title: 'Usuários - Painel Admin',
                users
            });
        } catch (err) {
            console.error('Erro ao carregar usuários:', err);
            return res.status(500).send('Erro ao carregar usuários');
        }
    },

    // FORM NOVO – GET /admin/users/new
    async create(req, res) {
        try {
            return res.render('admin/users/new', {
                title: 'Novo Usuário',
                error: null
            });
        } catch (err) {
            console.error('Erro ao carregar formulário de usuário:', err);
            return res.status(500).send('Erro ao carregar formulário');
        }
    },

    // SALVAR NOVO – POST /admin/users
    async store(req, res) {
        try {
            const { name, email, password, role, is_active } = req.body;

            await User.create({
                name,
                email,
                password_hash: password,      // se o model tiver hook pra hashear, deixa assim
                role,
                is_active: is_active === 'on'
            });

            return res.redirect('/admin/users');
        } catch (err) {
            console.error('Erro ao criar usuário:', err);
            return res.render('admin/users/new', {
                title: 'Novo Usuário',
                error: 'Erro ao criar usuário. Verifique se o e-mail já está cadastrado.'
            });
        }
    },

    // FORM EDIT – GET /admin/users/:id/edit
    async edit(req, res) {
        try {
            const user = await User.findByPk(req.params.id);

            if (!user) {
                return res.status(404).send('Usuário não encontrado');
            }

            return res.render('admin/users/edit', {
                title: 'Editar Usuário',
                user,
                error: null
            });
        } catch (err) {
            console.error('Erro ao carregar usuário para edição:', err);
            return res.status(500).send('Erro ao carregar usuário');
        }
    },

    // ATUALIZAR – POST /admin/users/:id
    async update(req, res) {
        try {
            const { name, email, password, role, is_active } = req.body;

            const user = await User.findByPk(req.params.id);

            if (!user) {
                return res.status(404).send('Usuário não encontrado');
            }

            user.name = name;
            user.email = email;
            user.role = role;
            user.is_active = is_active === 'on';

            // Se veio senha, atualiza (senão mantém)
            if (password && password.trim() !== '') {
                user.password_hash = password; // hook do model faz o hash
            }

            await user.save();

            return res.redirect('/admin/users');
        } catch (err) {
            console.error('Erro ao atualizar usuário:', err);
            return res.render('admin/users/edit', {
                title: 'Editar Usuário',
                user,
                error: 'Erro ao atualizar usuário. Verifique os dados informados.'
            });
        }
    },

    // CONFIRMAÇÃO EXCLUSÃO – GET /admin/users/:id/delete
    async confirmDelete(req, res) {
        try {
            const user = await User.findByPk(req.params.id);

            if (!user) {
                return res.status(404).send('Usuário não encontrado');
            }

            return res.render('admin/users/delete', {
                title: 'Excluir Usuário',
                user
            });
        } catch (err) {
            console.error('Erro ao carregar usuário para exclusão:', err);
            return res.status(500).send('Erro ao carregar usuário');
        }
    },

    // EXCLUIR – POST /admin/users/:id/delete ou GET, conforme preferir
    async destroy(req, res) {
        try {
            await User.destroy({ where: { id: req.params.id } });
            return res.redirect('/admin/users');
        } catch (err) {
            console.error('Erro ao excluir usuário:', err);
            return res.status(500).send('Erro ao excluir usuário');
        }
    }
};
