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
    // 优先使用 OpenClaw Gateway
    if (API_CONFIG.useOpenClawGateway && typeof fetchOpenClawSessions === 'function') {
        const sessionsData = await fetchOpenClawSessions();

        if (sessionsData && sessionsData.sessions) {
            const formattedAgents = convertSessionsToAgents(sessionsData);
            
            if (formattedAgents.length > 0) {
                agents = formattedAgents;
                console.log('✅ 已更新为 OpenClaw Gateway 数据:', agents.length, '个 Agent');
                updateConnectionStatus();
                renderAgents();
                return;
            }
        }
    }

    // 回退到自定义 API 端点
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
 * 切换数据源（模拟/自定义API/OpenClaw Gateway）
 */
function toggleDataSource() {
    // 三种模式循环切换：0=模拟, 1=自定义API, 2=OpenClaw Gateway
    if (!API_CONFIG.useRealData && !API_CONFIG.useOpenClawGateway) {
        // 当前是模拟模式 -> 切换到自定义API模式
        API_CONFIG.useRealData = true;
        API_CONFIG.useOpenClawGateway = false;

        if (!API_CONFIG.gatewayEndpoint) {
            alert('请先配置 Gateway API 端点地址\n\n当前使用 OpenClaw Gateway 模式');
            API_CONFIG.useRealData = false;
            API_CONFIG.useOpenClawGateway = true;
        } else {
            alert('已切换到自定义 API 模式');
        }
    } else if (API_CONFIG.useRealData && !API_CONFIG.useOpenClawGateway) {
        // 当前是自定义API模式 -> 切换到OpenClaw Gateway模式
        API_CONFIG.useRealData = false;
        API_CONFIG.useOpenClawGateway = true;
        alert('已切换到 OpenClaw Gateway 模式（使用环境变量配置）');
    } else {
        // 当前是OpenClaw Gateway模式 -> 切换回模拟模式
        API_CONFIG.useRealData = false;
        API_CONFIG.useOpenClawGateway = false;
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
        statusEl.textContent = '🟢 WebSocket 实时连接';
        statusEl.className = 'text-green-400';
    } else if (API_CONFIG.useWebSocket) {
        statusEl.textContent = '🟡 WebSocket 连接中...';
        statusEl.className = 'text-yellow-400';
    } else if (API_CONFIG.useOpenClawGateway) {
        statusEl.textContent = '🟢 OpenClaw Gateway';
        statusEl.className = 'text-green-400';
    } else if (API_CONFIG.useRealData) {
        statusEl.textContent = '🟡 自定义 API 轮询';
        statusEl.className = 'text-yellow-400';
    } else {
        statusEl.textContent = '⚫ 模拟数据';
        statusEl.className = 'text-gray-400';
    }
}

// 页面加载时更新连接状态
document.addEventListener('DOMContentLoaded', () => {
    updateConnectionStatus();

    // 不再从 localStorage 读取 URL，因为现在使用环境变量
    // 显示默认提示
    const input = document.getElementById('gatewayUrlInput');
    if (input) {
        input.value = 'http://localhost:3333 (从环境变量)';
    }
});

// ==================== 配置面板功能 ====================

/**
 * 切换配置面板显示/隐藏
 */
function toggleConfigPanel() {
    const panel = document.getElementById('configPanel');
    panel.classList.toggle('hidden');
}

/**
 * 保存 Gateway URL
 * 注意：现在 URL 从环境变量获取，这里只显示当前配置
 */
function saveGatewayUrl() {
    const input = document.getElementById('gatewayUrlInput');
    const url = input.value.trim();

    if (!url) {
        alert('请输入 Gateway URL');
        return;
    }

    // 显示提示信息
    alert('⚠️ 配置说明:\n\n' +
          'Gateway URL 现在从服务器环境变量获取:\n' +
          'OPENCLAW_GATEWAY_URL\n\n' +
          '请按以下步骤配置:\n' +
          '1. 设置环境变量: export OPENCLAW_GATEWAY_URL=' + url + '\n' +
          '2. 可选: export OPENCLAW_GATEWAY_TOKEN=your_token\n' +
          '3. 重启服务器: npm start\n\n' +
          '注意: Token 会自动从环境变量加载，无需在浏览器中配置');
}

/**
 * 测试 Gateway 连接
 */
async function testGateway() {
    // 显示测试中状态
    alert('🔄 正在测试 Gateway 连接...\n\n' +
          '请查看浏览器控制台获取详细信息\n\n' +
          '确保已设置环境变量:\n' +
          '- OPENCLAW_GATEWAY_URL\n' +
          '- OPENCLAW_GATEWAY_TOKEN (可选)');

    // 执行测试
    const result = await testGatewayConnection();

    if (result.success) {
        alert(`${result.message}\n\n现在可以点击"连接 Gateway"按钮获取真实数据`);
    } else {
        alert(result.message + '\n\n' +
              '请检查:\n' +
              '1. 是否设置了 OPENCLAW_GATEWAY_URL 环境变量\n' +
              '2. OpenClaw Gateway 是否正在运行\n' +
              '3. 浏览器控制台是否有详细错误信息');
    }
}

/**
 * 获取并显示代理配置信息
 */
async function showProxyConfig() {
    const config = await getProxyConfig();

    if (config) {
        alert('📋 当前代理配置:\n\n' +
              `Gateway URL: ${config.gatewayUrl}\n` +
              `Token 状态: ${config.message}\n\n` +
              '💡 提示:\n' +
              '- Token 从服务器环境变量自动加载\n' +
              '- 无需在浏览器中手动配置\n' +
              '- 如需修改，请更新环境变量并重启服务器');
    } else {
        alert('❌ 无法获取配置信息\n\n' +
              '请确保服务器正在运行: npm start');
    }
}

/**
 * 快捷连接到 Gateway
 */
async function quickConnectToGateway() {
    // 直接切换到 OpenClaw Gateway 模式
    API_CONFIG.useOpenClawGateway = true;
    API_CONFIG.useRealData = false;

    // 关闭配置面板
    toggleConfigPanel();

    // 显示加载中状态
    showNotification('正在连接 OpenClaw Gateway...', 'info');

    // 获取数据
    await updateAgentData();

    // 显示结果
    if (API_CONFIG.useOpenClawGateway && agents.length > 0) {
        showNotification(`✅ 成功连接！发现 ${agents.length} 个 Agent`, 'success');
    } else {
        showNotification('⚠️ 连接失败，请检查环境变量配置', 'warning');
    }
}

/**
 * 重置为模拟数据
 */
function resetToMockData() {
    API_CONFIG.useOpenClawGateway = false;
    API_CONFIG.useRealData = false;
    API_CONFIG.useWebSocket = false;

    closeWebSocket();

    agents = [...defaultAgents];

    toggleConfigPanel();
    updateAgentData();
    updateConnectionStatus();

    showNotification('已重置为模拟数据', 'info');
}

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