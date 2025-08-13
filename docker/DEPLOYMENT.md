# 快速部署说明

## GitHub Actions 文件结构

根据工作流配置，GitHub Actions会创建以下文件结构：

```
dist/
├── .output/           # Nuxt构建产物（包含应用代码）
├── Dockerfile         # Docker镜像文件
├── docker-compose.yml # 开发环境配置
├── docker-compose.prod.yml # 生产环境配置
├── .dockerignore      # Docker构建忽略文件
├── deploy.sh          # 部署脚本
├── env.production.template # 环境变量模板
└── nginx/             # Nginx配置目录
```

## 部署步骤

### 1. 开发环境
```bash
# 在dist目录下
./deploy.sh development
```

### 2. 生产环境
```bash
# 配置环境变量
cp env.production.template .env.production
# 编辑 .env.production 文件

# 部署
./deploy.sh production
```

## 注意事项

- **构建上下文**: 使用当前目录（`.`），因为所有文件都在同一层级
- **预构建产物**: 只使用 `.output` 目录，不包含源代码
- **Prisma**: 由于没有Prisma相关文件，数据库功能可能受限
- **端口**: 应用运行在3000端口

## 故障排除

### 预构建产物缺失
```bash
# 检查.output目录
ls -la .output/

# 检查服务器入口文件
ls -la .output/server/
```

### 权限问题
```bash
# 给部署脚本执行权限
chmod +x deploy.sh
```

### 端口冲突
```bash
# 检查端口占用
netstat -tulpn | grep :3000
```
