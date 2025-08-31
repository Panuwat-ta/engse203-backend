// server.js
const express = require('express');
require('dotenv').config(); // << เพิ่มบรรทัดนี้ที่ด้านบน
const cors = require('cors'); // << Import cors
const helmet = require('helmet'); // << Import helmet

const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3000; // << อ่านค่า PORT จาก .env
const APP_NAME = process.env.APP_NAME;

app.use(helmet()); // << เพิ่มบรรทัดนี้: ใส่เกราะป้องกัน!
app.use(cors());  // << เพิ่มบรรทัดนี้: ใช้ cors กับทุก request


app.get('/', (req, res) => {
  res.send(`<h1>Hello from ${APP_NAME}!</h1>`);
});

// เพิ่ม Route ใหม่สำหรับทดสอบ
app.get('/api/data', (req, res) => {
    res.json({ message: 'This data is open for everyone!' });
});

app.listen(PORT, () => {
  console.log(`🚀 ${APP_NAME} is running on http://localhost:${PORT}`);
});