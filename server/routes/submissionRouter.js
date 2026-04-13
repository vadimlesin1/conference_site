const router = require('express').Router();
const submissionController = require('../controllers/submissionController');
const authorize = require('../middleware/authorize');
const multer = require('multer');
const path = require('path');


// --- 1. Настройка загрузки (Multer) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Папка должна существовать
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});


const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 } // Лимит 10 МБ
});


// --- 2. Маршруты ---

// Подача заявки (Защищено токеном)
// ВАЖНО: Имя метода изменено на createOrUpdateSubmission
router.post('/', authorize, upload.single('file'), submissionController.createOrUpdateSubmission);

// Получение списка заявок пользователя (ДОБАВЛЕНО)
// Без этого маршрута вы не увидите свои заявки в личном кабинете
router.get('/', authorize, submissionController.getUserSubmissions);

// Скачивание файла (Защищено токеном)
router.get('/download/:filename', authorize, submissionController.downloadFile);


module.exports = router;
