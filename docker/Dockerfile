FROM node:20-alpine
WORKDIR /app

# 安装必要的系统依赖
RUN apk add --no-cache dumb-init sqlite

# 构建期可传的 schema 路径，默认 /app/prisma/schema.prisma
ARG PRISMA_SCHEMA=/app/prisma/schema.prisma

# 复制来自 Actions 的产物
COPY .output ./.output
COPY prisma ./prisma

# 验证 Prisma Client 是否已生成（应该来自 Actions）
RUN if [ ! -d "/app/.output/server/node_modules/.prisma" ] && [ ! -d "/app/node_modules/.prisma" ]; then \
      echo "ERROR: Prisma Client not found. Please ensure it's generated in the Actions workflow."; \
      exit 1; \
    fi

# 复制启动脚本
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# 设置环境变量
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    NITRO_HOST=0.0.0.0 \
    NITRO_PORT=3000 \
    PRISMA_SCHEMA=/app/prisma/schema.prisma

EXPOSE 3000

ENTRYPOINT ["dumb-init","--"]
CMD ["sh","./entrypoint.sh"]
