// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    console.log(token);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const tk = token.replace('Bearer ', '');
        const decoded = jwt.verify(tk, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ error: 'Unauthorized' });
    }
};
