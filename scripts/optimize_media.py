# -*- coding: utf-8 -*-
"""Optimize BA and key photos for web."""
from pathlib import Path
from PIL import Image

root = Path(r"G:\Вебдизайн\Нова Ера сайту салону\prototype\media")
ba = root / "ba"
out = ba / "web"
out.mkdir(exist_ok=True)

cases = [
    ("curls", "Форма і гладкість", "Текстура до/після · полірування"),
    ("color", "Складний колір", "Балаяж / вихід у світлий"),
    ("blonde", "Блонд і тонування", "Рівний тон без ламкості"),
    ("airtouch", "Airtouch", "Мʼяке багатотональне освітлення"),
    ("grey", "Grey blending", "Сивина як акцент"),
    ("length", "Довжина і щільність", "Нарощення / відновлення"),
]


def to_web(src: Path, dest: Path, max_edge=1600, quality=82):
    im = Image.open(src).convert("RGB")
    im.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "JPEG", quality=quality, optimize=True, progressive=True)
    print(dest.name, dest.stat().st_size // 1024, "KB", "from", src.name)


# Key page images
for name in [
    "hero-hair.jpg",
    "salon-logo.jpg",
    "founder-halyna.jpg",
    "award-trust.jpg",
    "nails.jpg",
    "space-interior.jpg",
    "curly-result.jpg",
    "team-curly.jpg",
    "hair-process.jpg",
]:
    src = root / name
    if src.exists():
        to_web(src, root / "web" / name, max_edge=1800 if "hero" in name or "salon" in name else 1400)

import json

final = []
for slug, title, desc in cases:
    before = next(ba.glob(f"{slug}-before.*"))
    after = next(ba.glob(f"{slug}-after.*"))
    b_out = out / f"{slug}-before.jpg"
    a_out = out / f"{slug}-after.jpg"
    to_web(before, b_out, max_edge=1400)
    to_web(after, a_out, max_edge=1400)
    final.append(
        {
            "id": slug,
            "title": title,
            "desc": desc,
            "before": f"media/ba/web/{b_out.name}",
            "after": f"media/ba/web/{a_out.name}",
            "thumb": f"media/ba/web/{a_out.name}",
        }
    )

(root / "cases.json").write_text(json.dumps(final, ensure_ascii=False, indent=2), encoding="utf-8")
print("cases", len(final))
