const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { pool } = require('../config/database');

const router = express.Router();

// Stricter rate limiting for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: '15 minutes'
    },
    skipSuccessfulRequests: true, // Don't count successful requests
});

// Login endpoint
router.post('/login', (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') ? (req, res, next) => next() : authLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        // Manual validation
        if (!username || typeof username !== 'string' || username.trim().length === 0) {
            return res.status(400).json({
                error: 'Username is required and must be a non-empty string'
            });
        }
        
        if (!password || typeof password !== 'string' || password.trim().length === 0) {
            return res.status(400).json({
                error: 'Password is required and must be a non-empty string'
            });
        }
        
        // Validate username length
        if (username.length > 50) {
            return res.status(400).json({
                error: 'Username must be 50 characters or less'
            });
        }
        
        // Validate password length (minimum security)
        if (password.length < 6) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters long'
            });
        }

        // Get connection from pool
        const connection = await pool.getConnection();

        try {
            // Find user by username
            const [users] = await connection.query(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );

            if (users.length === 0) {
                return res.status(401).json({
                    error: 'Invalid credentials'
                });
            }

            const user = users[0];

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password_hash);

            if (!isValidPassword) {
                return res.status(401).json({
                    error: 'Invalid credentials'
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: user.id, 
                    username: user.username, 
                    role: user.role 
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Return user data and token
            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Verify token endpoint
router.get('/verify', (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') ? (req, res, next) => next() : authLimiter, async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'No token provided'
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

            res.json({
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            });

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

        console.error('Token verification error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

module.exports = router; 