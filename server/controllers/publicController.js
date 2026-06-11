const pool = require('../db');

class PublicController {

    // 1. Получить расписание (только оплаченные доклады, после даты формирования программы)
    async getSchedule(req, res) {
        try {
            // Проверяем дату формирования программы
            const confRes = await pool.query(`
                SELECT id, program_formation_date 
                FROM conferences 
                WHERE is_active = true 
                ORDER BY date_start DESC 
                LIMIT 1
            `);

            if (confRes.rows.length === 0) {
                return res.json([]);
            }

            const conf = confRes.rows[0];

            // Если дата формирования программы установлена и ещё не наступила — возвращаем пустой массив
            if (conf.program_formation_date) {
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const formDate = new Date(conf.program_formation_date);
                formDate.setHours(0, 0, 0, 0);
                if (now.getTime() < formDate.getTime()) {
                    return res.json([]);
                }
            }

            const result = await pool.query(`
                SELECT s.id, s.title, s.abstract, s.start_time, s.duration,
                       sec.title as section_name, sec.room,
                       (u.first_name || ' ' || u.last_name) as speaker_name
                FROM submissions s
                JOIN sections sec ON s.section_id = sec.id
                JOIN conferences c ON sec.conference_id = c.id
                JOIN users u ON s.user_id = u.id
                WHERE s.status IN ('accepted', 'published')
                  AND s.payment_status = 'paid'
                  AND s.start_time IS NOT NULL
                  AND c.id = $1
                ORDER BY s.start_time ASC
            `, [conf.id]);
            res.json(result.rows);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // 2. Получить список секций
    async getAllSections(req, res) {
        try {
            const sections = await pool.query(`
                SELECT s.id, s.title, s.room, s.section_date, s.managers_text
                FROM sections s
                JOIN conferences c ON s.conference_id = c.id
                WHERE c.is_active = true
                ORDER BY s.title ASC
            `);
            res.json(sections.rows);
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    }


    // 3. Получить статистику (Считаем ВСЕ одобренные работы, чтобы цифры были большими)
    async getStats(req, res) {
        try {
            const confInfo = await pool.query(`
                SELECT id, title, description, date_start, date_end, location, submission_deadline, program_formation_date, proceedings_url 
                FROM conferences 
                WHERE is_active = true 
                ORDER BY date_start DESC 
                LIMIT 1
            `);

            if (confInfo.rows.length === 0) {
                return res.json({ title: "Конференция не активна", stats: null });
            }

            const activeConf = confInfo.rows[0];
            const activeConfId = activeConf.id;

            // Считаем (accepted + published)
            const submissionsCount = await pool.query(`
                SELECT COUNT(*) FROM submissions s
                JOIN sections sec ON s.section_id = sec.id
                WHERE sec.conference_id = $1 
                  AND s.status IN ('accepted', 'published') 
            `, [activeConfId]);

            // Считаем участников (accepted + published)
            const participantsCount = await pool.query(`
                SELECT COUNT(DISTINCT s.user_id) FROM submissions s
                JOIN sections sec ON s.section_id = sec.id
                WHERE sec.conference_id = $1 
                  AND s.status IN ('accepted', 'published') 
            `, [activeConfId]);

            res.json({
                info: activeConf,
                stats: {
                    submissions: submissionsCount.rows[0].count,
                    participants: participantsCount.rows[0].count
                }
            });

        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    }

    // 4. Получить принятые и опубликованные доклады (Для страницы "Доклады")
    async getAllAcceptedSubmissions(req, res) {
        try {
            const list = await pool.query(`
                SELECT sub.id, 
                       sub.title, 
                       sub.abstract,
                       (u.last_name || ' ' || u.first_name || ' ' || COALESCE(u.middle_name, '')) as speaker_name,
                       u.institution,
                       sec.title as section_name
                FROM submissions sub
                JOIN sections sec ON sub.section_id = sec.id
                JOIN conferences c ON sec.conference_id = c.id
                JOIN users u ON sub.user_id = u.id
                WHERE sub.status IN ('accepted', 'published')
                  AND c.id = (
                      SELECT id FROM conferences 
                      WHERE is_active = true 
                      ORDER BY date_start DESC 
                      LIMIT 1
                  )
                ORDER BY sec.title ASC, sub.title ASC
            `);
            res.json(list.rows);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    }

    // 5. Получить новости
    async getNews(req, res) {
        try {
            const news = await pool.query(`
                SELECT id, title, content, image_url, created_at
                FROM news
                WHERE is_published = true 
                ORDER BY created_at DESC
            `);
            res.json(news.rows);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }
}

module.exports = new PublicController();
