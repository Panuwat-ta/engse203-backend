const sql = require('mssql');
const mongoose = require('mongoose');

// MS SQL Configuration
const sqlConfig = {
    user: process.env.MSSQL_USER,
    password: process.env.MSSQL_PASSWORD,
    server: process.env.MSSQL_SERVER,
    database: process.env.MSSQL_DATABASE,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// MS SQL Connection
let sqlPool;
const connectMSSQL = async () => {
    try {
        sqlPool = await sql.connect(sqlConfig);
        console.log('✅ Connected to MS SQL Server');
        return sqlPool;
    } catch (error) {
        console.error('❌ MS SQL connection failed:', error.message);
        throw error;
    }
};

// MongoDB Connection  
const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        throw error;
    }
};

// Get SQL Pool
const getSqlPool = () => {
    if (!sqlPool) {
        throw new Error('SQL Pool not initialized');
    }
    return sqlPool;
};

module.exports = {
    connectMSSQL,
    connectMongoDB,
    getSqlPool,
    sql
};