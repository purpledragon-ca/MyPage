(function(){
    // 相对 skilltree.html 的路径；用 baseURI 解析成绝对地址，避免相对路径迷惑
    const REL_MD_URL = "F:\\Work\\my_project_page\\data\\skilltree.md";
    const MD_URL = new URL(REL_MD_URL, document.baseURI).href;
  
    const rootEl = document.getElementById("skilltree-root");
    if (!rootEl) return;
  
    rootEl.textContent = `Loading markdown from: ${MD_URL}`;
  
    const newNode = (label) => ({ label, children: [] });
    const normTabs = (s) => s.replace(/\t/g, "  "); // tab -> 2 spaces
  
    async function loadMarkdown(){
      try {
        const r = await fetch(MD_URL, { cache: "no-store" });
        if (!r.ok) {
          throw new Error(`HTTP ${r.status} ${r.statusText}`);
        }
        return await r.text();
      } catch (err) {
        // 尝试内联回退：<script type="text/markdown" id="skilltree-md">...</script>
        const inline = document.getElementById("skilltree-md");
        if (inline) {
          console.warn("[skilltree] fetch 失败，使用内联 markdown 回退：", err);
          return inline.textContent;
        }
        throw err;
      }
    }
  
    function parse(md){
      const lines = normTabs(md).split(/\r?\n/).map(l => l.replace(/\s+$/,""));
      const sections = [];
      let current = null;
      let stack = [];
  
      for (const line of lines) {
        if (!line.trim()) continue;
  
        const h = line.match(/^#\s+(.+)$/);
        if (h) {
          current = { title: h[1].trim(), root: newNode("__root__") };
          sections.push(current);
          stack = [ current.root ];
          continue;
        }
  
        const m = line.match(/^(\s*)-\s+(.+)$/);
        if (m && current) {
          const indent = m[1].length;
          const label = m[2].trim();
          const level = Math.floor(indent / 2) + 1;
  
          while (stack.length > level) stack.pop();
          while (stack.length < level) stack.push(stack[stack.length - 1]); // 防御
  
          const parent = stack[stack.length - 1];
          const node = newNode(label);
          parent.children.push(node);
          stack.push(node);
        }
      }
      return sections;
    }
  
    function renderTree(node){
      const ul = document.createElement("ul");
      ul.className = "tree";
      (node.children || []).forEach(child => ul.appendChild(renderNode(child)));
      return ul;
    }
  
    function renderNode(node){
      const li = document.createElement("li");
      const span = document.createElement("span");
      span.className = "node";
      span.textContent = node.label;
      li.appendChild(span);
  
      if (node.children && node.children.length) {
        const ul = document.createElement("ul");
        node.children.forEach(ch => ul.appendChild(renderNode(ch)));
        li.appendChild(ul);
      }
      return li;
    }
  
    async function main(){
      try{
        const md = await loadMarkdown();
        const sections = parse(md);
  
        rootEl.innerHTML = "";
        if (!sections.length) {
          rootEl.textContent = "Markdown 中未找到任何 # 标题与列表。";
          return;
        }
  
        sections.forEach(sec => {
          const box = document.createElement("div");
          box.className = "section";
          const h2 = document.createElement("h2");
          h2.textContent = sec.title;
          box.appendChild(h2);
          box.appendChild(renderTree(sec.root));
          rootEl.appendChild(box);
        });
      }catch(err){
        console.error("[skilltree] 加载/解析失败：", err);
        rootEl.classList.add("error");
        rootEl.innerHTML = [
          `<div><strong>加载/解析失败</strong></div>`,
          `<div>请求：<code>${MD_URL}</code></div>`,
          `<div>原因：<code>${(err && err.message) || err}</code></div>`,
          `<div style="margin-top:8px;color:#6b7280">常见原因：`,
          `<ul style="margin:6px 0 0 18px">`,
          `<li>用 <code>file://</code> 方式直接打开 HTML（浏览器阻止 fetch 本地文件）。</li>`,
          `<li>路径不对（返回 404）。确认 <code>../data/skilltree.md</code> 是否存在、大小写正确。</li>`,
          `<li>脚本路径错或未加载：检查 <code>&lt;script src="./skilltree.js" defer&gt;</code> 是否能在 Network 里看到 200。</li>`,
          `</ul></div>`
        ].join("");
      }
    }
  
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", main, { once: true });
    } else {
      main();
    }
  })();
  