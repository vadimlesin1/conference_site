const router = require('express').Router();
const organizerController = require('../controllers/organizerController');
const authorize = require('../middleware/authorize');
const checkRole = require('../middleware/checkRole');
const multer = require('multer');
const path = require('path');

// Настройка хранилища для сборников
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Папка для сохранения (должна существовать)
    },
    filename: function (req, file, cb) {
        cb(null, 'proceedings-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- КОНФЕРЕНЦИИ ---
router.get('/conferences', authorize, checkRole(2), organizerController.getConferences);
router.post('/conferences', authorize, checkRole(2), organizerController.createConference);
router.put('/conferences/:id', authorize, checkRole(2), organizerController.updateConference);
router.put('/conferences/:id/activate', authorize, checkRole(2), organizerController.activateConference);
router.post('/conferences/:id/proceedings', authorize, checkRole(2), upload.single('file'), organizerController.uploadProceedings);

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

// --- ОПЛАТА ---
router.put('/payment/:id/confirm', authorize, checkRole(2), organizerController.confirmPayment);
router.put('/payment/:id/cancel', authorize, checkRole(2), organizerController.cancelPayment);

// --- НОВОСТИ ---
router.get('/news', authorize, checkRole(2), organizerController.getOrganizerNews);
router.post('/news', authorize, checkRole(2), organizerController.createNews);
router.delete('/news/:id', authorize, checkRole(2), organizerController.deleteNews);

// --- СТАТИСТИКА ---
router.get('/statistics', authorize, checkRole(2), organizerController.getStatistics);

module.exports = router;
