"use client";
import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import ToolPageSections from "@/components/tool/ToolPageSections";
import { validate, parseBulk } from "@/lib/isbn/engine";
import { CheckCircle, AlertCircle, Copy, Check, Download, Upload, Trash2, User, Users } from "lucide-react";

type Mode = "single" | "bulk";

export default function ISBNValidatorClient() {
  const [mode, setMode] = useState<Mode>("single");
  const [single, setSingle] = useState("");
  const [bulk, setBulk] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "valid" | "invalid">("all");

  const singleResult = useMemo(() => single.trim() ? validate(single) : null, [single]);
  const bulkResults = useMemo(() => bulk.trim() ? parseBulk(bulk).map((r) => validate(r)) : [], [bulk]);
  const stats = useMemo(() => {
    const t = bulkResults.length;
    const v = bulkResults.filter((r) => r.valid).length;
    return { total: t, valid: v, invalid: t - v };
  }, [bulkResults]);
  const filtered = bulkResults.filter((r) => filter === "all" || (filter === "valid" ? r.valid : !r.valid));

  const copy = (t: string, id: string) => { navigator.clipboard.writeText(t); setCopied(id); setTimeout(() => setCopied(null), 1500); };

  const readFile = (f: File) => {
    if (f.size > 2 * 1024 * 1024) { alert("File too large (max 2 MB)"); return; }
    const r = new FileReader();
    r.onload = () => setBulk(String(r.result ?? ""));
    r.readAsText(f);
  };

  const exportCSV = () => {
    const lines = ["Input,Normalized,Type,Valid,Reason,ISBN-13,ISBN-10,Country/Language"];
    for (const r of bulkResults) {
      lines.push([r.input, r.normalized, r.type, r.valid ? "Yes" : "No", r.reason ?? "", r.isbn13 ?? "", r.isbn10 ?? "", r.countryOrLanguage ?? ""]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "isbn-validation.csv"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(bulkResults.map((r) => `${r.input}\t${r.valid ? "VALID" : "INVALID"}\t${r.reason ?? r.format ?? ""}`).join("\n"));
    setCopied("all"); setTimeout(() => setCopied(null), 1500);
  };

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--txt)]">ISBN Validator</h1>
            <p className="text-[13px] text-[var(--txt-2)]">
              Validate a single ISBN or check hundreds at once. Both ISBN-10 and ISBN-13 supported. Verifies check digit, formats output, identifies country. 100% private.
            </p>
          </div>

          {/* Mode toggle */}
          <div className="mb-4 inline-flex rounded-full border border-[var(--line-mid)] bg-[var(--surface-2)] p-1 shadow-sm">
            <button onClick={() => setMode("single")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition-all ${mode === "single" ? "bg-[#EE4B3C] text-white shadow" : "text-[var(--txt-2)] hover:text-[var(--txt)]"}`}>
              <User size={13} /> Single
            </button>
            <button onClick={() => setMode("bulk")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition-all ${mode === "bulk" ? "bg-[#EE4B3C] text-white shadow" : "text-[var(--txt-2)] hover:text-[var(--txt)]"}`}>
              <Users size={13} /> Bulk
            </button>
          </div>

          {mode === "single" ? (
            <>
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                <label className="mb-1.5 flex items-center justify-between text-[12px] font-semibold text-[var(--txt)]">
                  Enter ISBN
                  {single && <button onClick={() => setSingle("")} className="flex items-center gap-1 text-[11px] font-semibold text-[var(--txt-2)] hover:text-[#EE4B3C]"><Trash2 size={11} /> Clear</button>}
                </label>
                <input type="text" value={single} onChange={(e) => setSingle(e.target.value)} spellCheck={false}
                  placeholder="e.g. 978-3-16-148410-0 or 0-306-40615-2"
                  className="w-full rounded-md border border-[var(--line-mid)] bg-[var(--surface-2)] px-3 py-2 font-mono text-[14px] text-[var(--txt)] outline-none focus:border-[#EE4B3C]/50" />
              </div>

              {singleResult && (
                <div className={`mt-4 rounded-2xl border p-4 ${singleResult.valid ? "border-[#27AE60]/30 bg-[#E9F9EF]" : "border-[#C0392B]/30 bg-[#FDECEA]"}`}>
                  <div className="mb-3 flex items-center gap-2">
                    {singleResult.valid ? <CheckCircle size={18} className="text-[#27AE60]" /> : <AlertCircle size={18} className="text-[#C0392B]" />}
                    <p className={`text-[15px] font-bold ${singleResult.valid ? "text-[#14532D]" : "text-[#7F1D1D]"}`}>
                      {singleResult.valid ? "Valid" : "Invalid"} {singleResult.type}
                    </p>
                  </div>
                  {!singleResult.valid && singleResult.reason && (
                    <p className="text-[13px] text-[#7F1D1D]">{singleResult.reason}</p>
                  )}
                  {singleResult.valid && (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {[
                        ["Formatted", singleResult.format],
                        ["ISBN-13", singleResult.isbn13],
                        ["ISBN-10", singleResult.isbn10 ?? "Not available (979- prefix)"],
                        ["Registration group", singleResult.registrationGroup],
                        ["Country / Language", singleResult.countryOrLanguage],
                      ].filter(([, v]) => v).map(([k, v]) => (
                        <div key={k as string} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--txt-2)]">{k}</p>
                            <p className="truncate font-mono text-[13px] text-[var(--txt)]">{v}</p>
                          </div>
                          <button onClick={() => copy(String(v), k as string)} className="rounded-md p-1.5 text-[var(--txt-2)] hover:bg-[var(--hover-soft)]">
                            {copied === k ? <Check size={13} className="text-[#27AE60]" /> : <Copy size={13} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <label className="text-[12px] font-semibold text-[var(--txt)]">Paste ISBNs (one per line or comma-separated)</label>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-2.5 py-1 text-[12px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40">
                      <Upload size={13} /> Upload .txt / .csv
                      <input type="file" accept=".txt,.csv,text/*" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); e.target.value = ""; }} />
                    </label>
                    <button onClick={() => setBulk("")} className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-2.5 py-1 text-[12px] font-semibold text-[var(--txt-2)] hover:border-[#EE4B3C]/40 hover:text-[#EE4B3C]">
                      <Trash2 size={13} /> Clear
                    </button>
                  </div>
                </div>
                <textarea value={bulk} onChange={(e) => setBulk(e.target.value)} spellCheck={false}
                  placeholder="978-0-306-40615-7&#10;0306406152&#10;9780134685991"
                  className="block h-40 w-full resize-y rounded-md border border-[var(--line-mid)] bg-[var(--surface-2)] p-3 font-mono text-[12.5px] text-[var(--txt)] outline-none focus:border-[#EE4B3C]/50" />
              </div>

              {bulkResults.length > 0 && (
                <>
                  <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
                    <p className="text-[13px] font-semibold text-[var(--txt)]">
                      {stats.total} total · <span className="text-[#27AE60]">{stats.valid} valid</span> · <span className="text-[#C0392B]">{stats.invalid} invalid</span>
                    </p>
                    <div className="flex rounded-lg border border-[var(--line)] p-0.5 text-[11.5px] font-semibold">
                      {(["all","valid","invalid"] as const).map((f) => (
                        <button key={f} onClick={() => setFilter(f)}
                          className={`rounded-md px-2.5 py-1 ${filter === f ? "bg-[var(--inv-bg)] text-[var(--inv-txt)]" : "text-[var(--txt-2)] hover:text-[var(--txt)]"}`}>
                          {f[0].toUpperCase() + f.slice(1)}
                        </button>
                      ))}
                    </div>
                    <div className="ml-auto flex flex-wrap gap-2">
                      <button onClick={copyAll} className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-2.5 py-1 text-[12px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40">
                        {copied === "all" ? <><Check size={13} className="text-[#27AE60]" /> Copied</> : <><Copy size={13} /> Copy</>}
                      </button>
                      <button onClick={exportCSV} className="flex items-center gap-1.5 rounded-lg bg-[#EE4B3C] px-3 py-1 text-[12px] font-semibold text-white hover:opacity-90">
                        <Download size={13} /> Export CSV
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                    <div className="max-h-[500px] overflow-y-auto">
                      <table className="w-full text-[12.5px]">
                        <thead className="sticky top-0 bg-[var(--surface-2)] text-[11px] font-bold uppercase tracking-wide text-[var(--txt-2)]">
                          <tr>
                            <th className="px-3 py-2 text-left">#</th>
                            <th className="px-3 py-2 text-left">Input</th>
                            <th className="px-3 py-2 text-left">Type</th>
                            <th className="px-3 py-2 text-left">Status</th>
                            <th className="px-3 py-2 text-left">Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((r, i) => (
                            <tr key={i} className="border-t border-[var(--line)]">
                              <td className="px-3 py-2 font-mono text-[var(--txt-3)]">{i + 1}</td>
                              <td className="px-3 py-2 font-mono text-[var(--txt)]">{r.input}</td>
                              <td className="px-3 py-2 text-[var(--txt-2)]">{r.type}</td>
                              <td className="px-3 py-2">
                                {r.valid ? <span className="flex items-center gap-1 text-[#27AE60]"><CheckCircle size={12} /> Valid</span>
                                         : <span className="flex items-center gap-1 text-[#C0392B]"><AlertCircle size={12} /> Invalid</span>}
                              </td>
                              <td className="px-3 py-2 text-[var(--txt-2)]">
                                {r.valid ? (r.format ?? r.isbn13) : (r.reason ?? "—")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          <p className="mt-6 text-xs text-[var(--txt-2)]">🔒 100% private — validation runs locally in your browser.</p>

          <ToolPageSections
            processingMode="browser"
            howToSteps={[
              { title: "Pick Single or Bulk mode", desc: "Single: paste one ISBN, get full details. Bulk: paste or upload a list to validate all at once." },
              { title: "See instant results", desc: "Check digit is verified using the standard mod-11 (ISBN-10) or mod-10 (ISBN-13) algorithm." },
              { title: "Copy or export", desc: "Copy formatted values, or export the bulk report as CSV." },
            ]}
            capabilities={[
              "Single and bulk modes in one tool",
              "Validates ISBN-10 and ISBN-13",
              "Accepts any input format",
              "Explains invalid reasons (wrong length, bad check digit, missing 978/979)",
              "Converts between ISBN-10 and ISBN-13",
              "Identifies registration group / country",
              "Bulk: filter view (All / Valid / Invalid) + CSV export",
            ]}
            useCases={[
              "Verify a single ISBN before publishing",
              "Audit ISBN accuracy across a catalog",
              "Clean up ISBN lists from library databases",
              "Verify barcodes scanned in bulk",
            ]}
            relatedTools={["duplicate-isbn-finder","isbn-converter","isbn-country-identifier"]}
            faqs={[
              { q: "How many ISBNs can I validate in bulk mode?", a: "No hard limit — the tool handles tens of thousands. Very large lists (100k+) may be sluggish on lower-end devices." },
              { q: "What's the difference between ISBN-10 and ISBN-13?", a: "ISBN-10 was the standard until 2007. ISBN-13 (starting with 978/979) is required now. All ISBN-10s can be converted to ISBN-13." },
              { q: "Why do some ISBN-13s not convert to ISBN-10?", a: "Only 978-prefixed ISBN-13s have ISBN-10 equivalents. 979-prefixed ISBNs were created after ISBN-10 was retired." },
            ]}
          />
        </main>
      </div>
    </>
  );
}
