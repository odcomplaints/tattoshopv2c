#!/usr/bin/env python3
"""
Generates "bundle" collages that group items by brand/theme (Bape, Supreme,
vintage jerseys, chains & jewelry, etc.) instead of just the featured shop
order — same visual style as generate-collages.py (concrete-textured
background, soft shadows), but items are clustered by what belongs together.

Reads:
  - src/data/shop.ts (id, name, category, image)

Writes:
  - public/assets/collages/bundle-<slug>.png (one per brand/theme group)

Run with: python3 scripts/generate-brand-bundles.py
"""
import re
import os
import math
import random
from collections import defaultdict
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOP_TS = os.path.join(ROOT, 'src/data/shop.ts')
PUBLIC_DIR = os.path.join(ROOT, 'public')
OUT_DIR = os.path.join(PUBLIC_DIR, 'assets/collages')

COLS = 3
CELL = 520
GAP = 26
MARGIN = 70


def load_items():
    content = open(SHOP_TS, encoding='utf-8').read()
    items = []
    seen = set()
    for m in re.finditer(
        r"\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',.*?category:\s*'([^']+)',.*?image:\s*'([^']+)'",
        content, re.S,
    ):
        iid, name, cat, img = m.groups()
        if iid in seen:
            continue
        seen.add(iid)
        items.append({'id': iid, 'name': name, 'category': cat, 'image': img})
    return items


def bucket_for(item):
    n = item['name'].lower()
    c = item['category'].lower()
    iid = item['id'].lower()

    if 'bape' in n or 'bape' in iid:
        return 'Bape'
    if 'supreme' in n or 'supreme' in iid:
        return 'Supreme'
    if 'palace' in n or 'palace' in iid:
        return 'Palace'
    if 'trikot' in n or 'jersey' in c:
        return 'Vintage Jerseys'
    if 'polo' in c:
        return 'Polos'
    if 'schmuck' in c:
        return 'Chains & Jewelry'
    if 'watch' in n or 'uhr' in c:
        return 'Watches'
    if any(k in n or k in iid for k in ('dior', 'balenciaga', 'prada', 'cp company', 'casablanca')):
        return 'Luxury Designer'
    if 'carlo colucci' in n or 'strick' in c or 'pullover' in c or 'winterpulli' in n:
        return 'Knitwear & Pullover'
    if 'charity' in c:
        return 'Charity & Accessories'
    return 'Streetwear Mix'


def slugify(label):
    return re.sub(r'[^a-z0-9]+', '-', label.lower()).strip('-')


def make_concrete_background(w, h, seed):
    random.seed(seed)
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


def build_bundle(label, entries, seed):
    cols = COLS if len(entries) > 1 else 1
    rows = math.ceil(len(entries) / cols)
    w = MARGIN * 2 + cols * CELL + (cols - 1) * GAP
    h = MARGIN * 2 + rows * CELL + (rows - 1) * GAP

    bg = make_concrete_background(w, h, seed).convert('RGBA')

    for idx, entry in enumerate(entries):
        col = idx % cols
        row = idx // cols
        cell_x = MARGIN + col * (CELL + GAP)
        cell_y = MARGIN + row * (CELL + GAP)

        try:
            item_img = Image.open(entry['abs_path'])
        except Exception as e:
            print(f"  skip {entry['id']}: {e}")
            continue

        fitted = fit_contain(item_img, CELL, CELL)
        off_x = cell_x + (CELL - fitted.width) // 2
        off_y = cell_y + (CELL - fitted.height) // 2

        paste_soft_shadow(bg, fitted, off_x, off_y)
        bg.alpha_composite(fitted, (off_x, off_y))

    slug = slugify(label)
    out_path = os.path.join(OUT_DIR, f"bundle-{slug}.png")
    bg.convert('RGB').save(out_path, quality=95)
    print(f"  wrote {out_path} ({len(entries)} items, {w}x{h}) — {label}")


def main():
    items = load_items()
    groups = defaultdict(list)
    missing = []

    for item in items:
        abs_path = os.path.join(PUBLIC_DIR, item['image'].lstrip('/'))
        if not os.path.exists(abs_path):
            missing.append(item['id'])
            continue
        item['abs_path'] = abs_path
        groups[bucket_for(item)].append(item)

    if missing:
        print(f"Note: {len(missing)} item(s) skipped (no image found): {missing}")

    os.makedirs(OUT_DIR, exist_ok=True)

    print(f"Building {len(groups)} bundle collage(s)...")
    for i, (label, entries) in enumerate(sorted(groups.items(), key=lambda kv: -len(kv[1]))):
        build_bundle(label, entries, seed=100 + i)


if __name__ == '__main__':
    main()
