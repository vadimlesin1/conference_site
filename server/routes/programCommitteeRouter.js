const router = require('express').Router();
const pcController = require('../controllers/programCommitteeController');
const authorize = require('../middleware/authorize');
const checkRole = require('../middleware/checkRole');

// Маршруты для ПК (role_id = 5) и Администратора ПК (role_id = 2)

// Получить все доклады
router.get('/submissions', authorize, checkRole([2, 5]), pcController.getAllSubmissions);

// Получить список рецензентов
router.get('/reviewers', authorize, checkRole([2, 5]), pcController.getReviewers);

// Назначить рецензента
router.post('/assign', authorize, checkRole([2, 5]), pcController.assignReviewer);

// Получить все рецензии
router.get('/reviews', authorize, checkRole([2, 5]), pcController.getAllReviews);

// Отправить рецензию автору
router.post('/forward/:id', authorize, checkRole([2, 5]), pcController.forwardToAuthor);

// Вернуть исправленный доклад рецензенту
router.post('/forward-to-reviewer/:id', authorize, checkRole([2, 5]), pcController.forwardToReviewer);

// История версий доклада
router.get('/history/:id', authorize, checkRole([2, 5]), pcController.getSubmissionHistory);

// Отправить напоминалки
router.post('/reminders', authorize, checkRole([2, 5]), pcController.sendReminders);

// Статистика
router.get('/statistics', authorize, checkRole([2, 5]), pcController.getStatistics);

module.exports = router;
