# Builds the Stay Weird Studios brand logo options in the distressed ink style.
# Usage: python3 tools/make_brand_logos.py <out_dir>   (needs numpy + Pillow)
import math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = sys.argv[1] if len(sys.argv) > 1 else "brand"
os.makedirs(OUT, exist_ok=True)
BOLD = "/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf"
BLACK = "/usr/share/fonts/opentype/inter/InterDisplay-Black.otf"
INK_DARK, INK_LIGHT = (10, 10, 10), (243, 238, 230)
rng = np.random.default_rng(11)


def font(path, size):
    return ImageFont.truetype(path if os.path.exists(path) else BOLD, size)


def smooth_noise(h, w, cell):
    g = rng.random((h // cell + 3, w // cell + 3)).astype(np.float32)
    im = Image.fromarray((g * 255).astype(np.uint8)).resize((w + 2 * cell, h + 2 * cell), Image.BICUBIC)
    return np.asarray(im, np.float32)[cell:cell + h, cell:cell + w] / 255.0


def distress(mask, unit, melt=1.2, hole=0.6, lines=2):
    """mask: L image (255 = ink). unit: typical letter height in px, sets the scale of the wear."""
    W, H = mask.size
    a = np.asarray(mask, np.float32) / 255.0
    cell = max(8, int(unit // 6)); amp = unit * 0.009 * melt
    dx = (smooth_noise(H, W, cell) - .5) * 2 * amp; dy = (smooth_noise(H, W, cell) - .5) * 2 * amp
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    a = a[np.clip(yy + dy, 0, H - 1).astype(int), np.clip(xx + dx, 0, W - 1).astype(int)]
    a = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(unit * 0.026 * melt)), np.float32) / 255.0
    thr = 0.47 + (smooth_noise(H, W, max(6, int(unit // 10))) - .5) * 0.10
    steep = max(14, unit * 0.026 * melt * 1.4)
    ink = np.clip((a - thr) * steep + 0.5, 0, 1)
    fine = rng.random((H, W)).astype(np.float32)
    fine = np.asarray(Image.fromarray((fine * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.7)), np.float32) / 255.0
    ink = ink * (1 - np.clip((fine - hole) * 30, 0, 1) * 0.95)
    stray = np.clip((0.40 - fine) * 30, 0, 1) * np.clip((a - 0.25) * 4, 0, 1) * (ink < 0.5)
    ink = np.maximum(ink, stray * 0.8)
    for _ in range(lines):
        r = int(rng.integers(0, H)); ink[r:r + max(1, int(unit // 70)), :] *= 0.8
    return Image.fromarray((np.clip(ink, 0, 1) * 255).astype(np.uint8))


def text_w(d, t, f, track):
    return sum(f.getlength(c) for c in t) + track * f.size * (len(t) - 1)


def draw_text(d, xy, t, f, track=0.0, fill=255, anchor_center=False):
    x, y = xy
    if anchor_center:
        x -= text_w(d, t, f, track) / 2
    for c in t:
        d.text((x, y), c, font=f, fill=fill, anchor="ls"); x += f.getlength(c) + track * f.size


def arc_text(d, cx, cy, r, t, f, track, top=True, fill=255):
    """Letters around a circle, centred on the top (reads left->right) or bottom (reads left->right)."""
    widths = [f.getlength(c) + track * f.size for c in t]
    total = sum(widths) - track * f.size
    ang = -total / r / 2 if top else total / r / 2
    for c, w in zip(t, widths):
        mid = ang + (f.getlength(c) / 2) / r if top else ang - (f.getlength(c) / 2) / r
        tile = Image.new("L", (int(f.size * 2), int(f.size * 2)), 0)
        ImageDraw.Draw(tile).text((f.size, f.size), c, font=f, fill=fill, anchor="mm")
        if top:
            px, py, rot = cx + r * math.sin(mid), cy - r * math.cos(mid), -math.degrees(mid)
        else:
            px, py, rot = cx - r * math.sin(mid), cy + r * math.cos(mid), -math.degrees(mid)
        tile = tile.rotate(rot, resample=Image.BICUBIC, expand=False)
        d._image.paste(255, (int(px - tile.width / 2), int(py - tile.height / 2)), tile)
        ang += w / r if top else -w / r


def save(alpha, name, pad=24):
    box = alpha.point(lambda v: 255 if v > 40 else 0).getbbox()
    alpha = alpha.crop((max(0, box[0] - pad), max(0, box[1] - pad), min(alpha.width, box[2] + pad), min(alpha.height, box[3] + pad)))
    for tag, col in (("black", INK_DARK), ("white", INK_LIGHT)):
        im = Image.new("RGBA", alpha.size, col + (0,)); im.putalpha(alpha)
        im.save(f"{OUT}/{name}-{tag}.png", optimize=True)
    return alpha


# 1) SW monogram
m = Image.new("L", (1400, 1000), 0); d = ImageDraw.Draw(m)
f = font(BLACK, 760); draw_text(d, (700, 800), "SW", f, track=-0.06, anchor_center=True)
mono = save(distress(m, 760, melt=0.95, hole=0.555, lines=2), "sw-monogram")

# 2) Round badge: ring + SW + name around the edge
S = 1600; c = S // 2
m = Image.new("L", (S, S), 0); d = ImageDraw.Draw(m)
d.ellipse((c - 720, c - 720, c + 720, c + 720), outline=255, width=46)
d.ellipse((c - 520, c - 520, c + 520, c + 520), outline=255, width=22)
arc_text(d, c, c, 615, "STAY WEIRD STUDIOS", font(BLACK, 150), 0.02, top=True)
arc_text(d, c, c, 615, "EST. 2026", font(BLACK, 150), 0.06, top=False)
for s in (-1, 1):  # small dots between the two lines of ring text
    ang = math.radians(90 + s * 68); d.ellipse((c + 615 * math.cos(ang) - 22, c + 615 * math.sin(ang) - 22, c + 615 * math.cos(ang) + 22, c + 615 * math.sin(ang) + 22), fill=255)
draw_text(d, (c, c + 190), "SW", font(BLACK, 520), track=-0.06, anchor_center=True)
badge = save(distress(m, 300, melt=1.15, hole=0.62, lines=2), "badge")

# 3) Wordmark: big "Stay Weird" + spaced-out "STUDIOS" underneath
m = Image.new("L", (2400, 900), 0); d = ImageDraw.Draw(m)
draw_text(d, (1200, 430), "Stay Weird", font(BOLD, 420), track=-0.05, anchor_center=True)
draw_text(d, (1200, 690), "STUDIOS", font(BLACK, 170), track=0.32, anchor_center=True)
word = save(distress(m, 420, melt=1.25, hole=0.6, lines=2), "wordmark-studios")

# 4) Block lockup: SW knocked out of a solid box, name to the right
m = Image.new("L", (2600, 900), 0); d = ImageDraw.Draw(m)
d.rounded_rectangle((100, 150, 760, 750), radius=40, fill=255)
draw_text(d, (430, 640), "SW", font(BLACK, 420), track=-0.06, fill=0, anchor_center=True)
fb = font(BOLD, 230)
for i, t in enumerate(["Stay Weird", "Studios"]):
    draw_text(d, (850, 380 + i * 230), t, fb, track=-0.05)
block = save(distress(m, 300, melt=1.2, hole=0.6, lines=2), "block-lockup")

# Preview sheet (dark tiles, then light tiles)
tiles = [mono, badge, word, block]
def sheet(bg, ink, name):
    TW, TH, G = 900, 620, 30
    out = Image.new("RGB", (TW * 2 + G * 3, TH * 2 + G * 3), bg)
    for i, a in enumerate(tiles):
        sc = min((TW - 120) / a.width, (TH - 120) / a.height)
        a2 = a.resize((int(a.width * sc), int(a.height * sc)), Image.LANCZOS)
        im = Image.new("RGBA", a2.size, ink + (0,)); im.putalpha(a2)
        x = G + (i % 2) * (TW + G) + (TW - a2.width) // 2; y = G + (i // 2) * (TH + G) + (TH - a2.height) // 2
        out.paste(im, (x, y), im)
    out.save(f"{OUT}/{name}", quality=90)
sheet((14, 14, 14), INK_LIGHT, "preview-dark.jpg")
sheet((246, 244, 240), INK_DARK, "preview-light.jpg")
print("done", [t.size for t in tiles])
