const roleMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ msg: 'Accès réservé aux admins.' });
    }
    next();
};

module.exports = roleMiddleware;
