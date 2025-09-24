const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const https = require('https');
const fs = require('fs').promises;
const config = require('./api-config');

let mainWindow;
let tray = null;
let agentStatusInterval = null;

function createWindow() {
    console.log('🚀 [MAIN] สร้าง Real-time Wallboard...');

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        title: 'Agent Wallboard - Real-time Dashboard',
        icon: path.join(__dirname, 'assets', 'icon.png')
    });

    mainWindow.loadFile('index.html');
    mainWindow.webContents.openDevTools();

    // Handle window close event for tray integration
    mainWindow.on('close', (event) => {
        if (!app.isQuiting) {
            event.preventDefault();
            mainWindow.hide();
            showTrayNotification('Application was minimized to tray');
        }
    });

    console.log('✅ [MAIN] Wallboard พร้อมแล้ว');
}

// ===== SYSTEM TRAY FUNCTIONS =====

function createTray() {
    const iconPath = path.join(__dirname, 'assets', 'icon.png');
    tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show Dashboard',
            click: () => {
                mainWindow.show();
            }
        },
        {
            label: 'Hide Dashboard',
            click: () => {
                mainWindow.hide();
            }
        },
        { type: 'separator' },
        {
            label: 'Agent Status',
            submenu: [
                { label: '🟢 Available: 2', enabled: false },
                { label: '🔴 Busy: 1', enabled: false },
                { label: '🟡 Break: 1', enabled: false }
            ]
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                app.isQuiting = true;
                app.quit();
            }
        }
    ]);

    tray.setContextMenu(contextMenu);
    tray.setToolTip('Agent Wallboard Dashboard');

    // Double click to show/hide window
    tray.on('double-click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    });
}

function showTrayNotification(message) {
    if (tray) {
        tray.displayBalloon({
            iconType: 'info',
            title: 'Agent Wallboard',
            content: message
        });
    }
}

function updateTrayMenu(agentStats) {
    if (!tray) return;

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show Dashboard',
            click: () => {
                mainWindow.show();
            }
        },
        {
            label: 'Hide Dashboard',
            click: () => {
                mainWindow.hide();
            }
        },
        { type: 'separator' },
        {
            label: 'Agent Status',
            submenu: [
                { label: `🟢 Available: ${agentStats.available || 0}`, enabled: false },
                { label: `🔴 Busy: ${agentStats.busy || 0}`, enabled: false },
                { label: `🟡 Break: ${agentStats.break || 0}`, enabled: false },
                { label: `⚫ Offline: ${agentStats.offline || 0}`, enabled: false }
            ]
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                app.isQuiting = true;
                app.quit();
            }
        }
    ]);

    tray.setContextMenu(contextMenu);
}

// ===== HTTP API FUNCTIONS =====

// 🌐 ฟังก์ชันเรียก HTTP API
function callAPI(url) {
    return new Promise((resolve, reject) => {
        console.log('🌐 [MAIN] เรียก API:', url);

        https.get(url, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    console.log('✅ [MAIN] API สำเร็จ');
                    resolve(jsonData);
                } catch (error) {
                    console.error('❌ [MAIN] Parse error:', error);
                    reject(error);
                }
            });

        }).on('error', (error) => {
            console.error('❌ [MAIN] API error:', error);
            reject(error);
        });
    });
}

function fetchTimeWithAPIKey(url) {
    return new Promise((resolve, reject) => {
        console.log('🌐 [MAIN] เรียก API:', url);

        // Define the headers, including the X-RapidAPI-Key
        const options = {
            headers: {
                'X-RapidAPI-Key': config.timeKey,  // Replace with your RapidAPI key
                'X-RapidAPI-Host': config.timeHost,  // This is the RapidAPI host for the WorldTimeAPI
            }
        };

        // Use https.get with the options to include the headers
        https.get(url, options, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    console.log('✅ [MAIN] API สำเร็จ');
                    resolve(jsonData);
                } catch (error) {
                    console.error('❌ [MAIN] Parse error:', error);
                    reject(error);
                }
            });

        }).on('error', (error) => {
            console.error('❌ [MAIN] API error:', error);
            reject(error);
        });
    });
}

// ===== IPC HANDLERS =====

// 🕒 ดึงเวลาจาก World Time API
ipcMain.handle('get-world-time', async () => {
    try {
        console.log('🕒 [MAIN] ดึงเวลาจาก API...');
        const timeData = await fetchTimeWithAPIKey(config.timeAPI);

        return {
            success: true,
            datetime: timeData.datetime,
            timezone: timeData.timezone,
            formatted: new Date(timeData.datetime).toLocaleString('th-TH')
        };

    } catch (error) {
        console.error('❌ [MAIN] Time API error:', error);
        return {
            success: false,
            error: error.message,
            fallback: new Date().toLocaleString('th-TH')
        };
    }
});

// 📊 ดึงข้อมูล mock users (จำลอง agents)
ipcMain.handle('get-mock-agents', async () => {
    try {
        console.log('📊 [MAIN] ดึงข้อมูล mock agents...');
        const users = await callAPI(config.usersAPI);

        // แปลง users เป็น agent format
        const agents = users.slice(0, 5).map((user, index) => {
            const statuses = ['Available', 'Busy', 'Break', 'Offline'];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

            return {
                id: `AG${String(index + 1).padStart(3, '0')}`,
                name: user.name,
                email: user.email,
                phone: user.phone,
                status: randomStatus,
                extension: `100${index + 1}`,
                company: user.company.name,
                lastUpdate: new Date().toISOString()
            };
        });

        return {
            success: true,
            agents: agents,
            count: agents.length,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('❌ [MAIN] Mock agents error:', error);

        // Fallback ข้อมูล กรณีที่ API ที่เรียกใช้งานไม่ได้ ก็จะมาอ่านที่ไฟล์แทน
        const mockData = await fs.readFile('mock-data.json', 'utf8');
        const fallbackData = JSON.parse(mockData);

        return {
            success: true,
            agents: fallbackData.agents,
            fallback: true,
            error: error.message
        };
    }
});

ipcMain.handle('get-metrics', async () => {
    try {
        // อ่าน mock-data.json
        const mockData = await fs.readFile('mock-data.json', 'utf8');
        const data = JSON.parse(mockData);

        // สร้าง metrics จาก mock-data
        const agentsOnline = data.agents.filter(a => a.status === 'Available').length;
        const agentsBusy = data.agents.filter(a => a.status === 'Busy').length;
        const agentsBreak = data.agents.filter(a => a.status === 'Break').length;
        const avgResponseTime = data.systemStats.avgWaitTime;

        return {
            success: true,
            agentsOnline,
            agentsBusy,
            agentsBreak,
            avgResponseTime
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
});

// ===== AGENT STATUS SIMULATOR =====

// จำลองการเปลี่ยนสถานะ agent แบบสุ่ม
ipcMain.handle('start-agent-simulator', () => {
    console.log('🎭 [MAIN] เริ่ม Agent Status Simulator...');

    if (agentStatusInterval) {
        clearInterval(agentStatusInterval);
    }

    const statuses = ['Available', 'Busy', 'Break'];
    const agentIds = ['AG001', 'AG002', 'AG003'];

    agentStatusInterval = setInterval(() => {
        const randomAgent = agentIds[Math.floor(Math.random() * agentIds.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        console.log(`🎭 [SIMULATOR] ${randomAgent} → ${randomStatus}`);

        // ส่งข้อมูลไปยัง renderer
        mainWindow.webContents.send('agent-status-changed', {
            agentId: randomAgent,
            newStatus: randomStatus,
            timestamp: new Date().toISOString(),
            simulated: true
        });

        // Show tray notification
        showTrayNotification(`🔄 ${randomAgent} changed to ${randomStatus}`);

    }, 10000); // ทุก 10 วินาที

    return { success: true, message: 'Agent Simulator เริ่มทำงานแล้ว' };
});

ipcMain.handle('stop-agent-simulator', () => {
    console.log('⏹️ [MAIN] หยุด Agent Status Simulator');

    if (agentStatusInterval) {
        clearInterval(agentStatusInterval);
        agentStatusInterval = null;
    }

    return { success: true, message: 'Agent Simulator หยุดแล้ว' };
});

// 🎯 Update tray menu with current agent stats
ipcMain.handle('update-tray-menu', (event, agentStats) => {
    updateTrayMenu(agentStats);
    return { success: true };
});

// 🌤️ ดึงข้อมูลสภาพอากาศ (ถ้ามี API key)
ipcMain.handle('get-weather', async () => {
    if (config.weatherKey === 'YOUR_API_KEY_HERE') {
        return {
            success: false,
            error: 'ไม่ได้ตั้งค่า Weather API key',
            fallback: {
                location: 'Bangkok',
                temperature: '32°C',
                description: 'Sunny',
                humidity: '65%'
            }
        };
    }

    try {
        const weatherURL = `${config.weatherAPI}?q=Bangkok&appid=${config.weatherKey}&units=metric`;
        const weatherData = await callAPI(weatherURL);

        return {
            success: true,
            location: weatherData.name,
            temperature: Math.round(weatherData.main.temp) + '°C',
            description: weatherData.weather[0].description,
            humidity: weatherData.main.humidity + '%',
            icon: weatherData.weather[0].icon
        };

    } catch (error) {
        return {
            success: false,
            error: error.message,
            fallback: {
                location: 'Bangkok',
                temperature: '32°C',
                description: 'Data unavailable',
                humidity: 'N/A'
            }
        };
    }
});

app.whenReady().then(() => {
    createWindow();
    createTray();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
