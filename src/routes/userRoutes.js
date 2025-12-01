const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

// Protect all user routes with authMiddleware
router.use(authMiddleware);

// List users - Admin only? Request says "Rotas como /users... devem ser acessíveis apenas por admin"
router.get('/', adminMiddleware, UserController.list);

// Create user
router.get('/new', adminMiddleware, UserController.createPage);
router.post('/', adminMiddleware, UserController.create);

// Edit user
router.get('/:id/edit', adminMiddleware, UserController.editPage);
router.post('/:id', adminMiddleware, UserController.update); // Using POST for form submission, could be PUT via method-override

// Delete user
router.post('/:id/delete', adminMiddleware, UserController.delete);

module.exports = router;
