// ขั้นที่ 1: Import Express
const express = require('express'); // เติมให้ถูก

// ขั้นที่ 2: สร้าง app  
const app = express(); // เติมให้ถูก

// ขั้นที่ 3: กำหนด PORT
const PORT = 3001;

// ขั้นที่ 4: สร้าง route แรก
app.get('/', (req, res) => {
    res.send("Hello Agent Wallboard!");
}); // เติม method และ response function

app.get('/Hello', (req, res) => {
    res.send("Hello");
});


app.get('/health', (req, res) => {
    res.send({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});


/*
AVAILABLE  = พร้อมรับสาย
ACTIVE     = กำลังคุยกับลูกค้า  
WRAP_UP    = บันทึกหลังจบสาย
NOT_READY  = ไม่พร้อมรับสาย (พัก/ประชุม)
OFFLINE    = ออฟไลน์
*/

const agents = [
    {
        code: "A001",        // รหัส Agent
        name: "bas",         // เติมคิดเอง
        status: "OFFLINE",       // เติมคิดเอง  
        loginTime: new Date()
    }, {
        code: "A002",
        name: "bas1",
        status: "ACTIVE",
        loginTime: new Date()
    }, {
        code: "A003",
        name: "bas2",
        status: "AVAILABLE",
        loginTime: new Date()
    }
];


app.get('/api/agents', (req, res) => {
    // ควร return อะไร?
    res.json({
        success: true,     // เติม true/false
        data: agents,        // เติม agents หรือไม่?
        count: agents.length,       // เติมจำนวน agents
        timestamp: new Date().toISOString()   // เติมเวลาปัจจุบัน
    });
});

//Mini Challenge 2
app.get('/api/agents/count', (req, res) => {
    res.json({
        success: true,
        count: agents.length,
        timestamp: new Date().toISOString()
    });
});


// ขั้นที่ 5: เริ่ม server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});