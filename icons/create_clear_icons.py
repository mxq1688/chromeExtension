#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
清晰图标生成器 - 网页工具箱专用
生成高质量、清晰的Chrome扩展图标
"""

import os
from PIL import Image, ImageDraw, ImageFont
import math

def create_clear_icon(size):
    """
    创建清晰的网页工具箱图标
    
    Args:
        size (int): 图标尺寸 (像素)
    
    Returns:
        PIL.Image: 生成的图标
    """
    # 创建透明背景的图像
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 计算比例因子
    scale = size / 128.0
    
    # 颜色定义 - Google Material Design 蓝色系
    primary_blue = (66, 133, 244)      # Google蓝
    secondary_blue = (51, 103, 214)    # 深蓝
    accent_blue = (138, 180, 248)      # 浅蓝
    white = (255, 255, 255)
    gray = (96, 125, 139)
    
    # 背景圆形 - 更现代的渐变效果
    center = size // 2
    radius = int((size * 0.45))
    
    # 绘制多层圆形背景创建渐变效果
    for i in range(radius, 0, -2):
        alpha = int(255 * (i / radius) * 0.9)
        color_intensity = i / radius
        
        r = int(primary_blue[0] * color_intensity + secondary_blue[0] * (1 - color_intensity))
        g = int(primary_blue[1] * color_intensity + secondary_blue[1] * (1 - color_intensity))
        b = int(primary_blue[2] * color_intensity + secondary_blue[2] * (1 - color_intensity))
        
        draw.ellipse(
            [center - i, center - i, center + i, center + i],
            fill=(r, g, b, alpha)
        )
    
    # 内部白色背景
    inner_radius = int(radius * 0.75)
    draw.ellipse(
        [center - inner_radius, center - inner_radius, 
         center + inner_radius, center + inner_radius],
        fill=(*white, 240)
    )
    
    # 绘制网页框架 - 更清晰的设计
    frame_margin = int(size * 0.25)
    frame_width = size - 2 * frame_margin
    frame_height = int(frame_width * 0.8)
    
    frame_x = frame_margin
    frame_y = frame_margin + int((size - 2 * frame_margin - frame_height) / 2)
    
    # 浏览器窗口外框
    border_width = max(1, int(2 * scale))
    draw.rectangle(
        [frame_x, frame_y, frame_x + frame_width, frame_y + frame_height],
        outline=secondary_blue,
        width=border_width
    )
    
    # 地址栏
    address_bar_height = int(frame_height * 0.2)
    draw.rectangle(
        [frame_x + border_width, frame_y + border_width,
         frame_x + frame_width - border_width, frame_y + address_bar_height],
        fill=accent_blue
    )
    
    # 地址栏图标（小圆点）
    if size >= 32:
        dot_size = max(2, int(3 * scale))
        for i in range(3):
            dot_x = frame_x + int(8 * scale) + i * int(8 * scale)
            dot_y = frame_y + int(address_bar_height / 2)
            draw.ellipse(
                [dot_x - dot_size, dot_y - dot_size, dot_x + dot_size, dot_y + dot_size],
                fill=white
            )
    
    # 网页内容区域
    content_y = frame_y + address_bar_height + int(2 * scale)
    content_height = frame_height - address_bar_height - int(4 * scale)
    
    # 内容线条 - 模拟网页内容
    if size >= 32:
        line_spacing = max(6, int(8 * scale))
        line_width = max(1, int(1.5 * scale))
        
        for i in range(min(4, content_height // line_spacing)):
            line_y = content_y + int(6 * scale) + i * line_spacing
            line_length = frame_width - int(20 * scale)
            
            # 变化线条长度创建真实感
            if i == 1:
                line_length = int(line_length * 0.7)
            elif i == 2:
                line_length = int(line_length * 0.9)
            
            draw.rectangle(
                [frame_x + int(10 * scale), line_y,
                 frame_x + line_length, line_y + line_width],
                fill=gray
            )
    
    # 工具齿轮图标 - 右下角
    if size >= 24:
        gear_size = max(8, int(12 * scale))
        gear_x = frame_x + frame_width - gear_size - int(4 * scale)
        gear_y = frame_y + frame_height - gear_size - int(4 * scale)
        
        # 绘制简化齿轮
        gear_center_x = gear_x + gear_size // 2
        gear_center_y = gear_y + gear_size // 2
        gear_radius = gear_size // 3
        
        # 齿轮外圈
        if size >= 48:
            # 大尺寸时绘制齿轮齿
            teeth_count = 8
            for i in range(teeth_count):
                angle = (2 * math.pi * i) / teeth_count
                x1 = gear_center_x + int((gear_radius + 2) * math.cos(angle))
                y1 = gear_center_y + int((gear_radius + 2) * math.sin(angle))
                x2 = gear_center_x + int((gear_radius + 4) * math.cos(angle))
                y2 = gear_center_y + int((gear_radius + 4) * math.sin(angle))
                
                draw.rectangle([x1-1, y1-1, x2+1, y2+1], fill=secondary_blue)
        
        # 齿轮主体
        draw.ellipse(
            [gear_center_x - gear_radius, gear_center_y - gear_radius,
             gear_center_x + gear_radius, gear_center_y + gear_radius],
            fill=secondary_blue
        )
        
        # 齿轮中心孔
        center_hole_radius = max(2, gear_radius // 3)
        draw.ellipse(
            [gear_center_x - center_hole_radius, gear_center_y - center_hole_radius,
             gear_center_x + center_hole_radius, gear_center_y + center_hole_radius],
            fill=white
        )
    
    # 添加光泽效果（仅大尺寸）
    if size >= 64:
        highlight_radius = int(radius * 0.6)
        highlight_center_x = center - int(radius * 0.2)
        highlight_center_y = center - int(radius * 0.2)
        
        # 创建渐变高光
        for i in range(highlight_radius, 0, -3):
            alpha = int(50 * (1 - i / highlight_radius))
            draw.ellipse(
                [highlight_center_x - i, highlight_center_y - i,
                 highlight_center_x + i, highlight_center_y + i],
                fill=(*white, alpha)
            )
    
    return img

def generate_all_icons():
    """
    生成所有尺寸的清晰图标
    """
    sizes = [16, 32, 48, 128]
    
    print("🎨 开始生成清晰的网页工具箱图标...")
    
    for size in sizes:
        print(f"📐 生成 {size}x{size} 图标...")
        
        # 生成图标
        icon = create_clear_icon(size)
        
        # 保存文件
        filename = f"icon{size}.png"
        filepath = os.path.join(os.path.dirname(__file__), filename)
        
        # 使用最高质量保存
        icon.save(filepath, 'PNG', optimize=True, compress_level=1)
        
        # 获取文件大小
        file_size = os.path.getsize(filepath)
        print(f"✅ {filename} 已生成 ({file_size} 字节)")
    
    print("\n🎉 所有图标生成完成！")
    print("\n📋 图标特性:")
    print("   🎯 高清晰度设计")
    print("   🌐 现代网页管理主题")
    print("   🔧 详细的工具图标元素")
    print("   💎 专业的视觉效果")
    print("   📱 完美适配所有尺寸")
    print("\n💡 使用提示: 重新加载Chrome扩展查看新图标")

if __name__ == "__main__":
    try:
        generate_all_icons()
    except ImportError as e:
        print("❌ 错误: 缺少PIL库")
        print("💡 安装命令: pip install Pillow")
        print(f"详细错误: {e}")
    except Exception as e:
        print(f"❌ 生成图标时出错: {e}")
        print("💡 请检查文件权限和依赖库")