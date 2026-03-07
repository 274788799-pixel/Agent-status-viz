# 🔗 OpenClaw Gateway 集成指南

## 概述

agent-status-viz 现已支持连接到 OpenClaw Gateway，获取并显示真实的 Agent 会话数据！

## 快速开始

### 1. 确保 OpenClaw Gateway 运行

```bash
# 检查 Gateway 状态
openclaw gateway status

# 如果未运行，启动它
openclaw gateway start
```

### 2. 访问应用

```bash
# 本地开发
cd agent-status-viz
npm start

# 访问
http://localhost:3000
```

## 配置步骤

### 方法 1: 使用配置面板（推荐）

1. 打开应用后，点击右下角的 **⚙️** 配置按钮
2. 在配置面板中输入 Gateway URL：
   - **本地开发**: `http://localhost:3333`
   - **远程服务器**: `http://your-server:3333`
3. 点击"保存"按钮
4. 点击"🔗 连接 Gateway"按钮

### 方法 2: 使用数据源按钮

1. 点击顶部的"🔗 数据源"按钮
2. 循环切换模式直到显示"🟢 OpenClaw Gateway"

### 方法 3: 直接配置代码

编辑 `js/openclaw-gateway.js`:

```javascript
const OPENCLAW_CONFIG = {
    gatewayUrl: 'http://localhost:3333', // 修改为你的 Gateway URL
    // ...
};
```

## 三种数据模式

### ⚫ 模拟数据
- 使用预设的 12 个模拟 Agent
- 适合演示和测试
- 不需要任何外部连接

### 🟡 自定义 API 轮询
- 连接到自定义 API 端点
- 需要在配置中设置 `gatewayEndpoint`
- 定期轮询获取数据（默认 30 秒）

### 🟢 OpenClaw Gateway（新功能）
- 连接到真实的 OpenClaw Gateway
- 获取真实的 Agent 会话数据
- 显示实际的 Agent 名称、模型、Token 使用情况

## 数据映射说明

OpenClaw Gateway 数据会被自动映射为以下格式：

| OpenClaw 字段 | 显示字段 | 说明 |
|--------------|---------|------|
| `session.key` | Agent 名称 | 从 sessionKey 提取 |
| `session.kind` | 助手类型 | 群组/私聊 |
| `session.channel` | 通道类型 | feishu/telegram/discord 等 |
| `session.model` | 模型名称 | qwen3.5-plus, glm-4.7 等 |
| `session.updatedAt` | 最后活跃时间 | 转换为相对时间 |
| `session.totalTokens` | 完成任务数 | 基于 Token 估算 |
| `session.contextTokens` | 上下文 Token | 显示详细信息 |

## 状态判断逻辑

Agent 状态根据最后活跃时间自动判断：

- **🟢 忙碌 (busy)**: 最近 5 分钟内有活动
- **🟡 空闲 (idle)**: 5-60 分钟内有活动
- **🔴 离线 (offline)**: 超过 60 分钟无活动

## 功能按钮说明

### 🔗 数据源
循环切换三种数据模式：模拟 → 自定义 API → OpenClaw Gateway

### ⚡ 实时
启用 WebSocket 实时更新（需要 Gateway 支持，暂未实现）

### 🔄 刷新
手动刷新当前数据源

### ⚙️ 配置
打开配置面板，设置 Gateway URL

## 测试连接

在配置面板中点击"🧪 测试 Gateway 连接"按钮，会：

1. 尝试连接到 Gateway
2. 获取会话列表
3. 显示连接结果和发现的 Agent 数量

## 常见问题

### Q: 连接失败怎么办？

**A:** 检查以下几点：
1. Gateway 是否正在运行：`openclaw gateway status`
2. URL 是否正确：`http://localhost:3333`
3. 是否有防火墙阻止
4. 查看浏览器控制台获取详细错误信息

### Q: 看不到真实的 Agent 数据？

**A:** 确保：
1. 已切换到 OpenClaw Gateway 模式
2. Gateway 确实有活跃会话
3. URL 配置正确
4. 查看 Console 日志确认连接状态

### Q: 如何获取 Gateway URL？

**A:**
- **本地**: 默认 `http://localhost:3333`
- **远程**: 查看你的服务器配置，通常是 `http://<服务器IP>:3333`
- **自定义**: 如果修改了端口，使用实际端口号

### Q: 支持哪些通道？

**A:** 目前支持：
- Feishu (飞书)
- Telegram
- Discord
- Slack
- WhatsApp
- Signal
- iMessage

更多通道会自动识别并显示为"智能助手"。

## 开发说明

### 添加新的通道支持

编辑 `js/openclaw-gateway.js` 中的 `descriptionMap`:

```javascript
const descriptionMap = {
    'feishu': `飞书${isGroupChat ? '群组' : '私聊'}助手`,
    'your-channel': '你的通道助手',
    // ...
};
```

### 自定义状态映射

编辑 `js/openclaw-gateway.js` 中的状态判断逻辑:

```javascript
// 修改状态判断阈值
if (minutesSinceActive > 60) {
    status = 'offline';
} else if (minutesSinceActive < 5) {
    status = 'busy';
}
```

## 技术细节

### API 端点

当前使用的 OpenClaw Gateway API:

```
GET http://localhost:3333/api/v1/sessions
```

返回格式:

```json
{
  "count": 4,
  "sessions": [
    {
      "key": "agent:main:feishu:user:xxx",
      "kind": "other",
      "channel": "feishu",
      "model": "qwen3.5-plus",
      "updatedAt": 1772893401994,
      // ...
    }
  ]
}
```

### 数据流程

```
用户点击"连接 Gateway"
    ↓
调用 fetchOpenClawSessions()
    ↓
连接 Gateway API
    ↓
获取 sessions 数据
    ↓
convertSessionsToAgents() 转换格式
    ↓
renderAgents() 渲染卡片
    ↓
显示真实 Agent 状态
```

## 部署到 Cloudflare Pages

1. 确保 `public/` 目录包含所有文件
2. 推送到 GitHub
3. Cloudflare Pages 会自动部署
4. 注意：部署后需要配置 CORS 才能访问本地 Gateway

## 后续计划

- [ ] WebSocket 实时更新
- [ ] 支持认证的 Gateway
- [ ] 历史数据记录
- [ ] Agent 交互控制
- [ ] 自定义状态映射规则

## 反馈与问题

如有问题或建议，请查看：
- GitHub Issues
- 浏览器控制台日志
- Gateway 日志: `openclaw gateway logs`

---

享受真实的 Agent 监控体验！ 🎉