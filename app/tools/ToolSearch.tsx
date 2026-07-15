"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { LIVE_TOOLS, searchTools, type Tool } from "@/lib/tools";

const C = { ink: "var(--txt)", sub: "var(--txt-2)", brand: "#FF6B5E", line: "var(--line-strong)", surface: "var(--surface)", cream: "var(--cream)" };
const shadow = "3px 3px 0 0 var(--line-strong)";

export default function ToolSearch() {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const router = useRouter();

  const results = searchTools(query);
  const hasQuery = query.trim().length > 0;

  useEffect(() => { setActiveIndex(-1); }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!hasQuery || results.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, -1)); }
    else if (e.key === "Enter" && activeIndex >= 0) { e.preventDefault(); router.push(results[activeIndex].href); setQuery(""); }
    else if (e.key === "Escape") { setQuery(""); inputRef.current?.blur(); }
  };

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  return (
    <div className="mb-6">
      <div className="relative max-w-xl">
        <label htmlFor="tool-search" className="sr-only">Search tools</label>
        <div className="flex items-center rounded-xl bg-[var(--surface)]" style={{ border: `1px solid ${C.line}`, boxShadow: shadow }}>
          <Search size={17} className="ml-3 shrink-0" style={{ color: C.sub }} aria-hidden="true" />
          <input
            ref={inputRef}
            id="tool-search"
            type="search"
            role="combobox"
            aria-expanded={hasQuery && results.length > 0}
            aria-controls="tool-search-results"
            aria-autocomplete="list"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tools — compress, merge, json, base64..."
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm"
            style={{ color: C.ink, outline: "none" }}
          />
          {hasQuery && (
            <button type="button" onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              aria-label="Clear search" className="mr-2 flex h-6 w-6 items-center justify-center rounded-md shrink-0"
              style={{ color: C.sub }}>
              <X size={15} />
            </button>
          )}
        </div>

        {hasQuery && (
          <ul
            id="tool-search-results"
            ref={listRef}
            role="listbox"
            className="absolute left-0 top-full z-30 mt-2 w-full overflow-y-auto rounded-xl bg-[var(--surface)]"
            style={{ border: `1px solid ${C.line}`, boxShadow: shadow, maxHeight: "320px" }}
          >
            {results.length > 0 ? results.map((tool, i) => (
              <li key={tool.href} role="option" aria-selected={activeIndex === i}>
                <Link href={tool.href} onClick={() => setQuery("")}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm"
                  style={{ background: activeIndex === i ? C.cream : C.surface, color: C.ink }}>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{ background: C.brand }}>{tool.name[0]}</div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="truncate font-semibold">{tool.name}</p>
                    <p className="truncate text-xs" style={{ color: C.sub }}>{tool.category}</p>
                  </div>
                </Link>
              </li>
            )) : (
              <li className="px-4 py-3 text-sm" style={{ color: C.sub }}>
                No tools found for &quot;{query.trim()}&quot;
              </li>
            )}
          </ul>
        )}
      </div>

      {hasQuery && results.length > 0 && (
        <p className="mt-2 text-xs" style={{ color: C.sub }}>
          {results.length} result{results.length !== 1 ? "s" : ""} for &quot;{query.trim()}&quot;
        </p>
      )}
      {!hasQuery && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Show tool grid when no search active */}
        </div>
      )}
    </div>
  );
}
