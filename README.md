# 🤖 Agent 状态监控中心

一个实时可视化显示 Agent 状态的 Web 应用，通过生动的场景展示 Agent 的闲忙情况。

## ✨ 功能特性

- 🎨 **可视化状态展示**
  - 空闲状态: ☕ 喝咖啡 / 🛋️ 坐在沙发
  - 忙碌状态: 💻 在办公位使用笔记本
  - 离线状态: 🔄 不可用

- 🔗 **OpenClaw Gateway 集成**
  - ✅ 真实连接 OpenClaw Gateway
  - 📡 获取真实的 Agent 会话数据
  - 🔧 配置面板支持自定义 Gateway URL
  - 🧪 连接测试功能

- 📊 **实时信息**
  - Agent 基本信息展示
  - 当前任务显示
  - 任务完成统计
  - 可用率监控

- 🎭 **生动动画**
  - 呼吸动画（空闲状态）
  - 咖啡摇晃动画
  - 打字动画（忙碌状态）
  - 脉冲指示器

- 📱 **响应式设计**
  - 支持桌面端和移动端
  - 自适应布局

## 🚀 快速开始

### 1. 安装依赖

```bash
cd agent-status-viz
npm install
```

### 2. 启动服务

```bash
npm start
```

### 3. 访问应用

打开浏览器访问: `http://localhost:3000`

## 📁 项目结构

```
agent-status-viz/
├── public/
│   └── index.html          # 主页面
├── css/
│   └── style.css           # 样式文件
├── js/
│   └── main.js            # 主逻辑
├── server.js              # Express 服务器
├── package.json           # 项目配置
└── README.md              # 说明文档
```

## 🎮 使用说明

### 手动切换状态

每个 Agent 卡片下方都有 "切换状态" 按钮，点击可以切换 Agent 的状态：
- 空闲 → 忙碌 → 离线 → 空闲

### 自动刷新

页面每 30 秒自动刷新一次，模拟随机状态变化。

点击顶部的 "🔄 刷新" 按钮可以手动刷新所有状态。

## 🔧 配置说明

### 修改 Agent 数据

在 `js/main.js` 中的 `agents` 数组可以修改或添加 Agent：

```javascript
const agents = [
    {
        id: 'agent-001',
        name: 'Writer Agent',
        type: '写作助手',
        description: '擅长文案创作、内容生成和文档编辑',
        status: 'idle',          // idle/busy/offline
        subStatus: 'sofa',       // sofa/coffee/working/null
        currentTask: null,
        tasksCompleted: 47,
        uptime: '98.5%'
    },
    // 添加更多 Agent...
];
```

### 自定义状态图标

在 `js/main.js` 中的 `statusIcons` 对象可以修改状态图标：

```javascript
const statusIcons = {
    idle_sofa: '🛋️',
    idle_coffee: '☕',
    busy_working: '💻',
    offline: '🔄'
};
```

## 🎨 样式定制

所有样式都在 `css/style.css` 中，可以自定义：
- 动画效果
- 颜色方案
- 卡片样式
- 响应式布局

## 🔗 OpenClaw Gateway 集成

### 连接真实数据

现在支持连接到 OpenClaw Gateway，获取真实的 Agent 会话数据！

#### 步骤 1: 确保 Gateway 运行

```bash
# 检查 Gateway 状态
openclaw gateway status

# 如果未运行，启动它
openclaw gateway start
```

#### 步骤 2: 配置 Gateway URL

1. 打开应用后，点击右下角的 ⚙️ 配置按钮
2. 在配置面板中输入 Gateway URL
   - 本地开发: `http://localhost:3333`
   - 远程服务器: `http://your-server:3333`
3. 点击"保存"按钮

#### 步骤 3: 连接 Gateway

- **方法 1**: 使用配置面板中的"🔗 连接 Gateway"按钮
- **方法 2**: 点击顶部的"🔗 数据源"按钮，切换到 OpenClaw Gateway 模式

#### 步骤 4: 测试连接

点击"🧪 测试 Gateway 连接"按钮，验证连接是否正常。

### 三种数据模式

1. **⚫ 模拟数据**: 使用预设的模拟数据（默认）
2. **🟡 自定义 API 轮询**: 连接到自定义 API 端点
3. **🟢 OpenClaw Gateway**: 连接到 OpenClaw Gateway 获取真实数据

### 数据源切换

点击顶部的"🔗 数据源"按钮，可以在三种模式之间循环切换：
- 模拟数据 → 自定义 API → OpenClaw Gateway → 模拟数据

### 实时更新

点击顶部的"⚡ 实时"按钮可以启用 WebSocket 实时更新（需要 Gateway 支持）。

## 🔮 未来计划

- [x] 接入真实 OpenClaw Gateway API
- [ ] WebSocket 实时更新支持
- [ ] 添加历史状态记录
- [ ] 支持更多状态类型
- [ ] 添加通知功能
- [ ] 支持多语言
- [ ] 数据持久化

## 📝 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **样式**: Tailwind CSS
- **后端**: Node.js + Express
- **动画**: CSS Animations

## 💡 提示

- 当前使用模拟数据，可用于演示和测试
- 要接入真实数据，需要修改 `server.js` 中的 API 路由
- 所有动画都是纯 CSS 实现，性能良好

---

享受您的 Agent 监控体验！ 🎉