#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
网页管理工具图标生成器
生成Chrome扩展所需的各种尺寸图标
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_web_management_icon(size):
    """
    创建网页管理图标
    """
    # 创建透明背景的图像
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 计算相对尺寸
    center = size // 2
    radius = size // 3
    
    # 背景圆形
    bg_color = (67, 133, 245, 255)  # Google蓝色
    draw.ellipse([
        center - radius, center - radius,
        center + radius, center + radius
    ], fill=bg_color)
    
    # 网页符号 - 白色
    white = (255, 255, 255, 255)
    
    # 绘制网页框架
    frame_size = radius * 0.7
    frame_x = center - frame_size * 0.5
    frame_y = center - frame_size * 0.5
    
    # 外框
    draw.rectangle([
        frame_x, frame_y,
        frame_x + frame_size, frame_y + frame_size
    ], outline=white, width=max(1, size//32))
    
    # 顶部地址栏
    bar_height = frame_size * 0.15
    draw.rectangle([
        frame_x, frame_y,
        frame_x + frame_size, frame_y + bar_height
    ], fill=white)
    
    # 地址栏中的小圆点
    dot_size = max(1, size//64)
    for i in range(3):
        dot_x = frame_x + (i + 1) * frame_size * 0.15
        dot_y = frame_y + bar_height * 0.5
        draw.ellipse([
            dot_x - dot_size, dot_y - dot_size,
            dot_x + dot_size, dot_y + dot_size
        ], fill=bg_color)
    
    # 内容区域的线条（表示网页内容）
    line_width = max(1, size//64)
    content_start_y = frame_y + bar_height + frame_size * 0.1
    line_spacing = frame_size * 0.15
    
    for i in range(3):
        line_y = content_start_y + i * line_spacing
        line_length = frame_size * (0.8 - i * 0.1)  # 渐短的线条
        draw.rectangle([
            frame_x + frame_size * 0.1, line_y,
            frame_x + frame_size * 0.1 + line_length, line_y + line_width
        ], fill=white)
    
    # 右下角的小齿轮（管理工具象征）
    gear_size = radius * 0.4
    gear_x = center + radius * 0.3
    gear_y = center + radius * 0.3
    
    # 简化的齿轮形状
    for angle in range(0, 360, 45):
        import math
        rad = math.radians(angle)
        x1 = gear_x + math.cos(rad) * gear_size * 0.3
        y1 = gear_y + math.sin(rad) * gear_size * 0.3
        x2 = gear_x + math.cos(rad) * gear_size * 0.6
        y2 = gear_y + math.sin(rad) * gear_size * 0.6
        draw.line([(x1, y1), (x2, y2)], fill=white, width=max(1, size//32))
    
    # 齿轮中心
    draw.ellipse([
        gear_x - gear_size * 0.15, gear_y - gear_size * 0.15,
        gear_x + gear_size * 0.15, gear_y + gear_size * 0.15
    ], fill=white)
    
    return img

def create_all_icons():
    """
    创建所有尺寸的图标
    """
    sizes = [16, 32, 48, 128]
    
    # 确保icons目录存在
    if not os.path.exists('icons'):
        os.makedirs('icons')
    
    for size in sizes:
        print(f"创建 {size}x{size} 图标...")
        
        # 创建图标
        icon = create_web_management_icon(size)
        
        # 保存为PNG文件
        filename = f'icons/icon{size}.png'
        icon.save(filename, 'PNG')
        print(f"✅ 已保存: {filename}")
    
    print("\n🎉 所有图标创建完成！")
    
    # 显示图标预览信息
    print("\n📋 图标文件列表:")
    for size in sizes:
        filename = f'icon{size}.png'
        print(f"  - {filename} ({size}x{size}px)")
    
    print("\n🎨 设计特点:")
    print("  - 🌐 网页框架设计，体现网页管理功能")
    print("  - ⚙️ 齿轮元素，表示工具和管理特性")
    print("  - 🎯 Google蓝配色，符合Chrome扩展风格")
    print("  - ✨ 简洁现代，在小尺寸下也清晰可见")

if __name__ == '__main__':
    try:
        create_all_icons()
    except ImportError as e:
        print("❌ 错误: 缺少PIL库")
        print("请安装: pip install Pillow")
    except Exception as e:
        print(f"❌ 创建图标时出错: {e}")