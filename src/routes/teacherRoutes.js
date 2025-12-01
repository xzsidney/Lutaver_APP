const express = require('express');
const router = express.Router();
const TeacherController = require('../controllers/TeacherController');
const { authMiddleware, teacherOrAdminMiddleware } = require('../middlewares/auth');

// Apply middleware to all teacher routes
router.use(authMiddleware);
router.use(teacherOrAdminMiddleware);

// Dashboard
router.get('/dashboard', TeacherController.dashboard);

// Adventures
router.get('/adventures', TeacherController.listAdventures);
router.get('/adventures/new', TeacherController.createAdventurePage);
router.post('/adventures', TeacherController.createAdventure);
router.get('/adventures/:id/edit', TeacherController.editAdventurePage);
router.post('/adventures/:id', TeacherController.updateAdventure);
router.post('/adventures/:id/delete', TeacherController.deleteAdventure);

// Questions
router.get('/questions', TeacherController.listQuestions);
router.get('/questions/new', TeacherController.createQuestionPage);
router.post('/questions', TeacherController.createQuestion);
router.get('/questions/:id/edit', TeacherController.editQuestionPage);
router.post('/questions/:id', TeacherController.updateQuestion);
router.post('/questions/:id/delete', TeacherController.deleteQuestion);
router.get('/questions/:id/duplicate', TeacherController.duplicateQuestion);

// Reports
router.get('/reports/students', TeacherController.reportStudents);
router.get('/reports/adventures', TeacherController.reportAdventures);
router.get('/reports/questions', TeacherController.reportQuestions);

module.exports = router;
