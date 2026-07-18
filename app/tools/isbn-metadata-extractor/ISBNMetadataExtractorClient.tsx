"use client";
import { useState, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import ToolPageSections from "@/components/tool/ToolPageSections";
import { validate, parseBulk } from "@/lib/isbn/engine";
import { Search, Loader2, Copy, Check, AlertCircle, Download, Trash2 } from "lucide-react";

interface Metadata {
  isbn: string;
  title?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  language?: string;
  description?: string;
  thumbnail?: string;
  source?: "google" | "openlibrary";
  error?: string;
}

async function fetchGoogleBooks(isbn: string): Promise<Metadata | null> {
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.items?.length) return null;
    const v = data.items[0].volumeInfo;
    return {
      isbn,
      title: v.title,
      authors: v.authors,
      publisher: v.publisher,
      publishedDate: v.publishedDate,
      pageCount: v.pageCount,
      language: v.language,
      description: v.description,
      thumbnail: v.imageLinks?.thumbnail?.replace("http:", "https:"),
      source: "google",
    };
  } catch { return null; }
}

async function fetchOpenLibrary(isbn: string): Promise<Metadata | null> {
  try {
    const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
    if (!res.ok) return null;
    const data = await res.json();
    const v = data[`ISBN:${isbn}`];
    if (!v) return null;
    return {
      isbn,
      title: v.title,
      authors: v.authors?.map((a: { name: string }) => a.name),
      publisher: v.publishers?.map((p: { name: string }) => p.name).join(", "),
      publishedDate: v.publish_date,
      pageCount: v.number_of_pages,
      thumbnail: v.cover?.medium,
      source: "openlibrary",
    };
  } catch { return null; }
}

async function fetchMetadata(isbn: string): Promise<Metadata> {
  const g = await fetchGoogleBooks(isbn);
  if (g) return g;
  const o = await fetchOpenLibrary(isbn);
  if (o) return o;
  return { isbn, error: "No metadata found in Google Books or Open Library" };
}

export default function ISBNMetadataExtractorClient() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Metadata[]>([]);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const fetch1 = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    const isbns = parseBulk(input).map((r) => validate(r)).filter((v) => v.valid).map((v) => v.isbn13!);
    const uniq = [...new Set(isbns)];
    const out: Metadata[] = [];
    for (const isbn of uniq) {
      const m = await fetchMetadata(isbn);
      out.push(m);
      setResults([...out]);
    }
    setBusy(false);
  }, [input, busy]);

  const copy = (t: string, id: string) => { navigator.clipboard.writeText(t); setCopied(id); setTimeout(() => setCopied(null), 1500); };

  const exportCSV = () => {
    const lines = ["ISBN,Title,Authors,Publisher,Published,Pages,Language,Source"];
    for (const r of results) {
      lines.push([r.isbn, r.title ?? "", (r.authors ?? []).join("; "), r.publisher ?? "", r.publishedDate ?? "", r.pageCount ?? "", r.language ?? "", r.source ?? ""]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "isbn-metadata.csv"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--txt)]">ISBN Metadata Extractor</h1>
            <p className="text-[13px] text-[var(--txt-2)]">
              Look up book title, author, publisher, page count, and cover image for any ISBN. Queries Google Books first, falls back to Open Library. Supports single and bulk lookup.
            </p>
            <p className="mt-2 flex items-center gap-1.5 rounded-md border border-[#B7791F]/30 bg-[#FFF8E6] px-3 py-1.5 text-[11.5px] text-[#7C4A03]">
              <AlertCircle size={13} className="shrink-0" />
              This is the only pdf24x tool that queries external services (Google Books & Open Library). No pdf24x server involved.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[12px] font-semibold text-[var(--txt)]">Paste one or many ISBNs</label>
              {input && <button onClick={() => setInput("")} className="flex items-center gap-1 text-[11px] font-semibold text-[var(--txt-2)] hover:text-[#EE4B3C]"><Trash2 size={11} /> Clear</button>}
            </div>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false}
              placeholder="978-0-13-468599-1&#10;9780306406157"
              className="block h-32 w-full resize-y rounded-md border border-[var(--line-mid)] bg-[var(--surface-2)] p-3 font-mono text-[12.5px] text-[var(--txt)] outline-none focus:border-[#EE4B3C]/50" />
            <button onClick={fetch1} disabled={busy || !input.trim()}
              className="mt-3 flex items-center gap-1.5 rounded-lg bg-[#EE4B3C] px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-40">
              {busy ? <><Loader2 size={14} className="animate-spin" /> Fetching…</> : <><Search size={14} /> Fetch metadata</>}
            </button>
          </div>

          {results.length > 0 && (
            <>
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
                <p className="text-[13px] font-semibold text-[var(--txt)]">
                  {results.length} result{results.length === 1 ? "" : "s"} · <span className="text-[#27AE60]">{results.filter((r) => !r.error).length} found</span>
                  {results.some((r) => r.error) && <> · <span className="text-[#C0392B]">{results.filter((r) => r.error).length} not found</span></>}
                </p>
                <button onClick={exportCSV} className="flex items-center gap-1.5 rounded-lg bg-[#EE4B3C] px-3 py-1 text-[12px] font-semibold text-white hover:opacity-90">
                  <Download size={13} /> Export CSV
                </button>
              </div>

              <div className="mt-3 space-y-3">
                {results.map((r) => (
                  <div key={r.isbn} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                    <div className="flex gap-4">
                      {r.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.thumbnail} alt="" className="h-24 w-16 shrink-0 rounded border border-[var(--line)] object-cover" />
                      ) : (
                        <div className="grid h-24 w-16 shrink-0 place-items-center rounded border border-[var(--line)] bg-[var(--surface-2)] text-[10px] text-[var(--txt-3)]">No cover</div>
                      )}
                      <div className="min-w-0 flex-1">
                        {r.error ? (
                          <>
                            <p className="font-mono text-[13px] text-[var(--txt)]">{r.isbn}</p>
                            <p className="mt-1 flex items-center gap-1 text-[12.5px] text-[#C0392B]"><AlertCircle size={12} /> {r.error}</p>
                          </>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-[15px] font-bold text-[var(--txt)]">{r.title ?? "Untitled"}</p>
                              <button onClick={() => copy([r.title, (r.authors ?? []).join(", "), r.publisher, r.publishedDate].filter(Boolean).join(" · "), r.isbn)}
                                className="shrink-0 rounded-md p-1.5 text-[var(--txt-2)] hover:bg-[var(--hover-soft)]">
                                {copied === r.isbn ? <Check size={13} className="text-[#27AE60]" /> : <Copy size={13} />}
                              </button>
                            </div>
                            {r.authors?.length && <p className="text-[13px] text-[var(--txt-2)]">by {r.authors.join(", ")}</p>}
                            <p className="mt-1 font-mono text-[11.5px] text-[var(--txt-3)]">{r.isbn}</p>
                            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-[var(--txt-2)]">
                              {r.publisher && <span><strong>Publisher:</strong> {r.publisher}</span>}
                              {r.publishedDate && <span><strong>Published:</strong> {r.publishedDate}</span>}
                              {r.pageCount && <span><strong>Pages:</strong> {r.pageCount}</span>}
                              {r.language && <span><strong>Language:</strong> {r.language}</span>}
                              {r.source && <span className="rounded bg-[var(--surface-2)] px-1.5 text-[10.5px] uppercase tracking-wide">via {r.source}</span>}
                            </div>
                            {r.description && (
                              <details className="mt-2">
                                <summary className="cursor-pointer text-[11.5px] font-semibold text-[var(--txt-2)]">Show description</summary>
                                <p className="mt-1 text-[12.5px] text-[var(--txt-2)]">{r.description}</p>
                              </details>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <p className="mt-6 text-xs text-[var(--txt-2)]">Data fetched from Google Books & Open Library public APIs. No pdf24x server sees your queries.</p>

          <ToolPageSections
            processingMode="browser"
            howToSteps={[
              { title: "Paste ISBNs", desc: "One per line or comma-separated. Both ISBN-10 and ISBN-13 supported." },
              { title: "Click Fetch metadata", desc: "The tool queries Google Books first, then Open Library as fallback." },
              { title: "Review results", desc: "See title, authors, publisher, publish date, page count, language, and cover image." },
              { title: "Export as CSV", desc: "For bulk lookups, download all data as CSV for further processing." },
            ]}
            capabilities={[
              "Free access to millions of book records",
              "Google Books first, Open Library fallback",
              "Title, author, publisher, publish date, page count, language",
              "Cover image thumbnails",
              "Bulk lookup with CSV export",
              "Deduplicates on ISBN-13 before querying",
            ]}
            useCases={[
              "Enrich a book catalog with title/author data",
              "Verify unclear entries in library records",
              "Build a spreadsheet of book metadata from ISBNs",
              "Cross-check publisher info across multiple sources",
            ]}
            relatedTools={["isbn-validator","isbn-range-checker","isbn-country-identifier"]}
            faqs={[
              { q: "Where does the data come from?", a: "Google Books API (primary) and Open Library API (fallback). Both are free and public. Google Books tends to have richer metadata; Open Library sometimes has records Google Books doesn't." },
              { q: "Do queries go through pdf24x's server?", a: "No. Your browser talks to Google Books and Open Library directly. Note that Google and Open Library will log the request per their own privacy policies." },
              { q: "Why is some data missing?", a: "Not every ISBN has complete metadata in either service. Rare, older, or newly-published books are the most common gaps. Try the ISBN in each service's website manually if needed." },
              { q: "Is there a rate limit?", a: "Google Books allows ~1000 queries/day without an API key. Open Library has no strict limit. For large batches, expect occasional errors and rerun." },
            ]}
          />
        </main>
      </div>
    </>
  );
}
