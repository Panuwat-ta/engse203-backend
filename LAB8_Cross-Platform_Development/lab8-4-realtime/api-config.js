// api-config.js - การตั้งค่า APIs ที่ใช้

module.exports = {
  // 🕒 World Time API (ฟรี)
  timeAPI: 'https://world-time-api3.p.rapidapi.com/timezone/Asia/Bangkok',
  timeHost: 'world-time-api3.p.rapidapi.com',
  timeKey: '58ebf5a58dmsh52c73c5ea54c635p169e86jsn8a437586e847', // แทนที่ด้วย API key จริง


  // 📊 JSONPlaceholder (ฟรี - สำหรับทดสอบ HTTP requests)
  usersAPI: 'https://jsonplaceholder.typicode.com/users',
  postsAPI: 'https://jsonplaceholder.typicode.com/posts',
  
  // ⚡ WebSocket Echo Test (ฟรี)
  websocketURL: 'wss://echo.websocket.org/',
  
  // 🌤️ OpenWeatherMap (ฟรี - ต้องสมัคร API key)
  // ไปสมัครที่: https://openweathermap.org/api
  weatherAPI: 'https://api.openweathermap.org/data/2.5/weather',
  weatherKey: 'e1a6c05373adf8b0a9f8b334cc0bd645', // แทนที่ด้วย API key จริง
  
  // 📱 จำลอง Agent API endpoints
  mockAgentAPI: {
    status: 'http://localhost:3001/api/agents/status',
    update: 'http://localhost:3001/api/agents/update'
  }
};