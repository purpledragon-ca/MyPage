// load_projects.js - Load projects from manifest.json and render cards
(async function() {
  const grid = document.getElementById('pgrid');
  if (!grid) return;

  try {
    // Load manifest.json - try multiple paths for GitHub Pages compatibility
    const paths = [
      '../_projects/manifest.json',  // From pages/ directory
      './_projects/manifest.json',   // From root
      '/_projects/manifest.json'     // Absolute path
    ];
    
    let manifest = null;
    let lastError = null;
    
    for (const path of paths) {
      try {
        const response = await fetch(path, { cache: 'no-store' });
        if (response.ok) {
          manifest = await response.json();
          break;
        }
      } catch (e) {
        lastError = e;
        continue;
      }
    }
    
    if (!manifest) {
      throw new Error(`Failed to load manifest.json. Tried: ${paths.join(', ')}`);
    }

    if (!manifest.projects || manifest.projects.length === 0) {
      grid.innerHTML = '<p class="muted">No projects found. Run <code>python build_projects_manifest.py</code> to generate the manifest.</p>';
      return;
    }

    // Clear loading message
    grid.innerHTML = '';

    // Level mapping for display
    const levelMap = {
      'junior': 'Beginner',
      'mid': 'Mid',
      'advanced': 'Advanced'
    };

    // Render each project card
    manifest.projects.forEach(project => {
      const article = document.createElement('article');
      article.className = 'pcard panel';
      article.setAttribute('data-level', project.level);
      article.setAttribute('data-skills', project.skills);

      // Create link wrapper
      const link = document.createElement('a');
      link.className = 'pcard-link';
      link.href = `./project_page.html?id=${project.id}`;
      link.setAttribute('aria-label', `Open ${project.title}`);

      // Cover image
      const img = document.createElement('img');
      img.className = 'pc-thumb';
      // Handle cover path: same logic as project_page.html
      // If absolute path (starts with /) or protocol-relative, use as-is
      // Otherwise, treat as relative to project directory
      if (!project.cover) {
        img.src = ''; // No cover image
      } else if (/^(https?:)?\/\//i.test(project.cover)) {
        // Absolute URL or protocol-relative
        img.src = project.cover;
      } else if (project.cover.startsWith('/')) {
        // Site-root path
        img.src = project.cover;
      } else {
        // Relative path: prepend project directory path
        img.src = `/_projects/${project.id}/${project.cover.replace(/^\.\//, '')}`;
      }
      img.alt = `${project.title} cover`;
      img.loading = 'lazy';
      link.appendChild(img);

      // Card body
      const body = document.createElement('div');
      body.className = 'pc-body';

      // Title
      const title = document.createElement('h3');
      title.className = 'pc-title';
      title.textContent = project.title;
      body.appendChild(title);

      // Description
      const desc = document.createElement('p');
      desc.className = 'pc-desc';
      desc.textContent = project.description || '';
      body.appendChild(desc);

      // Tags
      const tagsDiv = document.createElement('div');
      tagsDiv.className = 'tags';

      // Level chip
      const levelChip = document.createElement('span');
      levelChip.className = 'chip';
      levelChip.textContent = levelMap[project.level] || project.level;
      tagsDiv.appendChild(levelChip);

      // Tag chips
      if (Array.isArray(project.tags)) {
        project.tags.forEach(tag => {
          const tagChip = document.createElement('span');
          tagChip.className = 'chip';
          tagChip.textContent = tag;
          tagsDiv.appendChild(tagChip);
        });
      }

      body.appendChild(tagsDiv);
      link.appendChild(body);
      article.appendChild(link);
      
      // Add like button container (outside the link to prevent navigation)
      const likeContainer = document.createElement('div');
      likeContainer.style.marginTop = '8px';
      likeContainer.style.padding = '0 16px 16px 16px';
      likeContainer.setAttribute('data-project-id', project.id);
      likeContainer.setAttribute('data-like-container', 'true');
      article.appendChild(likeContainer);
      
      // Create like button when Likes API is available
      function addLikeButton() {
        if (window.Likes && window.Likes.createLikeButton) {
          const likeBtn = window.Likes.createLikeButton(project.id);
          likeContainer.innerHTML = '';
          likeContainer.appendChild(likeBtn);
        } else {
          // Retry if Likes not yet loaded
          setTimeout(addLikeButton, 50);
        }
      }
      addLikeButton();
      grid.appendChild(article);
    });

    // Trigger filter setup after cards are loaded
    // Wait a bit for DOM to update, then trigger projects.js filter setup
    console.log(`Loaded ${manifest.projects.length} projects, dispatching event...`);
    setTimeout(() => {
      const event = new CustomEvent('projectsLoaded', { 
        detail: { count: manifest.projects.length },
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(event);
      console.log('projectsLoaded event dispatched');
    }, 200);

  } catch (error) {
    console.error('Failed to load projects:', error);
    grid.innerHTML = `<p class="muted">Failed to load projects: ${error.message}. Make sure to run <code>python build_projects_manifest.py</code> first.</p>`;
  }
})();

