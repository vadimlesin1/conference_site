const router = require('express').Router();
const adminController = require('../controllers/adminController');
const authorize = require('../middleware/authorize');
const checkRole = require('../middleware/checkRole');

// Управление секцией (доклады + расписание) — доступно ПК (5) и Администратору ПК (2)
router.get('/dashboard', authorize, checkRole([2, 5]), adminController.getDashboardData);

// Изменить статус заявки (принять/отклонить)
router.put('/submissions/:id', authorize, checkRole([2, 5]), adminController.updateSubmissionStatus);

// Установить точное ВРЕМЯ выступления
router.put('/schedule/:id', authorize, checkRole([2, 5]), adminController.setSchedule);

module.exports = router;
