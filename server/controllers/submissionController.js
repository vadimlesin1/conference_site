const pool = require('../db');
const path = require('path');
const fs = require('fs');

class SubmissionController {

    // Создать ИЛИ Обновить заявку
    async createOrUpdateSubmission(req, res) {
        try {
            const { title, abstract, section_id } = req.body;
            const file_url = req.file ? `/uploads/${req.file.filename}` : null;
            const user_id = req.user; 

            // 1. Ищем активную конференцию (Берем самую свежую по дате начала)
            const confRes = await pool.query(`
                SELECT id, date_start 
                FROM conferences 
                WHERE is_active = true 
                ORDER BY date_start DESC 
                LIMIT 1
            `);

            if (confRes.rows.length === 0) {
                return res.status(400).json("Нет активной конференции.");
            }

            const conference = confRes.rows[0];

            // 2. ПРОВЕРКА ДАТЫ (Используем местное время, а не UTC)
            const now = new Date();
            const conferenceDate = new Date(conference.date_start);
            
            // Сбрасываем время в 00:00:00, чтобы сравнивать только дни
            now.setHours(0, 0, 0, 0);
            conferenceDate.setHours(0, 0, 0, 0);

            console.log(`Проверка: Сегодня ${now.toLocaleDateString()} > Начало ${conferenceDate.toLocaleDateString()}`);

            // Запрещаем только если "сегодня" строго позже "даты начала"
            if (now.getTime() > conferenceDate.getTime()) {
                return res.status(403).json("Прием заявок закрыт (дата конференции прошла).");
            }

            // 3. Ищем существующую заявку
            const existingSubRes = await pool.query(`
                SELECT s.id, s.file_url 
                FROM submissions s
                JOIN sections sec ON s.section_id = sec.id
                WHERE s.user_id = $1 
                  AND sec.conference_id = $2
            `, [user_id, conference.id]);

            // СЦЕНАРИЙ А: ОБНОВЛЕНИЕ
            if (existingSubRes.rows.length > 0) {
                const oldSub = existingSubRes.rows[0];
                const finalFileUrl = file_url || oldSub.file_url;

                const updatedSub = await pool.query(`
                    UPDATE submissions 
                    SET title = $1, abstract = $2, section_id = $3, file_url = $4, status = 'pending', created_at = NOW()
                    WHERE id = $5
                    RETURNING *
                `, [title, abstract, section_id, finalFileUrl, oldSub.id]);

                return res.json({ message: "Ваша заявка обновлена!", submission: updatedSub.rows[0] });
            }

            // СЦЕНАРИЙ Б: СОЗДАНИЕ
            if (!file_url) {
                return res.status(400).json("Прикрепите файл для новой заявки!");
            }

            const newSubmission = await pool.query(
                `INSERT INTO submissions (title, abstract, file_url, user_id, section_id, status, created_at) 
                 VALUES ($1, $2, $3, $4, $5, 'pending', NOW()) RETURNING *`,
                [title, abstract, file_url, user_id, section_id]
            );

            res.json({ message: "Заявка успешно создана!", submission: newSubmission.rows[0] });

        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // Скачивание
    async downloadFile(req, res) {
        try {
            const filename = req.params.filename;
            const filePath = path.join(__dirname, '..', 'uploads', filename);
            if (!fs.existsSync(filePath)) return res.status(404).json("Файл не найден");
            res.download(filePath, filename);
        } catch (err) { res.status(500).send("Ошибка"); }
    }

    // Список заявок юзера
    async getUserSubmissions(req, res) {
        try {
            const userId = req.user;
            const subs = await pool.query(
                `SELECT s.*, sec.title as section_name 
                 FROM submissions s
                 JOIN sections sec ON s.section_id = sec.id
                 WHERE s.user_id = $1
                 ORDER BY s.created_at DESC`, [userId]
            );
            res.json(subs.rows);
        } catch (err) { res.status(500).send("Ошибка"); }
    }
}

module.exports = new SubmissionController();
