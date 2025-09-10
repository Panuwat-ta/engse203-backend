const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import configurations
const { connectMSSQL, connectMongoDB } = require('./config/database');
const Student = require('./models/Student');

// Import routes
const studentRoutes = require('./routes/students');
const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`📨 ${new Date().toLocaleTimeString()} - ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🎉 Node.js Database API is running!',
        endpoints: {
            students: '/api/students (MS SQL)',
            products: '/api/products (MongoDB)'
        },
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/products', productRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('🚨 Server Error:', error.message);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
    });
});

// Start server
const startServer = async () => {
    try {
        console.log('🚀 Starting server...');
        
        // Connect to databases
        await connectMSSQL();
        await connectMongoDB();
        
        // Create tables
        await Student.createTable();
        
        // Start listening
        app.listen(PORT, '0.0.0.0', () => {
            console.log('🎯━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`🌟 Server running on http://localhost:${PORT}`);
            console.log('📚 API Endpoints:');
            console.log(`   👤 Students: http://localhost:${PORT}/api/students`);
            console.log(`   📦 Products: http://localhost:${PORT}/api/products`);
            console.log('🎯━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();