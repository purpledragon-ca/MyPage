// load_posts.js — Load posts from _posts/manifest.json and render list with search
(function(){
  const list = document.getElementById('post-list');
  const searchInput = document.getElementById('post-search');
  const clearBtn = document.getElementById('post-clear');
  if(!list) return;

  let allPosts = [];
  let q = '';

  function render(posts){
    if(!posts.length){
      list.innerHTML = '<p class="muted">No posts found.</p>';
      return;
    }
    const frag = document.createDocumentFragment();
    posts.forEach(p => {
      const art = document.createElement('article');
      art.className = 'post-card panel';
      art.style.padding = '16px';
      art.innerHTML = `
        <a class="post-link" href="./post_page.html?id=${encodeURIComponent(p.id)}" style="color:inherit;text-decoration:none">
          <h3 style="margin:.2rem 0 .25rem; font-size:1.15rem">${escapeHTML(p.title)}</h3>
          <div class="muted" style="font-size:.9rem;margin-bottom:.5rem">${escapeHTML(p.date)}${renderTags(p.tags)}</div>
          <p class="post-excerpt" style="margin:0;color:var(--muted)">${escapeHTML(p.excerpt || '')}</p>
        </a>
      `;
      frag.appendChild(art);
    });
    list.innerHTML = '';
    list.appendChild(frag);
  }

  function renderTags(tags){
    if(!Array.isArray(tags) || !tags.length) return '';
    return ' · ' + tags.map(t=>`<span class="chip" style="margin-left:6px">${escapeHTML(String(t))}</span>`).join('');
  }

  function escapeHTML(s){
    return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  }

  function apply(){
    const n = q.trim().toLowerCase();
    const filtered = n ? allPosts.filter(p =>
      (p.title||'').toLowerCase().includes(n) ||
      (p.excerpt||'').toLowerCase().includes(n) ||
      (Array.isArray(p.tags) ? p.tags.join(',').toLowerCase().includes(n) : false)
    ) : allPosts.slice();
    // Sort by date desc (manifest already sorted, but keep stable)
    filtered.sort((a,b)=> String(b.date).localeCompare(String(a.date)));
    render(filtered);
  }

  async function load(){
    try{
      // Try multiple paths for GitHub Pages compatibility
      const paths = [
        '../_posts/manifest.json',  // From pages/ directory
        './_posts/manifest.json',   // From root
        '/_posts/manifest.json'     // Absolute path
      ];
      
      let data = null;
      for (const path of paths) {
        try {
          const res = await fetch(path, { cache: 'no-store' });
          if (res.ok) {
            data = await res.json();
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!data) {
        throw new Error('Failed to load manifest.json from any path');
      }
      
      allPosts = Array.isArray(data.posts) ? data.posts : [];
      apply();
    }catch(err){
      console.error('Failed to load posts:', err);
      list.innerHTML = `<p class="muted">Failed to load posts: ${escapeHTML(err.message)}</p>`;
    }
  }

  // Wire search
  if (searchInput){
    searchInput.addEventListener('input', e=>{ q = e.target.value; apply(); });
    searchInput.addEventListener('keydown', e=>{ if(e.key==='Escape'){ searchInput.value=''; q=''; apply(); }});
  }
  if (clearBtn){
    clearBtn.addEventListener('click', ()=>{ q=''; if(searchInput) searchInput.value=''; apply(); });
  }

  // Kick off
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', load, { once:true });
  } else {
    load();
  }
})();
