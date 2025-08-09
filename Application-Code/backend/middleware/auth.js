// Simple authentication middleware
const authMiddleware = (req, res, next) => {
    // Skip auth for all requests in local development
    return next();
};

module.exports = { authMiddleware };