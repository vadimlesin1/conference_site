const pool = require('../db');
const transporter = require('../mailer');

class ReviewController {

    // 1. Получить доклады, назначенные текущему рецензенту
    async getAssignedSubmissions(req, res) {
        try {
            const reviewerId = req.user;

            const result = await pool.query(`
                SELECT s.id, s.title, s.abstract, s.status, s.file_url, 
                       s.current_version, s.rejection_count, s.created_at,
                       sec.title as section_name,
                       (u.first_name || ' ' || u.last_name) as author_name,
                       u.email as author_email,
                       ra.status as assignment_status, ra.assigned_at
                FROM review_assignments ra
                JOIN submissions s ON ra.submission_id = s.id
                JOIN users u ON s.user_id = u.id
                JOIN sections sec ON s.section_id = sec.id
                JOIN conferences c ON sec.conference_id = c.id
                WHERE ra.reviewer_id = $1 AND c.is_active = true
                ORDER BY ra.assigned_at DESC
            `, [reviewerId]);

            res.json(result.rows);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // 2. Получить доклады, доступные для выбора (после дедлайна, без рецензента)
    async getAvailableSubmissions(req, res) {
        try {
            const reviewerId = req.user;

            const result = await pool.query(`
                SELECT s.id, s.title, s.abstract, s.status, s.file_url,
                       s.current_version, s.created_at,
                       sec.title as section_name,
                       (u.first_name || ' ' || u.last_name) as author_name
                FROM submissions s
                JOIN sections sec ON s.section_id = sec.id
                JOIN conferences c ON sec.conference_id = c.id
                JOIN users u ON s.user_id = u.id
                WHERE c.is_active = true
                  AND s.status IN ('pending', 'under_review', 'revision_requested')
                  AND NOT EXISTS (
                      SELECT 1 FROM review_assignments ra 
                      WHERE ra.submission_id = s.id
                  )
                  AND (
                      c.submission_deadline IS NULL 
                      OR NOW() > c.submission_deadline
                  )
                ORDER BY s.created_at ASC
            `);

            res.json(result.rows);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // 3. Рецензент берёт доклад себе
    async claimSubmission(req, res) {
        try {
            const reviewerId = req.user;
            const submissionId = req.params.id;

            // Проверяем, что доклад существует и не занят
            const subRes = await pool.query(
                "SELECT id, status FROM submissions WHERE id = $1",
                [submissionId]
            );

            if (subRes.rows.length === 0) {
                return res.status(404).json("Доклад не найден");
            }

            // Проверяем, не закреплен ли уже
            const existingAssignment = await pool.query(
                "SELECT id FROM review_assignments WHERE submission_id = $1",
                [submissionId]
            );

            if (existingAssignment.rows.length > 0) {
                return res.status(400).json("Доклад уже закреплён за другим рецензентом");
            }

            // Создаём назначение
            await pool.query(
                `INSERT INTO review_assignments (submission_id, reviewer_id, status)
                 VALUES ($1, $2, 'in_progress')`,
                [submissionId, reviewerId]
            );

            // Обновляем статус доклада
            await pool.query(
                "UPDATE submissions SET status = 'under_review', reviewer_id = $1 WHERE id = $2",
                [reviewerId, submissionId]
            );

            res.json("Доклад закреплён за вами");
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // 4. Отправить рецензию (принять/отклонить + причина)
    async submitReview(req, res) {
        try {
            const reviewerId = req.user;
            const submissionId = req.params.id;
            const { decision, rejection_reason, comment } = req.body;

            if (!['accepted', 'rejected'].includes(decision)) {
                return res.status(400).json("Некорректное решение. Допустимо: accepted, rejected");
            }

            // Проверяем что доклад назначен этому рецензенту
            const assignRes = await pool.query(
                "SELECT id FROM review_assignments WHERE submission_id = $1 AND reviewer_id = $2",
                [submissionId, reviewerId]
            );

            if (assignRes.rows.length === 0) {
                return res.status(403).json("Этот доклад не назначен вам");
            }

            // Получаем данные доклада
            const subRes = await pool.query(
                `SELECT s.*, u.email, u.first_name, u.last_name
                 FROM submissions s
                 JOIN users u ON s.user_id = u.id
                 WHERE s.id = $1`,
                [submissionId]
            );

            if (subRes.rows.length === 0) {
                return res.status(404).json("Доклад не найден");
            }

            const submission = subRes.rows[0];

            // Сохраняем текущую версию в submission_versions (если ещё нет)
            const existingVersion = await pool.query(
                "SELECT id FROM submission_versions WHERE submission_id = $1 AND version_number = $2",
                [submissionId, submission.current_version]
            );

            if (existingVersion.rows.length === 0) {
                await pool.query(
                    `INSERT INTO submission_versions 
                     (submission_id, version_number, file_url, title, abstract, is_current)
                     VALUES ($1, $2, $3, $4, $5, true)`,
                    [submissionId, submission.current_version, submission.file_url, submission.title, submission.abstract]
                );
            }

            // Создаём рецензию
            await pool.query(
                `INSERT INTO reviews (submission_id, reviewer_id, version_number, decision, rejection_reason, comment)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [submissionId, reviewerId, submission.current_version, decision, rejection_reason || null, comment || null]
            );

            // Независимо от решения, доклад переходит в статус 'reviewed' (ожидает решения ПК)
            await pool.query(
                "UPDATE submissions SET status = 'reviewed' WHERE id = $1",
                [submissionId]
            );

            await pool.query(
                "UPDATE review_assignments SET status = 'completed' WHERE submission_id = $1 AND reviewer_id = $2",
                [submissionId, reviewerId]
            );

            // Уведомление ПК
            const pcUsers = await pool.query("SELECT id FROM users WHERE role_id = 5 OR role_id = 2");
            for (const pc of pcUsers.rows) {
                await pool.query(
                    `INSERT INTO notifications (user_id, message, is_read, created_at)
                     VALUES ($1, $2, false, NOW())`,
                    [pc.id, `Рецензент ${decision === 'accepted' ? 'принял' : 'отклонил'} доклад «${submission.title}». Требуется решение программного комитета.`]
                );
            }

            // Email рецензенту — подтверждение
            try {
                const { reviewSubmittedTemplate } = require('../emailTemplates');
                // Email не блокирует ответ
            } catch (emailErr) {
                console.error("Ошибка отправки письма:", emailErr.message);
            }

            res.json({ message: "Рецензия отправлена", decision });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // 5. Получить все версии доклада
    async getSubmissionVersions(req, res) {
        try {
            const submissionId = req.params.id;

            const versions = await pool.query(`
                SELECT sv.*, r.decision, r.rejection_reason, r.comment, r.created_at as review_date,
                       (ru.first_name || ' ' || ru.last_name) as reviewer_name
                FROM submission_versions sv
                LEFT JOIN reviews r ON r.submission_id = sv.submission_id AND r.version_number = sv.version_number
                LEFT JOIN users ru ON r.reviewer_id = ru.id
                WHERE sv.submission_id = $1
                ORDER BY sv.version_number ASC
            `, [submissionId]);

            res.json(versions.rows);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // 6. Получить все рецензии для доклада
    async getReviewsForSubmission(req, res) {
        try {
            const submissionId = req.params.id;

            const reviews = await pool.query(`
                SELECT r.*, (u.first_name || ' ' || u.last_name) as reviewer_name
                FROM reviews r
                JOIN users u ON r.reviewer_id = u.id
                WHERE r.submission_id = $1
                ORDER BY r.created_at ASC
            `, [submissionId]);

            res.json(reviews.rows);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }
}

module.exports = new ReviewController();
