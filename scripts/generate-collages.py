#!/usr/bin/env python3
"""
Generates Instagram-style product collages from the shop's existing product
photos, using the curated FEATURED_ORDER as the display order — similar in
spirit to the reference screenshots (grid of items on a subtle textured
background).

Reads:
  - src/data/shop.ts          (id -> image path)
  - src/data/featuredOrder.ts (display order)

Writes:
  - public/assets/collages/collage-01.png, collage-02.png, ...

Run with: python3 scripts/generate-collages.py
"""
import re
import os
import math
import random
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOP_TS = os.path.join(ROOT, 'src/data/shop.ts')
FEATURED_TS = os.path.join(ROOT, 'src/data/featuredOrder.ts')
PUBLIC_DIR = os.path.join(ROOT, 'public')
OUT_DIR = os.path.join(PUBLIC_DIR, 'assets/collages')

ITEMS_PER_IMAGE = 15  # 3 columns x 5 rows, like the reference screenshots
COLS = 3
CELL = 520           # px per product cell (square-ish slot)
GAP = 26
MARGIN = 70
BG_SIZE_PAD = 40


def load_id_to_image():
    content = open(SHOP_TS, encoding='utf-8').read()
    mapping = {}
    for m in re.finditer(r"\{\s*id:\s*'([^']+)',.*?image:\s*'([^']+)'", content, re.S):
        iid, img = m.group(1), m.group(2)
        if iid not in mapping:
            mapping[iid] = img
    return mapping


def load_featured_order():
    content = open(FEATURED_TS, encoding='utf-8').read()
    m = re.search(r"FEATURED_ORDER:\s*string\[\]\s*=\s*\[(.*?)\]", content, re.S)
    body = m.group(1)
    return re.findall(r"'([^']+)'", body)


def make_concrete_background(w, h):
    """Procedural light-grey mottled/concrete-ish texture, similar to the
    reference collages, without needing any external asset."""
    random.seed(42)
    base = Image.new('RGB', (w, h), (222, 220, 216))
    noise = Image.new('L', (w, h))
    px = noise.load()
    for y in range(h):
        for x in range(w):
            px[x, y] = random.randint(0, 40)
    noise = noise.filter(ImageFilter.GaussianBlur(3))
    tint = Image.new('RGB', (w, h), (0, 0, 0))
    base = Image.composite(tint, base, noise.point(lambda v: int(v * 0.6)))
    base = base.filter(ImageFilter.GaussianBlur(1.2))
    # subtle vignette
    vignette = Image.new('L', (w, h), 0)
    vd = ImageDraw.Draw(vignette)
    vd.ellipse([-w * 0.25, -h * 0.25, w * 1.25, h * 1.25], fill=255)
    vignette = vignette.filter(ImageFilter.GaussianBlur(120))
    dark = Image.new('RGB', (w, h), (150, 148, 145))
    base = Image.composite(base, dark, vignette)
    return base


def fit_contain(img, box_w, box_h, pad=18):
    img = img.convert('RGBA')
    tw, th = box_w - pad * 2, box_h - pad * 2
    ratio = min(tw / img.width, th / img.height)
    new_w, new_h = max(1, int(img.width * ratio)), max(1, int(img.height * ratio))
    return img.resize((new_w, new_h), Image.LANCZOS)


def paste_soft_shadow(base, item_img, x, y):
    shadow = Image.new('RGBA', base.size, (0, 0, 0, 0))
    alpha = item_img.split()[-1]
    shadow_shape = Image.new('RGBA', item_img.size, (0, 0, 0, 90))
    shadow_shape.putalpha(alpha.point(lambda a: min(90, a)))
    shadow.paste(shadow_shape, (x + 10, y + 14), shadow_shape)
    shadow = shadow.filter(ImageFilter.GaussianBlur(14))
    base.alpha_composite(shadow)


def build_collages():
    id_to_image = load_id_to_image()
    order = load_featured_order()

    ordered_paths = []
    missing = []
    for iid in order:
        rel = id_to_image.get(iid)
        if not rel:
            missing.append(iid)
            continue
        abs_path = os.path.join(PUBLIC_DIR, rel.lstrip('/'))
        if os.path.exists(abs_path):
            ordered_paths.append((iid, abs_path))
        else:
            missing.append(iid)

    # include any items that exist but weren't in FEATURED_ORDER, appended at the end
    seen = {iid for iid, _ in ordered_paths}
    for iid, rel in id_to_image.items():
        if iid in seen:
            continue
        abs_path = os.path.join(PUBLIC_DIR, rel.lstrip('/'))
        if os.path.exists(abs_path):
            ordered_paths.append((iid, abs_path))

    if missing:
        print(f"Note: {len(missing)} item(s) skipped (no image found): {missing}")

    os.makedirs(OUT_DIR, exist_ok=True)

    total = len(ordered_paths)
    pages = math.ceil(total / ITEMS_PER_IMAGE)
    print(f"Building {pages} collage page(s) from {total} items...")

    for page in range(pages):
        chunk = ordered_paths[page * ITEMS_PER_IMAGE:(page + 1) * ITEMS_PER_IMAGE]
        rows = math.ceil(len(chunk) / COLS)
        w = MARGIN * 2 + COLS * CELL + (COLS - 1) * GAP
        h = MARGIN * 2 + rows * CELL + (rows - 1) * GAP

        bg = make_concrete_background(w, h).convert('RGBA')

        for idx, (iid, path) in enumerate(chunk):
            col = idx % COLS
            row = idx // COLS
            cell_x = MARGIN + col * (CELL + GAP)
            cell_y = MARGIN + row * (CELL + GAP)

            try:
                item = Image.open(path)
            except Exception as e:
                print(f"  skip {iid}: {e}")
                continue

            fitted = fit_contain(item, CELL, CELL)
            off_x = cell_x + (CELL - fitted.width) // 2
            off_y = cell_y + (CELL - fitted.height) // 2

            paste_soft_shadow(bg, fitted, off_x, off_y)
            bg.alpha_composite(fitted, (off_x, off_y))

        out_path = os.path.join(OUT_DIR, f"collage-{page + 1:02d}.png")
        bg.convert('RGB').save(out_path, quality=95)
        print(f"  wrote {out_path} ({len(chunk)} items, {w}x{h})")


if __name__ == '__main__':
    build_collages()
