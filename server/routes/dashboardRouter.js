const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');

// 1. ИМПОРТИРУЕМ НАШ НОВЫЙ ФАЙЛ
const authorize = require('../middleware/authorize'); 

// 2. ВСТАВЛЯЕМ ЕГО В ЦЕПОЧКУ (между '/' и контроллером)
// Теперь, прежде чем пустить к dashboardController, сервер запустит authorize
router.get('/', authorize, dashboardController.getDashboard);
router.get('/profile', authorize, dashboardController.getProfile);
router.put('/profile', authorize, dashboardController.updateProfile);

module.exports = router;
