#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
极简清晰图标生成器
回归本质：简单 = 清晰
"""

import os
from PIL import Image, ImageDraw

def create_simple_clear_icon(size):
    """
    创建极简但极其清晰的图标
    理念：简单的设计 + 高质量渲染 = 最清晰的效果
    """
    # 创建图像
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 计算基础尺寸
    center = size // 2
    
    # 高对比度简洁配色
    main_blue = (66, 133, 244)     # Google蓝
    dark_blue = (26, 115, 232)     # 深蓝
    white = (255, 255, 255)        # 纯白
    gray = (95, 99, 104)           # 灰色
    
    # === 背景圆形 - 简洁实心圆 ===
    if size >= 32:
        bg_radius = int(size * 0.42)
        draw.ellipse(
            [center - bg_radius, center - bg_radius, center + bg_radius, center + bg_radius],
            fill=main_blue,
            outline=dark_blue,
            width=max(1, size // 32)
        )
    else:
        # 小尺寸时使用方形背景更清晰
        margin = size // 8
        draw.rectangle(
            [margin, margin, size - margin, size - margin],
            fill=main_blue,
            outline=dark_blue,
            width=1
        )
    
    # === 核心图标元素 - 超简化设计 ===
    if size >= 32:
        # 中等及大尺寸：浏览器窗口 + 齿轮
        icon_size = int(size * 0.5)
        icon_x = center - icon_size // 2
        icon_y = center - icon_size // 2
        
        # 白色背景区域
        draw.rectangle(
            [icon_x, icon_y, icon_x + icon_size, icon_y + icon_size],
            fill=white,
            outline=gray,
            width=max(1, size // 48)
        )
        
        # 顶部地址栏
        bar_height = max(3, icon_size // 6)
        draw.rectangle(
            [icon_x + 1, icon_y + 1, icon_x + icon_size - 1, icon_y + bar_height],
            fill=main_blue
        )
        
        # 内容线条（简化）
        line_height = max(1, size // 32)
        line_spacing = max(3, size // 16)
        content_start = icon_y + bar_height + line_spacing
        
        for i in range(min(3, (icon_size - bar_height - line_spacing) // line_spacing)):
            line_y = content_start + i * line_spacing
            line_width = icon_size - max(6, size // 8)
            if i == 1:
                line_width = int(line_width * 0.7)  # 短线
            
            draw.rectangle(
                [icon_x + max(3, size // 16), line_y,
                 icon_x + max(3, size // 16) + line_width, line_y + line_height],
                fill=gray
            )
        
        # 右下角齿轮（极简版）
        if size >= 48:
            gear_size = max(8, size // 8)
            gear_x = icon_x + icon_size - gear_size - 2
            gear_y = icon_y + icon_size - gear_size - 2
            
            # 简单的齿轮圆形
            draw.ellipse(
                [gear_x, gear_y, gear_x + gear_size, gear_y + gear_size],
                fill=dark_blue,
                outline=white,
                width=1
            )
            
            # 中心小孔
            hole_size = max(2, gear_size // 3)
            hole_center_x = gear_x + gear_size // 2
            hole_center_y = gear_y + gear_size // 2
            draw.ellipse(
                [hole_center_x - hole_size//2, hole_center_y - hole_size//2,
                 hole_center_x + hole_size//2, hole_center_y + hole_size//2],
                fill=white
            )
    
    elif size >= 16:
        # 小尺寸：极简设计
        # 简单的窗口图标
        window_size = size - 6
        window_x = 3
        window_y = 3
        
        # 白色窗口
        draw.rectangle(
            [window_x, window_y, window_x + window_size, window_y + window_size],
            fill=white,
            outline=gray,
            width=1
        )
        
        # 顶部蓝条
        draw.rectangle(
            [window_x + 1, window_y + 1, window_x + window_size - 1, window_y + 3],
            fill=main_blue
        )
        
        # 简单内容线
        if size >= 20:
            for i in range(2):
                line_y = window_y + 6 + i * 2
                draw.rectangle(
                    [window_x + 2, line_y, window_x + window_size - 3, line_y],
                    fill=gray
                )
    
    else:
        # 极小尺寸：纯色图标
        margin = 1
        draw.rectangle(
            [margin, margin, size - margin, size - margin],
            fill=main_blue
        )
        
        # 中心白点
        center_size = size // 3
        draw.rectangle(
            [center - center_size//2, center - center_size//2,
             center + center_size//2, center + center_size//2],
            fill=white
        )
    
    return img

def generate_simple_clear_icons():
    """
    生成极简清晰图标套装
    """
    sizes = [16, 32, 48, 128]
    
    print("✨ 开始生成极简清晰图标...")
    print("💡 设计理念：简单 = 清晰")
    
    for size in sizes:
        print(f"🎯 生成 {size}x{size} 极简清晰图标...")
        
        # 生成图标
        icon = create_simple_clear_icon(size)
        
        # 保存
        filename = f"icon{size}.png"
        filepath = os.path.join(os.path.dirname(__file__), filename)
        
        # 高质量保存
        icon.save(filepath, 'PNG', optimize=True)
        
        file_size = os.path.getsize(filepath)
        print(f"✅ {filename} - {file_size} bytes (极简清晰版)")
    
    print("\n🎉 极简清晰图标完成！")
    print("\n✨ 特点:")
    print("   🎯 极简设计 - 去除复杂元素")
    print("   💎 高对比度 - 确保清晰可见")
    print("   📐 像素对齐 - 避免模糊")
    print("   🎨 Google配色 - 专业感")
    print("   📱 自适应 - 各尺寸优化")
    
    print("\n💡 有时候简单就是最好的答案！")

if __name__ == "__main__":
    try:
        generate_simple_clear_icons()
    except Exception as e:
        print(f"❌ 错误: {e}")
        import traceback
        traceback.print_exc()