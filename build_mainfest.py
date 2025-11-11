# build_manifest.py
# Scan ./_project and write ./_project/manifest.json
# - Generates thumbnails for images into ./_project/thumbs/
# - Supports images (jpg/png/jpeg/webp/gif/svg*) and videos (mp4/webm)
#   *SVG 无法缩略图时直接引用原图
import os, json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent
SRC = ROOT / "_projects"
THUMBS = SRC / "thumbs"
THUMBS.mkdir(parents=True, exist_ok=True)

IMAGE_EXT = {".jpg",".jpeg",".png",".webp",".gif",".svg"}
VIDEO_EXT = {".mp4",".webm"}

def make_thumb(src: Path, maxw=800):
    if src.suffix.lower() == ".svg":
        return None  # use original for svg
    out = THUMBS / (src.stem + "-thumb.jpg")
    try:
        im = Image.open(src).convert("RGB")
        w, h = im.size
        if w > maxw:
            nh = int(h * maxw / w)
            im = im.resize((maxw, nh), Image.LANCZOS)
        im.save(out, "JPEG", quality=86, optimize=True)
        return f"./thumbs/{out.name}"
    except Exception as e:
        print("thumb fail:", src, e)
        return None

items = []
for p in sorted(SRC.iterdir()):
    if p.is_dir() or p.name.startswith(".") or p.name == "thumbs":
        continue
    ext = p.suffix.lower()
    if ext in IMAGE_EXT:
        thumb = make_thumb(p)
        items.append({
            "type": "image",
            "src": f"./{p.name}",
            "thumb": thumb or f"./{p.name}",
            "alt": p.stem
        })
    elif ext in VIDEO_EXT:
        items.append({
            "type": "video",
            "src": f"./{p.name}",
            "poster": None,
            "mime": "video/mp4" if ext==".mp4" else "video/webm"
        })

manifest = {"generated": True, "count": len(items), "items": items}
with open(SRC / "manifest.json", "w", encoding="utf-8") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)
print("Wrote", SRC / "manifest.json", "with", len(items), "items")
