const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async (req, res, next) => {
  try {
    // 1. Получаем токен из заголовка
    const jwtToken = req.header("token");

    if (!jwtToken) {
      return res.status(403).json("Нет авторизации (токен отсутствует)");
    }

    // 2. Проверяем токен
    // Используем тот же секретный ключ, что и при создании (в AuthController)
    const secretKey = process.env.JWT_SECRET || "secret_key_123";
    const payload = jwt.verify(jwtToken, secretKey);

    // 3. Достаем данные из токена
    // В твоем AuthController: jwt.sign({ user_id: ..., role_id: ... })
    
    req.user = payload.user_id; // ID пользователя (например, 5)
    req.role = payload.role_id; // Роль пользователя (например, 2 - организатор)

    next();
  } catch (err) {
    console.error(err.message);
    return res.status(403).json("Токен недействителен");
  }
};
