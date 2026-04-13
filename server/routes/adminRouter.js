const router = require('express').Router();
const adminController = require('../controllers/adminController');
const authorize = require('../middleware/authorize');
const checkRole = require('../middleware/checkRole');

// GET: Получить данные дашборда (секции + заявки)
router.get('/dashboard', authorize, checkRole(1), adminController.getDashboardData);

// PUT: Изменить статус заявки (принять/отклонить)
router.put('/submissions/:id', authorize, checkRole(1), adminController.updateSubmissionStatus);

// PUT: Установить точное ВРЕМЯ выступления (Администратор)
router.put('/schedule/:id', authorize, checkRole(1), adminController.setSchedule);

module.exports = router;
