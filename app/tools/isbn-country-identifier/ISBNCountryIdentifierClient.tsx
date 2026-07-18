"use client";
import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import ToolPageSections from "@/components/tool/ToolPageSections";
import { validate, parseBulk } from "@/lib/isbn/engine";
import { Globe, Trash2, Upload, Download } from "lucide-react";

export default function ISBNCountryIdentifierClient() {
  const [input, setInput] = useState("");

  const results = useMemo(() => {
    if (!input.trim()) return [];
    return parseBulk(input).map((raw) => validate(raw));
  }, [input]);

  const single = results.length === 1 ? results[0] : null;

  const readFile = (f: File) => {
    if (f.size > 2 * 1024 * 1024) { alert("File too large (max 2 MB)"); return; }
    const r = new FileReader();
    r.onload = () => setInput(String(r.result ?? ""));
    r.readAsText(f);
  };

  const exportCSV = () => {
    const lines = ["ISBN,Registration group,Country/Language,Valid"];
    for (const r of results) {
      lines.push([r.input, r.registrationGroup ?? "", r.countryOrLanguage ?? "Unknown", r.valid ? "Yes" : "No"]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "isbn-countries.csv"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--txt)]">ISBN Country Identifier</h1>
            <p className="text-[13px] text-[var(--txt-2)]">
              Look up the registration group (country / language / region) of any ISBN. Works with one ISBN or a bulk list. 100% private.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <label className="text-[12px] font-semibold text-[var(--txt)]">Enter one or many ISBNs</label>
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
              placeholder="978-3-16-148410-0 (Germany)&#10;978-81-208-0021-1 (India)&#10;978-4-06-518910-1 (Japan)"
              className="block h-32 w-full resize-y rounded-md border border-[var(--line-mid)] bg-[var(--surface-2)] p-3 font-mono text-[12.5px] text-[var(--txt)] outline-none focus:border-[#EE4B3C]/50" />
          </div>

          {single && single.valid && (
            <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 text-center">
              <Globe size={32} className="mx-auto mb-3 text-[#EE4B3C]" />
              <p className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--txt-2)]">Country / Language</p>
              <p className="mt-1 text-[22px] font-bold text-[var(--txt)]">{single.countryOrLanguage ?? "Unknown"}</p>
              <p className="mt-2 font-mono text-[13px] text-[var(--txt-2)]">Registration group: {single.registrationGroup ?? "—"}</p>
              <p className="mt-1 font-mono text-[13px] text-[var(--txt-2)]">{single.format}</p>
            </div>
          )}

          {results.length > 1 && (
            <>
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
                <p className="text-[13px] font-semibold text-[var(--txt)]">{results.length} ISBNs analyzed</p>
                <button onClick={exportCSV} className="flex items-center gap-1.5 rounded-lg bg-[#EE4B3C] px-3 py-1 text-[12px] font-semibold text-white hover:opacity-90">
                  <Download size={13} /> Export CSV
                </button>
              </div>
              <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                <div className="max-h-[500px] overflow-y-auto">
                  <table className="w-full text-[12.5px]">
                    <thead className="sticky top-0 bg-[var(--surface-2)] text-[11px] font-bold uppercase tracking-wide text-[var(--txt-2)]">
                      <tr>
                        <th className="px-3 py-2 text-left">#</th>
                        <th className="px-3 py-2 text-left">ISBN</th>
                        <th className="px-3 py-2 text-left">Group</th>
                        <th className="px-3 py-2 text-left">Country / Language</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => (
                        <tr key={i} className="border-t border-[var(--line)]">
                          <td className="px-3 py-2 font-mono text-[var(--txt-3)]">{i + 1}</td>
                          <td className="px-3 py-2 font-mono text-[var(--txt)]">{r.format ?? r.input}</td>
                          <td className="px-3 py-2 font-mono text-[var(--txt-2)]">{r.registrationGroup ?? "—"}</td>
                          <td className="px-3 py-2 text-[var(--txt-2)]">{r.valid ? (r.countryOrLanguage ?? "Unknown") : <span className="text-[#C0392B]">Invalid ISBN</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          <p className="mt-6 text-xs text-[var(--txt-2)]">🔒 100% private — lookup runs locally in your browser.</p>

          <ToolPageSections
            processingMode="browser"
            howToSteps={[
              { title: "Enter an ISBN (or many)", desc: "Type a single ISBN, or paste a list. Both ISBN-10 and ISBN-13 work." },
              { title: "See the registration group", desc: "The digits after the 978/979 prefix identify the country, region, or language." },
              { title: "Export as CSV", desc: "For bulk lookups, download the results as a CSV for further processing." },
            ]}
            capabilities={[
              "Covers 200+ ISBN registration groups worldwide",
              "Detects country, language, or regional group",
              "Supports both ISBN-10 (via conversion to ISBN-13) and ISBN-13",
              "Bulk lookup with CSV export",
              "Works entirely offline in your browser",
            ]}
            useCases={[
              "Find out where a book was registered",
              "Segment catalog by country of publication",
              "Verify ISBN prefixes match declared publisher region",
              "Identify possibly counterfeit ISBNs",
            ]}
            relatedTools={["isbn-validator","bulk-isbn-validator","isbn-range-checker"]}
            faqs={[
              { q: "Is the registration group the same as the publisher country?", a: "It identifies the country or language area where the ISBN was registered — which is usually the publisher's country, but not always. Multinational publishers may register books in multiple countries." },
              { q: "What if the country shows as 'Unknown'?", a: "The tool uses the largest publicly documented prefix table. A few very small or newly-allocated groups may not be recognized. Verify against the official ISBN Range Message from isbn-international.org." },
              { q: "Why do some prefixes cover multiple countries?", a: "Registration groups are sometimes shared (e.g. 978-0 and 978-1 both cover English-language countries). This is a legacy of how the ISBN system was designed decades ago." },
            ]}
          />
        </main>
      </div>
    </>
  );
}
