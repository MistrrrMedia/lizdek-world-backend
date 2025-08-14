const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const { pool } = require('./config/database');

// Rate limiting configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all routes (disabled in test mode)
if (process.env.NODE_ENV !== 'test') {
    app.use(limiter);
}

// Stricter rate limiting for authentication endpoints (disabled in test mode)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'test' ? 1000 : 5, // Higher limit for tests
    message: {
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: '15 minutes'
    },
    skipSuccessfulRequests: true, // Don't count successful requests
});

// Middleware
app.use(helmet());
app.use(logger.request);
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://lizdek.world', 'https://www.lizdek.world', 'https://api.lizdek.world']
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        // Test database connection
        const connection = await pool.getConnection();
        await connection.query('SELECT 1');
        connection.release();
        
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: process.env.VITE_APP_VERSION || '1.0.0',
            database: 'connected',
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            version: process.env.VITE_APP_VERSION || '1.0.0',
            database: 'disconnected',
            environment: process.env.NODE_ENV || 'development',
            error: error.message
        });
    }
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/shows', require('./routes/shows'));
app.use('/api/releases', require('./routes/releases'));
app.use('/api/edit/releases', require('./routes/editReleases'));

// Error handling middleware
app.use(require('./middleware/errorHandler'));

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        // Only log database connection in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
        }
    });
}

module.exports = app; 