# generate_site.py
import os, json

BASE = "portfolio-multipage"

FILES = {
    # ---------------- CSS ----------------
    ("css", "theme.css"): r""":root{
  --bg:#0b0717;
  --panel:#120a24;
  --ink:#e9e5ff;
  --muted:#b8a9ff;
  --primary:#7a3cff;
  --primary-2:#c53bff;
  --outline:#2a1b4b;
  --radius:14px; --radius-sm:10px;
  --maxw:1100px;
  --glow:0 0 32px rgba(122,60,255,.35);
  --shadow:0 10px 30px rgba(0,0,0,.35);
}
html,body{background:var(--bg); color:var(--ink); font-family:ui-sans-serif,Inter,"PingFang SC","Microsoft YaHei",Arial; line-height:1.6; margin:0}
*{box-sizing:border-box}
a{color:var(--muted); text-decoration:none}
a:hover{color:var(--primary-2)}
img,video{max-width:100%; display:block}
.wrap{max-width:var(--maxw); margin:0 auto; padding:0 20px}
.section{padding:80px 0}
.panel{background:linear-gradient(180deg,rgba(255,255,255,.02),rgba(255,255,255,0)); border:1px solid var(--outline); border-radius:var(--radius); box-shadow:var(--shadow)}
.grid{display:grid; gap:22px}
.btn{display:inline-flex; align-items:center; gap:.5rem; padding:.8rem 1.1rem; border-radius:var(--radius-sm); background:linear-gradient(135deg,var(--primary),var(--primary-2)); color:white; box-shadow:var(--glow); border:1px solid #5f33cc}
.btn.ghost{background:transparent; color:var(--ink); border:1px solid var(--outline)}
.chip{display:inline-block; padding:.3rem .6rem; border:1px solid var(--outline); border-radius:999px; color:var(--muted); font-size:.85rem}
hr.sep{border:none; height:1px; background:linear-gradient(90deg,transparent,var(--outline),transparent); margin:40px 0}
.nav{position:sticky; top:0; backdrop-filter:blur(10px); background:rgba(11,7,23,.5); border-bottom:1px solid var(--outline); z-index:10}
.nav .inner{display:flex; align-items:center; justify-content:space-between; height:64px}
.brand{display:flex; align-items:center; gap:.7rem}
.logo{width:28px;height:28px;border-radius:8px;background:radial-gradient(60% 60% at 50% 50%, var(--primary-2), var(--primary)); box-shadow:var(--glow)}
.projects .grid{grid-template-columns: repeat(auto-fill, minmax(260px,1fr))}
.card{position:relative; overflow:hidden; border-radius:var(--radius); border:1px solid var(--outline); background:var(--panel)}
.card .thumb{aspect-ratio:16/10; background:#1a1230}
.card .body{padding:16px}
.card h3{margin:.2rem 0 .5rem 0; font-size:1.05rem}
.card:hover{box-shadow:var(--glow); transform: translateY(-2px); transition:.2s}
.tags{display:flex; gap:8px; flex-wrap:wrap; margin-top:8px}
.gallery .grid{grid-template-columns: repeat(auto-fill, minmax(180px,1fr))}
@media (max-width:800px){ .about{grid-template-columns:1fr} }
""",

    # ---------------- JS ----------------
    ("js", "include.js"): r"""// Inject partials into each page via data-include
(async function mountIncludes(){
  const slots = document.querySelectorAll('[data-include]');
  for (const slot of slots) {
    const url = slot.getAttribute('data-include');
    try {
      const res = await fetch(url);
      const html = await res.text();
      slot.outerHTML = html;
    } catch (e) {
      console.error('Include failed:', url, e);
      slot.innerHTML = `<div style="padding:16px;color:#f99">Failed to load: ${url}</div>`;
    }
  }
})();
""",

    # ---------------- Partials ----------------
    ("partials", "header.html"): r"""<nav class="nav">
  <div class="wrap inner">
    <div class="brand">
      <div class="logo" aria-hidden="true"></div>
      <strong>Your Name</strong>
    </div>
    <div>
      <!-- IMPORTANT: links are relative to /pages/ because header is included from pages/*.html -->
      <a href="./hero.html">Home</a>
      <a href="./about.html">About</a>
      <a href="./projects.html">Projects</a>
      <a href="./gallery.html">Gallery</a>
      <a href="./skills.html">Skill&nbsp;Tree</a>
      <a href="./writing.html">Writing</a>
      <a href="./contact.html">Contact</a>
    </div>
  </div>
</nav>
""",
    ("partials", "footer.html"): r"""<footer style="padding:40px 0; color:var(--muted); border-top:1px solid var(--outline)">
  <div class="wrap">© <span id="y"></span> Your Name · All rights reserved</div>
  <script>document.getElementById('y').textContent = new Date().getFullYear();</script>
</footer>
""",

    # ---------------- Pages ----------------
    ("pages", "hero.html"): r"""<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Home · Your Name</title>
<link rel="stylesheet" href="../css/theme.css"/>
</head><body>
  <div data-include="../partials/header.html"></div>

  <main class="section" id="hero">
    <div class="wrap" style="display:grid; gap:24px; align-items:center">
      <span class="chip">Your focus / tag line</span>
      <h1 style="margin:0;font-size:clamp(2rem,4.5vw,3.25rem);line-height:1.15">
        I'm <span style="color:var(--primary-2)">Your Name</span> — I craft
        <span style="color:var(--primary)">visual & web</span> experiences
      </h1>
      <p style="color:var(--muted);margin:0">YOUR_SHORT_PITCH…</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <a class="btn" href="./projects.html">See Projects</a>
        <a class="btn ghost" href="./contact.html">Contact</a>
      </div>
    </div>
  </main>

  <div data-include="../partials/footer.html"></div>
  <script src="../js/include.js"></script>
</body></html>
""",

    ("pages", "about.html"): r"""<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>About · Your Name</title>
<link rel="stylesheet" href="../css/theme.css"/>
</head><body>
  <div data-include="../partials/header.html"></div>

  <main class="section" id="about">
    <div class="wrap about" style="display:grid;gap:24px;grid-template-columns:220px 1fr">
      <div class="panel" style="aspect-ratio:1/1;border-radius:var(--radius);overflow:hidden;border:1px solid var(--outline)">
        <img src="../assets/avatar.svg" alt="Your avatar">
      </div>
      <div>
        <h2>About</h2>
        <p>Hello! I'm a ... (background, focus, toolset, industry experience).</p>
        <p>Skilled in: Figma, React, Three.js, Branding, Motion, etc.</p>
        <div class="tags" aria-label="Skills">
          <span class="chip">UI/UX</span>
          <span class="chip">Frontend</span>
          <span class="chip">Motion</span>
          <span class="chip">3D</span>
        </div>
      </div>
    </div>
  </main>

  <div data-include="../partials/footer.html"></div>
  <script src="../js/include.js"></script>
</body></html>
""",

    ("pages", "projects.html"): r"""<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Projects · Your Name</title>
<link rel="stylesheet" href="../css/theme.css"/>
</head><body>
  <div data-include="../partials/header.html"></div>

  <main class="section" id="projects">
    <div class="wrap">
      <h2>Projects</h2>
      <p class="muted">Handpicked case studies and highlights.</p>
      <div class="grid">
        <article class="card">
          <img class="thumb" src="../assets/p1-cover.svg" alt="Project 1 cover">
          <div class="body">
            <h3>Project One · Title</h3>
            <p>What problem it solves, your contribution, and the outcome.</p>
            <div class="tags"><span class="chip">Web</span><span class="chip">Design</span></div>
            <p style="margin-top:.7rem">
              <a href="https://example.com" target="_blank" rel="noopener">Live</a> ·
              <a href="https://github.com/yourrepo" target="_blank" rel="noopener">Source</a>
            </p>
          </div>
        </article>
        <!-- Duplicate article blocks to add more projects -->
      </div>
    </div>
  </main>

  <div data-include="../partials/footer.html"></div>
  <script src="../js/include.js"></script>
</body></html>
""",

    ("pages", "gallery.html"): r"""<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Gallery · Your Name</title>
<link rel="stylesheet" href="../css/theme.css"/>
</head><body>
  <div data-include="../partials/header.html"></div>

  <main class="section" id="gallery">
    <div class="wrap">
      <h2>Gallery</h2>
      <p class="muted">Images, posters, or visual snapshots.</p>
      <div class="grid">
        <a class="panel" href="../assets/g1-large.svg" target="_blank" rel="noopener">
          <img src="../assets/g1-thumb.svg" alt="Work 1">
        </a>
        <!-- Add more images or videos -->
      </div>
    </div>
  </main>

  <div data-include="../partials/footer.html"></div>
  <script src="../js/include.js"></script>
</body></html>
""",

    ("pages", "skills.html"): r"""<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Skill Tree · Your Name</title>
<link rel="stylesheet" href="../css/theme.css"/>
</head><body>
  <div data-include="../partials/header.html"></div>

  <main class="section" id="skills">
    <div class="wrap">
      <h2 style="margin-bottom:16px">Skill Tree</h2>
      <p class="muted">Embed your XMind share link below, or replace with a static export (PNG/SVG/HTML).</p>

      <!-- Option A: XMind embed (replace src) -->
      <div class="panel" style="padding:0;border-radius:var(--radius);overflow:hidden">
        <iframe src="https://www.xmind.app/embed/your-xmind-id"
                title="Skill Tree (XMind)" style="width:100%;height:70vh;border:0"
                allowfullscreen loading="lazy"></iframe>
      </div>

      <!-- Option B: Static export (uncomment to use and remove the iframe above) -->
      <!--
      <div class="panel" style="padding:12px; overflow:auto; max-height:70vh; margin-top:16px">
        <img src="../assets/skill-tree.png" alt="Skill Tree" style="min-width:900px">
      </div>
      -->
    </div>
  </main>

  <div data-include="../partials/footer.html"></div>
  <script src="../js/include.js"></script>
</body></html>
""",

    ("pages", "writing.html"): r"""<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Writing · Your Name</title>
<link rel="stylesheet" href="../css/theme.css"/>
</head><body>
  <div data-include="../partials/header.html"></div>

  <main class="section" id="writing">
    <div class="wrap">
      <h2>Writing</h2>
      <article class="post panel" style="padding:20px">
        <h4>Post Title</h4>
        <div class="meta" style="color:var(--muted);font-size:.9rem;margin-bottom:.6rem">2025-05-01 · tags: design, frontend</div>
        <p>Intro paragraph or excerpt.</p>
        <pre><code>// Sample code
function hello(){ console.log('world') }
</code></pre>
      </article>
    </div>
  </main>

  <div data-include="../partials/footer.html"></div>
  <script src="../js/include.js"></script>
</body></html>
""",

    ("pages", "contact.html"): r"""<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Contact · Your Name</title>
<link rel="stylesheet" href="../css/theme.css"/>
</head><body>
  <div data-include="../partials/header.html"></div>

  <main class="section" id="contact">
    <div class="wrap grid" style="grid-template-columns:1.2fr .8fr">
      <div class="panel" style="padding:20px">
        <h2>Contact</h2>
        <p class="muted">Open for collaboration:</p>
        <p>
          <a href="mailto:yourname@example.com">yourname@example.com</a> ·
          <a href="https://x.com/yourid" target="_blank" rel="noopener">X</a> ·
          <a href="https://www.linkedin.com/in/yourid" target="_blank" rel="noopener">LinkedIn</a> ·
          <a href="https://www.instagram.com/yourid" target="_blank" rel="noopener">Instagram</a>
        </p>
        <form action="https://formspree.io/f/your-id" method="POST" class="grid" style="grid-template-columns:1fr 1fr">
          <input class="panel" style="padding:12px" type="text" name="name" placeholder="Your name" required>
          <input class="panel" style="padding:12px" type="email" name="email" placeholder="Your email" required>
          <textarea class="panel" style="padding:12px; grid-column:1/3" rows="5" name="message" placeholder="Your message…" required></textarea>
          <button class="btn" style="grid-column:1/3">Send</button>
        </form>
      </div>
      <div class="panel" style="padding:20px">
        <h3>Card / QR</h3>
        <img src="../assets/card.svg" alt="Card or QR">
      </div>
    </div>
  </main>

  <div data-include="../partials/footer.html"></div>
  <script src="../js/include.js"></script>
</body></html>
""",
}

# ---------- Helper: placeholder SVG ----------
def svg(text, w=1200, h=800, bg="#1a1230", fg="#c53bff"):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
  <rect width="100%" height="100%" fill="{bg}"/>
  <g>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
          font-size="{min(w,h)//10}" font-family="Arial, sans-serif"
          fill="{fg}">{text}</text>
  </g>
</svg>
"""

ASSETS = {
    "avatar.svg": svg("Avatar", 800, 800),
    "p1-cover.svg": svg("Project Cover", 1200, 800),
    "g1-thumb.svg": svg("Gallery Thumb", 800, 600),
    "g1-large.svg": svg("Gallery Large", 1600, 1000),
    "card.svg": svg("Card / QR", 1000, 600),
    # Optional static map for skill tree:
    "skill-tree.png": "",  # leave empty placeholder file (you can replace with real PNG)
}

def main():
    # create directories
    for path in [
        BASE,
        os.path.join(BASE, "css"),
        os.path.join(BASE, "js"),
        os.path.join(BASE, "partials"),
        os.path.join(BASE, "pages"),
        os.path.join(BASE, "assets"),
    ]:
        os.makedirs(path, exist_ok=True)

    # write text files
    for (folder, name), content in FILES.items():
        out = os.path.join(BASE, folder, name)
        with open(out, "w", encoding="utf-8") as f:
            f.write(content)

    # write assets
    for name, content in ASSETS.items():
        out = os.path.join(BASE, "assets", name)
        mode = "wb" if name.endswith(".png") else "w"
        with open(out, mode) as f:
            if name.endswith(".png"):
                # create an empty file as placeholder
                pass
            else:
                f.write(content)

    # root README
    with open(os.path.join(BASE, "README.md"), "w", encoding="utf-8") as f:
        f.write(
            "# Portfolio (Multi-page)\n\n"
            "- Open `pages/hero.html` to start.\n"
            "- Navigation uses **relative links** like `./about.html`.\n"
            "- Partials are included via `../partials/header.html` and `../partials/footer.html`.\n"
            "- Replace assets in `assets/` and texts in `pages/*.html`.\n"
        )

    print(f"Done! Generated: ./{BASE}")
    print("Open ./portfolio-multipage/pages/hero.html in your browser.")

if __name__ == "__main__":
    main()
