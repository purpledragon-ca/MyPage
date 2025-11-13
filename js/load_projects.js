// load_projects.js - Load projects from manifest.json and render cards
(async function() {
  const grid = document.getElementById('pgrid');
  if (!grid) return;

  try {
    // Smart path detection based on current page location
    const currentPath = window.location.pathname;
    const basePath = currentPath.includes('/pages/') ? '../' : './';
    
    // Build list of paths to try, ordered by likelihood
    const paths = [];
    
    // If we're in pages/, try relative path first
    if (currentPath.includes('/pages/')) {
      paths.push('../_projects/manifest.json');
      paths.push('../../_projects/manifest.json');
    }
    
    // Always try root-relative paths
    paths.push('./_projects/manifest.json');
    paths.push('_projects/manifest.json');
    
    // Try absolute paths
    paths.push('/_projects/manifest.json');
    
    // Try with base URL
    const baseUrl = window.location.origin;
    paths.push(`${baseUrl}/_projects/manifest.json`);
    
    // Remove duplicates
    const uniquePaths = [...new Set(paths)];
    
    let manifest = null;
    let lastError = null;
    let successfulPath = null;
    
    console.log('🔍 Attempting to load manifest.json...');
    console.log('📍 Current location:', currentPath);
    console.log('🌐 Base URL:', baseUrl);
    console.log('📂 Base path:', basePath);
    console.log('🛤️  Paths to try:', uniquePaths);
    
    for (const path of uniquePaths) {
      try {
        console.log(`  Trying: ${path}`);
        const fullUrl = new URL(path, window.location.href).href;
        console.log(`  Full URL: ${fullUrl}`);
        
        // Add timestamp to bypass cache
        const timestamp = new Date().getTime();
        const urlWithCacheBuster = path.includes('?') 
          ? `${path}&_t=${timestamp}` 
          : `${path}?_t=${timestamp}`;
        
        const response = await fetch(urlWithCacheBuster, { 
          cache: 'no-store',
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        console.log(`  Response status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          manifest = await response.json();
          successfulPath = path;
          console.log(`✅ Successfully loaded from: ${path}`);
          console.log(`📊 Found ${manifest.projects?.length || 0} projects`);
          break;
        } else {
          console.log(`  ❌ Failed: HTTP ${response.status}`);
          // Don't break, continue to next path
        }
      } catch (e) {
        lastError = e;
        console.log(`  ❌ Error: ${e.name} - ${e.message}`);
        // Continue to next path
        continue;
      }
    }
    
    if (!manifest) {
      const errorMsg = `Failed to load manifest.json. Tried: ${paths.join(', ')}. Current path: ${window.location.pathname}`;
      console.error('❌', errorMsg);
      console.error('Last error:', lastError);
      throw new Error(errorMsg);
    }

    if (!manifest.projects || manifest.projects.length === 0) {
      grid.innerHTML = '<p class="muted">No projects found. Run <code>python build_projects_manifest.py</code> to generate the manifest.</p>';
      return;
    }

    // Clear loading message
    grid.innerHTML = '';

    // Level mapping for display with emoji indicators
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

      // Create image container with level badge
      const thumbContainer = document.createElement('div');
      thumbContainer.className = 'pc-thumb-container';

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
      thumbContainer.appendChild(img);

      // Level badge in top-left corner
      const levelBadge = document.createElement('span');
      levelBadge.className = `chip level-badge level-${project.level}`;
      levelBadge.textContent = levelMap[project.level] || project.level;
      thumbContainer.appendChild(levelBadge);

      link.appendChild(thumbContainer);

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

      // Tags (only skill tags, level is now in top-left corner)
      const tagsDiv = document.createElement('div');
      tagsDiv.className = 'tags';

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
  } finally {
    // Clear loading flag
    if (grid) {
      grid.dataset.loading = 'false';
    }
  }
})();

