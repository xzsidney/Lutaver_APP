const User = require('../models/User');

const AuthController = {
    loginPage: (req, res) => {
        res.render('auth/login', { error: null });
    },

    login: async (req, res) => {
        const { email, password } = req.body;

        try {
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.render('auth/login', { error: 'E-mail ou senha inválidos' });
            }

            if (!user.is_active) {
                return res.render('auth/login', { error: 'Usuário desativado. Contate o administrador.' });
            }

            const isMatch = await user.checkPassword(password);

            if (!isMatch) {
                return res.render('auth/login', { error: 'E-mail ou senha inválidos' });
            }
            // Depois de validar o usuário e senha
            req.session.user = {
                id: user.id,
                name: user.name,
                role: user.role // 'admin' | 'teacher' | 'player'
            };

            switch (user.role) {
                case 'admin':
                    return res.redirect('/admin');
                case 'teacher':
                    return res.redirect('/teacher');
                case 'player':
                default:
                    return res.redirect('/player/dashboard');
            }
        } catch (error) {
            console.error(error);
            return res.render('auth/login', { error: 'Erro interno do servidor' });
        }
    },

    registerPage: (req, res) => {
        res.render('auth/register', { error: null, name: '', email: '' });
    },

    register: async (req, res) => {
        const { name, email, password, confirm_password } = req.body;

        try {
            if (password !== confirm_password) {
                return res.render('auth/register', {
                    error: 'As senhas não conferem',
                    name,
                    email
                });
            }

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.render('auth/register', {
                    error: 'Este e-mail já está em uso',
                    name,
                    email
                });
            }

            await User.create({
                name,
                email,
                password_hash: password,
                role: 'player',
                is_active: true
            });

            return res.render('auth/login', { error: 'Conta criada com sucesso! Faça login.' });
        } catch (error) {
            console.error(error);
            return res.render('auth/register', {
                error: 'Erro ao criar conta. Tente novamente.',
                name,
                email
            });
        }
    },

    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) console.log(err);
            res.redirect('/');
        });
    }
};

module.exports = AuthController;
