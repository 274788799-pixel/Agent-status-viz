// Agent 数据模型
const agents = [
    {
        id: 'agent-001',
        name: 'Writer Agent',
        type: '写作助手',
        description: '擅长文案创作、内容生成和文档编辑',
        status: 'idle',
        subStatus: 'sofa',
        currentTask: null,
        tasksCompleted: 47,
        uptime: '98.5%'
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
        uptime: '99.2%'
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
        uptime: '97.8%'
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
        uptime: '99.0%'
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
        uptime: '99.5%'
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
        uptime: '99.8%'
    }
];

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
            <div class="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                <div>
                    <div class="text-xs text-gray-400">已完成任务</div>
                    <div class="text-2xl font-bold text-white">${agent.tasksCompleted}</div>
                </div>
                <div>
                    <div class="text-xs text-gray-400">可用率</div>
                    <div class="text-2xl font-bold text-green-400">${agent.uptime}</div>
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
    renderAgents();
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

// 自动刷新（可选，每30秒）
setInterval(() => {
    // 模拟随机状态变化
    agents.forEach(agent => {
        if (agent.status !== 'offline' && Math.random() < 0.1) {
            toggleAgentStatus(agent.id);
        }
    });
    renderAgents();
}, 30000);

// 页面加载时渲染
document.addEventListener('DOMContentLoaded', () => {
    renderAgents();
});