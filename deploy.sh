#!/bin/bash

# 情绪发泄站 Docker 部署脚本
# 使用方法: ./deploy.sh [build|start|stop|restart|logs|clean]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目名称
PROJECT_NAME="mood"
CONTAINER_NAME="${PROJECT_NAME}-app"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    log_success "Docker 环境检查通过"
}

# 构建镜像
build() {
    log_info "开始构建 Docker 镜像..."
    
    # 创建生产环境配置文件
    if [ ! -f ".env.production" ]; then
        log_warning "未找到 .env.production 文件，创建默认配置..."
        cat > .env.production << EOF
# 生产环境配置
NODE_ENV=production
NUXT_HOST=0.0.0.0
NUXT_PORT=3000
DATABASE_URL=file:/app/prisma/prod.db
JWT_SECRET=your-production-jwt-secret-key-change-this
ADMIN_PASSWORD=admin123-change-this
EOF
        log_warning "请修改 .env.production 文件中的敏感信息！"
    fi
    
    # 构建镜像
    docker-compose build --no-cache
    
    log_success "Docker 镜像构建完成"
}

# 启动服务
start() {
    log_info "启动服务..."
    
    # 检查镜像是否存在
    if [[ "$(docker images -q ${PROJECT_NAME}_mood 2> /dev/null)" == "" ]]; then
        log_warning "镜像不存在，先构建镜像..."
        build
    fi
    
    # 启动服务
    docker-compose up -d
    
    log_success "服务启动完成"
    log_info "访问地址: http://localhost:3000"
    log_info "管理后台: http://localhost:3000/admin"
}

# 停止服务
stop() {
    log_info "停止服务..."
    docker-compose down
    log_success "服务已停止"
}

# 重启服务
restart() {
    log_info "重启服务..."
    docker-compose restart
    log_success "服务已重启"
}

# 查看日志
logs() {
    log_info "查看服务日志..."
    docker-compose logs -f
}

# 清理资源
clean() {
    log_warning "清理所有 Docker 资源..."
    
    read -p "确定要清理所有容器、镜像和卷吗？(y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v --rmi all
        docker system prune -f
        log_success "清理完成"
    else
        log_info "取消清理"
    fi
}

# 健康检查
health_check() {
    log_info "检查服务健康状态..."
    
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        log_success "服务运行正常"
    else
        log_error "服务运行异常"
        exit 1
    fi
}

# 主函数
main() {
    case "${1:-start}" in
        "build")
            check_docker
            build
            ;;
        "start")
            check_docker
            start
            sleep 5
            health_check
            ;;
        "stop")
            check_docker
            stop
            ;;
        "restart")
            check_docker
            restart
            sleep 5
            health_check
            ;;
        "logs")
            check_docker
            logs
            ;;
        "clean")
            check_docker
            clean
            ;;
        "health")
            check_docker
            health_check
            ;;
        *)
            echo "使用方法: $0 [build|start|stop|restart|logs|clean|health]"
            echo ""
            echo "命令说明:"
            echo "  build   - 构建 Docker 镜像"
            echo "  start   - 启动服务 (默认)"
            echo "  stop    - 停止服务"
            echo "  restart - 重启服务"
            echo "  logs    - 查看服务日志"
            echo "  clean   - 清理所有 Docker 资源"
            echo "  health  - 检查服务健康状态"
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
