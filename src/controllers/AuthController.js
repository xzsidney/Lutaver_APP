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

    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) console.log(err);
            res.redirect('/');
        });
    }
};

module.exports = AuthController;
