#!/bin/sh

# 启动脚本 - 处理Prisma数据库初始化和迁移

set -e

echo "🚀 启动 Mood 应用..."

# 检查数据库文件是否存在
if [ ! -f "/app/prisma/db/prod.db" ]; then
    echo "📊 数据库文件不存在，开始初始化..."
    
    # 创建数据库目录
    mkdir -p /app/prisma/db
    
    # 初始化数据库
    echo "🔧 运行Prisma迁移..."
    npx prisma migrate deploy
    
    echo "✅ 数据库初始化完成"
else
    echo "📊 数据库文件已存在，跳过初始化"
fi

# 启动应用
echo "🚀 启动Nuxt应用..."
exec node .output/server/index.mjs
