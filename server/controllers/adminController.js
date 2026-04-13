const pool = require('../db');

class AdminController {

    // 1. Получить данные для дашборда (ТОЛЬКО активная конференция)
        // 1. Получить данные для дашборда
    async getDashboardData(req, res) {
        try {
            const manager_id = req.user;

            // ШАГ 1: Получаем секции администратора (для активной конф.)
            const sectionRes = await pool.query(
                `
                SELECT DISTINCT s.* 
                FROM sections s
                JOIN conferences c ON s.conference_id = c.id
                WHERE s.manager_id = $1
                  AND c.is_active = true
                ORDER BY s.title
                `,
                [manager_id]
            );

            if (sectionRes.rows.length === 0) {
                return res.json({ sections: [], submissions: [] });
            }

            const sections = sectionRes.rows;
            const sectionIds = sections.map(sec => sec.id);

            // ШАГ 2: Получаем доклады. Добавил DISTINCT ON (s.id), чтобы точно убрать дубли, если они есть.
            // DISTINCT ON (s.id) оставит только одну строку для каждого ID доклада.
            const submissionsRes = await pool.query(`
                SELECT DISTINCT ON (s.id) 
                       s.id, s.title, s.abstract, s.status, s.file_url, s.section_id,
                       s.start_time, s.duration, 
                       sec.section_date as scheduled_day,
                       (u.first_name || ' ' || u.last_name) as speaker_name, u.email,
                       sec.title as section_name,
                       s.created_at -- нужно для сортировки
                FROM submissions s
                JOIN users u ON s.user_id = u.id
                JOIN sections sec ON s.section_id = sec.id
                JOIN conferences c ON sec.conference_id = c.id
                WHERE s.section_id = ANY($1)
                  AND c.is_active = true
                ORDER BY s.id, sec.section_date NULLS LAST, s.created_at DESC
            `, [sectionIds]);

            // Возвращаем данные. На фронте можно еще раз отсортировать, т.к. DISTINCT ON требует специфической сортировки.
            // Но обычно этого достаточно.
            
            // Если порядок важен (по дате подачи), пересортируем массив в JS:
            const sortedSubmissions = submissionsRes.rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            res.json({
                sections: sections,
                submissions: sortedSubmissions
            });

        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }


    // 2. Принять или Отклонить заявку
    async updateSubmissionStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            await pool.query(
                "UPDATE submissions SET status = $1 WHERE id = $2",
                [status, id]
            );

            res.json("Статус обновлен");
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // 3. Установить ВРЕМЯ (Администратор) — тоже проверяем, что конференция активна
    async setSchedule(req, res) {
        try {
            const { id } = req.params;
            const { start_time, duration } = req.body;
            const manager_id = req.user;

            // Проверяем права, дату секции и что конференция активна
            const checkRes = await pool.query(`
                SELECT s.id, sec.section_date 
                FROM submissions s
                JOIN sections sec ON s.section_id = sec.id
                JOIN conferences c ON sec.conference_id = c.id
                WHERE s.id = $1 
                  AND sec.manager_id = $2
                  AND c.is_active = true
            `, [id, manager_id]);

            if (checkRes.rows.length === 0) {
                return res.status(403).json("У вас нет прав на управление этим докладом или конференция неактивна");
            }

            const { section_date } = checkRes.rows[0];

            if (!section_date) {
                return res.status(400).json("Организатор еще не назначил дату для этой СЕКЦИИ");
            }

            const assignedDate = new Date(section_date).toISOString().split('T')[0];
            const newDate = new Date(start_time).toISOString().split('T')[0];

            if (assignedDate !== newDate) {
                return res.status(400).json(`Ошибка: Доклад должен быть назначен на дату секции: ${assignedDate}`);
            }

            await pool.query(
                "UPDATE submissions SET start_time = $1, duration = $2 WHERE id = $3",
                [start_time, duration, id]
            );

            res.json("Время выступления обновлено");
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }
}

module.exports = new AdminController();
