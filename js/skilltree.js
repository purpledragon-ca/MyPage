(function(){
  const PROJECTS_URL = "projects.html"; // Change here if Projects page path differs
  const columnsEl = document.getElementById('st-columns');
  const searchEl = document.getElementById('st-search');
  const btnExpand = document.getElementById('st-expand');
  const btnCollapse = document.getElementById('st-collapse');
  const btnClear = document.getElementById('st-clear');

  const mdEl = document.getElementById('skilltree-md');
  const normTabs = s => s.replace(/\t/g,'  ');
  const norm = s => (s||'').toLowerCase().trim();
  const isLevel = label => {
    const t = norm(label);
    if (t === 'beginner') return 'begin';
    if (t === 'intermedia' || t === 'intermediate') return 'mid';
    if (t === 'advanced') return 'adv';
    if (t === 'expert') return 'exp';
    return null;
  };

  const newNode = (label, token=null) => ({ label, token, children:[] });

  function parse(md){
    const lines = normTabs(md).split(/\r?\n/).map(l=>l.replace(/\s+$/,''));
    const sections = []; // [{title, root}]
    let current = null;
    let stack = [];
    for(const line of lines){
      if(!line.trim()) continue;
      const h = line.match(/^#\s+(.+)$/);
      if(h){
        current = { title: h[1].trim(), root: newNode('__root__') };
        sections.push(current);
        stack = [ current.root ];
        continue;
      }
      const m = line.match(/^(\s*)-\s+(.+)$/);
      if(m && current){
        const indent = m[1].length;
        let text = m[2].trim();
        let label = text, token = null;
        const tk = text.match(/\[(.+?)\]\s*$/);
        if (tk){ token = tk[1].trim(); label = text.replace(/\[(.+?)\]\s*$/,'').trim(); }
        const level = Math.floor(indent/2) + 1; // Each two spaces adds a depth level
        while(stack.length > level) stack.pop();
        while(stack.length < level) stack.push(stack[stack.length-1]); // Defensive guard
        const parent = stack[stack.length-1];
        const node = newNode(label, token);
        parent.children.push(node);
        stack.push(node);
      }
    }
    return sections;
  }

  function gotoProjects(token){
    if(!token) return;
    const url = new URL(PROJECTS_URL, location.href);
    url.searchParams.set('skill', norm(token));
    location.href = url.toString();
  }

  // Render an entire tree
  function renderTree(rootNode){
    const ul = document.createElement('ul');
    ul.className = 'tree';
    (rootNode.children||[]).forEach(ch => ul.appendChild(renderNode(ch)));
    return ul;
  }

  function renderNode(node){
    const li = document.createElement('li');
    li.className = 'li';
    li.dataset.label = node.label.toLowerCase();

    if(!node.children || node.children.length===0){
      // Leaf node: render as a button
      const btn = document.createElement('button');
      btn.className = 'leaf';
      btn.type = 'button';
      btn.textContent = node.label;
      const token = node.token || node.label;
      btn.addEventListener('click', ()=>gotoProjects(token));
      btn.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){ e.preventDefault(); gotoProjects(token);} });
      btn.setAttribute('aria-label','查看项目：'+node.label);
      li.appendChild(btn);
      return li;
    }

    // Branch node: collapsible section
    const head = document.createElement('span');
    head.className = 'node branch';
    head.innerHTML = `
      <svg class="caret" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l8 7-8 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span class="lbl"></span>
    `;
    head.querySelector('.lbl').textContent = node.label;

    // Level badge
    const lv = isLevel(node.label);
    if(lv){
      const badge = document.createElement('span');
      badge.className = 'badge '+(
        lv==='begin' ? 'lv-begin' : lv==='mid' ? 'lv-mid' : lv==='adv' ? 'lv-adv' : 'lv-exp'
      );
      badge.textContent = node.label;
      head.querySelector('.lbl').textContent = ''; // Replace label text with badge
      head.appendChild(badge);
    }

    head.setAttribute('role','button');
    head.setAttribute('tabindex','0');
    head.setAttribute('aria-expanded','false');

    const childUL = document.createElement('ul');
    node.children.forEach(c=> childUL.appendChild(renderNode(c)));

    // Default collapsed state
    li.classList.add('collapsed');

    // Interaction: toggle collapse on click/keyboard
    function toggle(){
      const collapsed = li.classList.toggle('collapsed');
      head.setAttribute('aria-expanded', String(!collapsed));
    }
    head.addEventListener('click', toggle);
    head.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle(); } });

    li.appendChild(head);
    li.appendChild(childUL);
    return li;
  }

  // Render all sections into two-column cards
  function renderSections(sections){
    columnsEl.innerHTML = '';
    sections.forEach(sec=>{
      const card = document.createElement('section');
      card.className = 'card';
      const h2 = document.createElement('h2'); h2.textContent = sec.title;
      card.appendChild(h2);
      card.appendChild(renderTree(sec.root));
      columnsEl.appendChild(card);
    });
  }

  // Search filter: mark matching li as .match, hide unmatched ones, expand ancestors
  function applySearch(q){
    const allLi = columnsEl.querySelectorAll('.li');
    allLi.forEach(li=> li.classList.remove('match','hidden'));
    if(!q){ return; }
    const n = norm(q);
    allLi.forEach(li=>{
      const ok = li.dataset.label.includes(n);
      if(ok){
        li.classList.add('match');
        // Expand ancestor branches
        let p = li.parentElement;
        while(p && p !== columnsEl){
          if(p.tagName==='UL'){ p = p.parentElement; continue; }
          if(p.classList.contains('li')){ p.classList.remove('collapsed'); p = p.parentElement; continue; }
          p = p.parentElement;
        }
      }
    });
    // Hide items that neither match nor contain matching descendants
    allLi.forEach(li=>{
      if(li.classList.contains('match')) return;
      if(li.querySelector('.match')) return;
      li.classList.add('hidden');
    });
  }

  function expandAll(){ columnsEl.querySelectorAll('.li.collapsed').forEach(li=>li.classList.remove('collapsed')); }
  function collapseAll(){ columnsEl.querySelectorAll('.li').forEach(li=>{ if(li.querySelector('ul')) li.classList.add('collapsed'); }); }

  function main(){
    const md = (mdEl && mdEl.textContent) || '';
    const sections = parse(md);
    if(!sections.length){
      columnsEl.innerHTML = '<div class="card"><h2>提示</h2><p>未在 Markdown 中找到 <code># 标题</code> 与列表项。</p></div>';
      return;
    }
    renderSections(sections);

    // Bind toolbar controls
    searchEl.addEventListener('input', e=> applySearch(e.target.value));
    searchEl.addEventListener('keydown', e=>{ if(e.key==='Escape'){ searchEl.value=''; applySearch(''); } });
    btnExpand.addEventListener('click', expandAll);
    btnCollapse.addEventListener('click', collapseAll);
    btnClear.addEventListener('click', ()=>{ searchEl.value=''; applySearch(''); expandAll(); });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', main, {once:true});
  else main();
})();