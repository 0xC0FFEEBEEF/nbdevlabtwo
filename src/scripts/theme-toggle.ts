const STORAGE_KEY = "nbdevlab-theme";
const THEMES = new Set(["light", "dark"] as const);

type Theme = "light" | "dark";

type ToggleButton = HTMLButtonElement & {
  dataset: {
    themeToggle?: string;
    themeLabelTarget?: string;
  };
};

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle("dark", theme === "dark");
};

const persistTheme = (theme: Theme) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch (error) {
    console.warn("theme-persist-failed", error);
  }
};

const getStoredTheme = (): Theme | null => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && THEMES.has(stored as Theme)) {
      return stored as Theme;
    }
  } catch (error) {
    console.warn("theme-read-failed", error);
  }
  return null;
};

const getPreferredTheme = (): Theme => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const setTheme = (theme: Theme, persist = true) => {
  applyTheme(theme);
  if (persist) {
    persistTheme(theme);
  }
  document
    .querySelectorAll<HTMLElement>("[data-theme-label]")
    .forEach((node) => (node.textContent = theme === "dark" ? "Dark" : "Light"));
  document
    .querySelectorAll<HTMLElement>("[data-theme-icon]")
    .forEach((node) => (node.textContent = theme === "dark" ? "🌙" : "☀️"));
  document
    .querySelectorAll<ToggleButton>("[data-theme-toggle]")
    .forEach((button) => {
      const isDark = theme === "dark";
      button.setAttribute("aria-pressed", String(isDark));
      button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    });
};

const initThemeToggle = () => {
  const stored = getStoredTheme();
  const initial = stored ?? getPreferredTheme();
  setTheme(initial, false);

  const toggleButtons = Array.from(document.querySelectorAll<ToggleButton>("[data-theme-toggle]"));
  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      setTheme(next);
    });
  });

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const mediaListener = (event: MediaQueryListEvent) => {
    if (getStoredTheme()) return;
    setTheme(event.matches ? "dark" : "light", false);
  };
  if (media.addEventListener) {
    media.addEventListener("change", mediaListener);
  } else {
    // @ts-expect-error legacy browsers
    media.addListener(mediaListener);
  }
};

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeToggle);
  } else {
    initThemeToggle();
  }
}

export {};
