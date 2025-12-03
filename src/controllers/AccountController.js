const User = require('../models/User');
const bcrypt = require('bcrypt');

module.exports = {
    // Exibir perfil do jogador
    async showProfile(req, res) {
        try {
            const userId = req.session.user.id;
            const user = await User.findByPk(userId);

            if (!user) {
                return res.redirect('/login');
            }

            return res.render('player/account/profile', {
                layout: 'layouts/player',
                title: 'Meu Perfil',
                user
            });
        } catch (error) {
            console.error('Error loading profile:', error);
            return res.status(500).send('Erro ao carregar perfil');
        }
    },

    // Exibir formulário de edição
    async editProfile(req, res) {
        try {
            const userId = req.session.user.id;
            const user = await User.findByPk(userId);

            if (!user) {
                return res.redirect('/login');
            }

            return res.render('player/account/edit', {
                layout: 'layouts/player',
                title: 'Editar Conta',
                user,
                error: null,
                success: null
            });
        } catch (error) {
            console.error('Error loading edit form:', error);
            return res.status(500).send('Erro ao carregar formulário');
        }
    },

    // Atualizar perfil
    async updateProfile(req, res) {
        try {
            const userId = req.session.user.id;
            const { name, email } = req.body;

            const user = await User.findByPk(userId);
            if (!user) {
                return res.redirect('/login');
            }

            // Atualizar dados
            await user.update({ name, email });

            // Atualizar sessão
            req.session.user.name = name;
            req.session.user.email = email;

            return res.render('player/account/edit', {
                layout: 'layouts/player',
                title: 'Editar Conta',
                user,
                error: null,
                success: 'Perfil atualizado com sucesso!'
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            const user = await User.findByPk(req.session.user.id);
            return res.render('player/account/edit', {
                layout: 'layouts/player',
                title: 'Editar Conta',
                user,
                error: 'Erro ao atualizar perfil',
                success: null
            });
        }
    },

    // Alterar senha
    async changePassword(req, res) {
        try {
            const userId = req.session.user.id;
            const { currentPassword, newPassword, confirmPassword } = req.body;

            const user = await User.findByPk(userId);
            if (!user) {
                return res.redirect('/login');
            }

            // Verificar senha atual
            const isValidPassword = await user.checkPassword(currentPassword);
            if (!isValidPassword) {
                return res.render('player/account/edit', {
                    layout: 'layouts/player',
                    title: 'Editar Conta',
                    user,
                    error: 'Senha atual incorreta',
                    success: null
                });
            }

            // Verificar se as senhas coincidem
            if (newPassword !== confirmPassword) {
                return res.render('player/account/edit', {
                    layout: 'layouts/player',
                    title: 'Editar Conta',
                    user,
                    error: 'As senhas não coincidem',
                    success: null
                });
            }

            // Atualizar senha (o hook do model vai criptografar)
            user.password_hash = newPassword;
            await user.save();

            return res.render('player/account/edit', {
                layout: 'layouts/player',
                title: 'Editar Conta',
                user,
                error: null,
                success: 'Senha alterada com sucesso!'
            });
        } catch (error) {
            console.error('Error changing password:', error);
            const user = await User.findByPk(req.session.user.id);
            return res.render('player/account/edit', {
                layout: 'layouts/player',
                title: 'Editar Conta',
                user,
                error: 'Erro ao alterar senha',
                success: null
            });
        }
    }
};
