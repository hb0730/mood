#!/bin/sh
set -e

# 1) DATABASE_URL 兜底（允许通过 compose 覆盖）
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:/app/prisma/db/prod.db"
fi

# 2) 若是 SQLite，确保目录与文件存在
case "$DATABASE_URL" in
  file:*)
    RAW_PATH="${DATABASE_URL#file:}"
    case "$RAW_PATH" in
      /*) DB_FILE="$RAW_PATH" ;;             # 绝对路径
      ./*) DB_FILE="/app/${RAW_PATH#./}" ;; # 相对 -> /app 下
      *)   DB_FILE="/app/$RAW_PATH" ;;      # 普通相对
    esac
    mkdir -p "$(dirname "$DB_FILE")"
    NEW_DB=false
    if [ ! -f "$DB_FILE" ]; then
      NEW_DB=true
      : > "$DB_FILE"
    fi
    # 文件存在但为空也视为新库
    if [ ! -s "$DB_FILE" ]; then
      NEW_DB=true
    fi
  ;;
esac

# 3) 迁移策略（Postgres/MySQL 同样适用），无迁移则退回 db push
SCHEMA_OPT=""
if [ -n "$PRISMA_SCHEMA" ]; then
  SCHEMA_OPT="--schema=$PRISMA_SCHEMA"
fi

if [ "$RUN_MIGRATIONS" = "true" ] || [ "$NEW_DB" = "true" ]; then
  echo "Running prisma migrate deploy $SCHEMA_OPT ..."
  if ! npx prisma migrate deploy $SCHEMA_OPT; then
    echo "No migrations found, fallback to prisma db push $SCHEMA_OPT ..."
    npx prisma db push $SCHEMA_OPT
  fi
fi

# 4) 启动 Nuxt SSR
exec node .output/server/index.mjs
