#!/bin/sh
set -e

echo "=== Starting Mood App Entrypoint ==="

# 1) 环境变量验证和设置
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:/app/prisma/db/prod.db"
fi

if [ -z "$PRISMA_SCHEMA" ]; then
  export PRISMA_SCHEMA="/app/prisma/schema.prisma"
fi

echo "Environment Configuration:"
echo "  DATABASE_URL: $DATABASE_URL"
echo "  PRISMA_SCHEMA: $PRISMA_SCHEMA"
echo "  NODE_ENV: $NODE_ENV"

# 2) 数据库文件准备（SQLite）
case "$DATABASE_URL" in
  file:*)
    RAW_PATH="${DATABASE_URL#file:}"
    case "$RAW_PATH" in
      /*) DB_FILE="$RAW_PATH" ;;             # 绝对路径
      ./*) DB_FILE="/app/${RAW_PATH#./}" ;; # 相对 -> /app 下
      *)   DB_FILE="/app/$RAW_PATH" ;;      # 普通相对
    esac
    
    echo "Database Configuration:"
    echo "  Database file: $DB_FILE"
    echo "  Database directory: $(dirname "$DB_FILE")"
    
    # 确保数据库目录存在
    mkdir -p "$(dirname "$DB_FILE")"
    
    # 检查数据库文件状态
    if [ ! -f "$DB_FILE" ]; then
      echo "Creating new database file..."
      : > "$DB_FILE"
      NEW_DB=true
    elif [ ! -s "$DB_FILE" ]; then
      echo "Database file exists but is empty, treating as new..."
      NEW_DB=true
    else
      echo "Existing database file found"
      NEW_DB=false
    fi
  ;;
  *)
    echo "Using non-SQLite database: $DATABASE_URL"
    NEW_DB=false
  ;;
esac

# 3) Prisma 状态检查和数据库同步
echo "Prisma Setup:"
echo "  Schema file: $PRISMA_SCHEMA"
echo "  New database: $NEW_DB"
echo "  Run migrations: $RUN_MIGRATIONS"

# 验证 Prisma schema 文件存在
if [ ! -f "$PRISMA_SCHEMA" ]; then
  echo "ERROR: Prisma schema file not found at $PRISMA_SCHEMA"
  exit 1
fi

# 验证 Prisma Client 已存在（来自 Actions 产物）
if [ ! -d "/app/.output/server/node_modules/.prisma" ] && [ ! -d "/app/node_modules/.prisma" ]; then
  echo "ERROR: Prisma Client not found. Please ensure it's generated in the Actions workflow."
  exit 1
fi

# 数据库同步策略
SCHEMA_OPT=""
if [ -n "$PRISMA_SCHEMA" ]; then
  SCHEMA_OPT="--schema=$PRISMA_SCHEMA"
fi

if [ "$RUN_MIGRATIONS" = "true" ] || [ "$NEW_DB" = "true" ]; then
  echo "Running database synchronization..."
  
  # 尝试运行迁移
  if npx prisma migrate deploy $SCHEMA_OPT; then
    echo "Database migrations applied successfully"
  else
    echo "No migrations found, using db push..."
    if npx prisma db push $SCHEMA_OPT; then
      echo "Database schema pushed successfully"
    else
      echo "ERROR: Database synchronization failed"
      exit 1
    fi
  fi
else
  echo "Skipping database synchronization (not required)"
fi

# 4) 数据库连接测试
echo "Testing database connection..."
if npx prisma db execute --stdin --schema="$PRISMA_SCHEMA" <<< "SELECT 1 as test;" > /dev/null 2>&1; then
  echo "Database connection test successful"
else
  echo "WARNING: Database connection test failed, but continuing..."
fi

# 5) 启动应用
echo "=== Starting Nuxt SSR Server ==="
echo "Server will be available at http://0.0.0.0:3000"
exec node .output/server/index.mjs
