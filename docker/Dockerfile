# 使用GitHub Actions预构建产物的Dockerfile
# 只使用实际可用的文件：.output目录

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

# 只复制预构建的应用产物（GitHub Actions实际提供的文件）
COPY .output ./.output

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

# 直接启动应用（不需要启动脚本，因为没有Prisma相关文件）
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", ".output/server/index.mjs"]
