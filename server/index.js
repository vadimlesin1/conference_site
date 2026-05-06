const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const path = require('path');

// Импорты роутеров
const authRouter = require('./routes/authRouter');
const dashboardRouter = require('./routes/dashboardRouter');
const submissionRouter = require('./routes/submissionRouter'); 
const organizerRouter = require('./routes/organizerRouter');
const publicRouter = require('./routes/publicRouter'); // <--- Проверь, что файл так и называется!
const adminRouter = require('./routes/adminRouter');
const notificationRouter = require('./routes/notificationRouter');

// middleware
app.use(cors());
app.use(express.json());

// Отдача статических файлов (для скачивания)
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// routes
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/organizer', organizerRouter);
app.use('/api/admin', adminRouter);
app.use('/api/submissions', submissionRouter); 
app.use('/api/public', publicRouter); // <--- Подключение расписания
app.use('/api/notifications', notificationRouter);

// server/index.js (примерно)
const archiveController = require('./controllers/archiveController');
app.get('/api/archive', archiveController.getArchiveList);
app.get('/api/archive/:id', archiveController.getArchiveDetails);
// В server/index.js должно быть:
app.use('/uploads', express.static('uploads')); // или path.join(__dirname, 'uploads')


app.listen(5000, () => {
    console.log("server has started on port 5000");
});

// Отлавливаем скрытые ошибки, из-за которых сервер может тихо падать
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});
