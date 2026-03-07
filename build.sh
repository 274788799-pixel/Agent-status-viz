#!/bin/bash

# 构建脚本：将开发文件复制到 public 目录用于部署

echo "🔨 开始构建..."

# 创建目标目录（如果不存在）
mkdir -p public/js public/css

# 复制 JS 文件
echo "📁 复制 JS 文件..."
cp -r src/js/* public/js/

# 复制 CSS 文件
echo "📁 复制 CSS 文件..."
cp -r src/css/* public/css/

echo "✅ 构建完成！"
echo ""
echo "📦 部署文件位置:"
echo "  - JS: public/js/"
echo "  - CSS: public/css/"
echo ""
echo "🚀 可以运行以下命令部署:"
echo "  git add public/js public/css"
echo "  git commit -m 'chore: Update build files'"
echo "  git push origin main"