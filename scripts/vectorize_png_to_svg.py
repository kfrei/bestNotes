#!/usr/bin/env python3
"""
High-quality PNG -> SVG Vectorizer for ExplainBoards Image Collection.
Uses OpenCV 4x edge-preserving bilateral upscaling + Rust-powered VTracer cubic Bézier splines
to convert low-resolution transparent PNG illustrations into crisp, infinitely scalable SVGs.

Usage:
    python3 scripts/vectorize_png_to_svg.py <input.png> <output.svg>
    python3 scripts/vectorize_png_to_svg.py --batch <input_dir> <output_dir>
"""
import argparse
import os
import re
import sys
import tempfile
import cv2
import numpy as np
from PIL import Image
import vtracer


def preprocess_png_for_tracing(
    input_path: str, tmp_png_path: str, scale: int = 3, max_colors: int = 12
) -> tuple[int, int]:
    """Load RGBA PNG, smooth watercolor noise, quantize to clean flat illustration colors, and upscale."""
    im = Image.open(input_path).convert("RGBA")
    arr = np.array(im)
    h, w = arr.shape[:2]

    rgb = arr[:, :, :3]
    alpha = arr[:, :, 3]

    # 1. Upscale RGB and alpha cleanly
    new_w, new_h = w * scale, h * scale
    rgb_up = cv2.resize(rgb, (new_w, new_h), interpolation=cv2.INTER_CUBIC)
    alpha_up = cv2.resize(alpha, (new_w, new_h), interpolation=cv2.INTER_CUBIC)

    # 2. Clean alpha mask
    alpha_clean = np.where(alpha_up >= 115, 255, 0).astype(np.uint8)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    alpha_clean = cv2.morphologyEx(alpha_clean, cv2.MORPH_OPEN, kernel)
    alpha_clean = cv2.morphologyEx(alpha_clean, cv2.MORPH_CLOSE, kernel)

    # 3. Strong edge-preserving bilateral smoothing to flatten watercolor/pencil grain into clean cel-shaded regions
    rgb_smooth = cv2.bilateralFilter(rgb_up, d=9, sigmaColor=55, sigmaSpace=55)
    rgb_smooth = cv2.bilateralFilter(rgb_smooth, d=7, sigmaColor=42, sigmaSpace=42)

    # 4. K-Means color quantization strictly on opaque pixels (clean Illustrator-style flat palette!)
    mask = alpha_clean > 0
    if np.count_nonzero(mask) > max_colors * 4:
        pixels = rgb_smooth[mask].astype(np.float32)
        # Subsample for instant K-Means speed
        step = max(1, len(pixels) // 12000)
        sample = pixels[::step]
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 25, 1.0)
        _, _, centers = cv2.kmeans(
            sample, max_colors, None, criteria, 3, cv2.KMEANS_PP_CENTERS
        )
        centers_u8 = np.clip(np.round(centers), 0, 255).astype(np.uint8)
        # Assign every opaque pixel to its nearest palette center
        dists = np.sum(
            (pixels[:, None, :] - centers[None, :, :]) ** 2, axis=2
        )
        nearest = np.argmin(dists, axis=1)
        quant_rgb = rgb_smooth.copy()
        quant_rgb[mask] = centers_u8[nearest]
        # Tiny median pass to eliminate 1px color speckles along borders
        quant_rgb = cv2.medianBlur(quant_rgb, 3)
    else:
        quant_rgb = rgb_smooth

    out_rgba = np.dstack([quant_rgb, alpha_clean])
    Image.fromarray(out_rgba).save(tmp_png_path, format="PNG")
    return new_w, new_h


def vectorize_file(
    input_path: str, output_path: str, scale: int = 2, max_colors: int = 12
) -> dict:
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tf:
        tmp_png = tf.name

    try:
        up_w, up_h = preprocess_png_for_tracing(
            input_path, tmp_png, scale=scale, max_colors=max_colors
        )
        vtracer.convert_image_to_svg_py(
            tmp_png,
            output_path,
            colormode="color",
            hierarchical="stacked",
            mode="spline",
            filter_speckle=16,
            color_precision=5,
            layer_difference=28,
            corner_threshold=60,
            length_threshold=5.5,
            max_iterations=10,
            splice_threshold=55,
            path_precision=1,
        )

        # Ensure clean viewBox & responsive SVG attributes for Canvas/Browser scaling
        with open(output_path, "r", encoding="utf-8") as f:
            svg = f.read()

        if "viewBox=" not in svg:
            svg = re.sub(
                r"<svg\b([^>]*)>",
                lambda m: f'<svg{m.group(1)} viewBox="0 0 {up_w} {up_h}">',
                svg,
                count=1,
            )

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(svg)

        return {
            "input": input_path,
            "output": output_path,
            "in_bytes": os.path.getsize(input_path),
            "out_bytes": os.path.getsize(output_path),
            "paths": svg.count("<path"),
            "size": (up_w, up_h),
        }
    finally:
        if os.path.exists(tmp_png):
            os.remove(tmp_png)


def main():
    parser = argparse.ArgumentParser(description="Convert low-res PNG illustrations into crisp SVGs.")
    parser.add_argument("src", help="Input PNG file or directory (with --batch)")
    parser.add_argument("dst", help="Output SVG file or directory (with --batch)")
    parser.add_argument("--batch", action="store_true", help="Convert all PNGs in src directory")
    parser.add_argument("--scale", type=int, default=2, help="Pre-trace upscale factor (default: 2)")
    parser.add_argument("--colors", type=int, default=12, help="Max flat palette colors (default: 12)")
    args = parser.parse_args()

    if args.batch:
        for name in sorted(os.listdir(args.src)):
            if not name.lower().endswith(".png"):
                continue
            in_p = os.path.join(args.src, name)
            out_p = os.path.join(args.dst, os.path.splitext(name)[0] + ".svg")
            info = vectorize_file(in_p, out_p, scale=args.scale, max_colors=args.colors)
            print(
                f"OK {name} -> {os.path.basename(out_p)} | "
                f"{info['in_bytes']/1024:.1f}KB PNG -> {info['out_bytes']/1024:.1f}KB SVG ({info['paths']} paths)"
            )
    else:
        info = vectorize_file(args.src, args.dst, scale=args.scale, max_colors=args.colors)
        print(
            f"OK {os.path.basename(args.src)} -> {os.path.basename(args.dst)} | "
            f"{info['in_bytes']/1024:.1f}KB PNG -> {info['out_bytes']/1024:.1f}KB SVG ({info['paths']} paths)"
        )


if __name__ == "__main__":
    main()
