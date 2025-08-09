require('dotenv').config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const tasks = require("./routes/tasks");
const connection = require("./db");
const { authMiddleware } = require("./middleware/auth");
const { getCsrfToken } = require("./middleware/csrf");

const app = express();

// Connect to database
connection();

// CORS configuration - allow all origins for development
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication middleware
app.use(authMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Legacy endpoint for compatibility
app.get('/ok', (req, res) => {
    res.status(200).send('ok');
});



// API routes
app.use("/api/tasks", tasks);

// 404 handler for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    // Sanitize error message to prevent log injection
    const sanitizedError = error.message ? encodeURIComponent(error.message) : 'Unknown error';
    console.error('Unhandled error:', sanitizedError);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

const port = process.env.PORT || 3500;
app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${port}/health`);
});
