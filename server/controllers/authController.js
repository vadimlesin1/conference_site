const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthController {
    
    // Регистрация
    async register(req, res) {
        try {
            // 1. Деструктуризация данных
            const { 
                email, password, 
                last_name, first_name, middle_name,
                phone_number, country, city, 
                institution, faculty, study_direction,
                academic_status
            } = req.body;

            // 2. Валидация: существует ли юзер?
            const userExist = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
            if (userExist.rows.length > 0) {
                return res.status(401).json("Пользователь с таким Email уже существует!");
            }

            // 3. Хеширование пароля
            const salt = await bcrypt.genSalt(10);
            const bcryptPassword = await bcrypt.hash(password, salt);

            // 4. Запись в БД
            const newUser = await pool.query(
                `INSERT INTO users (
                    email, password_hash, 
                    last_name, first_name, middle_name,
                    phone_number, country, city, 
                    institution, faculty, study_direction, 
                    academic_status, role_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 3) 
                RETURNING *`,
                [
                    email, bcryptPassword, 
                    last_name, first_name, middle_name,
                    phone_number, country, city, 
                    institution, faculty, study_direction, 
                    academic_status
                ]
            );

            // 5. Выдача токена
            const token = jwt.sign(
                { user_id: newUser.rows[0].id }, 
                process.env.JWT_SECRET || "secret_key_123", 
                { expiresIn: "1h" }
            );

            res.json({ token, user: newUser.rows[0] });

        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера при регистрации");
        }
    }

    // Вход
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

            if (user.rows.length === 0) {
                return res.status(401).json("Почта или пароль неверны");
            }

            const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
            if (!validPassword) {
                return res.status(401).json("Почта или пароль неверны");
            }

            const token = jwt.sign(
                { user_id: user.rows[0].id, role_id: user.rows[0].role_id }, 
                process.env.JWT_SECRET || "secret_key_123", 
                { expiresIn: "1h" }
            );

            res.json({ token, role_id: user.rows[0].role_id });

        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка сервера при входе");
        }
    }
}

module.exports = new AuthController();
