import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

type SearchItem = {
  id: string;
  type: string;
  title: string;
  url: string;
  tags: string[];
  summary: string;
  date?: string;
};

type SearchPayload = {
  generatedAt: string;
  items: SearchItem[];
  index: Record<string, number[]>;
};

type LoadedIndex = {
  tokens: Record<string, number[]>;
  items: SearchItem[];
};

declare global {
  interface Window {
    __nbdevlabSearch?: LoadedIndex;
  }
}

const fetchIndex = async (): Promise<LoadedIndex> => {
  if (typeof window === "undefined") {
    throw new Error("Search index unavailable during SSR");
  }
  if (window.__nbdevlabSearch) {
    return window.__nbdevlabSearch;
  }
  const response = await fetch("/search-index.json", { headers: { accept: "application/json" } });
  if (!response.ok) {
    throw new Error("Failed to load search index");
  }
  const payload = (await response.json()) as SearchPayload;
  const loaded = { tokens: payload.index, items: payload.items };
  window.__nbdevlabSearch = loaded;
  return loaded;
};

const tokenizeQuery = (value: string) =>
  value
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .filter(Boolean);

const highlightMatch = (text: string, query: string) => {
  if (!query.trim()) return text;
  const pattern = query.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  try {
    const regex = new RegExp(`(${pattern.split(/\s+/).join("|")})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  } catch (error) {
    console.warn("Failed to build highlight regex", error);
    return text;
  }
};

const formatType = (type: string) => {
  switch (type) {
    case "project":
      return "Project";
    case "lab-note":
      return "Lab Note";
    default:
      return type;
  }
};

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const dataRef = useRef<LoadedIndex>();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setError(null);
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      const metaPressed = event.metaKey || event.ctrlKey;
      if (event.key === "k" && metaPressed) {
        event.preventDefault();
        setOpen(true);
        return;
      }
      if (event.key === "/" && !metaPressed && !isTyping) {
        event.preventDefault();
        setOpen(true);
        return;
      }
      if (event.key === "Escape" && open) {
        event.preventDefault();
        close();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, open]);

  useEffect(() => {
    if (!open) {
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.setProperty("overflow", "hidden");
    setLoading(true);
    setError(null);
    fetchIndex()
      .then((payload) => {
        dataRef.current = payload;
        setLoading(false);
        setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0);
      })
      .catch((err) => {
        console.error(err);
        setError("Search is unavailable right now. Please try again later.");
        setLoading(false);
      });

    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!query.trim()) {
      setResults([]);
      setActiveIndex(0);
      return;
    }
    const data = dataRef.current;
    if (!data) return;

    const tokens = tokenizeQuery(query);
    if (tokens.length === 0) {
      setResults([]);
      setActiveIndex(0);
      return;
    }

    const scores = new Map<number, number>();

    tokens.forEach((token) => {
      const docMatches = data.tokens[token];
      if (!docMatches) return;
      const weight = token.length > 4 ? 2 : 1;
      docMatches.forEach((docIndex) => {
        scores.set(docIndex, (scores.get(docIndex) ?? 0) + weight);
      });
    });

    const ranked = [...scores.entries()]
      .sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        const leftDate = data.items[b[0]].date ? new Date(data.items[b[0]].date as string).getTime() : 0;
        const rightDate = data.items[a[0]].date ? new Date(data.items[a[0]].date as string).getTime() : 0;
        return leftDate - rightDate;
      })
      .map(([index]) => data.items[index]);

    setResults(ranked);
    setActiveIndex((previous) => (ranked.length === 0 ? 0 : Math.min(previous, ranked.length - 1)));
  }, [open, query]);

  const hint = useMemo(() => {
    if (typeof navigator === "undefined") return "Ctrl+K";
    return navigator.platform.includes("Mac") ? "⌘K" : "Ctrl+K";
  }, []);

  const handlePanelKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Tab") {
        const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) {
          event.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((value) => (results.length === 0 ? 0 : (value + 1) % results.length));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((value) => (results.length === 0 ? 0 : (value - 1 + results.length) % results.length));
      }
      if (event.key === "Enter") {
        const item = results[activeIndex];
        if (item) {
          close();
          window.location.href = item.url;
        }
      }
    },
    [results, activeIndex, close]
  );

  return (
    <>
      <button
        type="button"
        className="search-trigger"
        aria-label={`Search nbdevlab (shortcut ${hint})`}
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true">Search</span>
        <kbd>{hint}</kbd>
      </button>
      {open && (
        <div className="search-overlay" role="presentation">
          <div
            className="search-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Search the site"
            ref={panelRef}
            onKeyDown={handlePanelKeyDown}
          >
            <div className="search-header">
              <label className="sr-only" htmlFor="site-search-input">
                Search nbdevlab
              </label>
              <input
                id="site-search-input"
                ref={inputRef}
                placeholder="Search projects, lab notes, runbooks..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              <button type="button" className="search-close" onClick={close} aria-label="Close search">
                Close
              </button>
            </div>
            <div className="search-body" aria-live="polite">
              {loading && <p className="search-state">Loading search index…</p>}
              {error && <p className="search-state" role="status">{error}</p>}
              {!loading && !error && query.trim() === "" && (
                <p className="search-state">Start typing to explore projects, notes, and runbooks.</p>
              )}
              {!loading && !error && query.trim() !== "" && results.length === 0 && (
                <p className="search-state">No matches yet. Try another phrase.</p>
              )}
              {!loading && results.length > 0 && (
                <ul role="listbox" className="search-results">
                  {results.map((item, index) => (
                    <li key={item.id} role="option" aria-selected={index === activeIndex}>
                      <a
                        href={item.url}
                        onClick={close}
                        className={index === activeIndex ? "is-active" : undefined}
                      >
                        <span className="search-title" dangerouslySetInnerHTML={{ __html: highlightMatch(item.title, query) }} />
                        <span className="search-summary" dangerouslySetInnerHTML={{ __html: highlightMatch(item.summary ?? "", query) }} />
                        <span className="search-meta">
                          <span>{formatType(item.type)}</span>
                          {item.tags.length > 0 && (
                            <span>{item.tags.join(", ")}</span>
                          )}
                          {item.date && <time dateTime={item.date}>{new Date(item.date).toLocaleDateString()}</time>}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <button type="button" className="search-backdrop" aria-hidden="true" tabIndex={-1} onClick={close} />
        </div>
      )}
    </>
  );
}
