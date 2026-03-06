# ⚡ 简单集成指南 - WebSocket 实时更新

本指南说明如何在现有的 Agent 状态监控中心集成 WebSocket 实时更新功能。

---

## ✨ 新增功能

### 1. WebSocket 实时更新
- ✅ 实时接收 Agent 状态变化
- ✅ 自动重连机制
- ✅ 连接状态显示

### 2. 工作流可视化
- ✅ 实时工作流日志
- ✅ 任务委托链展示
- ✅ 事件通知系统

### 3. 增强功能
- ✅ 实时通知（成功/错误/信息）
- ✅ 连接状态指示器
- ✅ 按钮切换功能

---

## 🚀 快速开始

### 步骤 1：配置 WebSocket 端点

打开 `js/main.js`，修改 `API_CONFIG`：

```javascript
const API_CONFIG = {
    gatewayEndpoint: 'http://localhost:3333/api/agents',
    websocketEndpoint: 'ws://localhost:3333',  // 修改为你的 Gateway WebSocket 地址

    useRealData: true,    // 启用真实数据
    useWebSocket: true,   // 启用 WebSocket

    refreshInterval: 30000
};
```

### 步骤 2：刷新页面

在浏览器中刷新页面，点击 **"⚡ 实时"** 按钮启用 WebSocket。

### 步骤 3：查看效果

- 连接状态会显示为 **"🟢 实时连接"**
- 工作流日志区域会显示实时事件
- Agent 状态会实时更新

---

## 📋 功能说明

### 按钮说明

| 按钮 | 功能 | 状态 |
|------|------|------|
| 🔄 刷新 | 手动刷新数据 | 始终可用 |
| 🔗 数据源 | 切换真实/模拟数据 | 切换 API |
| ⚡ 实时 | 切换 WebSocket 实时更新 | 切换连接 |

### 连接状态

| 状态 | 显示 | 说明 |
|------|------|------|
| 实时连接 | 🟢 实时连接 | WebSocket 已连接 |
| 连接中 | 🟡 连接中... | 正在尝试连接 |
| 轮询模式 | 🟡 轮询模式 | 使用 HTTP 轮询 |
| 模拟数据 | ⚫ 模拟数据 | 使用本地模拟数据 |

---

## 🔌 WebSocket 消息格式

OpenClaw Gateway 应该发送以下格式的 JSON 消息：

### 1. Agent 状态更新

```json
{
  "type": "agent_status",
  "agent": {
    "id": "agent-001",
    "name": "Writer Agent",
    "status": "busy",
    "currentTask": "撰写文档",
    "tasksCompleted": 48
  }
}
```

### 2. 新 Agent 加入

```json
{
  "type": "agent_added",
  "agent": {
    "id": "agent-013",
    "name": "New Agent",
    "status": "idle"
  }
}
```

### 3. Agent 移除

```json
{
  "type": "agent_removed",
  "agentId": "agent-006"
}
```

### 4. 工作流事件

```json
{
  "type": "workflow",
  "workflow": {
    "from": "User",
    "to": "Main",
    "action": "任务委托",
    "message": "请处理这个请求"
  }
}
```

---

## 🎯 工作流日志

工作流日志显示最近 10 条任务流转事件：

```
14:23:45 User → Main: 任务委托
14:23:46 Main → Coder: 代码开发
14:24:12 Coder → QA: 测试请求
14:24:30 QA → Main: 测试完成
```

---

## 🔔 通知系统

### 通知类型

| 类型 | 颜色 | 用途 |
|------|------|------|
| 成功 | 🟢 绿色 | WebSocket 连接成功 |
| 错误 | 🔴 红色 | 连接失败或错误 |
| 信息 | 🔵 蓝色 | 一般信息通知 |
| 警告 | 🟡 黄色 | 警告信息 |

### 通知行为

- 自动显示在右上角
- 5 秒后自动消失
- 可以手动点击 × 关闭
- 支持多条通知同时显示

---

## ⚙️ 高级配置

### 自定义重连间隔

```javascript
wsReconnectTimer = setTimeout(() => {
    console.log('尝试重新连接 WebSocket...');
    initWebSocket();
    wsReconnectTimer = null;
}, 5000);  // 5 秒后重连
```

### 自定义工作流事件数量

```javascript
// 只保留最近 50 条事件
if (workflowEvents.length > 50) {
    workflowEvents = workflowEvents.slice(0, 50);
}
```

### 自定义通知显示时间

```javascript
// 5 秒后自动消失
setTimeout(() => {
    notification.classList.add('animate-slide-out');
    setTimeout(() => notification.remove(), 300);
}, 5000);  // 修改为其他时间
```

---

## 🐛 故障排除

### 问题 1：WebSocket 无法连接

**症状：** 连接状态一直显示 "连接中..."

**解决方案：**
1. 检查 `websocketEndpoint` 是否正确
2. 确认 Gateway 是否运行
3. 检查网络连接
4. 查看浏览器控制台错误

### 问题 2：消息未显示

**症状：** WebSocket 已连接但 Agent 状态未更新

**解决方案：**
1. 检查 Gateway 发送的消息格式
2. 查看浏览器控制台日志
3. 确认消息类型是否正确

### 问题 3：工作流日志为空

**症状：** 工作流日志一直显示 "暂无工作流事件..."

**解决方案：**
1. 确认 Gateway 发送 `workflow` 类型消息
2. 检查 `renderWorkflowLog()` 函数
3. 查看 `workflowEvents` 数组

---

## 📊 性能优化

### 1. 减少消息频率

```javascript
// 在 Gateway 端配置消息发送频率
// 例如：每 5 秒发送一次状态更新
```

### 2. 使用消息队列

```javascript
// 对于大量消息，可以添加队列机制
let messageQueue = [];

function processQueue() {
    // 批量处理消息
}
```

### 3. 压缩消息

```javascript
// 在 Gateway 端压缩消息
// 例如：只发送变化的数据
```

---

## 🎨 自定义样式

### 修改通知样式

```css
/* 在 css/style.css 中添加 */
.notification {
    /* 自定义样式 */
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}
```

### 修改工作流日志样式

```css
.workflow-item {
    /* 自定义样式 */
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
}
```

---

## 🔗 与 OpenClaw Office 对比

| 特性 | 本项目 | OpenClaw Office |
|------|-------|-----------------|
| **可视化** | 简单卡片 | 3D 办公室 |
| **实时更新** | WebSocket | WebSocket + SSE |
| **工作流** | 日志列表 | 完整流程动画 |
| **复杂度** | 简单 | 中等 |
| **学习曲线** | 低 | 中 |
| **部署** | Cloudflare Pages | 本地/服务器 |

---

## 🎓 使用场景

### 场景 1：监控多个 Agent

1. 启用 WebSocket 实时更新
2. 观察工作流日志
3. 实时接收通知

### 场景 2：调试 Agent 协作

1. 查看任务委托链
2. 追踪工作流事件
3. 识别瓶颈

### 场景 3：团队协作监控

1. 监控 Agent 状态
2. 分析工作模式
3. 优化资源分配

---

## 🚀 下一步

### 短期目标
- [ ] 添加更多通知类型
- [ ] 优化 WebSocket 性能
- [ ] 添加历史记录查看

### 中期目标
- [ ] 集成本地存储
- [ ] 添加图表统计
- [ ] 支持导出数据

### 长期目标
- [ ] 添加 AI 分析
- [ ] 实现预测功能
- [ ] 集成更多平台

---

## 📞 需要帮助？

遇到问题时：
1. 查看浏览器控制台（F12）
2. 检查 Gateway 日志
3. 参考 `API_INTEGRATION.md`

---

**祝使用愉快！🎉**