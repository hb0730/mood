#!/bin/bash

# Docker部署脚本 - 使用GitHub Actions预构建产物
# 使用方法: ./deploy.sh [production|development]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# 检查预构建产物
check_build_artifacts() {
    log_info "检查预构建产物..."
    
    if [ ! -d ".output" ]; then
        log_error "未找到预构建产物目录 .output"
        log_error "请确保GitHub Actions已成功构建应用"
        log_error "或者手动运行: pnpm run build"
        exit 1
    fi
    
    if [ ! -f ".output/server/index.mjs" ]; then
        log_error "未找到服务器入口文件 .output/server/index.mjs"
        log_error "构建可能不完整，请检查构建过程"
        exit 1
    fi
    
    log_success "预构建产物检查通过"
}

# 检查Docker是否运行
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker未运行，请启动Docker服务"
        exit 1
    fi
    log_success "Docker服务运行正常"
}

# 检查Docker Compose是否可用
check_docker_compose() {
    if ! docker compose version > /dev/null 2>&1; then
        log_error "Docker Compose不可用"
        exit 1
    fi
    log_success "Docker Compose可用"
}

# 创建必要的目录
create_directories() {
    log_info "创建必要的目录..."
    
    mkdir -p data
    mkdir -p logs
    mkdir -p ssl
    mkdir -p nginx/conf.d
    
    log_success "目录创建完成"
}

# 生成SSL证书
generate_ssl() {
    if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
        log_info "生成SSL证书..."
        if [ -f "generate-ssl.sh" ]; then
            chmod +x generate-ssl.sh
            ./generate-ssl.sh
        else
            log_warning "SSL证书生成脚本不存在，请手动生成证书"
        fi
    else
        log_success "SSL证书已存在"
    fi
}

# 检查环境变量文件
check_env_file() {
    local env_file=".env.production"
    
    if [ ! -f "$env_file" ]; then
        log_warning "环境变量文件 $env_file 不存在，使用模板创建"
        if [ -f "env.production.template" ]; then
            cp env.production.template "$env_file"
            log_warning "请编辑 $env_file 文件，设置正确的环境变量"
            log_warning "特别是 JWT_SECRET 和 ADMIN_PASSWORD"
            read -p "按回车键继续..."
        else
            log_error "环境变量模板文件不存在"
            exit 1
        fi
    fi
}

# 构建镜像
build_image() {
    local profile=$1
    
    log_info "构建Docker镜像..."
    
    if [ "$profile" = "production" ]; then
        docker compose -f docker-compose.prod.yml build --no-cache
    else
        docker compose build --no-cache
    fi
    
    log_success "镜像构建完成"
}

# 启动服务
start_services() {
    local profile=$1
    
    log_info "启动服务..."
    
    if [ "$profile" = "production" ]; then
        docker compose -f docker-compose.prod.yml up -d
    else
        docker compose up -d
    fi
    
    log_success "服务启动完成"
}

# 检查服务状态
check_services() {
    local profile=$1
    
    log_info "检查服务状态..."
    
    if [ "$profile" = "production" ]; then
        docker compose -f docker-compose.prod.yml ps
    else
        docker compose ps
    fi
    
    log_success "服务状态检查完成"
}

# 显示日志
show_logs() {
    local profile=$1
    
    log_info "显示服务日志..."
    
    if [ "$profile" = "production" ]; then
        docker compose -f docker-compose.prod.yml logs -f
    else
        docker compose logs -f
    fi
}

# 停止服务
stop_services() {
    local profile=$1
    
    log_info "停止服务..."
    
    if [ "$profile" = "production" ]; then
        docker compose -f docker-compose.prod.yml down
    else
        docker compose down
    fi
    
    log_success "服务已停止"
}

# 清理资源
cleanup() {
    log_info "清理Docker资源..."
    
    docker system prune -f
    docker volume prune -f
    
    log_success "清理完成"
}

# 主函数
main() {
    local profile=${1:-development}
    
    log_info "开始部署 Mood 应用 (环境: $profile)"
    log_info "使用GitHub Actions预构建产物"
    
    # 检查前置条件
    check_build_artifacts
    check_docker
    check_docker_compose
    
    # 创建目录
    create_directories
    
    # 生成SSL证书（如果需要）
    if [ "$profile" = "production" ]; then
        generate_ssl
    fi
    
    # 检查环境变量
    if [ "$profile" = "production" ]; then
        check_env_file
    fi
    
    # 停止现有服务
    stop_services "$profile"
    
    # 构建镜像
    build_image "$profile"
    
    # 启动服务
    start_services "$profile"
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 10
    
    # 检查服务状态
    check_services "$profile"
    
    log_success "部署完成！"
    log_info "应用地址: http://localhost:3000"
    
    if [ "$profile" = "production" ]; then
        log_info "Nginx地址: http://localhost:80 (重定向到HTTPS)"
        log_info "HTTPS地址: https://localhost:443"
    fi
    
    log_info "查看日志: ./deploy.sh logs $profile"
    log_info "停止服务: ./deploy.sh stop $profile"
}

# 命令行参数处理
case "${1:-}" in
    "production")
        main "production"
        ;;
    "development")
        main "development"
        ;;
    "build")
        build_image "${2:-development}"
        ;;
    "start")
        start_services "${2:-development}"
        ;;
    "stop")
        stop_services "${2:-development}"
        ;;
    "restart")
        stop_services "${2:-development}"
        start_services "${2:-development}"
        ;;
    "status")
        check_services "${2:-development}"
        ;;
    "logs")
        show_logs "${2:-development}"
        ;;
    "cleanup")
        cleanup
        ;;
    "help"|"-h"|"--help")
        echo "使用方法: $0 [命令] [环境]"
        echo ""
        echo "命令:"
        echo "  production    部署到生产环境"
        echo "  development   部署到开发环境 (默认)"
        echo "  build         构建镜像"
        echo "  start         启动服务"
        echo "  stop          停止服务"
        echo "  restart       重启服务"
        echo "  status        检查服务状态"
        echo "  logs          显示服务日志"
        echo "  cleanup       清理Docker资源"
        echo "  help          显示此帮助信息"
        echo ""
        echo "环境:"
        echo "  production    生产环境"
        echo "  development   开发环境 (默认)"
        echo ""
        echo "注意: 此脚本使用GitHub Actions预构建的产物"
        echo "确保 .output 目录存在且包含完整的构建产物"
        echo ""
        echo "示例:"
        echo "  $0                    # 部署到开发环境"
        echo "  $0 production         # 部署到生产环境"
        echo "  $0 logs production    # 查看生产环境日志"
        ;;
    *)
        main "development"
        ;;
esac
