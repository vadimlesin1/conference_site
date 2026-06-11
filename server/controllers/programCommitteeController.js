const pool = require('../db');
const transporter = require('../mailer');
const { reviewAssignedTemplate, reviewReminderTemplate, revisionRequestedTemplate, finalRejectedTemplate, acceptedTemplate } = require('../emailTemplates');

class ProgramCommitteeController {

    // 1. Получить все доклады (для ПК)
    async getAllSubmissions(req, res) {
        try {
            const result = await pool.query(`
                SELECT s.id, s.title, s.abstract, s.status, s.file_url,
                       s.current_version, s.rejection_count, s.created_at,
                       sec.title as section_name,
                       (u.first_name || ' ' || u.last_name) as author_name,
                       u.email as author_email,
                       (rev.first_name || ' ' || rev.last_name) as reviewer_name,
                       ra.status as assignment_status
                FROM submissions s
                JOIN sections sec ON s.section_id = sec.id
                JOIN conferences c ON sec.conference_id = c.id
                JOIN users u ON s.user_id = u.id
                LEFT JOIN review_assignments ra ON ra.submission_id = s.id
                LEFT JOIN users rev ON ra.reviewer_id = rev.id
                WHERE c.is_active = true
                ORDER BY 
                    CASE s.status 
                        WHEN 'pending' THEN 0
                        WHEN 'revision_submitted' THEN 1
                        WHEN 'under_review' THEN 2
                        WHEN 'revision_requested' THEN 3
                        WHEN 'accepted' THEN 4
                        WHEN 'final_rejected' THEN 5
                        WHEN 'published' THEN 6
                        ELSE 7
                    END,
                    s.created_at DESC
            `);

            res.json(result.rows);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // 2. Получить список рецензентов
    async getReviewers(req, res) {
        try {
            const result = await pool.query(`
                SELECT id, first_name, last_name, email,
                       (SELECT COUNT(*) FROM review_assignments ra WHERE ra.reviewer_id = users.id) as assigned_count
                FROM users 
                WHERE role_id = 4
                ORDER BY last_name
            `);
            res.json(result.rows);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // 3. Назначить рецензента на доклад (ПК может вручную)
    async assignReviewer(req, res) {
        try {
            const { submission_id, reviewer_id } = req.body;
            const assignedBy = req.user;

            // Проверяем что доклад существует
            const subRes = await pool.query("SELECT id, title FROM submissions WHERE id = $1", [submission_id]);
            if (subRes.rows.length === 0) {
                return res.status(404).json("Доклад не найден");
            }

            // Проверяем что рецензент существует и имеет роль 4
            const revRes = await pool.query(
                "SELECT id, first_name, last_name, email FROM users WHERE id = $1 AND role_id = 4",
                [reviewer_id]
            );
            if (revRes.rows.length === 0) {
                return res.status(400).json("Рецензент не найден или не имеет соответствующей роли");
            }

            // Удаляем старое назначение если было
            await pool.query("DELETE FROM review_assignments WHERE submission_id = $1", [submission_id]);

            // Создаём назначение
            await pool.query(
                `INSERT INTO review_assignments (submission_id, reviewer_id, status)
                 VALUES ($1, $2, 'assigned')`,
                [submission_id, reviewer_id]
            );

            // Обновляем submissions
            await pool.query(
                "UPDATE submissions SET status = 'under_review', reviewer_id = $1 WHERE id = $2",
                [reviewer_id, submission_id]
            );

            // Уведомление рецензенту
            const reviewer = revRes.rows[0];
            const submissionTitle = subRes.rows[0].title;

            await pool.query(
                `INSERT INTO notifications (user_id, message, is_read, created_at)
                 VALUES ($1, $2, false, NOW())`,
                [reviewer_id, `Вам назначен доклад для рецензирования: «${submissionTitle}»`]
            );

            // Email рецензенту
            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: reviewer.email,
                    subject: ` Вам назначен доклад для рецензирования — ${submissionTitle}`,
                    html: reviewAssignedTemplate({
                        first_name: reviewer.first_name,
                        last_name: reviewer.last_name,
                        title: submissionTitle
                    })
                });
            } catch (emailErr) {
                console.error("Ошибка отправки письма рецензенту:", emailErr.message);
            }

            res.json("Рецензент назначен");
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // 4. Просмотр всех рецензий
    async getAllReviews(req, res) {
        try {
            const result = await pool.query(`
                SELECT r.*, 
                       s.title as submission_title,
                       s.status as submission_status,
                       s.current_version as submission_current_version,
                       (au.first_name || ' ' || au.last_name) as author_name,
                       (rv.first_name || ' ' || rv.last_name) as reviewer_name
                FROM reviews r
                JOIN submissions s ON r.submission_id = s.id
                JOIN users au ON s.user_id = au.id
                JOIN users rv ON r.reviewer_id = rv.id
                JOIN sections sec ON s.section_id = sec.id
                JOIN conferences c ON sec.conference_id = c.id
                WHERE c.is_active = true
                ORDER BY r.created_at DESC
            `);

            res.json(result.rows);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // 5. Отправить рецензию автору для исправления
    async forwardToAuthor(req, res) {
        try {
            const submissionId = req.params.id;
            const { review_id } = req.body;

            // Получаем данные
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

            // Получаем рецензию
            const reviewRes = await pool.query(
                "SELECT * FROM reviews WHERE id = $1",
                [review_id]
            );

            const review = reviewRes.rows.length > 0 ? reviewRes.rows[0] : null;

            if (!review) {
                return res.status(400).json("Рецензия не найдена");
            }

            if (review.decision === 'accepted') {
                await pool.query("UPDATE submissions SET status = 'accepted' WHERE id = $1", [submissionId]);

                await pool.query(
                    `INSERT INTO notifications (user_id, message, is_read, created_at) VALUES ($1, $2, false, NOW())`,
                    [submission.user_id, `Ваш доклад «${submission.title}» принят! Поздравляем!`]
                );

                try {
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: submission.email,
                        subject: ` Ваш доклад принят — ${submission.title}`,
                        html: acceptedTemplate({
                            first_name: submission.first_name,
                            last_name: submission.last_name,
                            title: submission.title
                        })
                    });
                } catch (err) { console.error("Email err:", err); }

            } else {
                const newRejectionCount = (submission.rejection_count || 0) + 1;

                if (newRejectionCount >= 3) {
                    await pool.query("UPDATE submissions SET status = 'final_rejected', rejection_count = $1 WHERE id = $2", [newRejectionCount, submissionId]);

                    await pool.query(
                        `INSERT INTO notifications (user_id, message, is_read, created_at) VALUES ($1, $2, false, NOW())`,
                        [submission.user_id, `Ваш доклад «${submission.title}» окончательно отклонён после ${newRejectionCount} попыток.`]
                    );

                    try {
                        await transporter.sendMail({
                            from: process.env.EMAIL_USER,
                            to: submission.email,
                            subject: ` Доклад окончательно отклонён — ${submission.title}`,
                            html: finalRejectedTemplate({
                                first_name: submission.first_name,
                                last_name: submission.last_name,
                                title: submission.title
                            })
                        });
                    } catch (err) { console.error("Email err:", err); }
                } else {
                    await pool.query("UPDATE submissions SET status = 'revision_requested', rejection_count = $1 WHERE id = $2", [newRejectionCount, submissionId]);

                    const reasonText = review.rejection_reason ? ` Причина: ${review.rejection_reason}.` : '';
                    const commentText = review.comment ? ` Комментарий: ${review.comment}` : '';

                    await pool.query(
                        `INSERT INTO notifications (user_id, message, is_read, created_at) VALUES ($1, $2, false, NOW())`,
                        [submission.user_id, `Программный комитет направил вам рецензию по докладу «${submission.title}».${reasonText}${commentText} Пожалуйста, исправьте и отправьте повторно.`]
                    );

                    try {
                        await transporter.sendMail({
                            from: process.env.EMAIL_USER,
                            to: submission.email,
                            subject: ` Требуется доработка доклада — ${submission.title}`,
                            html: revisionRequestedTemplate({
                                first_name: submission.first_name,
                                last_name: submission.last_name,
                                title: submission.title,
                                reason: review.rejection_reason || 'Не указана',
                                comment: review.comment || '',
                                attempt: newRejectionCount,
                                max_attempts: 3
                            })
                        });
                    } catch (err) { console.error("Email err:", err); }
                }
            }

            res.json({ message: "Успешно отправлено автору" });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // 6. Отправить исправленный автором доклад обратно рецензенту
    async forwardToReviewer(req, res) {
        try {
            const submissionId = req.params.id;

            const subRes = await pool.query(
                "SELECT * FROM submissions WHERE id = $1",
                [submissionId]
            );

            if (subRes.rows.length === 0) {
                return res.status(404).json("Доклад не найден");
            }

            const submission = subRes.rows[0];

            if (submission.status !== 'revision_submitted') {
                return res.status(400).json("Доклад не в статусе 'Исправлено автором'");
            }

            if (!submission.reviewer_id) {
                return res.status(400).json("У доклада нет назначенного рецензента");
            }

            // Обновляем статус
            await pool.query(
                "UPDATE submissions SET status = 'under_review' WHERE id = $1",
                [submissionId]
            );

            // Уведомляем рецензента
            const revRes = await pool.query("SELECT email, first_name, last_name FROM users WHERE id = $1", [submission.reviewer_id]);
            if (revRes.rows.length > 0) {
                const reviewer = revRes.rows[0];
                await pool.query(
                    `INSERT INTO notifications (user_id, message, is_read, created_at) VALUES ($1, $2, false, NOW())`,
                    [submission.reviewer_id, `Автор прислал исправленную версию доклада «${submission.title}». Требуется повторная рецензия.`]
                );
            }

            res.json({ message: "Успешно отправлено рецензенту" });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // 7. История версий доклада
    async getSubmissionHistory(req, res) {
        try {
            const submissionId = req.params.id;

            // Информация о докладе
            const subRes = await pool.query(
                `SELECT s.*, (u.first_name || ' ' || u.last_name) as author_name
                 FROM submissions s
                 JOIN users u ON s.user_id = u.id
                 WHERE s.id = $1`,
                [submissionId]
            );

            // Версии
            const versions = await pool.query(`
                SELECT sv.*, 
                       r.decision, r.rejection_reason, r.comment, r.created_at as review_date,
                       (ru.first_name || ' ' || ru.last_name) as reviewer_name
                FROM submission_versions sv
                LEFT JOIN reviews r ON r.submission_id = sv.submission_id AND r.version_number = sv.version_number
                LEFT JOIN users ru ON r.reviewer_id = ru.id
                WHERE sv.submission_id = $1
                ORDER BY sv.version_number ASC
            `, [submissionId]);

            res.json({
                submission: subRes.rows[0] || null,
                versions: versions.rows
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // 7. Отправить напоминалки рецензентам (за 2 недели до конференции)
    async sendReminders(req, res) {
        try {
            // Получаем активную конференцию
            const confRes = await pool.query(`
                SELECT id, title, date_start FROM conferences
                WHERE is_active = true
                ORDER BY date_start DESC LIMIT 1
            `);

            if (confRes.rows.length === 0) {
                return res.status(400).json("Нет активной конференции");
            }

            const conference = confRes.rows[0];
            const confStart = new Date(conference.date_start);
            const now = new Date();
            const daysUntilConf = Math.ceil((confStart - now) / (1000 * 60 * 60 * 24));

            // Получаем рецензентов с незавершёнными рецензиями
            const pendingReviews = await pool.query(`
                SELECT DISTINCT ra.reviewer_id, u.first_name, u.last_name, u.email,
                       s.title as submission_title
                FROM review_assignments ra
                JOIN users u ON ra.reviewer_id = u.id
                JOIN submissions s ON ra.submission_id = s.id
                WHERE ra.status IN ('assigned', 'in_progress')
                  AND s.status = 'under_review'
            `);

            let sentCount = 0;

            for (const row of pendingReviews.rows) {
                // Уведомление на сайте
                await pool.query(
                    `INSERT INTO notifications (user_id, message, is_read, created_at)
                     VALUES ($1, $2, false, NOW())`,
                    [row.reviewer_id, `⏰ Напоминание: до конференции осталось ${daysUntilConf} дней. Пожалуйста, завершите рецензирование доклада «${row.submission_title}».`]
                );

                // Email
                try {
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: row.email,
                        subject: `⏰ Напоминание — завершите рецензирование`,
                        html: reviewReminderTemplate({
                            first_name: row.first_name,
                            last_name: row.last_name,
                            title: row.submission_title,
                            days_left: daysUntilConf
                        })
                    });
                } catch (emailErr) {
                    console.error("Ошибка отправки напоминалки:", emailErr.message);
                }

                sentCount++;
            }

            res.json({ message: `Отправлено ${sentCount} напоминаний`, days_until_conference: daysUntilConf });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // 8. Статистика для ПК
    async getStatistics(req, res) {
        try {
            const totalSubmissions = await pool.query(`
                SELECT COUNT(*) as total FROM submissions s
                JOIN sections sec ON s.section_id = sec.id
                JOIN conferences c ON sec.conference_id = c.id
                WHERE c.is_active = true
            `);

            const byStatus = await pool.query(`
                SELECT s.status, COUNT(*) as count FROM submissions s
                JOIN sections sec ON s.section_id = sec.id
                JOIN conferences c ON sec.conference_id = c.id
                WHERE c.is_active = true
                GROUP BY s.status
            `);

            const reviewerLoad = await pool.query(`
                SELECT (u.first_name || ' ' || u.last_name) as reviewer_name,
                       u.email as reviewer_email,
                       COUNT(ra.id) as total_assigned,
                       SUM(CASE WHEN ra.status = 'completed' THEN 1 ELSE 0 END) as completed,
                       SUM(CASE WHEN ra.status IN ('assigned', 'in_progress') THEN 1 ELSE 0 END) as pending
                FROM users u
                LEFT JOIN review_assignments ra ON ra.reviewer_id = u.id
                LEFT JOIN submissions s ON ra.submission_id = s.id
                LEFT JOIN sections sec ON s.section_id = sec.id
                LEFT JOIN conferences c ON sec.conference_id = c.id AND c.is_active = true
                WHERE u.role_id = 4
                GROUP BY u.id, u.first_name, u.last_name, u.email
                ORDER BY total_assigned DESC
            `);

            res.json({
                total: totalSubmissions.rows[0].total,
                by_status: byStatus.rows,
                reviewer_load: reviewerLoad.rows
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }
}

module.exports = new ProgramCommitteeController();
