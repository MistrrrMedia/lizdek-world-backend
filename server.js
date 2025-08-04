const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const { pool } = require('./config/database');

// Middleware
app.use(helmet());
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
});

module.exports = app; 