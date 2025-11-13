// likes.js - Like functionality for projects and posts (with cumulative counts)
(function() {
  const STORAGE_KEY = 'project_likes_count';
  const USER_LIKES_KEY = 'user_liked_projects'; // Track which projects current user has liked
  
  // Get like counts for all projects: { projectId: count }
  function getLikeCounts() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  }
  
  // Get projects that current user has liked
  function getUserLikes() {
    try {
      const stored = localStorage.getItem(USER_LIKES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }
  
  // Get like count for a specific project
  function getLikeCount(projectId) {
    const counts = getLikeCounts();
    return counts[projectId] || 0;
  }
  
  // Check if current user has liked this project
  function isLiked(projectId) {
    const userLikes = getUserLikes();
    return userLikes.includes(projectId);
  }
  
  // Add a like to a project (increment count)
  function addLike(projectId) {
    const counts = getLikeCounts();
    const currentCount = counts[projectId] || 0;
    counts[projectId] = currentCount + 1;
    
    // Track that current user has liked this project
    const userLikes = getUserLikes();
    if (!userLikes.includes(projectId)) {
      userLikes.push(projectId);
      try {
        localStorage.setItem(USER_LIKES_KEY, JSON.stringify(userLikes));
      } catch (e) {
        console.error('Failed to save user likes:', e);
      }
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
      return counts[projectId];
    } catch (e) {
      console.error('Failed to save like count:', e);
      return currentCount;
    }
  }
  
  // Remove a like from a project (decrement count, but not below 0)
  function removeLike(projectId) {
    const counts = getLikeCounts();
    const currentCount = counts[projectId] || 0;
    if (currentCount > 0) {
      counts[projectId] = currentCount - 1;
    }
    
    // Remove from user likes
    const userLikes = getUserLikes();
    const index = userLikes.indexOf(projectId);
    if (index > -1) {
      userLikes.splice(index, 1);
      try {
        localStorage.setItem(USER_LIKES_KEY, JSON.stringify(userLikes));
      } catch (e) {
        console.error('Failed to save user likes:', e);
      }
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
      return counts[projectId] || 0;
    } catch (e) {
      console.error('Failed to save like count:', e);
      return currentCount;
    }
  }
  
  // Toggle like: if user hasn't liked, add like; if already liked, remove like
  function toggleLike(projectId) {
    const userLiked = isLiked(projectId);
    if (userLiked) {
      return removeLike(projectId);
    } else {
      return addLike(projectId);
    }
  }
  
  // Update like button UI
  function updateLikeButton(button, projectId) {
    const userLiked = isLiked(projectId);
    const count = getLikeCount(projectId);
    
    button.classList.toggle('liked', userLiked);
    button.setAttribute('aria-pressed', userLiked);
    
    // Update icon
    const icon = button.querySelector('.like-icon');
    if (icon) {
      icon.textContent = userLiked ? '❤️' : '🤍';
    }
    
    // Update count display
    let countEl = button.querySelector('.like-count');
    if (!countEl) {
      countEl = document.createElement('span');
      countEl.className = 'like-count';
      if (icon && icon.nextSibling) {
        button.insertBefore(countEl, icon.nextSibling);
      } else {
        button.appendChild(countEl);
      }
    }
    countEl.textContent = count > 0 ? count : '';
    
    // Update button title/aria-label
    button.setAttribute('aria-label', `Like this project (${count} likes)`);
  }
  
  // Create a like button element
  function createLikeButton(projectId, showCount = true) {
    const button = document.createElement('button');
    button.className = 'like-btn chip';
    button.setAttribute('data-project-id', projectId);
    
    const icon = document.createElement('span');
    icon.className = 'like-icon';
    button.appendChild(icon);
    
    // Always show count
    const count = document.createElement('span');
    count.className = 'like-count';
    button.appendChild(count);
    
    // Add click handler
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const newCount = toggleLike(projectId);
      updateLikeButton(button, projectId);
      
      // Dispatch event for other pages to sync
      window.dispatchEvent(new CustomEvent('likeChanged', {
        detail: { projectId, count: newCount }
      }));
    });
    
    updateLikeButton(button, projectId);
    return button;
  }
  
  // Initialize like buttons on page load
  function initLikeButtons() {
    // Find all like buttons and update them
    document.querySelectorAll('.like-btn[data-project-id]').forEach(button => {
      const projectId = button.getAttribute('data-project-id');
      if (projectId) {
        updateLikeButton(button, projectId);
      }
    });
    
    // Initialize like button containers that don't have buttons yet
    document.querySelectorAll('[data-like-container="true"]').forEach(container => {
      const projectId = container.getAttribute('data-project-id');
      if (projectId && !container.querySelector('.like-btn')) {
        const likeBtn = createLikeButton(projectId);
        container.innerHTML = '';
        container.appendChild(likeBtn);
      }
    });
  }
  
  // Listen for like changes from other tabs/pages
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY || e.key === USER_LIKES_KEY) {
      initLikeButtons();
    }
  });
  
  // Listen for custom likeChanged events
  window.addEventListener('likeChanged', () => {
    initLikeButtons();
  });
  
  // Expose API
  window.Likes = {
    isLiked,
    getLikeCount,
    getLikeCounts,
    toggleLike,
    addLike,
    removeLike,
    createLikeButton,
    updateLikeButton,
    initLikeButtons
  };
  
  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLikeButtons);
  } else {
    initLikeButtons();
  }
})();

