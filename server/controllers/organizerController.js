const pool = require('../db');
const transporter = require('../mailer');
const { publishedTemplate } = require('../emailTemplates');

class OrganizerController {

    // 1. Получить список пользователей
    async getUsers(req, res) {
        try {
            const users = await pool.query(`
                SELECT id, (first_name || ' ' || last_name) as full_name, email, role_id 
                FROM users 
                ORDER BY last_name
            `);
            res.json(users.rows);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // 2. Получить список секций (ТОЛЬКО ДЛЯ АКТИВНОЙ КОНФЕРЕНЦИИ)
    async getAllSections(req, res) {
        try {
            const sections = await pool.query(`
                SELECT s.id, s.title, s.room, s.section_date, 
                       c.title as conference_name, 
                       (u.first_name || ' ' || u.last_name) as manager_name,
                       s.manager_id
                FROM sections s
                JOIN conferences c ON s.conference_id = c.id
                LEFT JOIN users u ON s.manager_id = u.id
                WHERE c.is_active = true 
                ORDER BY s.id DESC
            `);
            res.json(sections.rows);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // 3. [ИСПРАВЛЕНО] Создать новую секцию (Авто-привязка к активной конференции)
    async createSection(req, res) {
        try {
            // conference_id из body больше не нужен, мы найдем его сами
            const { title, manager_id, room } = req.body;
            const manager = manager_id === "" ? null : manager_id;

            // ШАГ 1: Ищем ID активной конференции
            const activeConf = await pool.query("SELECT id FROM conferences WHERE is_active = true LIMIT 1");
            
            if (activeConf.rows.length === 0) {
                return res.status(400).json("Ошибка: В базе нет активной конференции. Сначала активируйте одну из них.");
            }

            const activeConferenceId = activeConf.rows[0].id;

            // ШАГ 2: Создаем секцию с найденным ID
            const newSection = await pool.query(
                "INSERT INTO sections (title, conference_id, manager_id, room) VALUES($1, $2, $3, $4) RETURNING *",
                [title, activeConferenceId, manager, room]
            );

            res.json(newSection.rows[0]);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // 4. Сменить роль пользователя
    async changeUserRole(req, res) {
        try {
            const { userId, roleId } = req.body;
            await pool.query(
                "UPDATE users SET role_id = $1 WHERE id = $2",
                [roleId, userId]
            );
            res.json("Роль пользователя обновлена");
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // 5. Обновить данные секции
    async updateSectionInfo(req, res) {
        try {
            const { id } = req.params;
            const { title, room } = req.body;
            await pool.query(
                "UPDATE sections SET title = $1, room = $2 WHERE id = $3",
                [title, room, id]
            );
            res.json("Секция обновлена");
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    async updateSectionManager(req, res) {
        try {
            const { id } = req.params;
            let { manager_id } = req.body;
            if (manager_id === "") manager_id = null;

            await pool.query(
                "UPDATE sections SET manager_id = $1 WHERE id = $2",
                [manager_id, id]
            );
            res.json("Менеджер секции обновлен");
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // 6. Получить принятые доклады
    async getAcceptedSubmissions(req, res) {
        try {
            const result = await pool.query(`
                SELECT s.id, s.title, s.start_time, s.duration, 
                       sec.title as section_name, 
                       (u.first_name || ' ' || u.last_name) as speaker_name
                FROM submissions s
                JOIN sections sec ON s.section_id = sec.id
                JOIN conferences c ON sec.conference_id = c.id
                JOIN users u ON s.user_id = u.id
                WHERE s.status = 'accepted' 
                  AND c.is_active = true
                ORDER BY sec.title, s.start_time NULLS LAST, s.id
            `);
            res.json(result.rows);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // 7. Назначить ДАТУ проведения СЕКЦИИ
    async setSectionDate(req, res) {
        try {
            const { id } = req.params; 
            const { section_date } = req.body; 

            await pool.query(
                "UPDATE sections SET section_date = $1 WHERE id = $2",
                [section_date, id]
            );

            res.json("Дата секции установлена");
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // 8. Получить доклады для публикации
    async getReadyToPublish(req, res) {
        try {
            const result = await pool.query(`
                SELECT s.id, s.title, s.status, s.file_url,
                       (u.first_name || ' ' || u.last_name) as author_name,
                       sec.title as section_name
                FROM submissions s
                JOIN users u ON s.user_id = u.id
                JOIN sections sec ON s.section_id = sec.id
                JOIN conferences c ON sec.conference_id = c.id
                WHERE s.status IN ('accepted', 'published')
                  AND c.is_active = true
                ORDER BY 
                    CASE WHEN s.status = 'accepted' THEN 0 ELSE 1 END,
                    sec.title, 
                    s.created_at
            `);
            res.json(result.rows);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // 9. Опубликовать доклад
    async publishSubmission(req, res) {
        try {
            const { id } = req.params;

            // Получаем данные о докладе и участнике (без статуса, статус проверим при апдейте)
            const subRes = await pool.query(
                `SELECT s.title, s.user_id, u.email, u.first_name, u.last_name 
                 FROM submissions s
                 JOIN users u ON s.user_id = u.id
                 WHERE s.id = $1`,
                [id]
            );

            if (subRes.rows.length === 0) {
                return res.status(404).json("Доклад не найден");
            }

            const { title, user_id, email, first_name, last_name } = subRes.rows[0];

            // Атомарное обновление статуса: обновит только если статус ещё не 'published'
            const updateRes = await pool.query(
                "UPDATE submissions SET status = 'published' WHERE id = $1 AND status != 'published' RETURNING id",
                [id]
            );

            // Если ни одна строка не обновилась — значит уже опубликовано
            if (updateRes.rows.length === 0) {
                return res.json("Доклад уже опубликован");
            }

            // Добавляем уведомление на сайт
            const notifMessage = `Ваш доклад «${title}» опубликован! 🌟`;
            await pool.query(
                `INSERT INTO notifications (user_id, message, is_read, created_at) 
                 VALUES ($1, $2, false, NOW())`,
                [user_id, notifMessage]
            );

            // Отправляем письмо (не блокируем ответ при ошибке)
            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: `🌟 Ваш доклад опубликован — ${title}`,
                    html: publishedTemplate({ first_name, last_name, title })
                });
            } catch (emailErr) {
                console.error("Ошибка отправки письма о публикации:", emailErr.message);
            }

            res.json("Доклад опубликован на сайте");
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // 10-12. Новости
    async createNews(req, res) {
        try {
            const { title, content } = req.body;
            const newNews = await pool.query(
                "INSERT INTO news (title, content, is_published, created_at) VALUES ($1, $2, true, NOW()) RETURNING *",
                [title, content]
            );
            res.json(newNews.rows[0]);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    async deleteNews(req, res) {
        try {
            const { id } = req.params;
            await pool.query("DELETE FROM news WHERE id = $1", [id]);
            res.json("Новость удалена");
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }
    
    async getOrganizerNews(req, res) {
        try {
            const news = await pool.query(`
                SELECT id, title, content, created_at, is_published
                FROM news
                ORDER BY created_at DESC
            `);
            res.json(news.rows);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }
}

module.exports = new OrganizerController();
