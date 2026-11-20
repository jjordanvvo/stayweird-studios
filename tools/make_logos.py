# Regenerates the distressed logo PNGs in images/.
# Usage: python3 tools/make_logos.py images /tmp   (needs numpy + Pillow; set FONT to any bold .otf/.ttf)
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
OUT = sys.argv[1]
FONT = "/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf"
rng = np.random.default_rng(7)

def smooth_noise(h, w, cell):
    g = rng.random((h // cell + 3, w // cell + 3)).astype(np.float32)
    im = Image.fromarray((g * 255).astype(np.uint8)).resize((w + 2 * cell, h + 2 * cell), Image.BICUBIC)
    return np.asarray(im, np.float32)[cell:cell + h, cell:cell + w] / 255.0

def render(lines, size, track=-0.045, lh=0.84, melt=1.0, hole=0.575):
    f = ImageFont.truetype(FONT, size)
    widths = []
    for t in lines:
        w = 0
        for ch in t: w += f.getlength(ch) + track * size
        widths.append(w)
    pad = int(size * 0.18)
    W = int(max(widths) + pad * 2); H = int(size * (1 + (len(lines) - 1) * lh) + pad * 2)
    m = Image.new("L", (W, H), 0); d = ImageDraw.Draw(m)
    for i, t in enumerate(lines):
        x = pad; y = pad + i * size * lh - size * 0.12
        for ch in t:
            d.text((x, y), ch, font=f, fill=255); x += f.getlength(ch) + track * size
    a = np.asarray(m, np.float32) / 255.0
    # 1) wobble: displace by low-frequency noise
    cell = max(8, size // 6); amp = size * 0.009 * melt
    dx = (smooth_noise(H, W, cell) - .5) * 2 * amp; dy = (smooth_noise(H, W, cell) - .5) * 2 * amp
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    sx = np.clip(xx + dx, 0, W - 1).astype(int); sy = np.clip(yy + dy, 0, H - 1).astype(int)
    a = a[sy, sx]
    # 2) ink bleed: blur + threshold -> rounded, melted edges, letters fuse slightly
    b = Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(size * 0.026 * melt))
    a = np.asarray(b, np.float32) / 255.0
    thr = 0.47 + (smooth_noise(H, W, max(6, size // 10)) - .5) * 0.10   # uneven edge erosion
    ink = np.clip((a - thr) * 14 + 0.5, 0, 1)
    # 3) grain: fine speckle holes inside the ink + a few stray specks outside
    fine = rng.random((H, W)).astype(np.float32)
    fine = np.asarray(Image.fromarray((fine * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(max(0.6, size * 0.004))), np.float32) / 255.0
    holes = np.clip((fine - hole) * 30, 0, 1)
    ink = ink * (1 - holes * 0.95)
    stray = np.clip((0.40 - fine) * 30, 0, 1) * np.clip((a - 0.25) * 4, 0, 1) * (ink < 0.5)
    ink = np.maximum(ink, stray * 0.8)
    # 4) faint horizontal scan glitches (like a photocopy)
    for _ in range(max(1, len(lines))):
        r = rng.integers(0, H); hgt = max(1, size // 70)
        ink[r:r + hgt, :] *= 0.8
    alpha = (np.clip(ink, 0, 1) * 255).astype(np.uint8)
    return Image.fromarray(alpha)

def save(alpha, color, name, width=None):
    c = Image.new("RGBA", alpha.size, color + (0,)); c.putalpha(alpha)
    bbox = alpha.point(lambda v: 255 if v > 40 else 0).getbbox(); c = c.crop((max(0, bbox[0]-4), max(0, bbox[1]-4), bbox[2]+4, bbox[3]+4))
    if width: c = c.resize((width, round(c.height * width / c.width)), Image.LANCZOS)
    c.save(f"{OUT}/{name}.png", optimize=True); print(name, c.size)
    return c

one = render(["Stay Weird Studios"], 260, melt=1.15, hole=0.62)
save(one, (10, 10, 10), "logo-black", 1200)
save(one, (243, 238, 230), "logo-white", 1200)
stack = render(["Stay", "Weird", "Studios"], 420, melt=1.35, hole=0.58)
w = save(stack, (243, 238, 230), "wordmark-white", 1400)
prev = Image.new("RGB", (w.width + 120, w.height + 120), (11, 11, 11)); prev.paste(w, (60, 60), w); prev.save(sys.argv[2] + "/wm_preview.png")
lb = Image.open(f"{OUT}/logo-black.png"); p2 = Image.new("RGB", (lb.width + 80, lb.height + 80), (255, 255, 255)); p2.paste(lb, (40, 40), lb); p2.save(sys.argv[2] + "/lb_preview.png")
