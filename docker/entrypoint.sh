#!/bin/sh
set -e

echo "============================================="
echo "欢迎使用 MOOD"
echo "============================================="

# 设置默认环境变量
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:/app/prisma/db/mood.db"
fi

echo "Database URL: $DATABASE_URL"
echo "Starting Prisma database initialization..."

# 确保数据库目录存在
mkdir -p /app/prisma/db

# 检查数据库文件是否存在
if [ ! -f "/app/prisma/db/mood.db" ]; then
  echo "Database file does not exist, creating new database..."
  touch /app/prisma/db/mood.db
fi

# 尝试运行迁移
echo "Running Prisma migrations..."
if npx prisma migrate deploy; then
  echo "✅ Prisma migrations applied successfully"
else
  echo "⚠️  No migrations found, using db push..."
  if npx prisma db push; then
    echo "✅ Database schema pushed successfully"
  else
    echo "❌ Database initialization failed"
    exit 1
  fi
fi

# 验证数据库表是否存在
echo "Verifying database tables..."
if npx prisma db execute --stdin <<< "SELECT name FROM sqlite_master WHERE type='table' AND name='EmotionPost';" | grep -q "EmotionPost"; then
  echo "✅ EmotionPost table exists"
else
  echo "❌ EmotionPost table not found, attempting to recreate..."
  npx prisma db push --force-reset
  echo "✅ Database schema recreated"
fi

# 启动应用程序
echo "Starting application..."
exec node server/index.mjs
