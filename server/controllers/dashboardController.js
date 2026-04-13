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

            // 2. ЗАПРОС ДОКЛАДОВ (ОБНОВЛЕННЫЙ)
            const submissions = await pool.query(
                `SELECT s.id, s.title, s.status, s.created_at, 
                        s.start_time, s.duration,   -- <--- ДОБАВЛЕНО ВРЕМЯ
                        sec.title as section_name,
                        sec.room                    -- <--- ДОБАВЛЕНА АУДИТОРИЯ
                 FROM submissions s
                 LEFT JOIN sections sec ON s.section_id = sec.id
                 WHERE s.user_id = $1
                 ORDER BY s.created_at DESC`,
                [userId]
            );

            // 3. ОТВЕТ НА ФРОНТЕНД
            res.json({
                user: {
                    full_name: fullName,       
                    role_id: userData.role_id, 
                    email: userData.email
                },
                submissions: submissions.rows
            });

        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    }
}

module.exports = new DashboardController();
