// Agent 数据模型（默认数据，当无法获取真实数据时使用）
const defaultAgents = [
    {
        id: 'agent-001',
        name: 'Writer Agent',
        type: '写作助手',
        description: '擅长文案创作、内容生成和文档编辑',
        status: 'idle',
        subStatus: 'sofa',
        currentTask: null,
        tasksCompleted: 47,
        uptime: '98.5%',
        lastActive: '5分钟前'
    },
    {
        id: 'agent-002',
        name: 'Coder Agent',
        type: '编程助手',
        description: '精通多种编程语言，负责代码开发与调试',
        status: 'busy',
        subStatus: 'working',
        currentTask: '开发可视化界面',
        tasksCompleted: 156,
        uptime: '99.2%',
        lastActive: '刚刚'
    },
    {
        id: 'agent-003',
        name: 'Brainstorm Agent',
        type: '创意助手',
        description: '提供创意方案和头脑风暴支持',
        status: 'idle',
        subStatus: 'coffee',
        currentTask: null,
        tasksCompleted: 89,
        uptime: '97.8%',
        lastActive: '10分钟前'
    },
    {
        id: 'agent-004',
        name: 'Data Analyst',
        type: '数据分析',
        description: '处理数据清洗、分析和可视化任务',
        status: 'busy',
        subStatus: 'working',
        currentTask: '生成月度报告',
        tasksCompleted: 234,
        uptime: '99.0%',
        lastActive: '2分钟前'
    },
    {
        id: 'agent-005',
        name: 'QA Tester',
        type: '测试助手',
        description: '执行自动化测试和质量检查',
        status: 'idle',
        subStatus: 'sofa',
        currentTask: null,
        tasksCompleted: 312,
        uptime: '99.5%',
        lastActive: '15分钟前'
    },
    {
        id: 'agent-006',
        name: 'DevOps Agent',
        type: '运维助手',
        description: '管理部署、监控和系统维护',
        status: 'offline',
        subStatus: null,
        currentTask: null,
        tasksCompleted: 178,
        uptime: '99.8%',
        lastActive: '1小时前'
    },
    {
        id: 'agent-007',
        name: 'Researcher',
        type: '研究助手',
        description: '进行文献调研、信息搜集和知识整理',
        status: 'busy',
        subStatus: 'working',
        currentTask: '调研AI发展趋势',
        tasksCompleted: 201,
        uptime: '98.9%',
        lastActive: '刚刚'
    },
    {
        id: 'agent-008',
        name: 'Translator',
        type: '翻译助手',
        description: '多语言翻译和本地化服务',
        status: 'idle',
        subStatus: 'coffee',
        currentTask: null,
        tasksCompleted: 445,
        uptime: '99.1%',
        lastActive: '8分钟前'
    },
    {
        id: 'agent-009',
        name: 'UI Designer',
        type: '设计助手',
        description: '用户界面设计和用户体验优化',
        status: 'busy',
        subStatus: 'working',
        currentTask: '设计移动端界面',
        tasksCompleted: 167,
        uptime: '97.6%',
        lastActive: '1分钟前'
    },
    {
        id: 'agent-010',
        name: 'Security Analyst',
        type: '安全助手',
        description: '安全审计、漏洞检测和风险评估',
        status: 'idle',
        subStatus: 'sofa',
        currentTask: null,
        tasksCompleted: 89,
        uptime: '99.9%',
        lastActive: '20分钟前'
    },
    {
        id: 'agent-011',
        name: 'Database Admin',
        type: '数据库助手',
        description: '数据库管理、优化和备份',
        status: 'idle',
        subStatus: 'coffee',
        currentTask: null,
        tasksCompleted: 323,
        uptime: '99.4%',
        lastActive: '12分钟前'
    },
    {
        id: 'agent-012',
        name: 'Cloud Architect',
        type: '云架构助手',
        description: '云服务架构设计和优化',
        status: 'busy',
        subStatus: 'working',
        currentTask: '优化成本配置',
        tasksCompleted: 134,
        uptime: '98.3%',
        lastActive: '3分钟前'
    }
];

// 当前 agents 数据
let agents = [...defaultAgents];

// ==================== 真实数据接口 ====================

// API 配置
const API_CONFIG = {
    // OpenClaw Gateway API 端点（需要根据实际情况配置）
    gatewayEndpoint: '', // 例如: 'http://localhost:3333/api/agents'

    // Gateway WebSocket 端点
    websocketEndpoint: '', // 例如: 'ws://localhost:3333'

    // 使用真实数据的开关
    useRealData: false, // 设为 true 启用真实数据，false 使用模拟数据

    // 使用 WebSocket 实时更新
    useWebSocket: false, // 设为 true 启用 WebSocket

    // 数据刷新间隔（毫秒）
    refreshInterval: 30000
};

// ==================== WebSocket 实时更新 ====================

let wsConnection = null;
let wsReconnectTimer = null;

/**
 * 初始化 WebSocket 连接
 */
function initWebSocket() {
    if (!API_CONFIG.useWebSocket || !API_CONFIG.websocketEndpoint) {
        console.log('WebSocket 未启用');
        return;
    }

    if (wsConnection) {
        wsConnection.close();
    }

    try {
        wsConnection = new WebSocket(API_CONFIG.websocketEndpoint);

        wsConnection.onopen = () => {
            console.log('✅ WebSocket 连接已建立');
            showNotification('WebSocket 已连接', 'success');
            cancelReconnect();
        };

        wsConnection.onmessage = (event) => {
            handleWebSocketMessage(event.data);
        };

        wsConnection.onerror = (error) => {
            console.error('WebSocket 错误:', error);
        };

        wsConnection.onclose = () => {
            console.log('WebSocket 连接已断开');
            scheduleReconnect();
        };
    } catch (error) {
        console.error('WebSocket 初始化失败:', error);
        scheduleReconnect();
    }
}

/**
 * 处理 WebSocket 消息
 */
function handleWebSocketMessage(data) {
    try {
        const message = JSON.parse(data);

        // 处理不同类型的消息
        switch (message.type) {
            case 'agent_status':
                updateAgentStatus(message.agent);
                break;

            case 'agent_added':
                addAgent(message.agent);
                showNotification(`新 Agent 已加入: ${message.agent.name}`, 'info');
                break;

            case 'agent_removed':
                removeAgent(message.agentId);
                showNotification(`Agent 已移除: ${message.agentId}`, 'info');
                break;

            case 'workflow':
                addWorkflowEvent(message.workflow);
                break;

            default:
                console.log('未知消息类型:', message.type);
        }
    } catch (error) {
        console.error('解析 WebSocket 消息失败:', error);
    }
}

/**
 * 更新单个 Agent 状态
 */
function updateAgentStatus(agentData) {
    const index = agents.findIndex(a => a.id === agentData.id || a.id === agentData.sessionKey);

    if (index >= 0) {
        // 更新现有 Agent
        agents[index] = {
            ...agents[index],
            ...agentData,
            lastActive: '刚刚'
        };
    } else {
        // 添加新 Agent
        agents.push(formatAgentData(agentData));
    }

    renderAgents();
}

/**
 * 添加新 Agent
 */
function addAgent(agentData) {
    const formatted = formatAgentData(agentData);
    agents.push(formatted);
    renderAgents();
}

/**
 * 移除 Agent
 */
function removeAgent(agentId) {
    const index = agents.findIndex(a => a.id === agentId);
    if (index >= 0) {
        agents.splice(index, 1);
        renderAgents();
    }
}

/**
 * 格式化 Agent 数据
 */
function formatAgentData(apiAgent) {
    return {
        id: apiAgent.id || apiAgent.sessionKey,
        name: apiAgent.name || apiAgent.label || `Agent ${apiAgent.id}`,
        type: apiAgent.type || apiAgent.kind || '助手',
        description: apiAgent.description || '智能助手',
        status: mapApiStatus(apiAgent.status),
        subStatus: mapSubStatus(apiAgent.status),
        currentTask: apiAgent.currentTask || null,
        tasksCompleted: apiAgent.tasksCompleted || 0,
        uptime: apiAgent.uptime || '99.0%',
        lastActive: apiAgent.lastActive || '刚刚'
    };
}

/**
 * 安排重连
 */
function scheduleReconnect() {
    if (wsReconnectTimer) return;

    wsReconnectTimer = setTimeout(() => {
        console.log('尝试重新连接 WebSocket...');
        initWebSocket();
        wsReconnectTimer = null;
    }, 5000);
}

/**
 * 取消重连
 */
function cancelReconnect() {
    if (wsReconnectTimer) {
        clearTimeout(wsReconnectTimer);
        wsReconnectTimer = null;
    }
}

/**
 * 关闭 WebSocket 连接
 */
function closeWebSocket() {
    cancelReconnect();
    if (wsConnection) {
        wsConnection.close();
        wsConnection = null;
    }
}

// ==================== 真实数据接口 ====================

// 状态图标映射
const statusIcons = {
    idle_sofa: '🛋️',
    idle_coffee: '☕',
    busy_working: '💻',
    offline: '🔄'
};

// 状态文本映射
const statusText = {
    idle: '空闲中',
    busy: '忙碌中',
    offline: '离线'
};

// 生成 Agent 卡片 HTML
function createAgentCard(agent) {
    const statusIcon = statusIcons[`${agent.status}_${agent.subStatus}`] || statusIcons['offline'];
    const statusLabel = statusText[agent.status];
    const statusClass = `status-badge-${agent.status}`;
    const iconClass = agent.status === 'idle' ? 'status-icon-idle' :
                     agent.status === 'busy' ? 'status-icon-busy' : '';

    const currentTaskHtml = agent.currentTask
        ? `<div class="mt-3 p-2 bg-blue-500/20 rounded-lg text-sm text-blue-200">
            <span class="font-semibold">当前任务:</span> ${agent.currentTask}
           </div>`
        : `<div class="mt-3 p-2 bg-green-500/20 rounded-lg text-sm text-green-200">
            ✅ 等待新任务
           </div>`;

    const bgGradient = agent.status === 'idle'
        ? 'from-green-900/30 to-blue-900/30'
        : agent.status === 'busy'
        ? 'from-blue-900/30 to-purple-900/30'
        : 'from-gray-800/30 to-gray-900/30';

    return `
        <div class="agent-card bg-gradient-to-br ${bgGradient} rounded-xl p-6 border border-white/10 shadow-xl">
            <!-- 状态指示器 -->
            <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-2">
                    <span class="status-indicator w-3 h-3 rounded-full ${agent.status === 'idle' ? 'bg-green-400' : agent.status === 'busy' ? 'bg-blue-400' : 'bg-gray-400'}"></span>
                    <span class="status-badge ${statusClass}">
                        ${statusLabel}
                    </span>
                </div>
                <span class="text-xs text-gray-400">ID: ${agent.id}</span>
            </div>

            <!-- 可视化场景 -->
            <div class="text-center mb-4">
                <div class="text-7xl mb-2 ${iconClass} ${agent.status === 'idle' && agent.subStatus === 'coffee' ? 'status-icon-coffee' : ''}">
                    ${statusIcon}
                </div>
                <div class="text-gray-300 text-sm">
                    ${agent.status === 'idle'
                        ? (agent.subStatus === 'coffee' ? '正在享受咖啡时光 ☕' : '在沙发上休息 🛋️')
                        : agent.status === 'busy'
                        ? '正在全力工作中 💻'
                        : '暂时离线 🔄'}
                </div>
            </div>

            <!-- Agent 信息 -->
            <div class="space-y-2">
                <h3 class="text-xl font-bold text-white">${agent.name}</h3>
                <p class="text-sm text-blue-300">${agent.type}</p>
                <p class="text-sm text-gray-300 mt-2">${agent.description}</p>
            </div>

            <!-- 当前任务 -->
            ${currentTaskHtml}

            <!-- 统计信息 -->
            <div class="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-2">
                <div>
                    <div class="text-xs text-gray-400">已完成</div>
                    <div class="text-lg font-bold text-white">${agent.tasksCompleted}</div>
                </div>
                <div>
                    <div class="text-xs text-gray-400">可用率</div>
                    <div class="text-lg font-bold text-green-400">${agent.uptime}</div>
                </div>
                <div>
                    <div class="text-xs text-gray-400">活跃</div>
                    <div class="text-lg font-bold text-blue-400">${agent.lastActive || '刚刚'}</div>
                </div>
            </div>

            <!-- 手动状态切换按钮（用于演示） -->
            <div class="mt-4 flex gap-2">
                <button onclick="toggleAgentStatus('${agent.id}')" class="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-lg text-sm transition">
                    切换状态
                </button>
            </div>
        </div>
    `;
}

// 渲染所有 Agent 卡片
function renderAgents() {
    const container = document.getElementById('agentContainer');
    container.innerHTML = agents.map(agent => createAgentCard(agent)).join('');
    updateLastUpdateTime();
}

// 切换 Agent 状态
function toggleAgentStatus(agentId) {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    if (agent.status === 'idle') {
        agent.status = 'busy';
        agent.subStatus = 'working';
        agent.currentTask = `任务 #${agent.tasksCompleted + 1}`;
    } else if (agent.status === 'busy') {
        agent.status = 'idle';
        agent.subStatus = Math.random() > 0.5 ? 'sofa' : 'coffee';
        agent.currentTask = null;
        agent.tasksCompleted++;
    } else if (agent.status === 'offline') {
        agent.status = 'idle';
        agent.subStatus = 'sofa';
    } else {
        agent.status = 'offline';
        agent.subStatus = null;
        agent.currentTask = null;
    }

    renderAgents();
}

// 刷新状态
function refreshStatus() {
    updateAgentData();
}

// 更新最后更新时间
function updateLastUpdateTime() {
    const now = new Date();
    const timeStr = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('lastUpdate').textContent = `最后更新: ${timeStr}`;
}

// 自动刷新（每30秒）
setInterval(() => {
    if (API_CONFIG.useRealData) {
        // 使用真实数据源时，从 API 获取最新状态
        updateAgentData();
    } else {
        // 使用模拟数据时，随机改变状态
        agents.forEach(agent => {
            if (agent.status !== 'offline' && Math.random() < 0.1) {
                toggleAgentStatus(agent.id);
            }
        });
        renderAgents();
    }
}, API_CONFIG.refreshInterval);

// 页面加载时渲染
document.addEventListener('DOMContentLoaded', async () => {
    // 尝试加载真实数据
    await updateAgentData();
});