const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  
    if (req.session && req.session.user) {
        
        req.user = req.session.user;
        return next();
    }


    const authHeader = req.header('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = decoded;
            return next();
        } catch (err) {
            
            return res.status(401).json({ message: 'Token invalide.' });
        }
    }

   
    return res.status(401).json({ message: 'Aucun token ou session valide, autorisation refusée.' });
};

module.exports = authMiddleware;