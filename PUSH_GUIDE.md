# 🚀 推送到 GitHub - 详细步骤

本文档指导您将代码推送到 GitHub 并部署到 Cloudflare Pages。

---

## 📝 步骤 1：在 GitHub 创建仓库

### 1.1 访问 GitHub

打开 [GitHub](https://github.com/) 并登录您的账号

### 1.2 创建新仓库

1. 点击右上角 **"+"** → **"New repository"**
2. 填写仓库信息：

   | 设置项 | 值 |
   |--------|-----|
   | Repository name | `agent-status-viz` |
   | Description | `Agent 状态可视化监控中心` |
   | Public/Private | ✅ Public（推荐）或 Private |

3. ⚠️ **不要勾选** "Add a README file"（我们已经有代码了）
4. 点击 **"Create repository"**

### 1.3 记录仓库地址

创建成功后，复制仓库 HTTPS URL：

```
https://github.com/YOUR_USERNAME/agent-status-viz.git
```

**提示：** 替换 `YOUR_USERNAME` 为您的 GitHub 用户名

---

## 🔑 步骤 2：创建 GitHub Personal Access Token

由于 GitHub 已禁用密码认证，需要使用 Personal Access Token。

### 2.1 进入设置

1. 在 GitHub 点击右上角头像 → **Settings**
2. 左侧菜单向下滚动，找到 **"Developer settings"**
3. 点击 **"Personal access tokens"** → **"Tokens (classic)"**

### 2.2 创建新 Token

1. 点击 **"Generate new token"** → **"Generate new token (classic)"**
2. 填写信息：

   | 设置项 | 值 |
   |--------|-----|
   | Note | `Agent Status Viz` |
   | Expiration | 选择过期时间（推荐 90 days 或 No expiration） |

3. 勾选权限（勾选以下几项即可）：

   ```
   ✅ repo - Full control of private repositories
      ✅ repo:status
      ✅ repo_deployment
      ✅ public_repo
      ✅ repo:invite
   ```

4. 点击底部的 **"Generate token"**

### 2.3 保存 Token

**重要：** 立即复制 Token 并保存！

- Token 只会显示一次
- 将它保存在安全的地方
- 格式类似：`ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 📤 步骤 3：推送到 GitHub

### 3.1 添加远程仓库

在项目目录执行（替换 YOUR_USERNAME）：

```bash
cd /home/274788799_wy/.openclaw/workspace-master/agent-status-viz

git remote add origin https://github.com/YOUR_USERNAME/agent-status-viz.git
```

### 3.2 推送代码

执行推送命令（会要求输入 Token）：

```bash
git push -u origin main
```

### 3.3 输入认证信息

执行后会提示：

```
Username: YOUR_USERNAME
Password: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- **Username**: 输入您的 GitHub 用户名
- **Password**: 粘贴刚才创建的 Personal Access Token

**注意：**
- 密码输入时**不会显示字符**，这是正常的
- 直接粘贴 Token 即可

### 3.4 等待推送完成

看到类似输出即成功：

```
Enumerating objects: 15, done.
Counting objects: 100% (15/15), done.
Delta compression using up to 8 threads
Compressing objects: 100% (10/10), done.
Writing objects: 100% (15/15), 8.78 KiB | 8.78 MiB/s, done.
Total 15 (delta 0), reused 0 (delta 0)
To https://github.com/YOUR_USERNAME/agent-status-viz.git
 * [new branch]      main -> main
```

---

## 🌐 步骤 4：在 Cloudflare Pages 连接 GitHub

### 4.1 访问 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 左侧菜单 → **"Workers & Pages"**
3. 点击 **"Create"** → **"Pages"**

### 4.2 连接 GitHub

1. 选择 **"Connect to Git"** 选项卡
2. 点击 **"Connect GitHub"** 按钮
3. 首次使用需要授权：

   - 点击 **"Authorize Cloudflare Pages"**
   - 登录 GitHub 并授权（如果未登录）

### 4.3 选择仓库

1. 在仓库列表中选择 `agent-status-viz`
2. Cloudflare 会自动扫描仓库

### 4.4 配置构建设置

填写以下配置：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **项目名称** | `agent-status-viz` | 唯一标识 |
| **生产分支** | `main` | 主分支 |
| **框架预设** | `None` | 纯静态站点 |
| **构建命令** | 留空 | 无需构建 |
| **输出目录** | `public` | 静态文件目录 |

### 4.5 配置预览部署（可选）

勾选以下选项：
- ✅ **Preview deployments** - 为每个分支创建预览 URL
- ✅ **Automatic deployments** - 推送代码自动部署

### 4.6 部署

点击 **"Save and Deploy"**，等待部署完成（30-60 秒）

---

## ✅ 步骤 5：访问网站

部署完成后，您会获得：

### 生产环境 URL
```
https://agent-status-viz.pages.dev
```

### 预览环境 URL（分支）
```
https://feature-new.agent-status-viz.pages.dev
```

点击链接即可访问您的网站！🎉

---

## 🔄 后续更新流程

以后更新代码，只需：

```bash
# 1. 修改代码

# 2. 提交更改
git add .
git commit -m "描述你的更改"

# 3. 推送到 GitHub
git push origin main

# 4. 等待 Cloudflare 自动部署（30-60 秒）
```

**就是这么简单！** ✨

---

## 🔐 保存 Token 供后续使用

### 方式 1：使用 Git 凭据缓存（推荐）

```bash
# 缓存凭证 1 小时（3600 秒）
git config --global credential.helper 'cache --timeout=3600'

# 永久存储（不安全，仅限个人电脑）
git config --global credential.helper store
```

配置后，再次推送时只需输入一次 Token。

### 方式 2：使用 SSH（长期使用更方便）

如果经常推送，建议配置 SSH 密钥：

```bash
# 1. 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. 复制公钥
cat ~/.ssh/id_ed25519.pub

# 3. 在 GitHub 添加 SSH 密钥
# Settings → SSH and GPG keys → New SSH key
```

---

## ❓ 常见问题

### Q: 推送时提示 "Authentication failed"

**A:** 检查以下几点：
1. Token 是否正确复制（确保没有多余空格）
2. Token 是否已过期
3. 是否勾选了必要的权限（repo）

### Q: 找不到 Personal Access Token 设置

**A:** 确保路径正确：
```
Settings → Developer settings → Personal access tokens → Tokens (classic)
```

### Q: Cloudflare 部署失败

**A:** 检查以下几点：
1. 仓库名称是否正确
2. 输出目录是否为 `public`
3. 检查部署日志（在 Cloudflare Dashboard 查看）

### Q: 如何查看部署历史？

**A:** 在 Cloudflare Pages 项目中：
1. 进入项目
2. 点击 **"Deployments"**
3. 查看所有部署记录

---

## 🎉 完成后

您将拥有：
- ✅ GitHub 仓库，版本控制
- ✅ Cloudflare Pages 网站，全球访问
- ✅ 自动 CI/CD，推送即部署
- ✅ 预览环境，分支独立预览
- ✅ 完整的部署文档

---

## 📞 需要帮助？

- [GitHub Personal Access Tokens 文档](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Git 推送认证问题](https://docs.github.com/en/get-started/getting-started-with-git/caching-your-github-credentials-in-git)

---

**祝您部署成功！🚀**