// projects.js  — Projects 页面筛选脚本
(function () {
  // 小工具：大小写不敏感、去空格
  const norm = (s) => (s || "").toLowerCase().trim();

  // 从 URL 读取 skill（优先 ?skill=，其次 #skill=）
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

  // 将当前 skill 写回 URL（不跳转）
  function writeSkillToURL(val) {
    try {
      const u = new URL(window.location.href);
      if (val) {
        u.searchParams.set("skill", val);
      } else {
        u.searchParams.delete("skill");
      }
      // 不保留 #skill，避免重复表达
      u.hash = "";
      history.replaceState(null, "", u.toString());
    } catch (_) {}
  }

  function setup() {
    // 只在含 .page-projects 的页面运行
    const root = document.querySelector(".page-projects");
    if (!root) return;

    const grid = document.getElementById("pgrid");
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll(".pcard"));
    const levelBtns = Array.from(document.querySelectorAll(".pf-level"));
    const skillLabel = document.querySelector(".pf-skill-current");
    const clearSkillBtn = document.querySelector(".pf-clear-skill");

    // 没有卡片就不继续
    if (!cards.length) return;

    // 状态
    let levelFilter = "all";
    let skillFilter = readSkillFromURL();

    // 核心：应用筛选
    function applyFilters() {
      cards.forEach((card) => {
        const lv = norm(card.dataset.level);
        const skillsAttr = norm(card.dataset.skills);
        const skills = skillsAttr
          ? skillsAttr.split(",").map((s) => s.trim()).filter(Boolean)
          : [];

        const levelOK = levelFilter === "all" || lv === levelFilter;
        const skillOK = !skillFilter || skills.includes(skillFilter);

        card.style.display = levelOK && skillOK ? "" : "none";
      });

      // 按钮选中状态
      levelBtns.forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.level === levelFilter);
      });

      // 技能标签显示与清除按钮
      if (skillFilter) {
        if (skillLabel) skillLabel.textContent = skillFilter;
        if (clearSkillBtn) clearSkillBtn.hidden = false;
      } else {
        if (skillLabel) skillLabel.textContent = "— none —";
        if (clearSkillBtn) clearSkillBtn.hidden = true;
      }
    }

    // 初始化
    applyFilters();

    // 交互：切换难度
    levelBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        levelFilter = btn.dataset.level || "all";
        applyFilters();
      });
    });

    // 交互：清除技能
    clearSkillBtn?.addEventListener("click", () => {
      skillFilter = "";
      writeSkillToURL("");
      applyFilters();
    });

    // 交互：点击网格内的 tag（避免点到难度按钮/清除按钮）
    grid.addEventListener("click", (e) => {
      const t = e.target;
      if (
        t.classList?.contains("chip") &&
        !t.classList.contains("pf-level") &&
        !t.classList.contains("pf-clear-skill")
      ) {
        const val = norm(t.textContent);
        if (val) {
          skillFilter = val;
          writeSkillToURL(val);
          applyFilters();
        }
      }
    });

    // 若地址栏的 skill 被外部脚本改变（极少见），监听 popstate 同步
    window.addEventListener("popstate", () => {
      const s = readSkillFromURL();
      if (s !== skillFilter) {
        skillFilter = s;
        applyFilters();
      }
    });
  }

  // 兼容：若用 <script defer>，DOM 已就绪会直接运行；否则挂 DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
  } else {
    setup();
  }
})();
