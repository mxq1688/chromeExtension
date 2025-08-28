#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
超清晰图标生成器 - 专注锐利清晰度
生成极其清晰锐利的Chrome扩展图标
"""

import os
from PIL import Image, ImageDraw, ImageFont
import math

def create_ultra_clear_icon(size):
    """
    创建超清晰锐利的图标
    重点：锐利边缘、高对比度、清晰线条
    
    Args:
        size (int): 图标尺寸
    
    Returns:
        PIL.Image: 超清晰图标
    """
    # 创建4倍分辨率进行下采样以获得更清晰效果
    render_size = size * 4
    img = Image.new('RGBA', (render_size, render_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 计算比例
    scale = render_size / 128.0
    center = render_size // 2
    
    # 高对比度颜色 - 确保清晰度
    primary_blue = (33, 150, 243)     # 鲜明蓝色
    dark_blue = (21, 101, 192)        # 深蓝
    light_blue = (144, 202, 249)      # 浅蓝
    white = (255, 255, 255)           # 纯白
    black = (0, 0, 0)                 # 纯黑
    gray = (97, 97, 97)               # 中灰
    
    # 背景圆形 - 简洁清晰的实色
    bg_radius = int(render_size * 0.42)
    draw.ellipse(
        [center - bg_radius, center - bg_radius, center + bg_radius, center + bg_radius],
        fill=primary_blue,
        outline=dark_blue,
        width=int(3 * scale)
    )
    
    # 内部白色区域 - 为内容提供清晰背景
    inner_radius = int(bg_radius * 0.72)
    draw.ellipse(
        [center - inner_radius, center - inner_radius, center + inner_radius, center + inner_radius],
        fill=white,
        outline=gray,
        width=int(1 * scale)
    )
    
    # 浏览器窗口 - 极简清晰设计
    window_width = int(render_size * 0.5)
    window_height = int(window_width * 0.75)
    window_x = center - window_width // 2
    window_y = center - window_height // 2
    
    # 窗口边框 - 锐利线条
    border_width = max(2, int(3 * scale))
    draw.rectangle(
        [window_x, window_y, window_x + window_width, window_y + window_height],
        fill=None,
        outline=dark_blue,
        width=border_width
    )
    
    # 标题栏 - 清晰分区
    title_height = int(window_height * 0.2)
    draw.rectangle(
        [window_x + border_width, window_y + border_width,
         window_x + window_width - border_width, window_y + title_height],
        fill=light_blue,
        outline=None
    )
    
    # 标题栏按钮 - 清晰的圆点
    if render_size >= 64:
        button_size = max(4, int(6 * scale))
        button_spacing = int(12 * scale)
        button_y = window_y + title_height // 2
        
        for i in range(3):
            button_x = window_x + int(12 * scale) + i * button_spacing
            draw.ellipse(
                [button_x - button_size, button_y - button_size,
                 button_x + button_size, button_y + button_size],
                fill=white,
                outline=gray,
                width=1
            )
    
    # 内容区域线条 - 清晰简洁
    content_start_y = window_y + title_height + int(8 * scale)
    content_width = window_width - int(16 * scale)
    line_height = max(2, int(3 * scale))
    line_spacing = int(10 * scale)
    
    # 绘制3-4条内容线
    num_lines = 3 if render_size < 128 else 4
    for i in range(num_lines):
        line_y = content_start_y + i * line_spacing
        if line_y + line_height >= window_y + window_height - int(8 * scale):
            break
            
        # 变化线条长度模拟真实内容
        line_width = content_width
        if i == 1:
            line_width = int(content_width * 0.7)
        elif i == 2:
            line_width = int(content_width * 0.9)
        
        draw.rectangle(
            [window_x + int(8 * scale), line_y,
             window_x + int(8 * scale) + line_width, line_y + line_height],
            fill=gray
        )
    
    # 工具图标 - 清晰的齿轮
    gear_size = max(16, int(20 * scale))
    gear_x = window_x + window_width - gear_size - int(8 * scale)
    gear_y = window_y + window_height - gear_size - int(8 * scale)
    
    if gear_y > content_start_y:  # 确保不与内容重叠
        gear_center_x = gear_x + gear_size // 2
        gear_center_y = gear_y + gear_size // 2
        
        # 齿轮齿 - 清晰的八角形
        if render_size >= 64:
            teeth_radius = gear_size // 2 - int(2 * scale)
            inner_radius = teeth_radius - int(4 * scale)
            
            # 绘制8个齿
            teeth_points = []
            for i in range(16):  # 16个点形成8个齿
                angle = (2 * math.pi * i) / 16
                if i % 2 == 0:  # 齿尖
                    radius = teeth_radius
                else:  # 齿根
                    radius = inner_radius
                
                x = gear_center_x + int(radius * math.cos(angle))
                y = gear_center_y + int(radius * math.sin(angle))
                teeth_points.append((x, y))
            
            draw.polygon(teeth_points, fill=dark_blue, outline=black, width=1)
        
        # 齿轮中心
        center_radius = max(4, gear_size // 4)
        draw.ellipse(
            [gear_center_x - center_radius, gear_center_y - center_radius,
             gear_center_x + center_radius, gear_center_y + center_radius],
            fill=dark_blue,
            outline=black,
            width=1
        )
        
        # 中心孔
        hole_radius = max(2, center_radius // 2)
        draw.ellipse(
            [gear_center_x - hole_radius, gear_center_y - hole_radius,
             gear_center_x + hole_radius, gear_center_y + hole_radius],
            fill=white,
            outline=gray,
            width=1
        )
    
    # 添加锐化边缘效果（仅限大图标）
    if render_size >= 256:  # 对应64px及以上
        # 在边缘添加细微高光增强清晰度
        highlight_radius = bg_radius - int(2 * scale)
        draw.ellipse(
            [center - highlight_radius, center - highlight_radius,
             center + highlight_radius, center + highlight_radius],
            fill=None,
            outline=(255, 255, 255, 100),
            width=1
        )
    
    # 下采样到目标尺寸以获得抗锯齿效果
    if render_size != size:
        img = img.resize((size, size), Image.LANCZOS)
    
    return img

def generate_ultra_clear_icons():
    """
    生成所有尺寸的超清晰图标
    """
    sizes = [16, 32, 48, 128]
    
    print("🔥 开始生成超清晰锐利图标...")
    print("🎯 特色：4倍渲染 + 下采样 = 超级清晰")
    
    for size in sizes:
        print(f"⚡ 生成 {size}x{size} 超清晰图标...")
        
        # 生成超清晰图标
        icon = create_ultra_clear_icon(size)
        
        # 保存为高质量PNG
        filename = f"icon{size}.png"
        filepath = os.path.join(os.path.dirname(__file__), filename)
        
        # 最高质量保存设置
        icon.save(
            filepath, 
            'PNG', 
            optimize=False,  # 不压缩以保持最高质量
            compress_level=0,  # 无压缩
            pnginfo=None
        )
        
        # 文件信息
        file_size = os.path.getsize(filepath)
        print(f"✅ {filename} 已生成 ({file_size} bytes) - 超清晰版本")
    
    print("\n🎉 超清晰图标生成完成！")
    print("\n🔥 清晰度特性:")
    print("   ⚡ 4倍超采样渲染")
    print("   🎯 LANCZOS高质量缩放")
    print("   🔪 锐利边缘处理")
    print("   💎 高对比度配色")
    print("   📐 精确像素对齐")
    print("   🚀 零压缩保存")
    
    print("\n💡 使用说明:")
    print("   1. 重新加载Chrome扩展")
    print("   2. 图标应该比之前更加清晰锐利")
    print("   3. 在高分辨率屏幕上效果更佳")

if __name__ == "__main__":
    try:
        generate_ultra_clear_icons()
    except ImportError as e:
        print("❌ 错误: 缺少PIL库")
        print("💡 安装: pip install Pillow")
        print(f"详细: {e}")
    except Exception as e:
        print(f"❌ 生成错误: {e}")
        import traceback
        traceback.print_exc()