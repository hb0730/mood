# 使用官方Node.js 18 Alpine镜像作为基础镜像
FROM node:18-alpine AS base

# 设置工作目录
WORKDIR /app

# Git clone
RUN git clone https://github.com/your-username/your-repo.git . && cd your-repo

# 安装pnpm
RUN npm install -g pnpm

# 复制package.json和pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# 安装依赖
COPY . .

# 构建阶段
FROM base AS builder

# 设置环境变量
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# 构建应用
RUN pnpm run build

# 生产阶段
FROM node:18-alpine AS production

# 设置工作目录
WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm

# 复制package.json和pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# 只安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# 从构建阶段复制构建产物
COPY --from=builder /app/.nuxt ./.nuxt
COPY --from=builder /app/.output ./.output

# 复制必要的配置文件
COPY nuxt.config.ts ./
COPY uno.config.ts ./
COPY tailwind.config.js ./

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nuxtjs -u 1001

# 设置权限
RUN chown -R nuxtjs:nodejs /app
USER nuxtjs

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# 启动应用
CMD ["node", ".output/server/index.mjs"]
