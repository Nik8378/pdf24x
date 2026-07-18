"use client";
import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import ToolPageSections from "@/components/tool/ToolPageSections";
import { validate, identifyGroup, normalize } from "@/lib/isbn/engine";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function ISBNRangeCheckerClient() {
  const [input, setInput] = useState("");

  const check = useMemo(() => {
    if (!input.trim()) return null;
    const v = validate(input);
    if (!v.valid) return { ok: false as const, reason: v.reason ?? "Invalid ISBN" };
    const n13 = v.isbn13 ?? normalize(input);
    const g = identifyGroup(n13);
    if (!g) return { ok: false as const, reason: "Registration group not recognized. This may be an unassigned or invalid ISBN range." };
    // Publisher prefix is the digits after the registration group and before the last (title identifier + check digit).
    // Without the ISBN Range Message publisher-length tables (very large; loaded on demand), we can't split exactly.
    // But we can report that the group is recognized and the ISBN falls within a valid range.
    return {
      ok: true as const,
      formatted: v.format,
      group: g.prefix,
      country: g.name,
      isbn13: v.isbn13,
      isbn10: v.isbn10,
    };
  }, [input]);

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--txt)]">ISBN Range Checker</h1>
            <p className="text-[13px] text-[var(--txt-2)]">
              Check whether an ISBN falls within a valid registration range. Verifies the check digit, then confirms the registration group is a recognized publisher range. 100% private.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
            <label className="mb-1.5 block text-[12px] font-semibold text-[var(--txt)]">Enter an ISBN</label>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false}
              placeholder="978-3-16-148410-0"
              className="w-full rounded-md border border-[var(--line-mid)] bg-[var(--surface-2)] px-3 py-2 font-mono text-[14px] text-[var(--txt)] outline-none focus:border-[#EE4B3C]/50" />
          </div>

          {check && (
            check.ok ? (
              <div className="mt-4 rounded-2xl border border-[#27AE60]/30 bg-[#E9F9EF] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <CheckCircle size={18} className="text-[#27AE60]" />
                  <p className="text-[15px] font-bold text-[#14532D]">ISBN is within a valid range</p>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Field label="Formatted" value={check.formatted} />
                  <Field label="Registration group" value={check.group} />
                  <Field label="Country / Language" value={check.country} />
                  <Field label="ISBN-13" value={check.isbn13} />
                  {check.isbn10 && <Field label="ISBN-10" value={check.isbn10} />}
                </div>
                <p className="mt-3 text-[11.5px] text-[#14532D]">
                  Full publisher range lookup (including exact publisher prefix length) requires the official ISBN International Range Message; this tool confirms the group is registered — the finer publisher slot cannot be determined without that data.
                </p>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-[#C0392B]/30 bg-[#FDECEA] p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-[#C0392B]" />
                  <p className="text-[15px] font-bold text-[#7F1D1D]">Not within a valid range</p>
                </div>
                <p className="mt-2 text-[13px] text-[#7F1D1D]">{check.reason}</p>
              </div>
            )
          )}

          <p className="mt-6 text-xs text-[var(--txt-2)]">🔒 100% private — lookup runs locally in your browser.</p>

          <ToolPageSections
            processingMode="browser"
            howToSteps={[
              { title: "Enter an ISBN", desc: "ISBN-10 or ISBN-13 — any format." },
              { title: "Check the range", desc: "The tool validates the check digit and confirms the registration group is an assigned range." },
              { title: "Review recognized group", desc: "See the country/language of the registration group." },
            ]}
            capabilities={[
              "Check-digit validation",
              "Registration group recognition (200+ groups)",
              "Reason reporting for invalid ranges",
              "ISBN-10 ↔ ISBN-13 conversion",
            ]}
            useCases={[
              "Filter out fake or fabricated ISBNs",
              "Spot ISBNs from unassigned prefixes",
              "Pre-check ISBNs before submitting to a distributor",
            ]}
            relatedTools={["isbn-validator","isbn-country-identifier","bulk-isbn-validator"]}
            faqs={[
              { q: "How is this different from ISBN Validator?", a: "Validator checks that the number is arithmetically correct. Range Checker additionally confirms the ISBN's registration prefix belongs to an assigned country/language group. An ISBN can have a valid check digit but come from an unassigned range." },
              { q: "Can this tell me the publisher name?", a: "Not by itself. Determining the exact publisher requires the ISBN International Agency's range message (available at isbn-international.org). Cross-reference the publisher prefix there or use the Metadata Extractor for full title/author/publisher data via Google Books / Open Library." },
            ]}
          />
        </main>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2">
      <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--txt-2)]">{label}</p>
      <p className="truncate font-mono text-[13px] text-[var(--txt)]">{value}</p>
    </div>
  );
}
