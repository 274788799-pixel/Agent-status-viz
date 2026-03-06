// ==================== 补充功能函数 ====================

// 在 main.js 文件末尾添加以下函数

/**
 * 从 OpenClaw Gateway 获取真实 Agent 数据
 */
async function fetchRealAgentData() {
    try {
        const response = await fetch(`${API_CONFIG.gatewayEndpoint}/agents`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // 将 API 数据转换为我们的格式
        const formattedAgents = data.agents.map(apiAgent => ({
            id: apiAgent.sessionKey || apiAgent.id,
            name: apiAgent.label || apiAgent.name || `Agent ${apiAgent.id}`,
            type: apiAgent.kind || apiAgent.type || '助手',
            description: apiAgent.description || '智能助手',
            status: mapApiStatus(apiAgent.status),
            subStatus: mapSubStatus(apiAgent.status),
            currentTask: apiAgent.currentTask || null,
            tasksCompleted: apiAgent.tasksCompleted || 0,
            uptime: apiAgent.uptime || '99.0%',
            lastActive: apiAgent.lastActive || '刚刚'
        }));

        return formattedAgents;
    } catch (error) {
        console.warn('获取真实数据失败，使用模拟数据:', error.message);
        return null;
    }
}

/**
 * 映射 API 状态到我们的状态格式
 */
function mapApiStatus(apiStatus) {
    const statusLower = apiStatus.toLowerCase();

    if (statusLower.includes('busy') || statusLower.includes('active')) {
        return 'busy';
    } else if (statusLower.includes('idle') || statusLower.includes('waiting')) {
        return 'idle';
    } else if (statusLower.includes('offline') || statusLower.includes('disconnected')) {
        return 'offline';
    }

    return 'idle'; // 默认状态
}

/**
 * 映射子状态
 */
function mapSubStatus(status) {
    const statusLower = status.toLowerCase();

    if (statusLower.includes('busy') || statusLower.includes('active')) {
        return 'working';
    }

    // 空闲状态随机分配
    return Math.random() > 0.5 ? 'sofa' : 'coffee';
}

/**
 * 更新 Agent 数据
 */
async function updateAgentData() {
    if (API_CONFIG.useRealData && API_CONFIG.gatewayEndpoint) {
        const realData = await fetchRealAgentData();

        if (realData && realData.length > 0) {
            agents = realData;
            console.log('✅ 已更新为真实数据:', agents.length, '个 Agent');
        }
    }

    renderAgents();
}

/**
 * 切换数据源（真实/模拟）
 */
function toggleDataSource() {
    API_CONFIG.useRealData = !API_CONFIG.useRealData;

    if (API_CONFIG.useRealData) {
        alert('已切换到真实数据源（如果可用）');
    } else {
        agents = [...defaultAgents];
        alert('已切换到模拟数据');
        renderAgents();
    }

    updateAgentData();
    updateConnectionStatus();
}

/**
 * 切换 WebSocket 连接
 */
function toggleWebSocket() {
    API_CONFIG.useWebSocket = !API_CONFIG.useWebSocket;

    if (API_CONFIG.useWebSocket) {
        if (!API_CONFIG.websocketEndpoint) {
            alert('请先配置 WebSocket 端点地址');
            API_CONFIG.useWebSocket = false;
            return;
        }

        initWebSocket();
        alert('WebSocket 已启用');
    } else {
        closeWebSocket();
        alert('WebSocket 已禁用');
    }

    updateConnectionStatus();
}

// ==================== 工作流可视化 ====================

let workflowEvents = [];

/**
 * 添加工作流事件
 */
function addWorkflowEvent(workflow) {
    const event = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        from: workflow.from || 'User',
        to: workflow.to,
        action: workflow.action || '任务委托',
        message: workflow.message || ''
    };

    workflowEvents.unshift(event);

    // 只保留最近 50 条事件
    if (workflowEvents.length > 50) {
        workflowEvents = workflowEvents.slice(0, 50);
    }

    renderWorkflowLog();
    showNotification(`${event.from} → ${event.to}: ${event.action}`, 'info');
}

/**
 * 渲染工作流日志
 */
function renderWorkflowLog() {
    const container = document.getElementById('workflowLog');
    if (!container) return;

    if (workflowEvents.length === 0) {
        container.innerHTML = '<div class="text-gray-400 text-sm text-center py-4">暂无工作流事件...</div>';
        return;
    }

    container.innerHTML = workflowEvents.slice(0, 10).map(event => `
        <div class="workflow-item flex items-center gap-2 p-2 bg-white/5 rounded-lg text-sm">
            <span class="text-gray-400">${formatTimestamp(event.timestamp)}</span>
            <span class="text-blue-400 font-medium">${event.from}</span>
            <span class="text-gray-500">→</span>
            <span class="text-purple-400 font-medium">${event.to}</span>
            <span class="text-gray-300">${event.action}</span>
        </div>
    `).join('');
}

/**
 * 格式化时间戳
 */
function formatTimestamp(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * 显示通知
 */
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${getNotificationClass(type)} p-3 rounded-lg shadow-lg flex items-center justify-between min-w-[200px] animate-slide-in`;

    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="ml-2 text-lg hover:opacity-70">×</button>
    `;

    container.appendChild(notification);

    // 5 秒后自动消失
    setTimeout(() => {
        notification.classList.add('animate-slide-out');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

/**
 * 获取通知样式类
 */
function getNotificationClass(type) {
    const classes = {
        success: 'bg-green-500/90 text-white',
        error: 'bg-red-500/90 text-white',
        info: 'bg-blue-500/90 text-white',
        warning: 'bg-yellow-500/90 text-black'
    };

    return classes[type] || classes.info;
}

/**
 * 更新连接状态显示
 */
function updateConnectionStatus() {
    const statusEl = document.getElementById('connectionStatus');
    if (!statusEl) return;

    if (API_CONFIG.useWebSocket && wsConnection && wsConnection.readyState === WebSocket.OPEN) {
        statusEl.textContent = '🟢 实时连接';
        statusEl.className = 'text-green-400';
    } else if (API_CONFIG.useWebSocket) {
        statusEl.textContent = '🟡 连接中...';
        statusEl.className = 'text-yellow-400';
    } else if (API_CONFIG.useRealData) {
        statusEl.textContent = '🟡 轮询模式';
        statusEl.className = 'text-yellow-400';
    } else {
        statusEl.textContent = '⚫ 模拟数据';
        statusEl.className = 'text-gray-400';
    }
}

// 页面加载时更新连接状态
document.addEventListener('DOMContentLoaded', () => {
    updateConnectionStatus();
});

// 添加通知动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slide-in {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slide-out {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    .animate-slide-in {
        animation: slide-in 0.3s ease-out;
    }
    .animate-slide-out {
        animation: slide-out 0.3s ease-in;
    }
`;
document.head.appendChild(style);