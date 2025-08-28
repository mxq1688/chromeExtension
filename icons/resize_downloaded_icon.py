#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
调整下载图标尺寸
将专业图标调整为Chrome扩展需要的尺寸
"""

import os
from PIL import Image

def resize_professional_icon():
    """
    将下载的专业图标调整为Chrome扩展需要的尺寸
    """
    # 输入文件
    input_file = "toolbox_temp.png"
    
    if not os.path.exists(input_file):
        print(f"❌ 找不到文件: {input_file}")
        return
    
    try:
        # 打开原始图标
        original = Image.open(input_file)
        print(f"📁 原始图标尺寸: {original.size}")
        print(f"📁 原始图标模式: {original.mode}")
        
        # 如果不是RGBA模式，转换为RGBA以保持透明度
        if original.mode != 'RGBA':
            original = original.convert('RGBA')
        
        # Chrome扩展需要的尺寸
        sizes = [16, 32, 48, 128]
        
        print("\n🔄 开始调整尺寸...")
        
        for size in sizes:
            print(f"⚡ 调整为 {size}x{size}...")
            
            # 使用最高质量的重采样算法
            resized = original.resize((size, size), Image.LANCZOS)
            
            # 保存文件
            output_file = f"icon{size}.png"
            resized.save(
                output_file, 
                'PNG',
                optimize=True,
                compress_level=6  # 平衡质量和文件大小
            )
            
            # 检查文件信息
            file_size = os.path.getsize(output_file)
            print(f"✅ {output_file} - {file_size} bytes (专业版)")
        
        print("\n🎉 专业图标调整完成！")
        print("\n📊 特点:")
        print("   💎 专业设计师制作")
        print("   🎯 高质量Lanczos缩放")
        print("   ✨ 保持原始清晰度")
        print("   🎨 完美透明背景")
        print("   📐 精确尺寸适配")
        
        # 清理临时文件
        if os.path.exists(input_file):
            os.remove(input_file)
            print(f"\n🗑️ 已清理临时文件: {input_file}")
            
    except Exception as e:
        print(f"❌ 处理图标时出错: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    resize_professional_icon()