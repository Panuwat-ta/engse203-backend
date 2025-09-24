const { contextBridge, ipcRenderer } = require('electron');

console.log('🌉 [PRELOAD] กำลังตั้งค่า security bridge...');

contextBridge.exposeInMainWorld('electronAPI', {
    // ฟังก์ชันเดิม
    sendMessage: (message) => {
        console.log('📤 [PRELOAD] ส่งข้อความ:', message);
        return ipcRenderer.invoke('send-message', message);
    },

    sayHello: (name) => {
        console.log('👋 [PRELOAD] ส่งคำทักทาย:', name);
        return ipcRenderer.invoke('say-hello', name);
    },

    // ฟังก์ชันใหม่สำหรับ agent wallboard
    getAgents: () => {
        console.log('📊 [PRELOAD] ร้องขอข้อมูล agents');
        return ipcRenderer.invoke('get-agents');
    },

    changeAgentStatus: (agentId, newStatus) => {
        console.log(`🔄 [PRELOAD] เปลี่ยนสถานะ ${agentId} เป็น ${newStatus}`);
        return ipcRenderer.invoke('change-agent-status', { agentId, newStatus });
    },

    authenticate: (agentId, password) => ipcRenderer.invoke('authenticate', { agentId, password }),

    // listener สำหรับรับ event เมื่อ agent เปลี่ยนสถานะ
    onAgentStatusUpdated: (callback) => {
        const listener = (event, payload) => callback(payload);
        ipcRenderer.on('agent-status-updated', listener);
        return () => ipcRenderer.removeListener('agent-status-updated', listener);
    }
});

console.log('✅ [PRELOAD] Security bridge พร้อมแล้ว');