// projects.js — Projects page filtering script
(function () {
  // Helper: case-insensitive, trim whitespace
  const norm = (s) => (s || "").toLowerCase().trim();

  // Read skill from URL (?skill= first, fallback to #skill=)
  function readSkillFromURL() {
    try {
      const u = new URL(window.location.href);
      const byQuery = u.searchParams.get("skill");
      if (byQuery) return norm(byQuery);
      const hash = (u.hash || "").replace(/^#/, "");
      const [k, v] = hash.split("=");
      if (k === "skill" && v) return norm(v);
    } catch (_) {}
    return "";
  }

  // Write current skill back to URL (without navigating)
  function writeSkillToURL(val) {
    try {
      const u = new URL(window.location.href);
      if (val) {
        u.searchParams.set("skill", val);
      } else {
        u.searchParams.delete("skill");
      }
      u.hash = "";
      history.replaceState(null, "", u.toString());
    } catch (_) {}
  }

  // Global state
  let isSetup = false;
  let levelFilter = "all";
  let skillFilter = "";
  let grid = null;
  let levelBtns = [];
  let skillLabel = null;
  let clearSkillBtn = null;

  // Apply filters
  function applyFilters() {
    if (!grid) return;
    
    // Re-fetch card list each time because cards are loaded dynamically
    const cards = Array.from(grid.querySelectorAll(".pcard"));
    
    if (!cards.length) {
      console.log("No cards found");
      return;
    }

    console.log(`Applying filters: level=${levelFilter}, skill=${skillFilter}, cards=${cards.length}`);

    cards.forEach((card) => {
      const lv = norm(card.dataset.level || "");
      const skillsAttr = norm(card.dataset.skills || "");
      const skills = skillsAttr
        ? skillsAttr.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const levelOK = levelFilter === "all" || lv === levelFilter;
      const skillOK = !skillFilter || skills.includes(skillFilter);

      card.style.display = levelOK && skillOK ? "" : "none";
    });

    // Update button active state
    levelBtns.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.level === levelFilter);
    });

    // Update skill label and clear button visibility
    if (skillFilter) {
      if (skillLabel) skillLabel.textContent = skillFilter;
      if (clearSkillBtn) clearSkillBtn.hidden = false;
    } else {
      if (skillLabel) skillLabel.textContent = "— none —";
      if (clearSkillBtn) clearSkillBtn.hidden = true;
    }
  }

  // Bind button events immediately (do not wait for project load)
  function bindButtons() {
    // Run only on pages with .page-projects
    const root = document.querySelector(".page-projects");
    if (!root) return;

    levelBtns = Array.from(document.querySelectorAll(".pf-level"));
    skillLabel = document.querySelector(".pf-skill-current");
    clearSkillBtn = document.querySelector(".pf-clear-skill");

    if (!levelBtns.length) {
      console.log("Level buttons not found, will retry...");
      return;
    }

    console.log(`Found ${levelBtns.length} level buttons, binding events...`);

    // Bind level button events (only once)
    levelBtns.forEach((btn) => {
      // Skip if this button already has a handler (flagged via dataset)
      if (btn.dataset.bound === 'true') return;
      
      btn.dataset.bound = 'true';
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        levelFilter = btn.dataset.level || "all";
        console.log("Level filter changed to:", levelFilter);
        applyFilters();
      });
    });

    // Bind clear-skill button event
    if (clearSkillBtn && !clearSkillBtn.dataset.bound) {
      clearSkillBtn.dataset.bound = 'true';
      clearSkillBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        skillFilter = "";
        writeSkillToURL("");
        console.log("Skill filter cleared");
        applyFilters();
      });
    }
  }

  function setup() {
    // Prevent repeated initialization
    if (isSetup) {
      console.log("Already setup, skipping");
      return;
    }
    
    // Run only on pages with .page-projects
    const root = document.querySelector(".page-projects");
    if (!root) {
      console.log("Not projects page");
      return;
    }

    grid = document.getElementById("pgrid");
    if (!grid) {
      console.log("Grid not found");
      return;
    }

    // Ensure buttons are bound
    bindButtons();

    // Initialize filter state
    levelFilter = "all";
    skillFilter = readSkillFromURL();

    console.log("Setting up filters...");

    // Bind tag clicks within the grid (event delegation for dynamic cards)
    grid.addEventListener("click", (e) => {
      const t = e.target;
      if (
        t.classList?.contains("chip") &&
        !t.classList.contains("pf-level") &&
        !t.classList.contains("pf-clear-skill")
      ) {
        e.stopPropagation();
        const val = norm(t.textContent);
        if (val) {
          skillFilter = val;
          writeSkillToURL(val);
          console.log("Skill filter changed to:", skillFilter);
          applyFilters();
        }
      }
    });

    // React to URL changes via popstate
    window.addEventListener("popstate", () => {
      const s = readSkillFromURL();
      if (s !== skillFilter) {
        skillFilter = s;
        applyFilters();
      }
    });

    // Mark setup as complete
    isSetup = true;

    // Apply filters shortly after to ensure cards are present
    setTimeout(() => {
      applyFilters();
    }, 300);
  }

  // Initialization entry point
  function init() {
    const root = document.querySelector(".page-projects");
    if (!root) return;

    console.log("Initializing projects filter...");

    // Bind button events right away (no need to wait for projects)
    function tryBindButtons() {
      bindButtons();
      // Retry shortly if buttons are not yet in the DOM
      if (levelBtns.length === 0) {
        setTimeout(tryBindButtons, 100);
      }
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        tryBindButtons();
      }, { once: true });
    } else {
      tryBindButtons();
    }

    // Listen for projectsLoaded (capturing to ensure delivery)
    window.addEventListener('projectsLoaded', (e) => {
      console.log("Projects loaded event received", e.detail);
      setTimeout(setup, 150);
    }, { once: true, capture: true });
    
    // Fallback: if cards already exist, ensure setup runs
    function checkAndSetup() {
      const cards = document.querySelectorAll('.pcard');
      if (cards.length > 0 && !isSetup) {
        console.log(`Found ${cards.length} cards, setting up...`);
        setup();
      }
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        setTimeout(checkAndSetup, 600);
      }, { once: true });
    } else {
      setTimeout(checkAndSetup, 600);
    }
  }
  
  init();
})();
