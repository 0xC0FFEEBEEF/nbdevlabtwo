const STORAGE_KEY = "nbdevlab-theme";
type Theme = "light" | "dark";

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle("dark", theme === "dark");
};

const getPreferredTheme = (): Theme => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch (error) {
    console.warn("theme-storage", error);
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const syncToggleState = (theme: Theme) => {
  document
    .querySelectorAll<HTMLButtonElement>("[data-theme-toggle]")
    .forEach((button) => button.setAttribute("aria-pressed", String(theme === "dark")));
};

const setTheme = (theme: Theme, persist = true) => {
  applyTheme(theme);
  syncToggleState(theme);
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      console.warn("theme-set", error);
    }
  }
};

const init = () => {
  const initial = getPreferredTheme();
  applyTheme(initial);
  syncToggleState(initial);

  const toggles = document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]");
  toggles.forEach((button) => {
    button.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      setTheme(next);
    });
  });

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const listener = (event: MediaQueryListEvent) => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setTheme(event.matches ? "dark" : "light", false);
      }
    } catch {
      setTheme(event.matches ? "dark" : "light", false);
    }
  };
  media.addEventListener("change", listener);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
