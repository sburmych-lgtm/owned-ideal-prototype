# -*- coding: utf-8 -*-
from pathlib import Path
import shutil
import re
import json

root = Path(r"G:\Вебдизайн\Нова Ера сайту салону")
refs = next(p for p in root.iterdir() if (p / "assets").is_dir())
ba_dir = next(d for d in refs.iterdir() if d.is_dir() and d.name != "assets")
assets = refs / "assets"
out = root / "prototype" / "media"
out.mkdir(parents=True, exist_ok=True)
(out / "ba").mkdir(exist_ok=True)

mapping = {
    "OWNED_MONOGRAM.svg": "monogram.svg",
    "OWNED_PRIMARY_LOGO.svg": "logo-primary.svg",
    "OWNER_HALYNA.jpg": "founder-halyna.jpg",
    "REAL_AWARD_TRUST.jpg": "award-trust.jpg",
    "REAL_HAIR_RESULT.jpg": "hero-hair.jpg",
    "REAL_LOGO_AMBIENT_VIDEO.mp4": "logo-ambient.mp4",
    "REAL_NAIL_RESULT.jpg": "nails.jpg",
    "REAL_SALON_LOGO.jpg": "salon-logo.jpg",
}
for src_name, dst_name in mapping.items():
    shutil.copy2(assets / src_name, out / dst_name)
    print("copied", dst_name)

# Also pull richer interiors from Audit makety if present
mak = Path(r"G:\Вебдизайн\Макети") / "Audit document and design decisions" / "media"
extra = {
    "07_REAL_INTERIOR.jpg": "space-interior.jpg",
    "08_REAL_CURLY_RESULT.jpg": "curly-result.jpg",
    "09_REAL_CURLY_TEAM.jpg": "team-curly.jpg",
    "10_REAL_HAIR_PROCESS.jpg": "hair-process.jpg",
}
if mak.exists():
    for src_name, dst_name in extra.items():
        src = mak / src_name
        if src.exists():
            shutil.copy2(src, out / dst_name)
            print("copied makety", dst_name)

files = [f for f in ba_dir.iterdir() if f.is_file()]
selected = []


def copy_pair(before: Path, after: Path, slug: str, title: str, desc: str) -> None:
    b_out = out / "ba" / f"{slug}-before{before.suffix.lower()}"
    a_out = out / "ba" / f"{slug}-after{after.suffix.lower()}"
    shutil.copy2(before, b_out)
    shutil.copy2(after, a_out)
    selected.append(
        {
            "id": slug,
            "title": title,
            "desc": desc,
            "before": f"media/ba/{b_out.name}",
            "after": f"media/ba/{a_out.name}",
        }
    )
    print("BA", slug, before.name, "->", after.name)


by_name = {f.name: f for f in files}
copy_pair(
    by_name["Airtouch1.jpg"],
    by_name["Airtouch2.jpg"],
    "airtouch",
    "Airtouch",
    "Мʼяке освітлення · система кольору",
)
copy_pair(
    by_name["10_cholovicha_stryzhka_DO.png"],
    by_name["10_cholovicha_stryzhka_PISLYA.png"],
    "mens-cut",
    "Чоловіча стрижка",
    "Чиста форма · текстура",
)
copy_pair(
    by_name["11_dytyacha_stryzhka_DO.png"],
    by_name["11_dytyacha_stryzhka_PISLYA.png"],
    "kids-cut",
    "Дитяча стрижка",
    "Охайна форма під ріст",
)

cyr_pairs: dict[str, dict[str, Path]] = {}
for f in files:
    n = f.name
    if n.startswith(("10_", "11_", "Airtouch")):
        continue
    m = re.match(r"^(.*)(1|2)\.(jpg|png|jpeg)$", n, re.I)
    if not m:
        continue
    base, num = m.group(1), m.group(2)
    cyr_pairs.setdefault(base, {})[num] = f

ranked = sorted(
    cyr_pairs.items(),
    key=lambda kv: (kv[1]["1"].stat().st_size if "1" in kv[1] else 0),
    reverse=True,
)
print("--- bases ---")
for i, (base, parts) in enumerate(ranked):
    print(i, repr(base), list(parts.keys()), parts["1"].stat().st_size if "1" in parts else 0)

labels = [
    ("curls", "Кучерява форма", "Стрижка під текстуру"),
    ("color", "Складний колір", "Балаяж / вихід у світлий"),
    ("blonde", "Блонд і тонування", "Рівний тон без ламкості"),
    ("length", "Довжина і щільність", "Нарощення / відновлення"),
    ("grey", "Grey blending", "Сивина як акцент, не проблема"),
]
picked = 0
for (base, parts), (slug, title, desc) in zip(ranked, labels):
    if "1" in parts and "2" in parts:
        copy_pair(parts["1"], parts["2"], slug, title, desc)
        picked += 1
    if picked >= 5:
        break

prefer = ["curls", "color", "blonde", "airtouch", "grey", "length", "mens-cut"]
by_id = {c["id"]: c for c in selected}
final = []
for pid in prefer:
    if pid in by_id:
        final.append(by_id[pid])
    if len(final) >= 6:
        break
for c in selected:
    if c not in final and len(final) < 6:
        final.append(c)

(out / "cases.json").write_text(json.dumps(final, ensure_ascii=False, indent=2), encoding="utf-8")
print("FINAL", len(final))
for c in final:
    print(c["id"], c["title"])
