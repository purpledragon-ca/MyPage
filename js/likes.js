// likes.js - Like functionality for projects and posts (with Firebase cloud sync)
(function() {
  const STORAGE_KEY = 'project_likes_count';
  const USER_LIKES_KEY = 'user_liked_projects';
  
  let db = null;
  let isFirebaseReady = false;
  
  // Initialize Firebase
  async function initFirebase() {
    try {
      if (typeof firebase === 'undefined' || !window.firebaseConfig) {
        console.warn('Firebase not loaded, using localStorage only');
        
        // Dispatch event so UI can update with local data
        window.dispatchEvent(new CustomEvent('cloudDataLoaded', {
          detail: { count: 0, error: true, reason: 'Firebase SDK not loaded' }
        }));
        
        return false;
      }
      
      // Initialize Firebase app
      if (!firebase.apps || firebase.apps.length === 0) {
        firebase.initializeApp(window.firebaseConfig);
      }
      
      // Get Firestore instance
      db = firebase.firestore();
      
      // Enable offline persistence
      try {
        await db.enablePersistence({ synchronizeTabs: true });
        console.log('✅ Firebase persistence enabled');
      } catch (err) {
        if (err.code === 'failed-precondition') {
          console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
          console.warn('Browser doesn\'t support persistence');
        }
      }
      
      isFirebaseReady = true;
      console.log('✅ Firebase initialized successfully');
      
      // Load existing cloud data first
      await loadCloudData();
      
      // Sync local data to cloud on first load
      await syncLocalToCloud();
      
      // Listen for real-time updates
      listenToCloudUpdates();
      
      return true;
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      
      // Still dispatch event so UI can update with local data
      window.dispatchEvent(new CustomEvent('cloudDataLoaded', {
        detail: { count: 0, error: true }
      }));
      
      return false;
    }
  }
  
  // Load all existing cloud data on initialization
  async function loadCloudData() {
    if (!isFirebaseReady) return;
    
    try {
      console.log('📥 Loading existing likes from cloud...');
      const snapshot = await db.collection('likes').get();
      
      let loadedCount = 0;
      snapshot.forEach((doc) => {
        const projectId = doc.id;
        const data = doc.data();
        const count = data.count || 0;
        
        // Update local cache
        updateLocalCount(projectId, count);
        loadedCount++;
      });
      
      console.log(`✅ Loaded ${loadedCount} projects' likes from cloud`);
      
      // Dispatch event to notify UI that cloud data is loaded
      window.dispatchEvent(new CustomEvent('cloudDataLoaded', {
        detail: { count: loadedCount }
      }));
    } catch (error) {
      console.error('Failed to load cloud data:', error);
    }
  }
  
  // Sync local storage data to cloud (one-time migration)
  async function syncLocalToCloud() {
    if (!isFirebaseReady) return;
    
    try {
      const localCounts = getLikeCountsFromLocal();
      
      for (const [projectId, count] of Object.entries(localCounts)) {
        if (count > 0) {
          const docRef = db.collection('likes').doc(projectId);
          const doc = await docRef.get();
          
          if (!doc.exists) {
            // If no cloud data, upload local data
            await docRef.set({ count: count, lastUpdated: firebase.firestore.FieldValue.serverTimestamp() });
            console.log(`Synced ${projectId}: ${count} likes to cloud`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to sync local to cloud:', error);
    }
  }
  
  // Listen for real-time updates from cloud
  function listenToCloudUpdates() {
    if (!isFirebaseReady) return;
    
    try {
      db.collection('likes').onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified') {
            const projectId = change.doc.id;
            const data = change.doc.data();
            updateLocalCount(projectId, data.count || 0);
            
            // Update UI
            updateAllButtonsForProject(projectId);
          }
        });
      }, (error) => {
        console.error('Error listening to updates:', error);
      });
    } catch (error) {
      console.error('Failed to setup listener:', error);
    }
  }
  
  // Update local storage count
  function updateLocalCount(projectId, count) {
    const counts = getLikeCountsFromLocal();
    counts[projectId] = count;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
    } catch (e) {
      console.error('Failed to update local count:', e);
    }
  }
  
  // Update all like buttons for a specific project
  function updateAllButtonsForProject(projectId) {
    document.querySelectorAll(`.like-btn[data-project-id="${projectId}"]`).forEach(button => {
      updateLikeButton(button, projectId);
    });
  }
  
  // Get like counts from localStorage
  function getLikeCountsFromLocal() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  }
  
  // Get like counts (from local cache)
  function getLikeCounts() {
    return getLikeCountsFromLocal();
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
  
  // Add a like to a project (increment count) - Cloud version
  async function addLike(projectId) {
    // Update user likes locally
    const userLikes = getUserLikes();
    if (!userLikes.includes(projectId)) {
      userLikes.push(projectId);
      try {
        localStorage.setItem(USER_LIKES_KEY, JSON.stringify(userLikes));
      } catch (e) {
        console.error('Failed to save user likes:', e);
      }
    }
    
    // Update count in cloud or locally
    if (isFirebaseReady && db) {
      try {
        const docRef = db.collection('likes').doc(projectId);
        await docRef.set({
          count: firebase.firestore.FieldValue.increment(1),
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        // Get updated count
        const doc = await docRef.get();
        const newCount = doc.exists ? (doc.data().count || 0) : 0;
        updateLocalCount(projectId, newCount);
        return newCount;
      } catch (error) {
        console.error('Failed to add like to cloud:', error);
        // Fallback to local
        return addLikeLocal(projectId);
      }
    } else {
      // Use local storage
      return addLikeLocal(projectId);
    }
  }
  
  // Add like locally (fallback)
  function addLikeLocal(projectId) {
    const counts = getLikeCountsFromLocal();
    const currentCount = counts[projectId] || 0;
    counts[projectId] = currentCount + 1;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
      return counts[projectId];
    } catch (e) {
      console.error('Failed to save like count:', e);
      return currentCount;
    }
  }
  
  // Remove a like from a project (decrement count, but not below 0) - Cloud version
  async function removeLike(projectId) {
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
    
    // Update count in cloud or locally
    if (isFirebaseReady && db) {
      try {
        const docRef = db.collection('likes').doc(projectId);
        const doc = await docRef.get();
        const currentCount = doc.exists ? (doc.data().count || 0) : 0;
        
        if (currentCount > 0) {
          await docRef.set({
            count: firebase.firestore.FieldValue.increment(-1),
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        }
        
        // Get updated count
        const updatedDoc = await docRef.get();
        const newCount = updatedDoc.exists ? (updatedDoc.data().count || 0) : 0;
        updateLocalCount(projectId, newCount);
        return newCount;
      } catch (error) {
        console.error('Failed to remove like from cloud:', error);
        // Fallback to local
        return removeLikeLocal(projectId);
      }
    } else {
      // Use local storage
      return removeLikeLocal(projectId);
    }
  }
  
  // Remove like locally (fallback)
  function removeLikeLocal(projectId) {
    const counts = getLikeCountsFromLocal();
    const currentCount = counts[projectId] || 0;
    if (currentCount > 0) {
      counts[projectId] = currentCount - 1;
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
  async function toggleLike(projectId) {
    const userLiked = isLiked(projectId);
    if (userLiked) {
      return await removeLike(projectId);
    } else {
      return await addLike(projectId);
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
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Disable button during update
      button.disabled = true;
      
      try {
        const newCount = await toggleLike(projectId);
        updateLikeButton(button, projectId);
        
        // Dispatch event for other components to sync
        window.dispatchEvent(new CustomEvent('likeChanged', {
          detail: { projectId, count: newCount }
        }));
      } catch (error) {
        console.error('Failed to toggle like:', error);
      } finally {
        button.disabled = false;
      }
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
  
  // Listen for like changes from other tabs/pages (localStorage sync)
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
    initLikeButtons,
    initFirebase
  };
  
  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
      await initFirebase();
      initLikeButtons();
    });
  } else {
    (async () => {
      await initFirebase();
      initLikeButtons();
    })();
  }
})();
