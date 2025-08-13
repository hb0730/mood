# Mood 应用 Docker 部署指南

本文档介绍如何使用 Docker 部署 Mood 匿名情绪发泄站应用，使用GitHub Actions预构建的产物，并支持Prisma数据库自动初始化。

## 部署流程

```
GitHub Actions 构建 → 生成 .output 目录 → Docker 部署 → Prisma初始化 → 运行应用
```

## 文件结构

```
docker/
├── Dockerfile                    # 运行时Docker镜像（使用预构建产物）
├── docker-compose.yml           # 开发环境配置
├── docker-compose.prod.yml      # 生产环境配置
├── .dockerignore                # Docker构建忽略文件
├── deploy.sh                    # 部署脚本
├── start.sh                     # 应用启动脚本（Prisma初始化）
├── env.production.template      # 生产环境变量模板
├── nginx/                       # Nginx配置目录
│   ├── nginx.prod.conf         # 生产环境Nginx主配置
│   └── conf.d/                 # Nginx站点配置目录
│       └── prod.conf           # 生产环境站点配置
└── README.md                    # 本文档
```

## 前置条件

### 1. 预构建产物

确保 `.output` 目录存在且包含完整的构建产物：

```bash
# 检查预构建产物
./deploy.sh check

# 如果不存在，可以手动构建
pnpm run build
```

### 2. 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 1GB 可用内存
- 至少 2GB 可用磁盘空间

## 快速开始

### 1. 开发环境部署

```bash
# 进入docker目录
cd docker

# 检查预构建产物
./deploy.sh check

# 部署到开发环境
./deploy.sh

# 或者明确指定开发环境
./deploy.sh development
```

### 2. 生产环境部署

```bash
# 配置生产环境变量
cp env.production.template .env.production
# 编辑 .env.production 文件

# 部署到生产环境
./deploy.sh production
```

## 配置说明

### 环境变量

在生产环境部署前，需要配置以下环境变量：

1. 复制环境变量模板：
```bash
cp env.production.template .env.production
```

2. 编辑 `.env.production` 文件，设置：
   - `JWT_SECRET`: JWT签名密钥（必须更改）
   - `ADMIN_PASSWORD`: 管理员密码（必须更改）
   - 其他可选配置

### 端口配置

- **应用端口**: 3000
- **HTTP端口**: 80 (重定向到HTTPS)
- **HTTPS端口**: 443
- **Prisma Studio**: 5555 (开发工具)

### 数据持久化

- 数据库文件: `./data/`
- 日志文件: `./logs/`
- SSL证书: `./ssl/`

## Prisma数据库管理

### 自动初始化
- 容器启动时自动检查数据库
- 如果数据库不存在，自动运行迁移
- 支持SQLite数据库

### 数据库访问
```bash
# 启动Prisma Studio
docker compose --profile dev-tools up prisma-studio

# 访问数据库管理界面
# http://localhost:5555
```

### 手动迁移
```bash
# 进入容器
docker exec -it mood-app sh

# 运行迁移
npx prisma migrate deploy

# 生成客户端
npx prisma generate
```

## 部署脚本使用

### 基本命令

```bash
# 检查预构建产物
./deploy.sh check

# 部署应用
./deploy.sh [production|development]

# 构建镜像
./deploy.sh build [production|development]

# 启动服务
./deploy.sh start [production|development]

# 停止服务
./deploy.sh stop [production|development]

# 重启服务
./deploy.sh restart [production|development]

# 查看状态
./deploy.sh status [production|development]

# 查看日志
./deploy.sh logs [production|development]

# 清理资源
./deploy.sh cleanup

# 显示帮助
./deploy.sh help
```

### 部署流程

1. **检查预构建产物**: 验证 `.output` 目录完整性
2. **检查环境**: 验证Docker和Docker Compose可用性
3. **创建目录**: 创建必要的数据和日志目录
4. **环境配置**: 检查并配置环境变量
5. **停止服务**: 停止现有服务（如果存在）
6. **构建镜像**: 构建Docker镜像（使用预构建产物）
7. **启动服务**: 启动应用服务
8. **健康检查**: 验证服务状态

## 与GitHub Actions的集成

### 工作流说明

1. **构建阶段**: GitHub Actions 运行 `pnpm run build`
2. **产物准备**: 将 `.output` 目录和 `docker/*` 文件复制到 `dist/` 目录
3. **文件结构**: 在 `dist/` 目录下，`.output` 和 `Dockerfile` 在同一层级
4. **部署阶段**: 将整个 `dist/` 目录传输到服务器
5. **Docker部署**: 在服务器上运行 `docker compose up -d --build`

### 文件结构
```
dist/
├── .output/           # Nuxt构建产物
├── Dockerfile         # Docker镜像文件
├── docker-compose.yml # Docker Compose配置
└── ...               # 其他Docker相关文件
```

### 优势

- **快速部署**: 无需在服务器上重新构建
- **一致性**: 使用相同的构建环境
- **资源节约**: 服务器只需运行，不需要构建工具
- **版本控制**: 构建产物与代码版本完全对应

## 生产环境特性

### 安全配置

- 非root用户运行
- 安全HTTP头
- 请求限流
- SSL/TLS加密
- 内容安全策略

### 性能优化

- 使用预构建产物
- 镜像层优化
- Gzip压缩
- 静态资源缓存
- 连接池优化

### 监控和日志

- 健康检查
- 结构化日志
- 日志轮转
- 资源限制

## 故障排除

### 常见问题

1. **预构建产物缺失**
   ```bash
   # 检查产物
   ./deploy.sh check
   
   # 手动构建
   pnpm run build
   ```

2. **Prisma初始化失败**
   ```bash
   # 查看应用日志
   ./deploy.sh logs production
   
   # 检查数据库目录权限
   ls -la data/
   ```

3. **端口冲突**
   ```bash
   # 检查端口占用
   netstat -tulpn | grep :3000
   
   # 停止冲突服务
   docker compose down
   ```

### 日志查看

```bash
# 查看应用日志
./deploy.sh logs production

# 查看特定服务日志
docker compose -f docker-compose.prod.yml logs mood-app

# 查看Nginx日志
docker compose -f docker-compose.prod.yml logs nginx
```

### 服务重启

```bash
# 重启所有服务
./deploy.sh restart production

# 重启特定服务
docker compose -f docker-compose.prod.yml restart mood-app
```

## 更新部署

### 代码更新

1. 推送新标签触发GitHub Actions
2. Actions自动构建新版本
3. 在服务器上重新部署

```bash
# 在本地推送新标签
git tag v1.0.1
git push origin v1.0.1

# 在服务器上重新部署
./deploy.sh production
```

### 配置更新

1. 修改配置文件
2. 重启相关服务

```bash
# 重启Nginx
docker compose -f docker-compose.prod.yml restart nginx
```

## 备份和恢复

### 数据备份

```bash
# 备份数据库
cp -r data/ backup_$(date +%Y%m%d_%H%M%S)/

# 备份配置
cp -r nginx/ backup_$(date +%Y%m%d_%H%M%S)/
```

### 数据恢复

```bash
# 恢复数据库
cp -r backup_YYYYMMDD_HHMMSS/data/* data/

# 恢复配置
cp -r backup_YYYYMMDD_HHMMSS/nginx/* nginx/
```

## 扩展配置

### 添加Redis

```yaml
# 在docker-compose.prod.yml中添加
redis:
  image: redis:alpine
  container_name: mood-redis
  restart: unless-stopped
  networks:
    - mood_prod_network
```

### 添加监控

```yaml
# 添加Prometheus和Grafana
prometheus:
  image: prom/prometheus
  # ... 配置

grafana:
  image: grafana/grafana
  # ... 配置
```

## 支持

如果遇到问题，请：

1. 检查预构建产物: `./deploy.sh check`
2. 查看日志文件
3. 检查环境变量配置
4. 验证Docker服务状态
5. 参考故障排除部分

## 许可证

本项目采用 MIT 许可证。
