# 🔌 接入真实 OpenClaw 数据指南

本文档说明如何将 Agent 状态监控中心接入真实的 OpenClaw Gateway 数据。

---

## 📋 前置条件

1. ✅ OpenClaw Gateway 正在运行
2. ✅ Gateway 已启用 API 访问
3. ✅ 了解 Gateway 的 API 端点地址

---

## 🎯 快速开始

### 步骤 1：获取 Gateway API 端点

默认情况下，OpenClaw Gateway API 端点为：

```
http://localhost:3333/api/agents
```

如果 Gateway 运行在其他地址或端口，请相应调整。

### 步骤 2：配置 API

打开 `js/main.js`，找到 `API_CONFIG` 配置：

```javascript
const API_CONFIG = {
    // OpenClaw Gateway API 端点
    gatewayEndpoint: 'http://localhost:3333/api/agents',

    // 使用真实数据的开关
    useRealData: false, // 改为 true

    // 数据刷新间隔（毫秒）
    refreshInterval: 30000
};
```

### 步骤 3：启用真实数据

将 `useRealData` 改为 `true`：

```javascript
useRealData: true, // 启用真实数据
```

### 步骤 4：刷新页面

在浏览器中刷新页面，现在应该看到从 OpenClaw Gateway 获取的真实 Agent 数据！

---

## 🔧 API 配置详解

### 完整配置示例

```javascript
const API_CONFIG = {
    // Gateway 端点（可以省略 /api/agents）
    gatewayEndpoint: 'http://localhost:3333',

    // 或完整路径
    gatewayEndpoint: 'http://localhost:3333/api/agents',

    // 启用真实数据
    useRealData: true,

    // 刷新间隔（毫秒）
    refreshInterval: 30000, // 30秒

    // 超时时间（毫秒）
    timeout: 10000
};
```

### 配置选项说明

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `gatewayEndpoint` | string | '' | Gateway API 端点地址 |
| `useRealData` | boolean | false | 是否使用真实数据 |
| `refreshInterval` | number | 30000 | 数据刷新间隔（毫秒） |
| `timeout` | number | 10000 | API 请求超时时间 |

---

## 📡 API 接口规范

### 请求格式

```
GET /api/agents
```

### 响应格式

OpenClaw Gateway 应该返回以下格式的 JSON：

```json
{
  "success": true,
  "agents": [
    {
      "id": "session-key-1",
      "sessionKey": "session-key-1",
      "label": "Main Session",
      "name": "Main Session",
      "kind": "main",
      "type": "主会话",
      "status": "busy",
      "description": "主要对话会话",
      "currentTask": "处理用户请求",
      "tasksCompleted": 47,
      "uptime": "99.5%",
      "lastActive": "刚刚"
    },
    {
      "id": "session-key-2",
      "sessionKey": "session-key-2",
      "label": "Coder Agent",
      "name": "Coder Agent",
      "kind": "subagent",
      "type": "编程助手",
      "status": "idle",
      "description": "代码开发与调试",
      "currentTask": null,
      "tasksCompleted": 156,
      "uptime": "98.2%",
      "lastActive": "5分钟前"
    }
  ]
}
```

### 字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `id` / `sessionKey` | string | ✅ | Agent 唯一标识 |
| `name` / `label` | string | ✅ | Agent 显示名称 |
| `type` | string | ❌ | Agent 类型 |
| `status` | string | ✅ | 状态（idle/busy/offline） |
| `currentTask` | string | ❌ | 当前任务描述 |
| `tasksCompleted` | number | ❌ | 已完成任务数 |
| `uptime` | string | ❌ | 可用率百分比 |
| `lastActive` | string | ❌ | 最后活跃时间 |

---

## 🌐 远程 Gateway 配置

如果 Gateway 运行在远程服务器：

### 示例 1：内网地址

```javascript
gatewayEndpoint: 'http://192.168.1.100:3333/api/agents'
```

### 示例 2：公网地址（需要配置 CORS）

```javascript
gatewayEndpoint: 'https://api.yourdomain.com/api/agents'
```

### 示例 3：使用反向代理

```javascript
gatewayEndpoint: 'https://yourwebsite.com/gateway/api/agents'
```

---

## 🔒 CORS 配置

如果 Gateway 和网站不在同一域名，需要在 Gateway 配置 CORS：

### OpenClaw Gateway 配置

在 Gateway 配置文件中添加：

```json
{
  "cors": {
    "enabled": true,
    "origins": ["https://agent-status-viz.pages.dev"],
    "methods": ["GET", "POST", "OPTIONS"],
    "headers": ["Content-Type", "Authorization"]
  }
}
```

### 使用 Nginx 反向代理

```nginx
location /gateway/ {
    proxy_pass http://localhost:3333/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;

    # 添加 CORS 头
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type";
}
```

---

## 🧪 测试 API 连接

### 方法 1：浏览器直接访问

在浏览器地址栏输入：

```
http://localhost:3333/api/agents
```

应该看到 JSON 响应。

### 方法 2：使用 curl

```bash
curl http://localhost:3333/api/agents
```

### 方法 3：使用浏览器控制台

打开浏览器控制台（F12），执行：

```javascript
fetch('http://localhost:3333/api/agents')
  .then(r => r.json())
  .then(console.log);
```

---

## 🐛 故障排除

### 问题 1：获取数据失败

**错误信息：** "获取真实数据失败，使用模拟数据"

**可能原因：**
1. Gateway 未运行
2. 端点地址错误
3. CORS 配置问题

**解决方案：**
1. 检查 Gateway 是否运行：`openclaw gateway status`
2. 确认端点地址正确
3. 检查 CORS 配置

---

### 问题 2：CORS 错误

**错误信息：** "Access to fetch at '...' has been blocked by CORS policy"

**解决方案：**
1. 在 Gateway 启用 CORS
2. 或使用反向代理
3. 或确保网站和 Gateway 同域

---

### 问题 3：数据格式不匹配

**错误信息：** 无法解析 API 响应

**解决方案：**
1. 检查 API 响应格式是否符合规范
2. 查看 `fetchRealAgentData()` 函数中的数据处理逻辑
3. 在控制台查看实际返回的数据

---

### 问题 4：连接超时

**错误信息：** "Failed to fetch" 或 "Network request failed"

**解决方案：**
1. 检查网络连接
2. 确认 Gateway 地址可访问
3. 增加超时时间配置

---

## 📊 数据映射

### 状态映射

系统自动将 API 状态映射到可视化状态：

| API 状态 | 可视化状态 | 场景 |
|----------|-----------|------|
| `busy`, `active` | `busy` | 💻 办公位 |
| `idle`, `waiting` | `idle` | ☕ 咖啡 或 🛋️ 沙发 |
| `offline`, `disconnected` | `offline` | 🔄 离线 |

### 子状态映射

空闲状态会随机分配子状态：
- 50% 概率：`sofa`（沙发）
- 50% 概率：`coffee`（咖啡）

---

## 🔧 自定义 API 处理

如果需要自定义 API 数据处理，修改 `fetchRealAgentData()` 函数：

```javascript
async function fetchRealAgentData() {
    try {
        const response = await fetch(`${API_CONFIG.gatewayEndpoint}/agents`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // 自定义数据处理逻辑
        const formattedAgents = data.agents.map(apiAgent => ({
            id: apiAgent.id || apiAgent.sessionKey,
            name: apiAgent.label || apiAgent.name,
            type: apiAgent.kind || apiAgent.type,
            description: apiAgent.description || '智能助手',
            status: mapApiStatus(apiAgent.status),
            subStatus: mapSubStatus(apiAgent.status),
            currentTask: apiAgent.currentTask || null,
            tasksCompleted: apiAgent.tasksCompleted || 0,
            uptime: apiAgent.uptime || '99.0%',
            lastActive: apiAgent.lastActive || '刚刚',

            // 添加自定义字段
            // customField: apiAgent.customField
        }));

        return formattedAgents;
    } catch (error) {
        console.warn('获取真实数据失败，使用模拟数据:', error.message);
        return null;
    }
}
```

---

## 🎯 最佳实践

### 1. 生产环境配置

```javascript
const API_CONFIG = {
    // 使用环境变量
    gatewayEndpoint: process.env.GATEWAY_ENDPOINT || 'http://localhost:3333',
    useRealData: true,
    refreshInterval: 30000,
    timeout: 10000
};
```

### 2. 错误处理

确保有降级方案（使用模拟数据）

### 3. 性能优化

- 合理设置刷新间隔
- 使用缓存减少请求
- 只在数据变化时更新 UI

---

## 📞 需要帮助？

如果遇到问题：
1. 检查浏览器控制台错误信息
2. 查看 Gateway 日志
3. 参考 OpenClaw 文档：https://docs.openclaw.ai

---

**祝您接入顺利！🚀**