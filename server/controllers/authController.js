const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const crypto = require("crypto");

class AuthController {

    // Регистрация

    async register(req, res) {
        try {
            const {
                email, password, last_name, first_name, middle_name,
                country, city, institution, faculty, study_direction,
                academic_status, phone_number
            } = req.body;

            const userExist = await pool.query(
                "SELECT * FROM users WHERE email = $1",
                [email]
            );

            if (userExist.rows.length > 0) {
                return res.status(400).json("Email уже используется");
            }

            const salt = await bcrypt.genSalt(10);
            const bcryptPassword = await bcrypt.hash(password, salt);

            // 🔑 генерируем токен
            const token = crypto.randomBytes(32).toString("hex");

            const newUser = await pool.query(
                `INSERT INTO users (
                    email, password_hash, verification_token, is_verified, role_id,
                    last_name, first_name, middle_name, country, city, 
                    institution, faculty, study_direction, academic_status, phone_number
                )
                VALUES ($1, $2, $3, false, 3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING *`,
                [
                    email, bcryptPassword, token,
                    last_name, first_name, middle_name, country, city,
                    institution, faculty, study_direction, academic_status, phone_number
                ]
            );

            // 📧 отправка письма
            const transporter = nodemailer.createTransport({
                host: "smtp.mail.ru",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
            await transporter.verify();
            console.log("SMTP работает");
            const link = `http://localhost:5000/api/auth/verify/${token}`;

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Подтверждение почты",
                html: `<h3>Подтверди email</h3>
                    <a href="${link}">${link}</a>`
            });

            res.json("Письмо отправлено, подтвердите email");

        } catch (err) {
            console.error(err.message);
            res.status(500).send("Ошибка регистрации");
        }
    }

    async verifyEmail(req, res) {
        try {
            const { token } = req.params;

            const user = await pool.query(
                "SELECT * FROM users WHERE verification_token = $1",
                [token]
            );

            if (user.rows.length === 0) {
                return res.status(400).send("Неверный токен");
            }

            await pool.query(
                `UPDATE users 
             SET is_verified = true, verification_token = NULL 
             WHERE id = $1`,
                [user.rows[0].id]
            );

            res.send("Email подтверждён!");
        } catch (err) {
            console.error(err);
            res.status(500).send("Ошибка подтверждения");
        }
    }

    // Вход
    async login(req, res) {
        try {
            const { email, password } = req.body;

            const user = await pool.query(
                "SELECT * FROM users WHERE email = $1",
                [email]
            );

            if (user.rows.length === 0) {
                return res.status(401).json("Почта или пароль неверны");
            }

            // ✅ ВОТ ЗДЕСЬ проверка
            if (!user.rows[0].is_verified) {
                return res.status(403).json("Подтвердите email перед входом");
            }

            const validPassword = await bcrypt.compare(
                password,
                user.rows[0].password_hash
            );

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
