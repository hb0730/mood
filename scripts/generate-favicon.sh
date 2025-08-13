#!/bin/bash

echo "🎨 生成 Favicon 图标..."

# 检查是否安装了 ImageMagick
if ! command -v convert &> /dev/null; then
    echo "❌ 需要安装 ImageMagick 来生成 favicon.ico"
    echo "macOS: brew install imagemagick"
    echo "Ubuntu: sudo apt-get install imagemagick"
    exit 1
fi

# 创建输出目录
mkdir -p public

# 从 SVG 生成不同尺寸的 PNG
echo "📱 生成不同尺寸的 PNG 图标..."

# 16x16
convert public/favicon-ico.svg -resize 16x16 public/favicon-16.png

# 32x32
convert public/favicon-ico.svg -resize 32x32 public/favicon-32.png

# 48x48
convert public/favicon-ico.svg -resize 48x48 public/favicon-48.png

# 生成 favicon.ico (包含多个尺寸)
echo "🔧 生成 favicon.ico..."
convert public/favicon-16.png public/favicon-32.png public/favicon-48.png public/favicon.ico

# 清理临时 PNG 文件
rm public/favicon-16.png public/favicon-32.png public/favicon-48.png

echo "✅ Favicon 生成完成！"
echo "📁 生成的文件："
echo "   - public/favicon.ico"
echo "   - public/favicon.svg"
echo "   - public/favicon-16.svg"
echo "   - public/favicon-32.svg"
echo "   - public/favicon-48.svg"
echo "   - public/apple-touch-icon.svg"
