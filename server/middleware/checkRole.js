module.exports = (requiredRole) => {
    return (req, res, next) => {
        // req.user у нас хранит ID (число)
        // Но роль мы в токен не зашили, или зашили?
        // Давай проверим AuthController.
        
        // ВАРИАНТ 1: Если роль есть в токене (req.role)
        // В AuthController мы писали: jwt.sign({ user_id: ..., role_id: ... })
        // Значит в authorize.js надо добавить: req.role = payload.role_id;
        
        if (req.role === requiredRole) {
            next();
        } else {
            return res.status(403).json("Нет прав доступа (Role mismatch)");
        }
    };
};
