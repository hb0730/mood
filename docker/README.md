# Mood App Docker 部署

## 概述

这个 Docker 配置用于部署 Mood 应用，包含完整的 Prisma 数据库初始化和应用启动流程。

## 文件结构

- `Dockerfile` - 应用镜像构建配置
- `docker-compose.yml` - 服务编排配置
- `entrypoint.sh` - 容器启动脚本
- `.dockerignore` - Docker 构建忽略文件

## 前置条件

确保以下文件来自 GitHub Actions 构建产物：
- `.output/` - Nuxt 构建产物
- `prisma/` - Prisma schema 和生成的客户端

## 使用方法

### 1. 构建镜像

```bash
cd docker
docker build -t mood-ssr:latest ..
```

### 2. 启动服务

```bash
docker-compose up -d
```

### 3. 查看日志

```bash
# 查看应用日志
docker-compose logs -f mood-app

# 查看数据库初始化日志
docker-compose logs db-init
```

### 4. 停止服务

```bash
docker-compose down
```

## 服务说明

### db-init 服务
- 一次性运行，负责数据库初始化
- 创建数据库文件（如果不存在）
- 运行 Prisma 迁移或 schema push
- 完成后自动退出

### mood-app 服务
- 主应用服务
- 依赖 db-init 服务完成
- 提供健康检查端点
- 自动重启策略

## 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `DATABASE_URL` | `file:/app/prisma/db/prod.db` | 数据库连接字符串 |
| `PRISMA_SCHEMA` | `/app/prisma/schema.prisma` | Prisma schema 文件路径 |
| `NODE_ENV` | `production` | 运行环境 |
| `RUN_MIGRATIONS` | `true` | 是否运行数据库迁移 |

## 数据库

- 使用 SQLite 数据库
- 数据库文件存储在 `./db/` 目录
- 支持 Prisma 迁移和 schema push
- 自动创建数据库目录和文件

## 健康检查

应用提供健康检查端点：
- URL: `http://localhost:3000/api/health`
- 检查数据库连接状态
- Docker 健康检查自动使用此端点

## 故障排除

### Prisma Client 未找到
确保 GitHub Actions 工作流中包含了 `npx prisma generate` 步骤。

### 数据库连接失败
检查数据库文件权限和路径配置。

### 应用启动失败
查看容器日志：`docker-compose logs mood-app`
