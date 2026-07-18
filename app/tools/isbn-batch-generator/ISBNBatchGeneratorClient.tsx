"use client";
import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import ToolPageSections from "@/components/tool/ToolPageSections";
import { checkDigit13, formatISBN13 } from "@/lib/isbn/engine";
import { Copy, Check, Download, RefreshCw } from "lucide-react";

// Generate an ISBN-shaped internal ID: 979 prefix + custom company code + sequential + valid check digit.
// Uses 979-8 (US) or 979-12 (Italy) etc — but for INTERNAL codes, we use 979 + user prefix.
// User picks a 4-8 digit "company prefix" (fake registration group + publisher slot), we fill sequential + check.

function pad(n: number, w: number): string {
  return String(n).padStart(w, "0");
}

export default function ISBNBatchGeneratorClient() {
  const [prefix, setPrefix] = useState("9793999"); // 7 digits by default (979 + custom "3999" internal group)
  const [start, setStart] = useState(1);
  const [count, setCount] = useState(20);
  const [copied, setCopied] = useState<string | null>(null);

  const codes = useMemo(() => {
    // Total 12 digits before check → prefix + sequential = 12 digits
    const seqLen = 12 - prefix.length;
    if (seqLen < 1) return [];
    const out: { seq: number; body: string; check: string; full: string; formatted: string; }[] = [];
    for (let i = 0; i < count; i++) {
      const seq = start + i;
      const body = prefix + pad(seq, seqLen);
      if (body.length !== 12) continue;
      const check = checkDigit13(body);
      const full = body + check;
      out.push({ seq, body, check, full, formatted: formatISBN13(full) });
    }
    return out;
  }, [prefix, start, count]);

  const prefixError = useMemo(() => {
    if (!/^\d+$/.test(prefix)) return "Prefix must be digits only";
    if (prefix.length < 4 || prefix.length > 11) return "Prefix must be 4–11 digits";
    if (!prefix.startsWith("979") && !prefix.startsWith("978")) return "Prefix must start with 978 or 979 (internal codes: 979 recommended)";
    return null;
  }, [prefix]);

  const copy = (t: string, id: string) => { navigator.clipboard.writeText(t); setCopied(id); setTimeout(() => setCopied(null), 1500); };
  const copyAll = () => copy(codes.map((c) => c.full).join("\n"), "all");

  const exportCSV = () => {
    const lines = ["Sequence,ISBN-13,Formatted"];
    for (const c of codes) lines.push(`${c.seq},${c.full},${c.formatted}`);
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "isbn-batch.csv"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const randomizeStart = () => setStart(Math.floor(Math.random() * 100000));

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--txt)]">ISBN Batch Generator</h1>
            <p className="text-[13px] text-[var(--txt-2)]">
              Generate batches of internal 13-digit codes with valid ISBN check digits. Useful for internal inventory IDs shaped like ISBNs (for test data, mock catalogs, or private numbering schemes).
            </p>
            <p className="mt-2 flex items-start gap-1.5 rounded-md border border-[#B7791F]/30 bg-[#FFF8E6] px-3 py-1.5 text-[11.5px] text-[#7C4A03]">
              <span>⚠️</span>
              <span>These are <strong>not real ISBNs</strong>. Real ISBNs must be purchased from your country&apos;s ISBN agency. Use these only for internal identifiers, testing, or mock data.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-[12px] font-semibold text-[var(--txt)]">Prefix (4–11 digits, starts with 978 or 979)</label>
                  <input type="text" value={prefix} onChange={(e) => setPrefix(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    className="w-full rounded-md border border-[var(--line-mid)] bg-[var(--surface-2)] px-3 py-2 font-mono text-[13px] text-[var(--txt)] outline-none focus:border-[#EE4B3C]/50" />
                  {prefixError && <p className="mt-1 text-[11.5px] text-[#C0392B]">{prefixError}</p>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 flex items-center justify-between text-[12px] font-semibold text-[var(--txt)]">
                      Starting number
                      <button onClick={randomizeStart} className="rounded-md p-1 text-[var(--txt-2)] hover:bg-[var(--hover-soft)]" title="Randomize"><RefreshCw size={12} /></button>
                    </label>
                    <input type="number" min={0} value={start} onChange={(e) => setStart(parseInt(e.target.value) || 0)}
                      className="w-full rounded-md border border-[var(--line-mid)] bg-[var(--surface-2)] px-3 py-2 font-mono text-[13px] text-[var(--txt)] outline-none focus:border-[#EE4B3C]/50" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[12px] font-semibold text-[var(--txt)]">Count</label>
                    <input type="number" min={1} max={10000} value={count} onChange={(e) => setCount(Math.min(10000, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-full rounded-md border border-[var(--line-mid)] bg-[var(--surface-2)] px-3 py-2 font-mono text-[13px] text-[var(--txt)] outline-none focus:border-[#EE4B3C]/50" />
                  </div>
                </div>
                {codes.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button onClick={copyAll} className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-3 py-1.5 text-[12px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40">
                      {copied === "all" ? <><Check size={13} className="text-[#27AE60]" /> Copied</> : <><Copy size={13} /> Copy all</>}
                    </button>
                    <button onClick={exportCSV} className="flex items-center gap-1.5 rounded-lg bg-[#EE4B3C] px-3 py-1.5 text-[12px] font-semibold text-white hover:opacity-90">
                      <Download size={13} /> Export CSV
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-4">
              <p className="mb-2 text-[11.5px] font-bold uppercase tracking-wide text-[var(--txt-2)]">Preview · {codes.length} code{codes.length === 1 ? "" : "s"}</p>
              <div className="max-h-[400px] overflow-y-auto rounded-lg border border-[var(--line)] bg-[var(--surface)]">
                {codes.length === 0 ? (
                  <p className="p-4 text-center text-[12.5px] text-[var(--txt-2)]">Adjust settings to generate codes</p>
                ) : (
                  <table className="w-full font-mono text-[12.5px]">
                    <tbody>
                      {codes.slice(0, 200).map((c) => (
                        <tr key={c.seq} className="border-b border-[var(--line)] last:border-0">
                          <td className="w-10 px-2 py-1 text-[10.5px] text-[var(--txt-3)]">#{c.seq}</td>
                          <td className="px-2 py-1 text-[var(--txt)]">{c.formatted}</td>
                          <td className="w-10 px-2 py-1 text-right">
                            <button onClick={() => copy(c.full, String(c.seq))} className="rounded p-1 text-[var(--txt-2)] hover:bg-[var(--hover-soft)]">
                              {copied === String(c.seq) ? <Check size={11} className="text-[#27AE60]" /> : <Copy size={11} />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {codes.length > 200 && (
                <p className="mt-2 text-[11.5px] text-[var(--txt-2)]">Showing first 200. Export CSV for all {codes.length}.</p>
              )}
            </div>
          </div>

          <p className="mt-6 text-xs text-[var(--txt-2)]">🔒 100% private — generation runs locally in your browser.</p>

          <ToolPageSections
            processingMode="browser"
            howToSteps={[
              { title: "Set a prefix", desc: "Start with 978 or 979 plus your internal identifier digits (total 4–11 digits)." },
              { title: "Pick a starting number and count", desc: "Sequential numbers fill the remaining digits before the check digit." },
              { title: "Copy or export", desc: "Copy all codes, or download the batch as CSV with sequence numbers." },
            ]}
            capabilities={[
              "Generate up to 10,000 codes at once",
              "Uses standard ISBN-13 check digit algorithm (mod-10)",
              "Codes are ISBN-shaped and pass validation",
              "Sequential or randomized starting numbers",
              "CSV export for import into inventory systems",
            ]}
            useCases={[
              "Internal inventory IDs for a private catalog",
              "Test/mock data for book database development",
              "Placeholder identifiers before purchasing real ISBNs",
              "Numbering schemes for zines or self-published prints",
            ]}
            relatedTools={["isbn-validator","isbn-barcode-generator","isbn-country-identifier"]}
            faqs={[
              { q: "Are these real ISBNs I can use commercially?", a: "No. Real ISBNs must be purchased from your country's official ISBN agency (Bowker in the US, Nielsen in the UK, etc.). These generated codes are for internal use, testing, or mock data only." },
              { q: "Will these codes clash with real ISBNs?", a: "Possibly. If you pick a prefix that overlaps with an assigned range, some codes will coincidentally match real ISBNs. For internal use only — never publish books with these codes." },
              { q: "Why use ISBN-shaped codes at all?", a: "They work with existing ISBN-aware software (validators, barcode scanners) as long as the check digit is valid, which makes them convenient placeholders during development." },
            ]}
          />
        </main>
      </div>
    </>
  );
}
