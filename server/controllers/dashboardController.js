const pool = require('../db');

class DashboardController {
    async getDashboard(req, res) {
        try {
            // req.user - это ID пользователя из middleware
            const userId = req.user; 

            // 1. ЗАПРОС К БД (Имя + Роль)
            const user = await pool.query(
                "SELECT first_name, last_name, email, role_id FROM users WHERE id = $1", 
                [userId]
            );

            if (user.rows.length === 0) {
                return res.status(404).json("Пользователь не найден");
            }

            const userData = user.rows[0];

            // Склеиваем имя
            const fullName = `${userData.first_name} ${userData.last_name}`;

            // 2. ЗАПРОС ДОКЛАДОВ (ТОЛЬКО АКТИВНАЯ КОНФЕРЕНЦИЯ)
            const submissions = await pool.query(
                `SELECT s.id, s.title, s.abstract, s.status, s.created_at, 
                        s.start_time, s.duration, s.file_url,
                        s.advisor_name, s.advisor_email, s.advisor_is_author,
                        s.payment_status, s.coauthors_list,
                        s.rejection_count, s.current_version, s.section_id,
                        sec.title as section_name,
                        sec.room
                 FROM submissions s
                 JOIN sections sec ON s.section_id = sec.id
                 JOIN conferences c ON sec.conference_id = c.id
                 WHERE s.user_id = $1 AND c.is_active = true
                 ORDER BY s.created_at DESC`,
                [userId]
            );

            // 3. ЗАПРОС АКТИВНОЙ КОНФЕРЕНЦИИ
            const conf = await pool.query("SELECT * FROM conferences WHERE is_active = true LIMIT 1");
            const activeConference = conf.rows.length > 0 ? conf.rows[0] : null;

            // 4. ОТВЕТ НА ФРОНТЕНД
            res.json({
                user: {
                    full_name: fullName,       
                    role_id: userData.role_id, 
                    email: userData.email
                },
                submissions: submissions.rows,
                activeConference: activeConference
            });

        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    }

    async getProfile(req, res) {
        try {
            const user = await pool.query(
                "SELECT first_name, last_name, middle_name, country, city, institution, academic_status FROM users WHERE id = $1",
                [req.user]
            );
            if (user.rows.length === 0) return res.status(404).json("Пользователь не найден");
            res.json(user.rows[0]);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    }

    async updateProfile(req, res) {
        try {
            const { first_name, last_name, middle_name, country, city, institution, academic_status } = req.body;
            const updatedUser = await pool.query(
                `UPDATE users 
                 SET first_name = $1, last_name = $2, middle_name = $3, country = $4, city = $5, institution = $6, academic_status = $7
                 WHERE id = $8 RETURNING *`,
                [first_name, last_name, middle_name, country, city, institution, academic_status, req.user]
            );
            res.json({ message: "Профиль успешно обновлен", user: updatedUser.rows[0] });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    }
}

module.exports = new DashboardController();
