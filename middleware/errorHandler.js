const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    // Log the error
    logger.error(err.message, {
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip || req.connection.remoteAddress
    });

    // Handle different error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            message: err.message
        });
    }

    if (err.name === 'DuplicateError') {
        return res.status(409).json({
            error: 'Duplicate Error',
            message: err.message
        });
    }

    if (err.name === 'NotFoundError') {
        return res.status(404).json({
            error: 'Not Found',
            message: err.message
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: 'Unauthorized',
            message: err.message
        });
    }

    // Default error response
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
};

module.exports = errorHandler; 