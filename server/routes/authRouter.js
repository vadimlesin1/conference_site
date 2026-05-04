const Router = require('express');
const router = new Router();
const authController = require('../controllers/authController');

// Маршруты
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get("/verify/:token", authController.verifyEmail);

module.exports = router;
