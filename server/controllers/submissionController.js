const pool = require('../db');
const path = require('path');
const fs = require('fs');

class SubmissionController {

    // Создать ИЛИ Обновить заявку
    async createOrUpdateSubmission(req, res) {
        try {
            const { title, abstract, section_id, advisor_name, advisor_email, advisor_is_author, coauthors_list } = req.body;
            const file_url = req.file ? `/uploads/${req.file.filename}` : null;
            const user_id = req.user;

            // 1. Ищем активную конференцию (Берем самую свежую по дате начала)
            const confRes = await pool.query(`
                SELECT id, date_start, date_end, submission_deadline 
                FROM conferences 
                WHERE is_active = true 
                ORDER BY date_start DESC 
                LIMIT 1
            `);

            if (confRes.rows.length === 0) {
                return res.status(400).json("Нет активной конференции.");
            }

            const conference = confRes.rows[0];

            // 2. ПРОВЕРКА ДЕДЛАЙНА ПОДАЧИ — заявки принимаются до submission_deadline
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            // Проверяем дедлайн подачи (submission_deadline)
            if (conference.submission_deadline) {
                const deadline = new Date(conference.submission_deadline);
                deadline.setHours(0, 0, 0, 0);
                console.log(`Проверка: Сегодня ${now.toLocaleDateString()} > Дедлайн подачи ${deadline.toLocaleDateString()}`);
                if (now.getTime() > deadline.getTime()) {
                    return res.status(403).json("Прием заявок закрыт (дедлайн подачи прошёл).");
                }
            }

            // Также проверяем дату окончания конференции
            const conferenceEnd = new Date(conference.date_end);
            conferenceEnd.setHours(0, 0, 0, 0);
            if (now.getTime() > conferenceEnd.getTime()) {
                return res.status(403).json("Прием заявок закрыт (дата конференции прошла).");
            }


            // 3. Ищем существующую заявку в ЭТОЙ секции
            const existingSubRes = await pool.query(`
                SELECT s.id, s.file_url, s.status
                FROM submissions s
                WHERE s.user_id = $1 
                  AND s.section_id = $2
            `, [user_id, section_id]);

            // СЦЕНАРИЙ А: ОБНОВЛЕНИЕ
            if (existingSubRes.rows.length > 0) {
                const oldSub = existingSubRes.rows[0];

                if (oldSub.status === 'accepted' || oldSub.status === 'published') {
                    return res.status(403).json("В эту секцию ваш доклад уже принят или опубликован. Вы больше не можете его изменять.");
                }

                if (oldSub.status === 'final_rejected') {
                    return res.status(403).json("Ваш доклад получил 3 отказа. Вы больше не можете подавать доклады в эту секцию.");
                }

                const finalFileUrl = file_url || oldSub.file_url;

                const updatedSub = await pool.query(`
                    UPDATE submissions 
                    SET title = $1, abstract = $2, section_id = $3, file_url = $4, status = 'pending', created_at = NOW(),
                        advisor_name = $6, advisor_email = $7, advisor_is_author = $8, coauthors_list = $9
                    WHERE id = $5
                    RETURNING *
                `, [title, abstract, section_id, finalFileUrl, oldSub.id, advisor_name, advisor_email, advisor_is_author === 'true', coauthors_list]);

                return res.json({ message: "Ваша заявка обновлена!", submission: updatedSub.rows[0] });
            }

            // СЦЕНАРИЙ Б: СОЗДАНИЕ
            if (!file_url) {
                return res.status(400).json("Прикрепите файл для новой заявки!");
            }

            const newSubmission = await pool.query(
                `INSERT INTO submissions (title, abstract, file_url, user_id, section_id, status, created_at, advisor_name, advisor_email, advisor_is_author, coauthors_list) 
                 VALUES ($1, $2, $3, $4, $5, 'pending', NOW(), $6, $7, $8, $9) RETURNING *`,
                [title, abstract, file_url, user_id, section_id, advisor_name, advisor_email, advisor_is_author === 'true', coauthors_list]
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

    async updateSubmissionById(req, res) {
        try {
            const subId = req.params.id;
            const userId = req.user;
            const { title, abstract, section_id, advisor_name, advisor_email, advisor_is_author, coauthors_list } = req.body;
            const file_url = req.file ? `/uploads/${req.file.filename}` : null;

            // Check existing
            const existing = await pool.query("SELECT * FROM submissions WHERE id = $1 AND user_id = $2", [subId, userId]);
            if (existing.rows.length === 0) return res.status(404).json("Доклад не найден");
            const oldSub = existing.rows[0];

            if (oldSub.status === 'accepted' || oldSub.status === 'published') {
                return res.status(403).json("В эту секцию ваш доклад уже принят или опубликован. Вы больше не можете его изменять.");
            }

            const finalFileUrl = file_url || oldSub.file_url;
            
            const updatedSub = await pool.query(`
                UPDATE submissions 
                SET title = $1, abstract = $2, section_id = $3, file_url = $4, status = 'pending', created_at = NOW(),
                    advisor_name = $5, advisor_email = $6, advisor_is_author = $7, coauthors_list = $8
                WHERE id = $9
                RETURNING *
            `, [title, abstract, section_id, finalFileUrl, advisor_name, advisor_email, advisor_is_author === 'true', coauthors_list, subId]);

            res.json({ message: "Доклад обновлен!", submission: updatedSub.rows[0] });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    async deleteSubmissionById(req, res) {
        try {
            const subId = req.params.id;
            const userId = req.user;

            const existing = await pool.query("SELECT * FROM submissions WHERE id = $1 AND user_id = $2", [subId, userId]);
            if (existing.rows.length === 0) return res.status(404).json("Доклад не найден");
            const oldSub = existing.rows[0];

            if (oldSub.reviewer_id) {
                return res.status(403).json("Доклад, которому уже назначен рецензент, нельзя удалить.");
            }

            if (oldSub.status === 'accepted' || oldSub.status === 'published') {
                return res.status(403).json("Принятый или опубликованный доклад нельзя удалить.");
            }

            await pool.query("DELETE FROM submissions WHERE id = $1 AND user_id = $2", [subId, userId]);
            res.json("Доклад удален!");
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }
    async updatePaymentStatus(req, res) {
        try {
            const subId = req.params.id;
            const { payment_status } = req.body;

            // Обновляем статус оплаты доклада.
            const result = await pool.query(
                "UPDATE submissions SET payment_status = $1 WHERE id = $2 RETURNING *",
                [payment_status, subId]
            );

            if (result.rows.length === 0) return res.status(404).json("Доклад не найден");
            res.json(result.rows[0]);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // Повторная отправка после рецензии (с версионностью)
    async resubmitAfterReview(req, res) {
        try {
            const subId = req.params.id;
            const userId = req.user;
            const { title, abstract } = req.body;
            const file_url = req.file ? `/uploads/${req.file.filename}` : null;

            // Проверяем что доклад принадлежит пользователю
            const existing = await pool.query(
                "SELECT * FROM submissions WHERE id = $1 AND user_id = $2",
                [subId, userId]
            );

            if (existing.rows.length === 0) {
                return res.status(404).json("Доклад не найден");
            }

            const oldSub = existing.rows[0];

            // Только если статус = revision_requested
            if (oldSub.status !== 'revision_requested') {
                return res.status(403).json("Доклад не в статусе 'требует доработки'");
            }

            // Проверяем лимит отказов
            if (oldSub.rejection_count >= 3) {
                return res.status(403).json("Достигнут лимит отказов (3 из 3). Доклад окончательно отклонён.");
            }

            if (!file_url) {
                return res.status(400).json("Прикрепите файл с исправленным докладом");
            }

            // Сохраняем СТАРУЮ версию в submission_versions (если ещё не сохранена)
            const existingVersion = await pool.query(
                "SELECT id FROM submission_versions WHERE submission_id = $1 AND version_number = $2",
                [subId, oldSub.current_version]
            );

            if (existingVersion.rows.length === 0) {
                await pool.query(
                    `INSERT INTO submission_versions 
                     (submission_id, version_number, file_url, title, abstract, is_current)
                     VALUES ($1, $2, $3, $4, $5, false)`,
                    [subId, oldSub.current_version, oldSub.file_url, oldSub.title, oldSub.abstract]
                );
            } else {
                // Помечаем старую как не текущую
                await pool.query(
                    "UPDATE submission_versions SET is_current = false WHERE submission_id = $1 AND version_number = $2",
                    [subId, oldSub.current_version]
                );
            }

            // Увеличиваем версию
            const newVersion = (oldSub.current_version || 1) + 1;

            // Сохраняем НОВУЮ версию
            await pool.query(
                `INSERT INTO submission_versions 
                 (submission_id, version_number, file_url, title, abstract, is_current)
                 VALUES ($1, $2, $3, $4, $5, true)`,
                [subId, newVersion, file_url, title || oldSub.title, abstract || oldSub.abstract]
            );

            // Обновляем основную запись
            await pool.query(`
                UPDATE submissions 
                SET title = $1, abstract = $2, file_url = $3, 
                    status = 'revision_submitted', current_version = $4, created_at = NOW()
                WHERE id = $5
            `, [
                title || oldSub.title, 
                abstract || oldSub.abstract, 
                file_url, 
                newVersion,
                subId
            ]);

            res.json({ message: `Доклад обновлён (версия ${newVersion}). Отправлен на повторную рецензию.`, version: newVersion });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // Получить версии своего доклада (для автора)
    async getMySubmissionVersions(req, res) {
        try {
            const subId = req.params.id;
            const userId = req.user;

            // Проверяем что доклад принадлежит пользователю
            const subCheck = await pool.query(
                "SELECT id FROM submissions WHERE id = $1 AND user_id = $2",
                [subId, userId]
            );

            if (subCheck.rows.length === 0) {
                return res.status(404).json("Доклад не найден");
            }

            const versions = await pool.query(`
                SELECT sv.*, 
                       r.decision, r.rejection_reason, r.comment, r.created_at as review_date,
                       (ru.first_name || ' ' || ru.last_name) as reviewer_name
                FROM submission_versions sv
                LEFT JOIN reviews r ON r.submission_id = sv.submission_id AND r.version_number = sv.version_number
                LEFT JOIN users ru ON r.reviewer_id = ru.id
                WHERE sv.submission_id = $1
                ORDER BY sv.version_number ASC
            `, [subId]);

            res.json(versions.rows);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }
}

module.exports = new SubmissionController();

