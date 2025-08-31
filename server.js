// server.js
const express = require('express');
require('dotenv').config(); // << เพิ่มบรรทัดนี้ที่ด้านบน

const app = express();
const PORT = process.env.PORT || 3000; // << อ่านค่า PORT จาก .env
const APP_NAME = process.env.APP_NAME;

app.get('/', (req, res) => {
  res.send(`<h1>Hello from ${APP_NAME}!</h1>`);
});

app.listen(PORT, () => {
  console.log(`🚀 ${APP_NAME} is running on http://localhost:${PORT}`);
});