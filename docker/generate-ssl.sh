#!/bin/bash

# SSL证书生成脚本
# 生成自签名证书用于开发/测试环境

set -e

echo "🔐 生成SSL证书..."

# 创建SSL目录
mkdir -p ssl

# 生成私钥
openssl genrsa -out ssl/key.pem 2048

# 生成证书签名请求
openssl req -new -key ssl/key.pem -out ssl/cert.csr -subj "/C=CN/ST=Beijing/L=Beijing/O=Mood/OU=Dev/CN=localhost"

# 生成自签名证书
openssl x509 -req -in ssl/cert.csr -signkey ssl/key.pem -out ssl/cert.pem -days 365

# 设置权限
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem

echo "✅ SSL证书生成完成！"
echo "📁 证书文件位置: ssl/"
echo "🔑 私钥: ssl/key.pem"
echo "📜 证书: ssl/cert.pem"
echo ""
echo "⚠️  注意: 这是自签名证书，浏览器会显示安全警告"
echo "   生产环境请使用受信任的CA签发的证书"
