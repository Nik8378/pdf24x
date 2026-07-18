"use client";
import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import ToolPageSections from "@/components/tool/ToolPageSections";
import { parseBulk, findDuplicates, formatISBN13 } from "@/lib/isbn/engine";
import { Copy, Check, Download, Upload, Trash2, AlertTriangle } from "lucide-react";

export default function DuplicateISBNFinderClient() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const list = useMemo(() => parseBulk(input), [input]);
  const dupes = useMemo(() => findDuplicates(list), [list]);
  const dupCount = dupes.reduce((sum, g) => sum + g.entries.length, 0);

  const readFile = (f: File) => {
    if (f.size > 2 * 1024 * 1024) { alert("File too large (max 2 MB)"); return; }
    const r = new FileReader();
    r.onload = () => setInput(String(r.result ?? ""));
    r.readAsText(f);
  };

  const exportCSV = () => {
    const lines = ["ISBN-13,Occurrences,Positions,Raw entries"];
    for (const g of dupes) {
      lines.push([g.key, g.entries.length, g.entries.map((e) => e.index + 1).join(";"), g.entries.map((e) => e.raw).join(";")]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "isbn-duplicates.csv"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const copyDupes = () => {
    navigator.clipboard.writeText(dupes.map((g) => `${g.key}\tx${g.entries.length}\t${g.entries.map((e) => e.raw).join(" | ")}`).join("\n"));
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--txt)]">Duplicate ISBN Finder</h1>
            <p className="text-[13px] text-[var(--txt-2)]">
              Find duplicate ISBNs in a list. Normalizes across ISBN-10 and ISBN-13 (so <span className="font-mono">0-306-40615-2</span> and <span className="font-mono">978-0-306-40615-7</span> are treated as the same book). 100% private.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <label className="text-[12px] font-semibold text-[var(--txt)]">Paste your list</label>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-2.5 py-1 text-[12px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40">
                  <Upload size={13} /> Upload .txt / .csv
                  <input type="file" accept=".txt,.csv,text/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); e.target.value = ""; }} />
                </label>
                <button onClick={() => setInput("")} className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-2.5 py-1 text-[12px] font-semibold text-[var(--txt-2)] hover:border-[#EE4B3C]/40 hover:text-[#EE4B3C]">
                  <Trash2 size={13} /> Clear
                </button>
              </div>
            </div>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false}
              placeholder="978-0-306-40615-7&#10;0-306-40615-2&#10;9780134685991&#10;9780134685991"
              className="block h-40 w-full resize-y rounded-md border border-[var(--line-mid)] bg-[var(--surface-2)] p-3 font-mono text-[12.5px] text-[var(--txt)] outline-none focus:border-[#EE4B3C]/50" />
          </div>

          {list.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
              <p className="text-[13px] font-semibold text-[var(--txt)]">
                {list.length} entries · {dupes.length === 0 ? <span className="text-[#27AE60]">No duplicates found</span> : <span className="text-[#C0392B]">{dupes.length} duplicate group{dupes.length === 1 ? "" : "s"} · {dupCount} affected rows</span>}
              </p>
              {dupes.length > 0 && (
                <div className="ml-auto flex flex-wrap gap-2">
                  <button onClick={copyDupes} className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-2.5 py-1 text-[12px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40">
                    {copied ? <><Check size={13} className="text-[#27AE60]" /> Copied</> : <><Copy size={13} /> Copy</>}
                  </button>
                  <button onClick={exportCSV} className="flex items-center gap-1.5 rounded-lg bg-[#EE4B3C] px-3 py-1 text-[12px] font-semibold text-white hover:opacity-90">
                    <Download size={13} /> Export CSV
                  </button>
                </div>
              )}
            </div>
          )}

          {dupes.length > 0 && (
            <div className="mt-3 space-y-2">
              {dupes.map((g) => (
                <div key={g.key} className="rounded-2xl border border-[#C0392B]/30 bg-[#FDECEA] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-[#C0392B]" />
                    <p className="font-mono text-[14px] font-bold text-[#7F1D1D]">{formatISBN13(g.key)}</p>
                    <span className="rounded-full bg-[#7F1D1D] px-2 py-0.5 text-[11px] font-bold text-white">×{g.entries.length}</span>
                  </div>
                  <div className="space-y-1">
                    {g.entries.map((e, i) => (
                      <div key={i} className="flex items-center justify-between rounded border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[12.5px]">
                        <span className="font-mono text-[var(--txt)]">{e.raw}</span>
                        <span className="text-[11px] text-[var(--txt-2)]">Line {e.index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="mt-6 text-xs text-[var(--txt-2)]">🔒 100% private — deduplication runs locally in your browser.</p>

          <ToolPageSections
            processingMode="browser"
            howToSteps={[
              { title: "Paste your ISBN list", desc: "One ISBN per line, or comma/semicolon-separated. Mixed ISBN-10 and ISBN-13 are fine." },
              { title: "See duplicates grouped", desc: "Each duplicate group shows the canonical ISBN-13 and every raw entry with its line number." },
              { title: "Export the report", desc: "Download a CSV with one row per duplicate group, ready for spreadsheet cleanup." },
            ]}
            capabilities={[
              "Normalizes ISBN-10 and ISBN-13 to the same canonical form",
              "Ignores whitespace, hyphens, dots in comparisons",
              "Groups duplicates and shows original positions",
              "CSV export ready for spreadsheet processing",
              "Handles thousands of ISBNs instantly",
            ]}
            useCases={[
              "Clean up a book catalog for double listings",
              "Deduplicate ISBN exports from multiple sources",
              "Find repeated barcodes in library records",
              "Merge inventory lists without duplicating stock",
            ]}
            relatedTools={["bulk-isbn-validator","isbn-validator","isbn-converter"]}
            faqs={[
              { q: "How are ISBN-10 and ISBN-13 compared?", a: "Every ISBN-10 is converted to its ISBN-13 equivalent (prefixing 978). The comparison is done on the normalized ISBN-13, so the same book listed once as ISBN-10 and once as ISBN-13 counts as a duplicate." },
              { q: "What about invalid ISBNs?", a: "Invalid ISBNs are silently skipped — they can't be reliably matched. Use the Bulk ISBN Validator first to find and fix invalid entries." },
              { q: "Are duplicates removed automatically?", a: "No — this tool only reports them. Removing them is a business decision (which of the duplicates to keep). Use the CSV export to drive the cleanup in your spreadsheet or database." },
            ]}
          />
        </main>
      </div>
    </>
  );
}
