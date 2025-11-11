// Inject partials into each page via data-include
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
