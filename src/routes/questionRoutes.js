const express = require('express');
const router = express.Router();
const { authMiddleware, teacherOrAdminMiddleware } = require('../middlewares/auth');
const QuestionController = require('../controllers/QuestionController');

/**
 * Questions Management Routes (Teacher + Admin)
 * Base path: /admin/questions (defined in index.js)
 */

// List all questions
router.get('/', authMiddleware, teacherOrAdminMiddleware, QuestionController.list);

// Create question form
router.get('/new', authMiddleware, teacherOrAdminMiddleware, QuestionController.createPage);

// Create question
router.post('/', authMiddleware, teacherOrAdminMiddleware, QuestionController.create);

// Edit question form
router.get('/:id/edit', authMiddleware, teacherOrAdminMiddleware, QuestionController.editPage);

// Update question
router.post('/:id', authMiddleware, teacherOrAdminMiddleware, QuestionController.update);

// Delete question
router.post('/:id/delete', authMiddleware, teacherOrAdminMiddleware, QuestionController.delete);

module.exports = router;
