/**
 * Authentication Middleware
 * Checks if user is logged in
 */
const authMiddleware = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    return res.redirect('/login');
};

/**
 * Generic Role Middleware
 * @param {Array<string>} allowedRoles - Array of roles that can access the route
 * @returns {Function} Express middleware function
 */
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.redirect('/login');
        }

        const userRole = req.session.user.role;

        if (allowedRoles.includes(userRole)) {
            return next();
        }

        // Render access denied page
        return res.status(403).render('errors/accessDenied', {
            user: req.session.user,
            requiredRoles: allowedRoles
        });
    };
};

/**
 * Admin Only Middleware
 * Only users with 'admin' role can access
 */
const adminMiddleware = (req, res, next) => {
    return roleMiddleware(['admin'])(req, res, next);
};

/**
 * Teacher or Admin Middleware
 * Users with 'teacher' or 'admin' role can access
 */
const teacherOrAdminMiddleware = (req, res, next) => {
    return roleMiddleware(['teacher', 'admin'])(req, res, next);
};

/**
 * Player Only Middleware (rarely used, but available)
 * Only users with 'player' role can access
 */
const playerOnlyMiddleware = (req, res, next) => {
    return roleMiddleware(['player'])(req, res, next);
};


/**
 * Layout Selector Middleware
 * Automatically chooses the correct EJS layout based on user role
 */
const setUserLayout = (req, res, next) => {

    // Usuários não logados → layout padrão (landing, login, register)
    if (!req.session || !req.session.user) {
        res.locals.layout = 'layouts/main';
        return next();
    }

    // Usuário logado
    const userRole = req.session.user.role;
    res.locals.user = req.session.user; // Disponibilizar usuário para todas as views

    switch (userRole) {
        case 'admin':
            res.locals.layout = 'layouts/admin';
            break;

        case 'teacher':
            res.locals.layout = 'layouts/teacher';
            break;

        case 'player':
        default:
            res.locals.layout = 'layouts/player';
            break;
    }

    next();
};


module.exports = {
    authMiddleware,
    roleMiddleware,
    adminMiddleware,
    teacherOrAdminMiddleware,
    playerOnlyMiddleware,
    setUserLayout
};
