#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
极致锐利图标生成器 - 追求完美清晰度
专注创建刀锋般锐利的Chrome扩展图标
"""

import os
from PIL import Image, ImageDraw
import math

def create_razor_sharp_icon(size):
    """
    创建极致锐利的图标
    采用矢量化思维 + 高精度渲染
    
    Args:
        size (int): 图标尺寸
    
    Returns:
        PIL.Image: 极致锐利图标
    """
    # 使用8倍分辨率确保绝对清晰
    render_size = size * 8
    img = Image.new('RGBA', (render_size, render_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 计算精确比例
    scale = render_size / 128.0
    center = render_size // 2
    
    # 极高对比度颜色 - 确保最大清晰度
    deep_blue = (25, 118, 210)        # 深蓝主色
    darker_blue = (13, 71, 161)       # 更深蓝
    bright_blue = (33, 150, 243)      # 亮蓝
    pure_white = (255, 255, 255)      # 纯白
    pure_black = (0, 0, 0)            # 纯黑
    dark_gray = (66, 66, 66)          # 深灰
    
    # === 1. 背景圆形 - 完美圆形 ===
    bg_radius = int(render_size * 0.40)
    # 绘制实心圆背景
    draw.ellipse(
        [center - bg_radius, center - bg_radius, center + bg_radius, center + bg_radius],
        fill=deep_blue
    )
    
    # 添加深色边框增强对比
    border_width = max(4, int(6 * scale))
    draw.ellipse(
        [center - bg_radius, center - bg_radius, center + bg_radius, center + bg_radius],
        fill=None,
        outline=darker_blue,
        width=border_width
    )
    
    # === 2. 内部白色工作区域 ===
    work_radius = int(bg_radius * 0.70)
    draw.ellipse(
        [center - work_radius, center - work_radius, center + work_radius, center + work_radius],
        fill=pure_white
    )
    
    # 工作区边框
    draw.ellipse(
        [center - work_radius, center - work_radius, center + work_radius, center + work_radius],
        fill=None,
        outline=dark_gray,
        width=max(2, int(2 * scale))
    )
    
    # === 3. 浏览器窗口 - 极简设计 ===
    window_size = int(work_radius * 1.2)
    window_x = center - window_size // 2
    window_y = center - window_size // 2
    
    # 窗口主框架
    frame_width = max(3, int(4 * scale))
    draw.rectangle(
        [window_x, window_y, window_x + window_size, window_y + window_size],
        fill=None,
        outline=darker_blue,
        width=frame_width
    )
    
    # === 4. 标题栏区域 ===
    title_height = int(window_size * 0.18)
    draw.rectangle(
        [window_x + frame_width, window_y + frame_width,
         window_x + window_size - frame_width, window_y + title_height],
        fill=bright_blue
    )
    
    # 标题栏控制按钮（3个圆点）
    button_radius = max(3, int(4 * scale))
    button_spacing = int(10 * scale)
    button_start_x = window_x + int(12 * scale)
    button_y = window_y + title_height // 2
    
    for i in range(3):
        btn_x = button_start_x + i * button_spacing
        draw.ellipse(
            [btn_x - button_radius, button_y - button_radius,
             btn_x + button_radius, button_y + button_radius],
            fill=pure_white,
            outline=darker_blue,
            width=max(1, int(1 * scale))
        )
    
    # === 5. 内容区域 - 清晰线条 ===
    content_start_y = window_y + title_height + int(6 * scale)
    content_margin = int(8 * scale)
    line_height = max(3, int(4 * scale))
    line_spacing = int(8 * scale)
    
    # 绘制4条内容线模拟网页
    content_lines = [
        1.0,    # 100% 宽度
        0.75,   # 75% 宽度
        0.90,   # 90% 宽度
        0.60    # 60% 宽度
    ]
    
    for i, width_ratio in enumerate(content_lines):
        line_y = content_start_y + i * (line_height + line_spacing)
        if line_y + line_height >= window_y + window_size - content_margin:
            break
            
        line_width = int((window_size - 2 * content_margin) * width_ratio)
        draw.rectangle(
            [window_x + content_margin, line_y,
             window_x + content_margin + line_width, line_y + line_height],
            fill=dark_gray
        )
    
    # === 6. 工具齿轮图标 - 数学精确 ===
    gear_size = max(20, int(24 * scale))
    gear_x = window_x + window_size - gear_size - int(6 * scale)
    gear_y = window_y + window_size - gear_size - int(6 * scale)
    
    gear_center_x = gear_x + gear_size // 2
    gear_center_y = gear_y + gear_size // 2
    
    # 齿轮外圈 - 精确12齿设计
    outer_radius = gear_size // 2 - int(2 * scale)
    inner_radius = outer_radius - int(6 * scale)
    
    # 生成齿轮齿的精确坐标
    teeth_points = []
    teeth_count = 12
    for i in range(teeth_count * 2):  # 每个齿需要2个点
        angle = (2 * math.pi * i) / (teeth_count * 2)
        if i % 2 == 0:  # 齿尖
            radius = outer_radius
        else:  # 齿根
            radius = inner_radius
        
        x = gear_center_x + int(radius * math.cos(angle))
        y = gear_center_y + int(radius * math.sin(angle))
        teeth_points.append((x, y))
    
    # 绘制齿轮主体
    draw.polygon(teeth_points, fill=darker_blue, outline=pure_black, width=max(1, int(1 * scale)))
    
    # 齿轮中心圆
    center_radius = max(6, int(8 * scale))
    draw.ellipse(
        [gear_center_x - center_radius, gear_center_y - center_radius,
         gear_center_x + center_radius, gear_center_y + center_radius],
        fill=darker_blue,
        outline=pure_black,
        width=max(1, int(1 * scale))
    )
    
    # 中心孔
    hole_radius = max(3, int(4 * scale))
    draw.ellipse(
        [gear_center_x - hole_radius, gear_center_y - hole_radius,
         gear_center_x + hole_radius, gear_center_y + hole_radius],
        fill=pure_white,
        outline=dark_gray,
        width=max(1, int(1 * scale))
    )
    
    # === 7. 高质量下采样 ===
    # 使用最高质量的Lanczos重采样
    final_img = img.resize((size, size), Image.LANCZOS)
    
    # === 8. 锐化滤镜（可选） ===
    if size >= 32:
        # 对大尺寸图标应用轻微锐化
        from PIL import ImageFilter
        try:
            final_img = final_img.filter(ImageFilter.UnsharpMask(radius=0.5, percent=150, threshold=2))
        except:
            pass  # 如果锐化失败，使用原图
    
    return final_img

def generate_razor_sharp_icons():
    """
    生成极致锐利的图标套装
    """
    sizes = [16, 32, 48, 128]
    
    print("🔪 开始生成极致锐利图标...")
    print("⚡ 技术：8倍渲染 + Lanczos + 锐化滤镜")
    
    for size in sizes:
        print(f"🎯 生成 {size}x{size} 极致锐利图标...")
        
        try:
            # 生成极致锐利图标
            icon = create_razor_sharp_icon(size)
            
            # 保存为最高质量
            filename = f"icon{size}.png"
            filepath = os.path.join(os.path.dirname(__file__), filename)
            
            # 无损保存
            icon.save(
                filepath, 
                'PNG', 
                optimize=False,
                compress_level=0
            )
            
            file_size = os.path.getsize(filepath)
            print(f"✅ {filename} - {file_size} bytes (极致锐利版)")
            
        except Exception as e:
            print(f"❌ 生成 {size}px 图标时出错: {e}")
    
    print("\n🔥 极致锐利图标完成！")
    print("\n🎯 锐利度特性:")
    print("   ⚡ 8倍超高精度渲染")
    print("   🔪 数学精确几何设计")
    print("   💎 Lanczos高质量缩放")
    print("   ✨ UnsharpMask锐化滤镜")
    print("   🎨 极高对比度配色")
    print("   📐 像素级精确对齐")
    
    print("\n💡 这次应该达到刀锋般的锐利效果！")

if __name__ == "__main__":
    try:
        generate_razor_sharp_icons()
    except Exception as e:
        print(f"❌ 生成过程出错: {e}")
        import traceback
        traceback.print_exc()