# build_posts_manifest.py
# Scan ./_posts and generate ./_posts/manifest.json with post metadata
import os, json, re
from pathlib import Path

ROOT = Path(__file__).parent
POSTS_DIR = ROOT / "_posts"

# Minimal front-matter parser (YAML subset)
def parse_front_matter(content: str):
    obj = {}
    body = content
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", content, re.DOTALL)
    if not m:
        return obj, body
    yaml_text, body = m.group(1), m.group(2)
    for line in yaml_text.splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        m2 = re.match(r"^([A-Za-z0-9_-]+)\s*:\s*(.*)$", line)
        if not m2:
            continue
        k, v = m2.group(1), m2.group(2).strip()
        if v.startswith('[') and v.endswith(']'):
            v = [x.strip().strip("'\"") for x in v[1:-1].split(',') if x.strip()]
        elif (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
            v = v[1:-1]
        obj[k] = v
    return obj, body

# Extract the first meaningful paragraph as excerpt
def extract_excerpt(body: str) -> str:
    lines = [l.strip() for l in body.splitlines()]
    for line in lines:
        if not line:
            continue
        if line.startswith('>'):
            return line.lstrip('> ').strip()
        if line and not line.startswith('#') and not line.startswith('```'):
            # Strip markdown links and images
            line = re.sub(r"!\[.*?\]\(.*?\)", '', line)
            line = re.sub(r"\[.*?\]\(.*?\)", '', line)
            return (line[:200] + '...') if len(line) > 200 else line
    return ""

# Scan posts directory
def scan_posts():
    posts = []
    if not POSTS_DIR.exists():
        print(f"Warning: {POSTS_DIR} does not exist. Create it and add markdown posts.")
        return posts

    for post_dir in sorted(POSTS_DIR.iterdir()):
        if not post_dir.is_dir() or post_dir.name.startswith('.'):
            continue
        md_files = list(post_dir.glob('*.md'))
        if not md_files:
            print(f"Warning: no .md file found in {post_dir.name}")
            continue
        preferred = post_dir / f"{post_dir.name}.md"
        md_file = preferred if preferred.exists() else md_files[0]
        try:
            text = md_file.read_text(encoding='utf-8')
            fm, body = parse_front_matter(text)
            # Required fields
            required = ['title', 'date']
            missing = [k for k in required if k not in fm]
            if missing:
                print(f"Warning: {post_dir.name} missing required fields: {missing}")
                # Skip posts without title/date
                continue
            tags = fm.get('tags', [])
            if isinstance(tags, str):
                tags = [t.strip() for t in tags.split(',') if t.strip()]
            excerpt = fm.get('excerpt') or extract_excerpt(body)
            cover = fm.get('cover', '')
            post = {
                'id': post_dir.name,
                'title': fm['title'],
                'date': fm['date'],  # Expect ISO-like yyyy-mm-dd or yyyy-mm-ddTHH:MM
                'tags': tags,
                'cover': cover,
                'excerpt': excerpt
            }
            posts.append(post)
            print(f"Loaded post: {post_dir.name} - {fm['title']}")
        except Exception as e:
            print(f"Error processing {post_dir.name}: {e}")
            continue

    # Sort by date desc (lexicographic works for ISO dates)
    posts.sort(key=lambda p: p.get('date', ''), reverse=True)
    return posts


def main():
    posts = scan_posts()
    manifest = {
        'generated': True,
        'count': len(posts),
        'posts': posts,
    }
    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    out = POSTS_DIR / 'manifest.json'
    with out.open('w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"Generated {out} with {len(posts)} posts")

if __name__ == '__main__':
    main()
