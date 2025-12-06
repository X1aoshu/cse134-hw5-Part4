(function () {
  const THEME_KEY = "sc-theme";
  const CUSTOM_KEY = "sc-theme-custom";

  const BG_OPTIONS = {
    light: { label: "Light", value: "#f3f4f6" },
    cozy:  { label: "Cozy",  value: "#fef3c7" },
    dark:  { label: "Dark",  value: "#020617" }
  };

  const TEXT_OPTIONS = {
    dark:  { label: "Dark",   value: "#111827" },
    soft:  { label: "Soft",   value: "#4b5563" },
    light: { label: "Light",  value: "#e5e7eb" }
  };

  const FONT_OPTIONS = {
    modern: {
      label: "Modern Sans",
      value: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
    },
    rounded: {
      label: "Rounded",
      value: `"Nunito", "Montserrat", system-ui, sans-serif`
    },
    serif: {
      label: "Serif",
      value: `"Georgia", "Times New Roman", serif`
    }
  };

  function runWithTransition(changeFn) {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        changeFn();
      });
    } else {
      changeFn();
    }
  }

  function getPreferredTheme() {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored) return stored;

    if (window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  function applyBaseTheme(themeName) {
    document.documentElement.dataset.theme = themeName;
    window.localStorage.setItem(THEME_KEY, themeName);
  }

  function applyCustomTheme(customConfig) {
    const { bgKey, textKey, fontKey } = customConfig;

    const bg = BG_OPTIONS[bgKey]   || BG_OPTIONS.light;
    const text = TEXT_OPTIONS[textKey] || TEXT_OPTIONS.dark;
    const font = FONT_OPTIONS[fontKey] || FONT_OPTIONS.modern;

    document.documentElement.dataset.theme = "custom";
    window.localStorage.setItem(THEME_KEY, "custom");
    window.localStorage.setItem(CUSTOM_KEY, JSON.stringify(customConfig));

    const rootStyle = document.documentElement.style;

    rootStyle.setProperty("--page-bg", bg.value);
    rootStyle.setProperty("--card-bg", bg.value);
    rootStyle.setProperty("--foot-bg", bg.value);

    rootStyle.setProperty("--page-ink", text.value);
    rootStyle.setProperty("--ink", text.value);
    rootStyle.setProperty("--text-main", text.value);

    rootStyle.setProperty("--font-body", font.value);
  }

  function restoreCustomThemeIfNeeded(themeName) {
    if (themeName !== "custom") return;

    try {
      const raw = window.localStorage.getItem(CUSTOM_KEY);
      if (!raw) return;
      const cfg = JSON.parse(raw);
      applyCustomTheme(cfg);
    } catch {
      applyBaseTheme("light");
    }
  }

  function createThemeUI(currentTheme) {
    const nav = document.querySelector(".site-nav");
    if (!nav) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-toggle";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-haspopup", "true");

    const iconSpan = document.createElement("span");
    iconSpan.className = "theme-toggle-icon";
    iconSpan.textContent = "🎨";

    const textSpan = document.createElement("span");
    textSpan.textContent = "Theme";

    btn.append(iconSpan, textSpan);

    const panel = document.createElement("div");
    panel.className = "theme-panel";
    panel.hidden = true;

    panel.innerHTML = `
      <div class="theme-row">
        <strong>Quick themes</strong>
        <div class="theme-presets">
          <button type="button" data-theme-choice="light">Light</button>
          <button type="button" data-theme-choice="dark">Dark</button>
          
        </div>
      </div>
      <hr>
      <div class="theme-row">
        <strong>Custom</strong>
        <div class="theme-custom">
          <label>
            Background
            <select id="theme-bg-select">
              <option value="light">${BG_OPTIONS.light.label}</option>
              <option value="cozy">${BG_OPTIONS.cozy.label}</option>
              <option value="dark">${BG_OPTIONS.dark.label}</option>
            </select>
          </label>
          <label>
            Text
            <select id="theme-text-select">
              <option value="dark">${TEXT_OPTIONS.dark.label}</option>
              <option value="soft">${TEXT_OPTIONS.soft.label}</option>
              <option value="light">${TEXT_OPTIONS.light.label}</option>
            </select>
          </label>
          <label>
            Font
            <select id="theme-font-select">
              <option value="modern">${FONT_OPTIONS.modern.label}</option>
              <option value="rounded">${FONT_OPTIONS.rounded.label}</option>
              <option value="serif">${FONT_OPTIONS.serif.label}</option>
            </select>
          </label>
          <button type="button" id="apply-custom-theme">
            Apply custom
          </button>
        </div>
      </div>
    `;

    nav.appendChild(panel);
    nav.appendChild(btn);

    btn.addEventListener("click", () => {
      const willOpen = panel.hidden;
      panel.hidden = !willOpen;
      btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
    });

    document.addEventListener("click", (ev) => {
      if (panel.hidden) return;
      if (!panel.contains(ev.target) && ev.target !== btn && !btn.contains(ev.target)) {
        panel.hidden = true;
        btn.setAttribute("aria-expanded", "false");
      }
    });

    panel.querySelectorAll("[data-theme-choice]").forEach((presetBtn) => {
      presetBtn.addEventListener("click", () => {
        const choice = presetBtn.getAttribute("data-theme-choice");

        runWithTransition(() => {
          applyBaseTheme(choice);
          const rs = document.documentElement.style;
          rs.removeProperty("--page-bg");
          rs.removeProperty("--card-bg");
          rs.removeProperty("--foot-bg");
          rs.removeProperty("--page-ink");
          rs.removeProperty("--ink");
          rs.removeProperty("--text-main");
          rs.removeProperty("--font-body");
        });

        panel.hidden = true;
        btn.setAttribute("aria-expanded", "false");
      });
    });

    const bgSelect   = panel.querySelector("#theme-bg-select");
    const textSelect = panel.querySelector("#theme-text-select");
    const fontSelect = panel.querySelector("#theme-font-select");
    const applyBtn   = panel.querySelector("#apply-custom-theme");

    if (currentTheme === "custom") {
      try {
        const raw = localStorage.getItem(CUSTOM_KEY);
        if (raw) {
          const cfg = JSON.parse(raw);
          if (cfg.bgKey)   bgSelect.value   = cfg.bgKey;
          if (cfg.textKey) textSelect.value = cfg.textKey;
          if (cfg.fontKey) fontSelect.value = cfg.fontKey;
        }
      } catch {
      }
    }

    applyBtn.addEventListener("click", () => {
      const cfg = {
        bgKey: bgSelect.value,
        textKey: textSelect.value,
        fontKey: fontSelect.value
      };

      runWithTransition(() => {
        applyCustomTheme(cfg);
      });

      panel.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const theme = getPreferredTheme();
    applyBaseTheme(theme);
    restoreCustomThemeIfNeeded(theme);
    createThemeUI(theme);
  });
})();
