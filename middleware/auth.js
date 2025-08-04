const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Access token required'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get connection from pool
        const connection = await pool.getConnection();

        try {
            // Check if user still exists in database
            const [users] = await connection.query(
                'SELECT id, username, role FROM users WHERE id = ?',
                [decoded.id]
            );

            if (users.length === 0) {
                return res.status(401).json({
                    error: 'User not found'
                });
            }

            const user = users[0];

            // Add user info to request object
            req.user = {
                id: user.id,
                username: user.username,
                role: user.role
            };

            next();

        } finally {
            connection.release();
        }

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired'
            });
        }

        console.error('Authentication error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Admin access required'
        });
    }
    next();
};

module.exports = {
    authenticateToken,
    requireAdmin
}; 