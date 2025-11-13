# Portfolio (Multi-page)

- Open `pages/hero.html` to start.
- Navigation uses **relative links** like `./about.html`.
- Partials are included via `../partials/header.html` and `../partials/footer.html`.
- Replace assets in `assets/` and texts in `pages/*.html`.

## Quick Start

### Local Development
1. Run build scripts to generate manifests:
   ```bash
   python build_projects_manifest.py
   python build_posts_manifest.py
   ```
2. Open `pages/hero.html` in your browser.

### Deploy to GitHub

Simply run:
```bash
python update_to_github.py -c "your commit message"
```

This script will:
1. ✅ Automatically build `_projects/manifest.json`
2. ✅ Automatically build `_posts/manifest.json`
3. ✅ Stage all changes
4. ✅ Commit with your message
5. ✅ Push to GitHub

GitHub Actions will automatically:
- Build the manifests
- Deploy to GitHub Pages
- Update your website

### GitHub Pages Setup

1. Go to your repository Settings → Pages
2. Set Source to "GitHub Actions"
3. The workflow will automatically deploy on every push to `main` branch

## Project Structure

- `_projects/` - Project markdown files with front-matter
- `_posts/` - Blog post markdown files
- `pages/` - HTML pages
- `css/` - Stylesheets
- `js/` - JavaScript files
- `assets/` - Images and other assets

## TODO

- 增加CV页
- 增加tools页