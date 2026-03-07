# 🔐 环境变量配置指南

## 概述

从现在开始，OpenClaw Gateway 的配置（包括 URL 和 Token）通过服务器端环境变量管理，更加安全和方便。

## 环境变量

### 1. OPENCLAW_GATEWAY_URL

**必需** - OpenClaw Gateway 的访问地址。

```bash
# 本地开发
export OPENCLAW_GATEWAY_URL=http://localhost:3333

# 远程服务器
export OPENCLAW_GATEWAY_URL=http://your-server:3333
```

### 2. OPENCLAW_GATEWAY_TOKEN

**可选** - Gateway 的认证 Token（如果 Gateway 启用了认证）。

```bash
# 如果 Gateway 需要认证
export OPENCLAW_GATEWAY_TOKEN=your_token_here
```

## 配置步骤

### 方法 1: 临时设置（当前会话）

```bash
# 1. 设置环境变量
export OPENCLAW_GATEWAY_URL=http://localhost:3333
export OPENCLAW_GATEWAY_TOKEN=your_token_here  # 可选

# 2. 启动服务器
npm start
```

### 方法 2: 永久设置（推荐）

#### Linux / macOS

将环境变量添加到 `~/.bashrc` 或 `~/.zshrc`:

```bash
echo 'export OPENCLAW_GATEWAY_URL=http://localhost:3333' >> ~/.bashrc
echo 'export OPENCLAW_GATEWAY_TOKEN=your_token_here' >> ~/.bashrc  # 可选

# 重新加载配置
source ~/.bashrc
```

#### Windows (PowerShell)

```powershell
# 永久设置
[System.Environment]::SetEnvironmentVariable('OPENCLAW_GATEWAY_URL', 'http://localhost:3333', 'User')
[System.Environment]::SetEnvironmentVariable('OPENCLAW_GATEWAY_TOKEN', 'your_token_here', 'User')

# 重启终端后生效
```

#### 使用 .env 文件（开发环境）

创建 `.env` 文件：

```bash
OPENCLAW_GATEWAY_URL=http://localhost:3333
OPENCLAW_GATEWAY_TOKEN=your_token_here  # 可选
```

然后修改 `server.js` 使用 `dotenv`:

```bash
npm install dotenv
```

```javascript
// server.js 顶部添加
require('dotenv').config();
```

## 获取 OpenClaw Gateway Token

### 1. 查看当前 Token

```bash
openclaw gateway token
```

### 2. 重置 Token（如果需要）

```bash
openclaw gateway reset-token
```

### 3. 重启 Gateway

```bash
openclaw gateway restart
```

## 工作原理

```
用户请求（浏览器）
    ↓
本地服务器 (agent-status-viz)
    ↓
读取环境变量 (OPENCLAW_GATEWAY_URL + OPENCLAW_GATEWAY_TOKEN)
    ↓
添加认证头 (Bearer Token)
    ↓
转发到 OpenClaw Gateway
    ↓
返回数据给浏览器
```

**优势：**
- ✅ Token 不会暴露在浏览器中
- ✅ 集中管理配置
- ✅ 支持动态更新
- ✅ 更安全

## 验证配置

启动服务器后，查看控制台输出：

```
╔══════════════════════════════════════╗
║  🤖 Agent 状态监控中心已启动!        ║
║  访问地址: http://localhost:3000     ║
╠══════════════════════════════════════╣
║  🔧 OpenClaw Gateway 配置:           ║
║  - URL: http://localhost:3333        ║
║  - Token: ✅ 已配置                   ║
╚══════════════════════════════════════╝
```

## 测试连接

1. 启动服务器后，访问 http://localhost:3000
2. 点击右下角 ⚙️ 配置按钮
3. 点击 "🧪 测试 Gateway 连接"
4. 查看浏览器控制台的详细日志

## 常见问题

### Q: 为什么不再在浏览器中配置 URL 和 Token？

**A:** 出于安全考虑。Token 是敏感信息，不应该存储在浏览器或前端代码中。通过服务器代理，Token 只存在于服务器端环境变量中。

### Q: 如何在不同环境使用不同配置？

**A:** 使用不同的环境变量配置：

- **开发环境**: `export OPENCLAW_GATEWAY_URL=http://localhost:3333`
- **生产环境**: `export OPENCLAW_GATEWAY_URL=https://gateway.example.com`

### Q: Token 可以不配置吗？

**A:** 可以。如果 Gateway 没有启用认证，可以不设置 `OPENCLAW_GATEWAY_TOKEN`。服务器会自动检测，只在存在时才添加认证头。

### Q: 如何检查 Gateway 是否需要 Token？

**A:** 尝试不带 Token 访问：

```bash
curl http://localhost:3333/api/v1/sessions
```

如果返回 `401 Unauthorized`，则需要 Token。

### Q: 在 Cloudflare Pages 部署时如何配置？

**A:** Cloudflare Pages 支持环境变量：

1. 进入项目设置 → Environment Variables
2. 添加 `OPENCLAW_GATEWAY_URL` 和 `OPENCLAW_GATEWAY_TOKEN`
3. 重新部署

注意：Pages 是静态托管，无法运行 Node.js 服务器。需要使用 Cloudflare Workers 或 Functions 来实现代理功能。

### Q: 如何在 Docker 中配置？

**A:** 在 `docker-compose.yml` 中：

```yaml
services:
  app:
    build: .
    environment:
      - OPENCLAW_GATEWAY_URL=http://gateway:3333
      - OPENCLAW_GATEWAY_TOKEN=${OPENCLAW_GATEWAY_TOKEN}
```

然后在 `.env` 文件中设置变量。

### Q: 如何调试代理连接问题？

**A:**

1. **检查服务器日志** - 查看是否有连接错误
2. **查看浏览器控制台** - 查看 Network 标签的请求详情
3. **使用 curl 测试** - 直接测试 Gateway 是否可访问：

```bash
curl -H "Authorization: Bearer your_token" http://localhost:3333/api/v1/sessions
```

4. **检查环境变量** - 在服务器启动时确认已加载：

```bash
echo $OPENCLAW_GATEWAY_URL
echo $OPENCLAW_GATEWAY_TOKEN
```

## 安全建议

1. **不要在代码中硬编码 Token**
   - ❌ `const token = 'abc123'`
   - ✅ `process.env.OPENCLAW_GATEWAY_TOKEN`

2. **使用 .gitignore 排除 .env 文件**
   ```bash
   echo ".env" >> .gitignore
   ```

3. **定期轮换 Token**
   ```bash
   openclaw gateway reset-token
   ```

4. **限制 Token 权限**（如果支持）
   - 只授予必要的 API 权限

5. **生产环境使用 HTTPS**
   - 确保 Gateway URL 使用 `https://`

## 迁移指南

如果你之前使用旧版本（浏览器端配置），迁移步骤：

1. **删除浏览器中的 localStorage 数据**：
   ```javascript
   localStorage.removeItem('openclaw_gateway_url');
   ```

2. **设置环境变量**（见上方配置步骤）

3. **重启服务器**：
   ```bash
   npm start
   ```

4. **验证连接**：点击 "测试 Gateway 连接" 按钮

## 相关文档

- [OpenClaw Gateway 文档](https://docs.openclaw.ai)
- [OPENCLAW_INTEGRATION.md](./OPENCLAW_INTEGRATION.md)
- [README.md](./README.md)

---

如需帮助，请查看浏览器控制台或服务器日志！🔧