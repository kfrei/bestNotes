#!/usr/bin/env python3
"""
BestNotes Image & Sticker Library Auto-Cropper
Automatically crops excessive transparent padding from PNG/WebP images in the library
so that bounding boxes on the canvas fit the visible content tightly with zero empty space.
"""

import os
import sys
import argparse
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

def crop_image(file_path: str, padding: int = 6, threshold: int = 8, dry_run: bool = False):
    try:
        with Image.open(file_path) as im:
            if 'A' not in im.getbands():
                return None  # No alpha channel, nothing to crop transparently
            
            alpha = im.split()[-1]
            bbox = alpha.getbbox()
            if not bbox:
                return None  # Completely transparent image
            
            w, h = im.size
            bx0, by0, bx1, by1 = bbox
            pad_left = bx0
            pad_top = by0
            pad_right = w - bx1
            pad_bottom = h - by1
            
            # If the padding on any edge exceeds threshold
            if (pad_left >= threshold or pad_top >= threshold or 
                pad_right >= threshold or pad_bottom >= threshold):
                
                crop_box = (
                    max(0, bx0 - padding),
                    max(0, by0 - padding),
                    min(w, bx1 + padding),
                    min(h, by1 + padding)
                )
                new_w = crop_box[2] - crop_box[0]
                new_h = crop_box[3] - crop_box[1]
                
                # If dimensions actually changed meaningfully
                if new_w < w or new_h < h:
                    if not dry_run:
                        cropped = im.crop(crop_box)
                        cropped.save(file_path, optimize=True)
                    return {
                        'path': file_path,
                        'old_size': (w, h),
                        'new_size': (new_w, new_h),
                        'saved_px': (w * h) - (new_w * new_h)
                    }
    except Exception as e:
        print(f"Error processing {file_path}: {e}", file=sys.stderr)
    return None

def main():
    parser = argparse.ArgumentParser(description="Crop transparent padding from library images.")
    parser.add_argument("--dir", default="public/mind_maps", help="Target directory (default: public/mind_maps)")
    parser.add_argument("--padding", type=int, default=6, help="Padding to keep around content (default: 6px)")
    parser.add_argument("--threshold", type=int, default=8, help="Minimum padding threshold to trigger crop (default: 8px)")
    parser.add_argument("--dry-run", action="store_true", help="Report what would be cropped without saving")
    args = parser.parse_args()

    target_dir = args.dir
    if not os.path.exists(target_dir):
        print(f"Directory not found: {target_dir}")
        sys.exit(1)

    image_files = []
    for root, _, files in os.walk(target_dir):
        for f in files:
            if f.lower().endswith(('.png', '.webp')):
                image_files.append(os.path.join(root, f))

    print(f"🔍 Found {len(image_files)} images in {target_dir}...")
    print(f"⚙️ Running auto-crop (padding={args.padding}px, threshold={args.threshold}px, dry_run={args.dry_run})...")

    results = []
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(crop_image, f, args.padding, args.threshold, args.dry_run) for f in image_files]
        for f in futures:
            res = f.result()
            if res:
                results.append(res)

    print(f"\n✅ Finished processing {len(image_files)} images!")
    print(f"✂️ Cropped: {len(results)} images with excessive empty padding.")
    
    if results:
        print("\n📋 Sample cropped images:")
        for r in results[:10]:
            print(f"  • {os.path.basename(r['path'])}: {r['old_size'][0]}×{r['old_size'][1]} → {r['new_size'][0]}×{r['new_size'][1]}")

if __name__ == "__main__":
    main()
