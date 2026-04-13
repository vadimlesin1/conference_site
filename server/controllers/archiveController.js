const pool = require('../db');

class ArchiveController {
    
    // 1. Получить список архивных конференций
    async getArchiveList(req, res) {
        try {
            // Выбираем только те, где is_active = false (прошедшие)
            // Сортируем по дате начала (свежие сверху)
            const list = await pool.query(`
                SELECT id, title, description, date_start, date_end, location, proceedings_url 
                FROM conferences 
                WHERE is_active = false 
                ORDER BY date_start DESC
            `);
            res.json(list.rows);
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    }

    // 2. Получить детали (Секции + Доклады)
    async getArchiveDetails(req, res) {
        try {
            const { id } = req.params;

            // Инфо о конференции
            const confInfo = await pool.query(
                "SELECT * FROM conferences WHERE id = $1", 
                [id]
            );
            
            if (confInfo.rows.length === 0) return res.status(404).json("Conference not found");

            // Доклады (принятые)
            const submissions = await pool.query(`
                SELECT s.title, s.abstract, 
                       (u.first_name || ' ' || u.last_name) as speaker_name,
                       sec.title as section_name
                FROM submissions s
                JOIN sections sec ON s.section_id = sec.id
                JOIN users u ON s.user_id = u.id
                WHERE sec.conference_id = $1 AND s.status = 'accepted'
                ORDER BY sec.title, s.title
            `, [id]);

            res.json({
                info: confInfo.rows[0],
                data: submissions.rows
            });

        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    }
}

module.exports = new ArchiveController();
