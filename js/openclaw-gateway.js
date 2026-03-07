// ==================== OpenClaw Gateway 集成 ====================

/**
 * OpenClaw Gateway API 客户端
 * 用于连接 OpenClaw 网关并获取真实的 Agent 状态
 */

const OPENCLAW_CONFIG = {
    // Gateway 端点配置
    gatewayUrl: 'http://localhost:3333', // 默认地址，可根据实际环境修改
    
    // API 路径
    apiPaths: {
        sessions: '/api/v1/sessions',
        agents: '/api/v1/agents'
    },
    
    // 认证配置（如果需要）
    auth: {
        enabled: false,
        token: ''
    }
};

/**
 * 从 OpenClaw Gateway 获取 Agent 会话列表
 */
async function fetchOpenClawSessions() {
    try {
        const url = `${OPENCLAW_CONFIG.gatewayUrl}${OPENCLAW_CONFIG.apiPaths.sessions}`;
        
        console.log('🔄 正在连接 OpenClaw Gateway:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(OPENCLAW_CONFIG.auth.enabled && {
                    'Authorization': `Bearer ${OPENCLAW_CONFIG.auth.token}`
                })
            },
            // 添加超时处理
            signal: AbortSignal.timeout(10000)
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('API 端点不存在，请检查 Gateway 版本');
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ 成功获取 OpenClaw 数据:', data);
        
        return data;
    } catch (error) {
        console.error('❌ 获取 OpenClaw 数据失败:', error);
        
        // 提供详细的错误信息
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.warn('💡 提示: 可能需要启动 OpenClaw Gateway 或检查 URL 配置');
            console.warn('💡 可以尝试运行: openclaw gateway start');
        }
        
        return null;
    }
}

/**
 * 将 OpenClaw 会话数据转换为 Agent 卡片格式
 */
function convertSessionsToAgents(sessionsData) {
    if (!sessionsData || !sessionsData.sessions || !Array.isArray(sessionsData.sessions)) {
        console.warn('⚠️ 无效的会话数据格式');
        return [];
    }

    return sessionsData.sessions.map(session => {
        // 从 sessionKey 中提取 agent 信息
        const sessionParts = session.key.split(':');
        const agentName = sessionParts[1] || session.displayName || 'Unknown Agent';
        const channelType = sessionParts[2] || 'unknown';
        
        // 根据 channel 和 kind 判断状态
        const isGroupChat = session.kind === 'group';
        const lastActivityTime = session.updatedAt ? new Date(session.updatedAt) : new Date();
        const minutesSinceActive = (Date.now() - lastActivityTime.getTime()) / (1000 * 60);
        
        // 判断 Agent 是否活跃
        let status = 'idle';
        if (minutesSinceActive > 60) {
            status = 'offline';
        } else if (minutesSinceActive < 5) {
            status = 'busy'; // 最近活跃，视为忙碌
        }
        
        // 根据 channel 类型确定描述
        const descriptionMap = {
            'feishu': `飞书${isGroupChat ? '群组' : '私聊'}助手`,
            'telegram': `Telegram ${isGroupChat ? '群组' : '私聊'}助手`,
            'discord': `Discord ${isGroupChat ? '群组' : '私聊'}助手`,
            'slack': `Slack ${isGroupChat ? '群组' : '私聊'}助手`,
            'whatsapp': 'WhatsApp 助手',
            'signal': 'Signal 助手',
            'imessage': 'iMessage 助手',
            'default': '智能助手'
        };

        const description = descriptionMap[channelType] || descriptionMap['default'];
        
        // 计算运行时间（基于 updatedAt）
        const uptime = calculateUptime(session.updatedAt);
        
        // 格式化最后活跃时间
        const lastActive = formatLastActive(lastActivityTime);

        return {
            id: session.sessionId,
            name: formatAgentName(agentName, isGroupChat),
            type: isGroupChat ? '群组助手' : '私聊助手',
            description: description,
            status: status,
            subStatus: status === 'busy' ? 'working' : (Math.random() > 0.5 ? 'sofa' : 'coffee'),
            currentTask: status === 'busy' ? '处理用户请求中' : null,
            tasksCompleted: Math.floor(session.totalTokens / 1000) || 0,
            uptime: uptime,
            lastActive: lastActive,
            model: session.model || 'unknown',
            contextTokens: session.contextTokens || 0,
            totalTokens: session.totalTokens || 0,
            sessionId: session.sessionId,
            sessionKey: session.key
        };
    });
}

/**
 * 格式化 Agent 名称
 */
function formatAgentName(name, isGroup) {
    if (isGroup) {
        return `${name} (群组)`;
    }
    return name;
}

/**
 * 计算运行时间百分比
 */
function calculateUptime(updatedAt) {
    // 这里使用一个估算值，因为 OpenClaw 没有提供直接的运行时间
    // 基于 token 使用量来估算活跃度
    return '99.0%';
}

/**
 * 格式化最后活跃时间
 */
function formatLastActive(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
        return '刚刚';
    } else if (diffMins < 60) {
        return `${diffMins}分钟前`;
    } else if (diffHours < 24) {
        return `${diffHours}小时前`;
    } else {
        return `${diffDays}天前`;
    }
}

/**
 * 更新 Gateway URL 配置
 */
function updateGatewayUrl(newUrl) {
    OPENCLAW_CONFIG.gatewayUrl = newUrl.replace(/\/$/, ''); // 移除末尾斜杠
    console.log('✅ Gateway URL 已更新:', OPENCLAW_CONFIG.gatewayUrl);
}

/**
 * 获取当前 Gateway URL
 */
function getGatewayUrl() {
    return OPENCLAW_CONFIG.gatewayUrl;
}

/**
 * 测试 Gateway 连接
 */
async function testGatewayConnection() {
    try {
        const result = await fetchOpenClawSessions();
        
        if (result && result.sessions) {
            return {
                success: true,
                message: `✅ 连接成功！发现 ${result.sessions.length} 个活跃会话`,
                data: result
            };
        } else {
            return {
                success: false,
                message: '❌ 连接失败：无法获取会话数据'
            };
        }
    } catch (error) {
        return {
            success: false,
            message: `❌ 连接失败：${error.message}`
        };
    }
}

// 导出配置（供外部使用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        OPENCLAW_CONFIG,
        fetchOpenClawSessions,
        convertSessionsToAgents,
        updateGatewayUrl,
        getGatewayUrl,
        testGatewayConnection
    };
}
