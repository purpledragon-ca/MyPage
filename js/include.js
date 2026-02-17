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

      // Extract any <script> tags so we can execute them explicitly
      const wrapper = document.createElement("div");
      wrapper.innerHTML = html;
      const scriptNodes = Array.from(wrapper.querySelectorAll("script"));
      scriptNodes.forEach(s => s.parentNode && s.parentNode.removeChild(s));

      // Use a template element to convert remaining HTML (without scripts) to nodes, then replace
      const tpl = document.createElement("template");
      tpl.innerHTML = wrapper.innerHTML;

      // Only replace if the element is still connected (avoid parentNode errors)
      if (el.isConnected) {
        // Insert all nodes from the template before the placeholder
        while (tpl.content.firstChild) {
          el.parentNode.insertBefore(tpl.content.firstChild, el);
        }
        el.remove();
      }

      // Execute extracted scripts in order (inline and external)
      scriptNodes.forEach(orig => {
        const s = document.createElement("script");
        // Copy attributes (type, async, defer, etc.)
        for (const attr of orig.attributes) {
          if (attr.name === "src") continue; // handle src separately
          s.setAttribute(attr.name, attr.value);
        }
        if (orig.src) {
          s.src = orig.src;
        } else {
          s.textContent = orig.textContent || "";
        }
        // Append to body so it executes
        document.body.appendChild(s);
      });
    } catch (err) {
      console.error(`Include failed: ${url}`, err);
      // Optional: render the error inline for easier debugging
      if (el.isConnected) {
        el.outerHTML = `<!-- include failed: ${url} (${err}) -->`;
      }
    }
  }
})();
