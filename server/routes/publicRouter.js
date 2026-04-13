const router = require('express').Router();
const publicController = require('../controllers/publicController');

// Важно: здесь просто '/schedule', а не '/api/public/schedule'
router.get('/schedule', publicController.getSchedule);
router.get('/sections', publicController.getAllSections);
router.get('/stats', publicController.getStats);
router.get('/submissions', publicController.getAllAcceptedSubmissions);
router.get('/news', publicController.getNews);

module.exports = router;
