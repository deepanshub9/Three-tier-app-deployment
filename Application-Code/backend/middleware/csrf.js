const crypto = require('crypto');

// Simple CSRF protection middleware
const csrfProtection = (req, res, next) => {
    // Skip CSRF for GET requests and health checks
    if (req.method === 'GET' || req.path === '/health' || req.path === '/ok') {
        return next();
    }

    // Generate CSRF token for session (simplified implementation)
    if (!req.session) {
        req.session = {};
    }

    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }

    // Check CSRF token for state-changing requests
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    
    if (!token || token !== req.session.csrfToken) {
        return res.status(403).json({
            success: false,
            message: 'Invalid CSRF token'
        });
    }

    next();
};

// Endpoint to get CSRF token
const getCsrfToken = (req, res) => {
    if (!req.session) {
        req.session = {};
    }
    
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }

    res.json({
        success: true,
        csrfToken: req.session.csrfToken
    });
};

module.exports = { csrfProtection, getCsrfToken };