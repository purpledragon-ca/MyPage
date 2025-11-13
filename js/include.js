// include.js — safe partial injection implementation
(async function () {
  // Wait until the DOM is ready
  if (document.readyState === "loading") {
    await new Promise(r => document.addEventListener("DOMContentLoaded", r, { once: true }));
  }

  // Take a static snapshot to avoid mutation during iteration
  const placeholders = Array.from(document.querySelectorAll("[data-include]"));
  for (const el of placeholders) {
    const url = el.getAttribute("data-include");
    if (!url) continue;

    try {
      // Resolve to an absolute URL to avoid relative path mistakes per page
      const abs = new URL(url, window.location.href).toString();
      const res = await fetch(abs, { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();

      // Use a template element to convert HTML to nodes, then replace
      const tpl = document.createElement("template");
      tpl.innerHTML = html;

      // Only replace if the element is still connected (avoid parentNode errors)
      if (el.isConnected) {
        // Safer approach: insert before the placeholder, then remove it
        el.insertAdjacentElement?.("beforebegin", tpl.content.firstChild ?? document.createTextNode(""));
        // If template yields multiple root nodes, insert them sequentially
        while (tpl.content.firstChild) {
          el.parentNode.insertBefore(tpl.content.firstChild, el);
        }
        el.remove();
      }
    } catch (err) {
      console.error(`Include failed: ${url}`, err);
      // Optional: render the error inline for easier debugging
      if (el.isConnected) {
        el.outerHTML = `<!-- include failed: ${url} (${err}) -->`;
      }
    }
  }
})();
