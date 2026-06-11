const router = require('express').Router();
const reviewController = require('../controllers/reviewController');
const authorize = require('../middleware/authorize');
const checkRole = require('../middleware/checkRole');

// Все маршруты только для рецензентов (role_id = 4)

// Получить назначенные доклады
router.get('/assigned', authorize, checkRole(4), reviewController.getAssignedSubmissions);

// Получить доступные для выбора доклады
router.get('/available', authorize, checkRole(4), reviewController.getAvailableSubmissions);

// Взять доклад на рецензию
router.post('/claim/:id', authorize, checkRole(4), reviewController.claimSubmission);

// Отправить рецензию
router.post('/submit/:id', authorize, checkRole(4), reviewController.submitReview);

// Получить версии доклада
router.get('/versions/:id', authorize, checkRole(4), reviewController.getSubmissionVersions);

// Получить рецензии для доклада
router.get('/reviews/:id', authorize, checkRole(4), reviewController.getReviewsForSubmission);

module.exports = router;
