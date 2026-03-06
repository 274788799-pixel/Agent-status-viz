# 🌍 Cloudflare Pages 部署指南

本文档提供三种将 Agent 状态可视化网站部署到 Cloudflare Pages 的方式。

---

## 🎯 推荐部署方式

| 方式 | 难度 | 优势 | 适用场景 |
|------|------|------|----------|
| **控制台上传** | ⭐ 简单 | 无需 Git，快速部署 | 首次部署，快速验证 |
| **GitHub 自动部署** | ⭐⭐ 中等 | 自动 CI/CD，推送即部署 | 长期维护，团队协作 |
| **Wrangler CLI** | ⭐⭐⭐ 较难 | 灵活配置，适合高级用户 | 需要自定义配置 |

---

## 方式 1：控制台上传（推荐新手）

### 步骤 1：准备部署文件

确保项目结构如下：
```
agent-status-viz/
├── public/
│   └── index.html          # 主页面
├── css/
│   └── style.css           # 样式文件
├── js/
│   └── main.js            # 主逻辑
└── README.md              # 说明文档
```

### 步骤 2：访问 Cloudflare Pages 控制台

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 在左侧菜单找到 **"Workers & Pages"**
3. 点击 **"Create"** → **"Pages"**
4. 选择 **"Upload assets"** 选项卡

### 步骤 3：上传项目文件

1. 将整个 `public` 文件夹中的文件拖拽到上传区域
2. 或者点击 "Select folder" 选择项目文件夹
3. 等待上传完成（通常几秒钟）

### 步骤 4：配置项目

- **项目名称**: `agent-status-viz`（可自定义）
- **生产分支**: `main`（上传模式无需配置）
- **构建设置**: 无需配置（纯静态站点）

### 步骤 5：部署

点击 **"Deploy site"** 按钮，等待部署完成（通常 30-60 秒）

### 步骤 6：访问网站

部署完成后，您会获得一个类似这样的 URL：
```
https://agent-status-viz.pages.dev
```

点击链接即可访问您的网站！

---

## 方式 2：GitHub 自动部署（推荐长期使用）

### 步骤 1：创建 GitHub 仓库

1. 登录 [GitHub](https://github.com/)
2. 点击右上角 **"+"** → **"New repository"**
3. 仓库名称: `agent-status-viz`
4. 选择 **Public** 或 **Private**（都可以）
5. 点击 **"Create repository"**

### 步骤 2：推送代码到 GitHub

在项目目录执行：

```bash
cd /home/274788799_wy/.openclaw/workspace-master/agent-status-viz

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Agent Status Visualization"

# 添加远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/agent-status-viz.git

# 推送代码
git branch -M main
git push -u origin main
```

### 步骤 3：在 Cloudflare 连接 GitHub 仓库

1. 登录 [Cloudflare Pages 控制台](https://dash.cloudflare.com/)
2. 创建新 Pages 项目
3. 选择 **"Connect to Git"** 选项卡
4. 选择 GitHub（首次需要授权 Cloudflare 访问您的仓库）
5. 选择 `agent-status-viz` 仓库

### 步骤 4：配置构建设置

配置如下：

| 设置项 | 值 |
|--------|-----|
| **项目名称** | `agent-status-viz` |
| **生产分支** | `main` |
| **框架预设** | `None` |
| **构建命令** | 留空 |
| **输出目录** | `public` |

### 步骤 5：部署

点击 **"Save and Deploy"**，Cloudflare 会自动部署

### 步骤 6：后续更新

以后只需推送代码到 GitHub，Cloudflare 会自动重新部署：

```bash
# 修改代码后
git add .
git commit -m "Update: 描述你的更改"
git push
```

---

## 方式 3：Wrangler CLI 部署

### 前提条件

1. 已安装 Node.js（项目已有）
2. 安装 Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

### 步骤 1：登录 Cloudflare

```bash
npx wrangler login
```

这会在浏览器中打开 Cloudflare 登录页面，授权后自动登录。

### 步骤 2：创建 Pages 项目

```bash
npx wrangler pages project create agent-status-viz
```

### 步骤 3：部署项目

```bash
npx wrangler pages deploy public --project-name=agent-status-viz
```

### 步骤 4：预览部署

```bash
npx wrangler pages deploy public --project-name=agent-status-viz --branch=preview
```

---

## 🎨 自定义域名（可选）

### 步骤 1：添加自定义域名

1. 进入 Cloudflare Pages 项目设置
2. 点击 **"Custom domains"**
3. 点击 **"Set up a custom domain"**
4. 输入您的域名（如：`agent.yourdomain.com`）

### 步骤 2：配置 DNS

Cloudflare 会自动为您配置 DNS 记录，通常几分钟内生效。

---

## 📊 部署后配置

### 环境变量（如需要）

在项目设置中可以添加环境变量：
- **Production**: 生产环境
- **Preview**: 预览环境

### 访问控制（可选）

可以在 Cloudflare 中配置：
- **页面规则**: 重定向、缓存控制
- **WAF**: 安全规则
- **访问控制**: 密码保护等

---

## 🔧 常见问题

### Q: 上传后无法访问？

**A:** 检查以下几点：
1. 确认 `index.html` 在 `public` 文件夹根目录
2. 等待 DNS 生效（最长 24 小时）
3. 检查 Cloudflare Pages 状态页面是否有错误

### Q: 如何查看部署日志？

**A:** 在 Cloudflare Pages 控制台：
1. 进入项目
2. 点击 **"Deployments"**
3. 选择最近的部署，点击查看日志

### Q: 如何回滚到之前的版本？

**A:**
1. 在 "Deployments" 页面
2. 找到之前的版本
3. 点击右上角 **"Rollback"** 按钮

### Q: 支持自定义 404 页面吗？

**A:** 支持！在 `public` 文件夹创建 `404.html` 文件即可。

---

## 🎉 部署完成后

您的网站将在 Cloudflare 的全球网络上运行，享受：
- ⚡ **极速加载**: 全球 CDN 加速
- 🌍 **全球覆盖**: 300+ 边缘节点
- 🔒 **HTTPS 免费**: 自动 SSL 证书
- 📈 **无限带宽**: 无流量限制
- 💰 **免费额度**: 每月 500 次构建

---

## 📞 需要帮助？

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare 社区论坛](https://community.cloudflare.com/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)

---

**祝您部署成功！🚀**