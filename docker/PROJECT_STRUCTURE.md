# 项目结构说明

## GitHub Actions 生成的文件结构

根据工作流配置，GitHub Actions会创建以下文件结构：

```
dist/
├── .output/                    # Nuxt构建产物
│   ├── server/                # 服务器端代码
│   ├── public/                # 静态资源
│   └── nitro.json            # Nitro配置
├── Dockerfile                 # Docker镜像文件
├── docker-compose.yml         # 开发环境配置
├── docker-compose.prod.yml    # 生产环境配置
├── .dockerignore              # Docker构建忽略文件
├── deploy.sh                  # 部署脚本
├── env.production.template    # 生产环境变量模板
├── generate-ssl.sh            # SSL证书生成脚本
├── nginx/                     # Nginx配置目录
│   ├── nginx.dev.conf        # 开发环境Nginx主配置
│   ├── nginx.prod.conf       # 生产环境Nginx主配置
│   └── conf.d/               # Nginx站点配置目录
│       ├── dev.conf          # 开发环境站点配置
│       └── prod.conf         # 生产环境站点配置
├── README.md                  # 详细说明文档
├── DEPLOYMENT.md              # 快速部署说明
└── PROJECT_STRUCTURE.md       # 本文档
```

## 文件说明

### 核心文件
- **`.output/`**: Nuxt.js构建产物，包含完整的应用代码
- **`Dockerfile`**: 基于Alpine Linux的轻量级运行时镜像
- **`docker-compose.yml`**: 开发环境Docker Compose配置
- **`docker-compose.prod.yml`**: 生产环境Docker Compose配置

### 配置文件
- **`.dockerignore`**: 优化Docker构建过程
- **`env.production.template`**: 生产环境变量模板
- **`deploy.sh`**: 智能部署脚本，支持多环境

### Nginx配置
- **`nginx/nginx.dev.conf`**: 开发环境Nginx主配置
- **`nginx/nginx.prod.conf`**: 生产环境Nginx主配置
- **`nginx/conf.d/dev.conf`**: 开发环境站点配置
- **`nginx/conf.d/prod.conf`**: 生产环境站点配置

### 工具脚本
- **`generate-ssl.sh`**: 自动生成SSL证书
- **`deploy.sh`**: 完整的部署管理脚本

## 部署流程

### 1. 开发环境
```bash
# 在dist目录下
./deploy.sh development
```

**特点:**
- 应用端口: 3000
- Nginx端口: 80
- 无SSL加密
- 适合开发和测试

### 2. 生产环境
```bash
# 配置环境变量
cp env.production.template .env.production
# 编辑 .env.production 文件

# 部署
./deploy.sh production
```

**特点:**
- 应用端口: 3000
- Nginx端口: 80 (HTTP) + 443 (HTTPS)
- 自动SSL证书生成
- 完整的生产级配置

## 网络架构

### 开发环境
```
用户 → Nginx (80) → Mood App (3000)
```

### 生产环境
```
用户 → Nginx (80/443) → Mood App (3000)
```

## 数据持久化

- **日志文件**: `./logs/` 目录
- **SSL证书**: `./ssl/` 目录
- **应用数据**: 容器内临时存储

## 安全特性

- **非root用户**: 应用以nuxtjs用户运行
- **安全头**: Nginx配置安全HTTP头
- **请求限流**: API接口限流保护
- **SSL/TLS**: 生产环境HTTPS加密

## 监控和健康检查

- **健康检查**: 应用健康状态监控
- **日志管理**: 结构化日志和轮转
- **资源限制**: CPU和内存使用限制
- **自动重启**: 故障时自动重启策略

## 扩展性

### 添加服务
```yaml
# 在docker-compose.yml中添加
redis:
  image: redis:alpine
  networks:
    - mood-network
```

### 自定义配置
- 修改Nginx配置文件
- 调整Docker资源限制
- 添加环境变量
- 配置SSL证书

## 故障排除

### 常见问题
1. **端口冲突**: 检查端口占用情况
2. **权限问题**: 确保脚本有执行权限
3. **SSL证书**: 自动生成或手动配置
4. **网络问题**: 检查Docker网络配置

### 调试命令
```bash
# 查看服务状态
./deploy.sh status

# 查看日志
./deploy.sh logs

# 重启服务
./deploy.sh restart

# 清理资源
./deploy.sh cleanup
```

## 最佳实践

1. **环境分离**: 开发和生产环境使用不同配置
2. **版本控制**: 所有配置文件纳入版本控制
3. **安全配置**: 生产环境使用强密码和SSL
4. **监控日志**: 定期检查应用和Nginx日志
5. **备份策略**: 定期备份配置和证书文件
