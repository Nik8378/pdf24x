"use client";
import { useState, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BookOpen, ArrowLeftRight, Copy, CheckCircle, Trash2, Plus } from "lucide-react";

// ─── ISBN Logic ───────────────────────────────────────────────────────────────

function cleanISBN(raw: string): string {
  return raw.replace(/[\s\-–—]/g, "").toUpperCase();
}

function detectType(isbn: string): "ISBN-10" | "ISBN-13" | "invalid" {
  const clean = cleanISBN(isbn);
  if (clean.length === 10 && /^\d{9}[\dX]$/.test(clean)) return "ISBN-10";
  if (clean.length === 13 && /^\d{13}$/.test(clean)) return "ISBN-13";
  return "invalid";
}

function validateISBN10(isbn: string): boolean {
  const clean = cleanISBN(isbn);
  if (!/^\d{9}[\dX]$/.test(clean)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += (10 - i) * parseInt(clean[i]);
  const last = clean[9] === "X" ? 10 : parseInt(clean[9]);
  sum += last;
  return sum % 11 === 0;
}

function validateISBN13(isbn: string): boolean {
  const clean = cleanISBN(isbn);
  if (!/^\d{13}$/.test(clean)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(clean[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return check === parseInt(clean[12]);
}

function isbn10to13(isbn: string): string {
  const clean = cleanISBN(isbn).slice(0, 9);
  const base = "978" + clean;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(base[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return base + check;
}

function isbn13to10(isbn: string): string | null {
  const clean = cleanISBN(isbn);
  if (!clean.startsWith("978")) return null;
  const base = clean.slice(3, 12);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += (10 - i) * parseInt(base[i]);
  }
  const check = (11 - (sum % 11)) % 11;
  return base + (check === 10 ? "X" : check.toString());
}

function formatISBN(isbn: string, type: "ISBN-10" | "ISBN-13"): string {
  if (type === "ISBN-13") {
    return `${isbn.slice(0, 3)}-${isbn.slice(3, 4)}-${isbn.slice(4, 10)}-${isbn.slice(10, 12)}-${isbn.slice(12)}`;
  }
  return `${isbn.slice(0, 1)}-${isbn.slice(1, 5)}-${isbn.slice(5, 9)}-${isbn.slice(9)}`;
}

interface ConvertResult {
  input: string;
  inputType: "ISBN-10" | "ISBN-13" | "invalid";
  isValid: boolean;
  output: string | null;
  outputType: "ISBN-10" | "ISBN-13" | null;
  outputFormatted: string | null;
  error: string | null;
}

function convertISBN(input: string): ConvertResult {
  const clean = cleanISBN(input);
  const inputType = detectType(clean);

  if (inputType === "invalid") {
    return { input, inputType, isValid: false, output: null, outputType: null, outputFormatted: null, error: "Invalid ISBN format. Must be 10 or 13 digits." };
  }

  if (inputType === "ISBN-10") {
    const isValid = validateISBN10(clean);
    if (!isValid) return { input, inputType, isValid: false, output: null, outputType: null, outputFormatted: null, error: "Invalid ISBN-10 check digit." };
    const output = isbn10to13(clean);
    return { input, inputType, isValid: true, output, outputType: "ISBN-13", outputFormatted: formatISBN(output, "ISBN-13"), error: null };
  }

  // ISBN-13
  const isValid = validateISBN13(clean);
  if (!isValid) return { input, inputType, isValid: false, output: null, outputType: null, outputFormatted: null, error: "Invalid ISBN-13 check digit." };
  const output = isbn13to10(clean);
  if (!output) return { input, inputType, isValid: true, output: null, outputType: null, outputFormatted: null, error: "Cannot convert ISBN-13 to ISBN-10: prefix is not 978." };
  return { input, inputType, isValid: true, output, outputType: "ISBN-10", outputFormatted: formatISBN(output, "ISBN-10"), error: null };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ISBNConverterClient() {
  const [inputs, setInputs] = useState<string[]>([""]);
  const [results, setResults] = useState<ConvertResult[]>([]);
  const [converted, setConverted] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleConvert = useCallback(() => {
    const filled = inputs.filter(i => i.trim());
    if (!filled.length) { showToast("Please enter at least one ISBN", "error"); return; }
    const res = filled.map(convertISBN);
    setResults(res);
    setConverted(true);
    const valid = res.filter(r => r.isValid).length;
    showToast(`Converted ${valid} of ${res.length} ISBN${res.length > 1 ? "s" : ""} successfully`);
  }, [inputs]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyAll = () => {
    const all = results.filter(r => r.output).map(r => r.output).join("\n");
    navigator.clipboard.writeText(all);
    showToast("All results copied to clipboard");
  };

  const addRow = () => setInputs(prev => [...prev, ""]);
  const removeRow = (i: number) => setInputs(prev => prev.filter((_, idx) => idx !== i));
  const updateRow = (i: number, val: string) => setInputs(prev => prev.map((v, idx) => idx === i ? val : v));

  const liveResult = inputs[0] ? convertISBN(inputs[0]) : null;

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-8">

          {/* Header */}
          <div className="mb-5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1a1917] mb-1">ISBN Converter</h1>
            <p className="text-[13px] text-[#7a7875]">
              Auto-detect and convert between ISBN-10 and ISBN-13. Validates check digits instantly.
            </p>
          </div>

          {/* SEO pills */}
          <div className="flex flex-wrap gap-2 mb-5">
            {["ISBN-10 to ISBN-13", "ISBN-13 to ISBN-10", "Auto Detect", "Validate ISBN", "Bulk Convert", "Free"].map(tag => (
              <span key={tag} className="text-[11px] font-medium text-[#7a7875] bg-[#f4f3f0] border border-[#e5e3de] rounded-full px-3 py-1">{tag}</span>
            ))}
          </div>

          <div className="flex flex-col xl:flex-row gap-4 items-start">

            {/* Left — Input */}
            <div className="flex-1 min-w-0 w-full space-y-4">

              {/* Single converter with live preview */}
              <div className="bg-white border border-[#1a1917]/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1a1917]/8">
                  <ArrowLeftRight size={14} className="text-[#7a7875]" />
                  <h2 className="text-[13px] font-bold text-[#1a1917]">Quick Convert</h2>
                  {liveResult && liveResult.inputType !== "invalid" && (
                    <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full bg-accent-bg text-accent">
                      {liveResult.inputType} detected
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
                  {/* Input */}
                  <div>
                    <label className="text-[10.5px] font-bold text-[#7a7875] uppercase tracking-widest mb-1.5 block">Input ISBN</label>
                    <input
                      value={inputs[0]}
                      onChange={e => updateRow(0, e.target.value)}
                      placeholder="e.g. 0-306-40615-2 or 978-3-16-148410-0"
                      className="w-full bg-[#f4f3f0] border border-[#1a1917]/12 rounded-xl px-4 py-3 text-[14px] text-[#1a1917] font-mono focus:outline-none focus:border-accent focus:bg-white transition-all"
                    />
                    {liveResult && inputs[0] && (
                      <p className={`text-[11.5px] mt-1.5 ${liveResult.isValid ? "text-green-600" : liveResult.inputType === "invalid" ? "text-[#7a7875]" : "text-red-500"}`}>
                        {liveResult.inputType === "invalid" ? "Enter a valid 10 or 13 digit ISBN" : liveResult.isValid ? `✓ Valid ${liveResult.inputType}` : `✗ ${liveResult.error}`}
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center pt-5">
                    <div className="w-8 h-8 rounded-full bg-[#f4f3f0] flex items-center justify-center">
                      <ArrowLeftRight size={14} className="text-[#7a7875]" />
                    </div>
                  </div>

                  {/* Output */}
                  <div>
                    <label className="text-[10.5px] font-bold text-[#7a7875] uppercase tracking-widest mb-1.5 block">
                      {liveResult?.outputType ?? "Output ISBN"}
                    </label>
                    <div className="relative">
                      <input
                        readOnly
                        value={liveResult?.output ?? ""}
                        placeholder="Result appears here"
                        className="w-full bg-[#f4f3f0] border border-[#1a1917]/12 rounded-xl px-4 py-3 pr-10 text-[14px] text-[#1a1917] font-mono focus:outline-none cursor-default"
                      />
                      {liveResult?.output && (
                        <button onClick={() => handleCopy(liveResult.output!)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a7875] hover:text-accent transition-colors">
                          {copied === liveResult.output ? <CheckCircle size={15} className="text-green-500" /> : <Copy size={15} />}
                        </button>
                      )}
                    </div>
                    {liveResult?.outputFormatted && (
                      <p className="text-[11.5px] text-[#7a7875] mt-1.5 font-mono">{liveResult.outputFormatted}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bulk converter */}
              <div className="bg-white border border-[#1a1917]/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1a1917]/8">
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-[#7a7875]" />
                    <h2 className="text-[13px] font-bold text-[#1a1917]">Bulk Convert</h2>
                  </div>
                  <button onClick={addRow}
                    className="flex items-center gap-1.5 text-[12px] text-accent hover:text-accent-dark font-medium transition-colors">
                    <Plus size={13} /> Add ISBN
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  {inputs.map((val, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[11px] text-[#7a7875] w-5 text-right shrink-0">{i + 1}</span>
                      <input
                        value={val}
                        onChange={e => updateRow(i, e.target.value)}
                        placeholder={`ISBN ${i + 1}`}
                        className="flex-1 bg-[#f4f3f0] border border-[#1a1917]/12 rounded-lg px-3 py-2 text-[13px] text-[#1a1917] font-mono focus:outline-none focus:border-accent focus:bg-white transition-all"
                      />
                      {inputs.length > 1 && (
                        <button onClick={() => removeRow(i)} className="text-[#7a7875] hover:text-red-500 transition-colors p-1">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button onClick={handleConvert}
                  className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold text-[14px] py-3 rounded-full shadow-md hover:shadow-lg transition-all">
                  <ArrowLeftRight size={16} />
                  Convert All ISBNs
                </button>
              </div>

              {/* Results */}
              {converted && results.length > 0 && (
                <div className="bg-white border border-[#1a1917]/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1a1917]/8">
                    <h2 className="text-[13px] font-bold text-[#1a1917]">
                      Results ({results.filter(r => r.isValid).length}/{results.length} converted)
                    </h2>
                    {results.some(r => r.output) && (
                      <button onClick={handleCopyAll}
                        className="flex items-center gap-1.5 text-[12px] text-accent hover:underline font-medium">
                        <Copy size={12} /> Copy All
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {results.map((r, i) => (
                      <div key={i} className={`rounded-xl p-3 border ${r.isValid ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${r.isValid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                {r.inputType === "invalid" ? "Invalid" : r.inputType}
                              </span>
                              {r.outputType && (
                                <>
                                  <ArrowLeftRight size={10} className="text-[#7a7875]" />
                                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-accent-bg text-accent">
                                    {r.outputType}
                                  </span>
                                </>
                              )}
                            </div>
                            <p className="text-[12px] font-mono text-[#7a7875]">{r.input}</p>
                            {r.output && (
                              <p className="text-[13px] font-mono font-semibold text-[#1a1917] mt-0.5">{r.output}</p>
                            )}
                            {r.outputFormatted && (
                              <p className="text-[11px] font-mono text-[#7a7875]">{r.outputFormatted}</p>
                            )}
                            {r.error && (
                              <p className="text-[11.5px] text-red-500 mt-0.5">{r.error}</p>
                            )}
                          </div>
                          {r.output && (
                            <button onClick={() => handleCopy(r.output!)}
                              className="shrink-0 text-[#7a7875] hover:text-accent transition-colors p-1">
                              {copied === r.output ? <CheckCircle size={15} className="text-green-500" /> : <Copy size={15} />}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info section for SEO */}
              <div className="bg-white border border-[#1a1917]/10 rounded-2xl p-5">
                <h2 className="text-[13px] font-bold text-[#1a1917] mb-3">About ISBN Conversion</h2>
                <div className="space-y-3 text-[12.5px] text-[#4a4845] leading-relaxed">
                  <p><strong className="text-[#1a1917]">ISBN-10</strong> — used for books published before 2007. 10 digits, last digit can be X (representing 10).</p>
                  <p><strong className="text-[#1a1917]">ISBN-13</strong> — current standard since 2007. 13 digits, always starts with 978 or 979.</p>
                  <p><strong className="text-[#1a1917]">Converting ISBN-10 to ISBN-13</strong> — add "978" prefix, recalculate the check digit.</p>
                  <p><strong className="text-[#1a1917]">Converting ISBN-13 to ISBN-10</strong> — only possible for ISBNs starting with "978". Remove prefix, recalculate check digit.</p>
                  <p><strong className="text-[#1a1917]">979 prefix ISBNs</strong> — cannot be converted to ISBN-10 as there is no equivalent format.</p>
                </div>
              </div>
            </div>

            {/* Right — Info panel */}
            <div className="w-full xl:w-[240px] shrink-0 xl:sticky xl:top-14 space-y-3">
              <div className="bg-white border border-[#1a1917]/10 rounded-2xl p-4 shadow-sm">
                <h3 className="text-[13px] font-bold text-[#1a1917] mb-3">Format Guide</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10.5px] font-bold text-[#7a7875] uppercase tracking-widest mb-1">ISBN-10</p>
                    <p className="text-[12px] font-mono text-[#1a1917]">0-306-40615-2</p>
                    <p className="text-[11px] text-[#7a7875]">10 digits, last can be X</p>
                  </div>
                  <div className="border-t border-[#e5e3de] pt-3">
                    <p className="text-[10.5px] font-bold text-[#7a7875] uppercase tracking-widest mb-1">ISBN-13</p>
                    <p className="text-[12px] font-mono text-[#1a1917]">978-0-306-40615-7</p>
                    <p className="text-[11px] text-[#7a7875]">13 digits, starts with 978/979</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#1a1917]/10 rounded-2xl p-4 shadow-sm">
                <h3 className="text-[13px] font-bold text-[#1a1917] mb-3">Accepted Formats</h3>
                <div className="space-y-1.5">
                  {[
                    "0306406152",
                    "0-306-40615-2",
                    "978 0 306 40615 7",
                    "9780306406157",
                    "978-0-306-40615-7",
                  ].map(f => (
                    <button key={f} onClick={() => { updateRow(0, f); setConverted(false); }}
                      className="w-full text-left text-[11.5px] font-mono text-[#4a4845] hover:text-accent hover:bg-accent-bg rounded-lg px-2 py-1 transition-all">
                      {f}
                    </button>
                  ))}
                </div>
                <p className="text-[10.5px] text-[#7a7875] mt-2">Click to try an example</p>
              </div>

              <div className="bg-[#f4f3f0] border border-[#e5e3de] rounded-2xl p-4">
                <p className="text-[11px] font-bold text-[#1a1917] mb-1">100% Private</p>
                <p className="text-[11px] text-[#7a7875] leading-snug">All conversion happens in your browser. No data is sent to any server.</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {toast && (
        <div className={`fixed bottom-20 lg:bottom-5 right-4 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[13.5px] font-medium z-[200] ${toast.type === "success" ? "bg-green-700 text-white" : "bg-red-600 text-white"}`}>
          {toast.msg}
        </div>
      )}
    </>
  );
}
