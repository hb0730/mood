# 使用GitHub Actions预构建产物的Dockerfile
# 支持可选的Prisma文件，自动处理数据库初始化

FROM node:20.19.4-alpine AS runtime

# 设置工作目录
WORKDIR /app

# 安装必要的系统依赖
RUN apk add --no-cache \
    dumb-init \
    sqlite \
    && rm -rf /var/cache/apk/*

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxtjs

# 复制预构建的应用产物
COPY .output ./.output

# 复制启动脚本
COPY start.sh ./start.sh

# 尝试复制Prisma相关文件（如果存在）
# 使用shell命令检查文件是否存在，如果存在则复制
RUN if [ -f "prisma/schema.prisma" ]; then \
        echo "发现Prisma schema文件，复制Prisma目录"; \
        cp -r prisma ./prisma; \
    else \
        echo "未发现Prisma schema文件，跳过复制"; \
    fi

# 尝试复制package.json（如果存在）
RUN if [ -f "package.json" ]; then \
        echo "发现package.json文件，复制依赖信息"; \
        cp package.json ./package.json; \
    else \
        echo "未发现package.json文件，跳过复制"; \
    fi

# 创建必要的目录
RUN mkdir -p /app/prisma/db /app/logs && \
    chown -R nuxtjs:nodejs /app/prisma/db /app/logs

# 设置环境变量
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000
ENV DATABASE_URL=file:./prisma/db/prod.db

# 暴露端口
EXPOSE 3000

# 切换到非root用户
USER nuxtjs

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# 使用dumb-init启动应用
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "./start.sh"]
