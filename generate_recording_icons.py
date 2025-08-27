#!/usr/bin/env python3
from PIL import Image, ImageDraw
import os

def create_microphone_icon(size):
    """Create a modern microphone icon"""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Colors
    primary_color = (37, 99, 235, 255)  # Blue
    secondary_color = (59, 130, 246, 255)  # Lighter blue
    wave_color = (96, 165, 250, 200)  # Semi-transparent blue
    
    # Scale factors
    center = size // 2
    stroke_width = max(1, size // 32)
    
    # Microphone capsule dimensions
    mic_width = size // 4
    mic_height = int(size * 0.4)
    mic_top = int(size * 0.15)
    
    # Draw microphone capsule (rounded rectangle)
    capsule_left = center - mic_width // 2
    capsule_right = center + mic_width // 2
    capsule_bottom = mic_top + mic_height
    
    # Draw capsule body
    draw.ellipse([
        capsule_left, mic_top,
        capsule_right, mic_top + mic_width
    ], fill=primary_color)
    
    draw.rectangle([
        capsule_left, mic_top + mic_width//2,
        capsule_right, capsule_bottom - mic_width//2
    ], fill=primary_color)
    
    draw.ellipse([
        capsule_left, capsule_bottom - mic_width,
        capsule_right, capsule_bottom
    ], fill=primary_color)
    
    # Draw microphone stand
    stand_top = capsule_bottom
    stand_bottom = int(size * 0.75)
    draw.line([
        center, stand_top,
        center, stand_bottom
    ], fill=primary_color, width=stroke_width)
    
    # Draw base
    base_width = int(size * 0.3)
    draw.line([
        center - base_width//2, stand_bottom,
        center + base_width//2, stand_bottom
    ], fill=primary_color, width=stroke_width)
    
    # Draw sound waves (arcs)
    if size >= 32:  # Only draw waves for larger icons
        wave_radius1 = int(size * 0.35)
        wave_radius2 = int(size * 0.45)
        
        # Create a separate image for waves to get better arc drawing
        wave_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        wave_draw = ImageDraw.Draw(wave_img)
        
        # Draw wave arcs (simplified as lines for PIL)
        wave_points = [
            # First wave - right side
            (center + int(wave_radius1 * 0.7), center - int(wave_radius1 * 0.5)),
            (center + wave_radius1, center),
            (center + int(wave_radius1 * 0.7), center + int(wave_radius1 * 0.5)),
            
            # Second wave - right side
            (center + int(wave_radius2 * 0.8), center - int(wave_radius2 * 0.6)),
            (center + wave_radius2, center),
            (center + int(wave_radius2 * 0.8), center + int(wave_radius2 * 0.6)),
        ]
        
        # Draw simplified wave lines
        for i in range(0, len(wave_points)-1, 3):
            if i + 2 < len(wave_points):
                wave_draw.line([wave_points[i], wave_points[i+1]], fill=wave_color, width=max(1, stroke_width//2))
                wave_draw.line([wave_points[i+1], wave_points[i+2]], fill=wave_color, width=max(1, stroke_width//2))
        
        # Blend waves with main image
        img = Image.alpha_composite(img, wave_img)
    
    return img

def generate_all_icons():
    """Generate all required icon sizes"""
    sizes = [16, 32, 48, 128]
    
    # Create icons directory if it doesn't exist
    os.makedirs('icons', exist_ok=True)
    
    for size in sizes:
        print(f"Generating icon{size}.png...")
        icon = create_microphone_icon(size)
        icon.save(f'icons/icon{size}.png', 'PNG')
        print(f"✓ Created icons/icon{size}.png ({size}x{size})")
    
    print("\n🎤 All recording icons generated successfully!")

if __name__ == '__main__':
    generate_all_icons()