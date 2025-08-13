#!/bin/sh

# 启动脚本 - 智能处理Prisma数据库初始化和迁移
# 支持多种场景：有迁移文件、无迁移文件、数据库已存在等

set -e

echo "🚀 启动 Mood 应用..."

# 函数：检查Prisma环境
check_prisma_environment() {
    if [ -d "/app/prisma/migrations" ] && [ -f "/app/prisma/schema.prisma" ]; then
        echo "🔧 发现完整的Prisma环境"
        return 0
    elif [ -f "/app/prisma/schema.prisma" ]; then
        echo "📝 发现Prisma schema文件，但缺少迁移目录"
        return 1
    else
        echo "⚠️  未发现Prisma文件"
        return 2
    fi
}

# 函数：创建数据库目录
create_database_directories() {
    echo "📁 创建数据库目录..."
    mkdir -p /app/prisma/db
    echo "✅ 数据库目录创建完成"
}

# 函数：运行Prisma迁移
run_prisma_migrations() {
    echo "🔧 开始运行Prisma迁移..."
    
    # 检查是否有可用的迁移
    if [ -n "$(ls -A /app/prisma/migrations 2>/dev/null)" ]; then
        echo "📝 发现迁移文件，开始应用..."
        
        # 尝试运行迁移
        if npx prisma migrate deploy; then
            echo "✅ 数据库迁移完成"
            return 0
        else
            echo "❌ 迁移失败，尝试创建数据库"
            return 1
        fi
    else
        echo "⚠️  迁移目录为空，跳过迁移"
        return 1
    fi
}

# 函数：创建空数据库
create_empty_database() {
    echo "📊 创建空数据库文件..."
    touch /app/prisma/db/prod.db
    echo "✅ 空数据库文件已创建"
}

# 函数：检查数据库状态
check_database_status() {
    echo "🔍 检查数据库状态..."
    
    if [ -f "/app/prisma/db/prod.db" ]; then
        echo "✅ 数据库文件存在"
        
        # 如果有Prisma环境，检查是否需要更新
        if check_prisma_environment; then
            echo "🔍 检查是否有新的迁移需要应用..."
            
            # 尝试检查迁移状态
            if npx prisma migrate status 2>/dev/null | grep -q "pending"; then
                echo "📝 发现待应用的迁移，开始应用..."
                if npx prisma migrate deploy; then
                    echo "✅ 新迁移已应用"
                else
                    echo "⚠️  新迁移应用失败，但继续启动"
                fi
            else
                echo "✅ 数据库已是最新状态，无需更新"
            fi
        fi
    else
        echo "❌ 数据库文件不存在，需要创建"
        return 1
    fi
}

# 主逻辑
main() {
    # 创建必要的目录
    create_database_directories
    
    # 检查数据库文件是否存在
    if [ ! -f "/app/prisma/db/prod.db" ]; then
        echo "📊 数据库文件不存在，开始初始化..."
        
        # 检查Prisma环境
        if check_prisma_environment; then
            # 有完整的Prisma环境，尝试运行迁移
            if ! run_prisma_migrations; then
                # 迁移失败，创建空数据库
                create_empty_database
            fi
        else
            # 没有完整的Prisma环境，创建空数据库
            create_empty_database
            echo "📝 数据库将在应用首次启动时自动创建表结构"
        fi
    else
        echo "📊 数据库文件已存在，检查状态..."
        check_database_status
    fi
    
    # 最终验证
    echo "🔍 最终验证数据库..."
    if [ -f "/app/prisma/db/prod.db" ]; then
        echo "✅ 数据库验证通过"
    else
        echo "❌ 数据库验证失败"
        exit 1
    fi
}

# 执行主逻辑
main

# 启动应用
echo "🚀 启动Nuxt应用..."
exec node .output/server/index.mjs
