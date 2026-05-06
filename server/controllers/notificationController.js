const pool = require('../db');

class NotificationController {

    // Получить уведомления пользователя
    async getNotifications(req, res) {
        try {
            const userId = req.user;
            const result = await pool.query(
                `SELECT * FROM notifications 
                 WHERE user_id = $1 
                 ORDER BY created_at DESC 
                 LIMIT 20`,
                [userId]
            );
            res.json(result.rows);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // Количество непрочитанных
    async getUnreadCount(req, res) {
        try {
            const userId = req.user;
            const result = await pool.query(
                `SELECT COUNT(*) FROM notifications 
                 WHERE user_id = $1 AND is_read = false`,
                [userId]
            );
            res.json({ count: parseInt(result.rows[0].count) });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }

    // Пометить все как прочитанные
    async markAllRead(req, res) {
        try {
            const userId = req.user;
            await pool.query(
                `UPDATE notifications SET is_read = true 
                 WHERE user_id = $1 AND is_read = false`,
                [userId]
            );
            res.json("Все уведомления прочитаны");
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера");
        }
    }
}

module.exports = new NotificationController();
