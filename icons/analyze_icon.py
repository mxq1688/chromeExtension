#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
图标质量分析工具
分析图标的详细信息和质量指标
"""

import os
from PIL import Image
import numpy as np

def analyze_icon(filename):
    """
    分析图标质量和内容
    """
    if not os.path.exists(filename):
        print(f"❌ 文件不存在: {filename}")
        return
    
    try:
        # 打开图像
        img = Image.open(filename)
        
        print(f"📁 分析文件: {filename}")
        print(f"📐 尺寸: {img.size}")
        print(f"🎨 模式: {img.mode}")
        print(f"📊 格式: {img.format}")
        
        # 文件大小
        file_size = os.path.getsize(filename)
        print(f"💾 文件大小: {file_size} bytes ({file_size/1024:.1f} KB)")
        
        # 转换为numpy数组进行分析
        img_array = np.array(img)
        print(f"🔢 数组形状: {img_array.shape}")
        
        if len(img_array.shape) >= 3:
            # 分析颜色通道
            if img_array.shape[2] >= 3:
                r_channel = img_array[:,:,0]
                g_channel = img_array[:,:,1]
                b_channel = img_array[:,:,2]
                
                print(f"\n🎨 颜色分析:")
                print(f"   🔴 红色通道: min={r_channel.min()}, max={r_channel.max()}, avg={r_channel.mean():.1f}")
                print(f"   🟢 绿色通道: min={g_channel.min()}, max={g_channel.max()}, avg={g_channel.mean():.1f}")
                print(f"   🔵 蓝色通道: min={b_channel.min()}, max={b_channel.max()}, avg={b_channel.mean():.1f}")
            
            # 透明度分析
            if img_array.shape[2] == 4:  # RGBA
                alpha_channel = img_array[:,:,3]
                print(f"   ⚪ 透明通道: min={alpha_channel.min()}, max={alpha_channel.max()}, avg={alpha_channel.mean():.1f}")
                
                # 计算透明像素比例
                transparent_pixels = np.sum(alpha_channel == 0)
                total_pixels = alpha_channel.size
                transparency_ratio = transparent_pixels / total_pixels * 100
                print(f"   👻 透明像素: {transparent_pixels}/{total_pixels} ({transparency_ratio:.1f}%)")
        
        # 颜色统计
        print(f"\n🎯 图像统计:")
        
        # 获取主要颜色
        if img.mode == 'RGBA':
            # 将RGBA转换为RGB进行颜色分析
            rgb_img = Image.new('RGB', img.size, (255, 255, 255))
            rgb_img.paste(img, mask=img.split()[3])  # 使用alpha通道作为mask
            colors = rgb_img.getcolors(maxcolors=256*256*256)
        else:
            colors = img.getcolors(maxcolors=256*256*256)
        
        if colors:
            # 排序获取最常用的颜色
            colors = sorted(colors, key=lambda x: x[0], reverse=True)
            print(f"   🌈 总颜色数: {len(colors)}")
            print(f"   🎨 主要颜色 (前5个):")
            for i, (count, color) in enumerate(colors[:5]):
                percentage = count / (img.size[0] * img.size[1]) * 100
                if isinstance(color, tuple) and len(color) >= 3:
                    print(f"      {i+1}. RGB{color[:3]} - {count}像素 ({percentage:.1f}%)")
                else:
                    print(f"      {i+1}. {color} - {count}像素 ({percentage:.1f}%)")
        
        # 边缘检测（简单版）
        if img.mode in ['RGB', 'RGBA']:
            # 转换为灰度进行边缘分析
            gray = img.convert('L')
            gray_array = np.array(gray)
            
            # 简单的边缘检测
            edges_h = np.abs(np.diff(gray_array, axis=0))
            edges_v = np.abs(np.diff(gray_array, axis=1))
            
            edge_strength = np.mean(edges_h) + np.mean(edges_v)
            print(f"   🔪 边缘锐利度: {edge_strength:.2f} (数值越高越锐利)")
        
        # 质量评估
        print(f"\n✨ 质量评估:")
        
        # 文件大小评估
        expected_size = img.size[0] * img.size[1] * 4  # RGBA每像素4字节
        compression_ratio = file_size / expected_size
        print(f"   📦 压缩比: {compression_ratio:.3f} (原始: {expected_size} bytes)")
        
        if compression_ratio > 0.5:
            print(f"   ⚠️  压缩比较高，可能影响质量")
        elif compression_ratio > 0.1:
            print(f"   ✅ 压缩比适中，质量良好")
        else:
            print(f"   💎 压缩比很低，质量优秀")
        
        # 尺寸评估
        if img.size[0] == img.size[1]:
            print(f"   ✅ 正方形图标，符合Chrome扩展规范")
        else:
            print(f"   ⚠️  非正方形图标，可能不符合规范")
        
        print(f"\n🎯 建议:")
        if file_size < 1000:
            print(f"   📏 文件较小，细节可能不够丰富")
        elif file_size > 50000:
            print(f"   📦 文件较大，考虑优化压缩")
        else:
            print(f"   ✅ 文件大小适中")
            
    except Exception as e:
        print(f"❌ 分析图标时出错: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # 分析所有图标
    sizes = [16, 32, 48, 128]
    
    for size in sizes:
        filename = f"icon{size}.png"
        print(f"{'='*50}")
        analyze_icon(filename)
        print()
    
    print("🎉 图标分析完成！")