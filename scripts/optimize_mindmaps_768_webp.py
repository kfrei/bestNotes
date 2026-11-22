#!/usr/bin/env python3
"""
Optimize all HD .webp images in public/mind_maps/ to max 768px, WebP quality=76, method=6.
Saves ~40% (~55 MB) with virtually indistinguishable visual quality.
"""
import glob
import os
import time
from concurrent.futures import ThreadPoolExecutor
from PIL import Image


def optimize_one(path: str):
    before = os.path.getsize(path)
    tmp = path + ".opt.tmp"
    try:
        with Image.open(path) as im:
            rgba = im.convert("RGBA")
            if max(rgba.size) > 768:
                rgba.thumbnail((768, 768), Image.LANCZOS)
            rgba.save(tmp, format="WEBP", quality=76, method=6)
        after = os.path.getsize(tmp)
        if after < before:
            os.replace(tmp, path)
            return before, after, True
        else:
            os.remove(tmp)
            return before, before, False
    except Exception as e:
        if os.path.exists(tmp):
            os.remove(tmp)
        print(f"WARN {path}: {e}")
        return before, before, False


def main():
    t0 = time.time()
    files = sorted(glob.glob("public/mind_maps/**/*.webp", recursive=True))
    print(f"Optimizing {len(files)} WebP files (max 768px, q=76)...", flush=True)
    with ThreadPoolExecutor(max_workers=8) as ex:
        results = list(ex.map(optimize_one, files))
    tot_before = sum(r[0] for r in results)
    tot_after = sum(r[1] for r in results)
    changed = sum(1 for r in results if r[2])
    saved_mb = (tot_before - tot_after) / 1024 / 1024
    pct = (1 - tot_after / max(1, tot_before)) * 100
    print(
        f"Done in {time.time()-t0:.1f}s: {changed}/{len(files)} shrunk | "
        f"{tot_before/1024/1024:.2f} MB -> {tot_after/1024/1024:.2f} MB "
        f"(saved {saved_mb:.2f} MB / -{pct:.1f}%, avg {tot_after/len(files)/1024:.1f} KB)"
    )


if __name__ == "__main__":
    main()
