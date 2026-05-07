const router = require('express').Router();
const organizerController = require('../controllers/organizerController');
const authorize = require('../middleware/authorize');
const checkRole = require('../middleware/checkRole'); 

// --- ПОЛЬЗОВАТЕЛИ ---
router.get('/users', authorize, checkRole(2), organizerController.getUsers);
router.put('/role', authorize, checkRole(2), organizerController.changeUserRole);

// --- СЕКЦИИ ---
router.get('/sections', authorize, checkRole(2), organizerController.getAllSections);
router.post('/sections', authorize, checkRole(2), organizerController.createSection);
router.put('/sections/:id/manager', authorize, checkRole(2), organizerController.updateSectionManager);
router.put('/sections/:id/info', authorize, checkRole(2), organizerController.updateSectionInfo);

// --- РАСПИСАНИЕ (ДАТА СЕКЦИИ) ---
// 1. Получить доклады (для просмотра) - остается как есть
router.get('/schedule', authorize, checkRole(2), organizerController.getAcceptedSubmissions);

// 2. [ИСПРАВЛЕНО] Назначить ДАТУ СЕКЦИИ (вместо assignDay для доклада)
router.put('/sections/:id/date', authorize, checkRole(2), organizerController.setSectionDate);

// --- ПУБЛИКАЦИЯ ---
router.get('/publish-list', authorize, checkRole(2), organizerController.getReadyToPublish);
router.put('/publish/:id', authorize, checkRole(2), organizerController.publishSubmission);

// --- НОВОСТИ ---
router.get('/news', authorize, checkRole(2), organizerController.getOrganizerNews);
router.post('/news', authorize, checkRole(2), organizerController.createNews);
router.delete('/news/:id', authorize, checkRole(2), organizerController.deleteNews);

// --- СТАТИСТИКА ---
router.get('/statistics', authorize, checkRole(2), organizerController.getStatistics);

module.exports = router;
