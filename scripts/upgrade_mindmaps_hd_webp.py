#!/usr/bin/env python3
"""
Batch HD Upgrade Pipeline for ExplainBoards Image Collection (/public/mind_maps/).
- Small PNGs (< 700px): halo-free white-bg composite -> Real-ESRGAN x4plus-anime GPU batch ->
  recombine crisp bicubic alpha -> 3x LANCZOS (capped at 1024px) -> crisp WebP (q=84).
- Already-HD PNGs (>= 700px): convert directly to crisp WebP (q=88) preserving full resolution & alpha.
- Verifies 100% of WebP outputs before deleting old PNGs.
- Updates /mind_maps/...png -> .webp across src/data/.
"""
import glob
import json
import os
import re
import shutil
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

SCRATCH = "/Users/freiderikosk/.gemini/antigravity/brain/7ce66ffa-920d-4372-a10c-3bcac12be1d4/scratch/realesrgan"
BIN = os.path.join(SCRATCH, "realesrgan-ncnn-vulkan")
MODELS = os.path.join(SCRATCH, "models")
TMP_IN = os.path.join(SCRATCH, "batch_in")
TMP_OUT = os.path.join(SCRATCH, "batch_out")


def main():
    t0 = time.time()
    pngs = sorted(glob.glob("public/mind_maps/**/*.png", recursive=True))
    print(f"Found {len(pngs)} PNGs in public/mind_maps/", flush=True)
    if not pngs:
        print("No PNGs to process.")
        return

    shutil.rmtree(TMP_IN, ignore_errors=True)
    shutil.rmtree(TMP_OUT, ignore_errors=True)
    os.makedirs(TMP_IN, exist_ok=True)
    os.makedirs(TMP_OUT, exist_ok=True)

    small_jobs = []  # (idx, src_png, dst_webp, orig_w, orig_h)
    hd_direct = []   # (src_png, dst_webp)

    for src in pngs:
        dst = src[:-4] + ".webp"
        with Image.open(src) as im:
            w, h = im.size
        if max(w, h) < 700:
            idx = len(small_jobs)
            small_jobs.append((idx, src, dst, w, h))
        else:
            hd_direct.append((src, dst))

    print(f"Stage 1: Converting {len(hd_direct)} already-HD PNGs directly to WebP & staging {len(small_jobs)} small PNGs...", flush=True)

    def convert_hd(item):
        src, dst = item
        with Image.open(src) as im:
            im.convert("RGBA").save(dst, format="WEBP", quality=88, method=6)

    def stage_small(item):
        idx, src, _dst, _w, _h = item
        with Image.open(src) as im:
            rgba = im.convert("RGBA")
            white = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
            comp = Image.alpha_composite(white, rgba).convert("RGB")
            comp.save(os.path.join(TMP_IN, f"{idx:05d}.png"), format="PNG")

    with ThreadPoolExecutor(max_workers=8) as ex:
        list(ex.map(convert_hd, hd_direct))
        list(ex.map(stage_small, small_jobs))

    print(f"Stage 1 done in {time.time() - t0:.1f}s. Stage 2: Running Real-ESRGAN GPU batch on {len(small_jobs)} images...", flush=True)
    t1 = time.time()

    if small_jobs:
        res = subprocess.run(
            [BIN, "-i", TMP_IN, "-o", TMP_OUT, "-n", "realesrgan-x4plus-anime", "-m", MODELS, "-s", "4", "-j", "2:2:2", "-f", "png"],
            capture_output=True,
            text=True,
        )
        if res.returncode != 0:
            print("Real-ESRGAN ERROR:", res.stderr, file=sys.stderr)
            raise SystemExit(1)

    print(f"Stage 2 GPU batch done in {time.time() - t1:.1f}s. Stage 3: Recombining clean alpha & saving 3x HD WebP...", flush=True)
    t2 = time.time()

    def finalize_small(item):
        idx, src, dst, orig_w, orig_h = item
        upscaled_path = os.path.join(TMP_OUT, f"{idx:05d}.png")
        with Image.open(src) as orig_im, Image.open(upscaled_path) as up_im:
            orig_alpha = orig_im.convert("RGBA").split()[3]
            hd_rgb = up_im.convert("RGB")
            uw, uh = hd_rgb.size
            alpha_hd = orig_alpha.resize((uw, uh), Image.BICUBIC)
            hd_rgba = hd_rgb.convert("RGBA")
            hd_rgba.putalpha(alpha_hd)

            # Target 3x resolution, capped at 1024px longest side for crispness + lean hosting footprint
            scale = min(3.0, 1024.0 / max(1, orig_w, orig_h))
            tw = max(1, int(round(orig_w * scale)))
            th = max(1, int(round(orig_h * scale)))
            final_im = hd_rgba.resize((tw, th), Image.LANCZOS) if (tw != uw or th != uh) else hd_rgba
            final_im.save(dst, format="WEBP", quality=84, method=6)

    with ThreadPoolExecutor(max_workers=8) as ex:
        list(ex.map(finalize_small, small_jobs))

    print(f"Stage 3 done in {time.time() - t2:.1f}s. Stage 4: Verifying all {len(pngs)} WebP outputs...", flush=True)

    missing = []
    total_png_b = 0
    total_webp_b = 0
    for src in pngs:
        dst = src[:-4] + ".webp"
        if not os.path.exists(dst) or os.path.getsize(dst) < 100:
            missing.append(src)
        else:
            total_png_b += os.path.getsize(src)
            total_webp_b += os.path.getsize(dst)

    if missing:
        print(f"ABORT: {len(missing)} WebP files failed! First 5: {missing[:5]}", file=sys.stderr)
        raise SystemExit(1)

    # All verified -> remove old PNGs and temp staging dirs
    for src in pngs:
        os.remove(src)
    shutil.rmtree(TMP_IN, ignore_errors=True)
    shutil.rmtree(TMP_OUT, ignore_errors=True)

    # Stage 5: Update /mind_maps/...png -> .webp across src/data/
    updated_files = 0
    updated_refs = 0
    for ts_path in sorted(glob.glob("src/data/**/*.ts", recursive=True)):
        with open(ts_path, "r", encoding="utf-8") as f:
            txt = f.read()

        def repl(m):
            nonlocal updated_refs
            url_png = m.group(0)
            webp_disk = os.path.join("public", url_png.lstrip("/")[:-4] + ".webp")
            if os.path.exists(webp_disk):
                updated_refs += 1
                return url_png[:-4] + ".webp"
            return url_png

        new_txt = re.sub(r"/mind_maps/[^\"'`\s)]+\.png", repl, txt)
        if new_txt != txt:
            with open(ts_path, "w", encoding="utf-8") as f:
                f.write(new_txt)
            updated_files += 1

    print(
        f"ALL DONE in {time.time() - t0:.1f}s!\n"
        f"Upgraded: {len(pngs)} PNGs ({total_png_b/1024/1024:.1f} MB) -> WebP ({total_webp_b/1024/1024:.1f} MB)\n"
        f"Updated {updated_refs} references across {updated_files} catalog/seed files.",
        flush=True,
    )


if __name__ == "__main__":
    main()
