module.exports = (requiredRole) => {
    return (req, res, next) => {
        // Поддержка как одного числа, так и массива ролей
        // Пример: checkRole(2) или checkRole([2, 5])
        
        if (Array.isArray(requiredRole)) {
            if (requiredRole.includes(req.role)) {
                next();
            } else {
                return res.status(403).json("Нет прав доступа (Role mismatch)");
            }
        } else {
            if (req.role === requiredRole) {
                next();
            } else {
                return res.status(403).json("Нет прав доступа (Role mismatch)");
            }
        }
    };
};
