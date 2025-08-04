const mysql = require('mysql2/promise');

// Database configuration from environment variables
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Connection validation and keep-alive settings
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // Handle connection errors
    multipleStatements: false
};

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '));
    process.exit(1);
}

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
};

// Validate connection before use
const getConnection = async () => {
    try {
        const connection = await pool.getConnection();
        // Test the connection with a simple query
        await connection.query('SELECT 1');
        return connection;
    } catch (error) {
        console.error('Connection validation failed:', error.message);
        throw error;
    }
};

// Initialize database connection
testConnection();

module.exports = {
    pool,
    getConnection
}; 