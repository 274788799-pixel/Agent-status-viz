#!/bin/bash

# GitHub 推送脚本
# 使用方法：在本地终端执行此脚本

echo "=========================================="
echo "  🚀 推送代码到 GitHub"
echo "=========================================="
echo ""

# 进入项目目录
cd /home/274788799_wy/.openclaw/workspace-master/agent-status-viz

# 检查 Git 状态
echo "📋 当前 Git 状态："
git status
echo ""

# 添加远程仓库（如果尚未添加）
echo "🔗 配置远程仓库..."
git remote remove origin 2>/dev/null
git remote add origin https://github.com/274788799-pixel/agent-status-viz.git
echo "✅ 远程仓库已设置："
git remote -v
echo ""

# 推送代码
echo "📤 开始推送到 GitHub..."
echo ""
echo "⚠️  当提示输入时："
echo "   Username: 274788799-pixel"
echo "   Password: [您的 GitHub Token]"
echo ""
echo "💡 提示：密码输入时不会显示字符，这是正常的"
echo ""

git push -u origin main

# 检查推送结果
if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "  ✅ 推送成功！"
    echo "=========================================="
    echo ""
    echo "📍 仓库地址："
    echo "   https://github.com/274788799-pixel/agent-status-viz"
    echo ""
    echo "🎯 下一步："
    echo "   1. 访问仓库查看代码"
    echo "   2. 在 Cloudflare Pages 连接此仓库"
    echo "   3. 配置部署设置（输出目录：public）"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "  ❌ 推送失败"
    echo "=========================================="
    echo ""
    echo "💡 常见问题："
    echo "   - 检查 Token 是否正确"
    echo "   - 确认 Token 有 repo 权限"
    echo "   - 检查网络连接"
    echo ""
fi