const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

const logFile = path.join(logsDir, 'app.log');

const getTimestamp = () => {
    return new Date().toISOString();
};

const writeToFile = (level, message, data = null) => {
    const logEntry = {
        timestamp: getTimestamp(),
        level,
        message,
        data: data || null
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    
    // Write to file
    fs.appendFileSync(logFile, logLine);
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.log(`[${level.toUpperCase()}] ${getTimestamp()}: ${message}`);
        if (data) {
            console.log('Data:', data);
        }
    }
};

const logger = {
    info: (message, data = null) => {
        writeToFile('info', message, data);
    },
    
    warn: (message, data = null) => {
        writeToFile('warn', message, data);
    },
    
    error: (message, data = null) => {
        writeToFile('error', message, data);
    },
    
    request: (req, res, next) => {
        const start = Date.now();
        
        res.on('finish', () => {
            const duration = Date.now() - start;
            const logData = {
                method: req.method,
                url: req.url,
                status: res.statusCode,
                duration: `${duration}ms`,
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent')
            };
            
            if (res.statusCode >= 400) {
                logger.error(`${req.method} ${req.url} - ${res.statusCode}`, logData);
            } else {
                logger.info(`${req.method} ${req.url} - ${res.statusCode}`, logData);
            }
        });
        
        next();
    }
};

module.exports = logger; 