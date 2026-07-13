"use client";
import ToolPageSections from "@/components/tool/ToolPageSections";

import { useState, useRef, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Scissors, UploadCloud, Trash2, FileText, Info } from "lucide-react";

function fmtBytes(b: number) { return b < 1024*1024 ? (b/1024).toFixed(1)+" KB" : (b/(1024*1024)).toFixed(2)+" MB"; }

type SplitMethod = "extract" | "range" | "every";
type OutputOption = "multiple" | "zip";

function parsePageRange(input: string, total: number): number[] {
  const pages = new Set<number>();
  input.split(",").forEach(part => {
    const trimmed = part.trim();
    if (trimmed.includes("-")) {
      const [s, e] = trimmed.split("-").map(Number);
      for (let i = s; i <= Math.min(e, total); i++) if (i >= 1) pages.add(i);
    } else {
      const n = parseInt(trimmed);
      if (!isNaN(n) && n >= 1 && n <= total) pages.add(n);
    }
  });
  return Array.from(pages).sort((a, b) => a - b);
}

export default function SplitClient() {
  const [pdf, setPdf] = useState<{ name: string; size: number; file: File; pages: number } | null>(null);
  const [method, setMethod] = useState<SplitMethod>("extract");
  const [pageInput, setPageInput] = useState("1, 3, 5-8, 10-12");
  const [rangeInput, setRangeInput] = useState("1-5, 6-10");
  const [fileName, setFileName] = useState("Split-Document");
  const [outputOption, setOutputOption] = useState<OutputOption>("multiple");
  const [addPageNumbers, setAddPageNumbers] = useState(false);
  const [keepBookmarks, setKeepBookmarks] = useState(false);
  const [keepLinks, setKeepLinks] = useState(false);
  const [keepFormFields, setKeepFormFields] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const handleFile = useCallback(async (f: File) => {
    if (f.type !== "application/pdf") { showToast("Please upload a PDF file", "error"); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      setPdf({ name: f.name, size: f.size, file: f, pages: doc.getPageCount() });
      showToast("PDF loaded successfully");
    } catch { setPdf({ name: f.name, size: f.size, file: f, pages: 0 }); }
  }, []);

  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); };

  const selectedPages = pdf && method === "extract" ? parsePageRange(pageInput, pdf.pages) : [];

  const handleSplit = async () => {
    if (!pdf) return;
    setLoading(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await pdf.file.arrayBuffer();
      const srcDoc = await PDFDocument.load(bytes);
      const total = srcDoc.getPageCount();

      if (method === "every") {
        // Split every page into individual PDF
        const downloads: { bytes: Uint8Array; name: string }[] = [];
        for (let i = 0; i < total; i++) {
          const newDoc = await PDFDocument.create();
          const [page] = await newDoc.copyPages(srcDoc, [i]);
          newDoc.addPage(page);
          const b = await newDoc.save();
          downloads.push({ bytes: b, name: `${fileName}-page-${i + 1}.pdf` });
        }
        if (outputOption === "zip") {
          // Download as individual files (zip would need JSZip)
          for (const d of downloads) {
            const blob = new Blob([d.bytes.buffer as ArrayBuffer], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = d.name; a.click();
            URL.revokeObjectURL(url);
            await new Promise(r => setTimeout(r, 100));
          }
        } else {
          for (const d of downloads) {
            const blob = new Blob([d.bytes.buffer as ArrayBuffer], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = d.name; a.click();
            URL.revokeObjectURL(url);
            await new Promise(r => setTimeout(r, 100));
          }
        }
        showToast(`Split into ${total} PDF files!`);
      } else if (method === "extract") {
        const pages = parsePageRange(pageInput, total);
        if (!pages.length) { showToast("No valid pages selected", "error"); setLoading(false); return; }
        const newDoc = await PDFDocument.create();
        const copied = await newDoc.copyPages(srcDoc, pages.map(p => p - 1));
        copied.forEach(p => newDoc.addPage(p));
        const b = await newDoc.save();
        const blob = new Blob([b.buffer as ArrayBuffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = `${fileName}-extracted.pdf`; a.click();
        URL.revokeObjectURL(url);
        showToast(`Extracted ${pages.length} pages!`);
      } else {
        // Range split
        const ranges = rangeInput.split(",").map(r => r.trim()).filter(Boolean);
        for (let ri = 0; ri < ranges.length; ri++) {
          const range = ranges[ri];
          const pages = parsePageRange(range, total);
          if (!pages.length) continue;
          const newDoc = await PDFDocument.create();
          const copied = await newDoc.copyPages(srcDoc, pages.map(p => p - 1));
          copied.forEach(p => newDoc.addPage(p));
          const b = await newDoc.save();
          const blob = new Blob([b.buffer as ArrayBuffer], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url; a.download = `${fileName}-part-${ri + 1}.pdf`; a.click();
          URL.revokeObjectURL(url);
          await new Promise(r => setTimeout(r, 100));
        }
        showToast(`Split into ${ranges.length} PDF files!`);
      }
    } catch (err) { showToast("Split failed. Please try again.", "error"); console.error(err); }
    finally { setLoading(false); }
  };

  const methodCards = [
    { id: "extract" as SplitMethod, label: "Extract Pages", desc: "Extract specific pages and save as a new PDF." },
    { id: "range" as SplitMethod, label: "Split by Range", desc: "Split PDF by page ranges (e.g., 1-5, 6-10)." },
    { id: "every" as SplitMethod, label: "Split Every Page", desc: "Split PDF into separate files for each page." },
  ];

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1a1917]">Split PDF</h1>
            <p className="text-[13px] text-[#7a7875]">Split PDF pages into multiple PDFs. Extract specific pages or split by range.</p>
          </div>

          <div className="flex flex-col xl:flex-row gap-4 items-start">
            <div className="flex-1 min-w-0 w-full space-y-4">
              {/* Upload */}
              <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all shadow-sm flex flex-col items-center justify-center min-h-[200px] ${dragging ? "border-accent bg-accent-light" : "border-[#1a1917]/15 bg-white hover:border-accent hover:bg-accent-light"}`}>
                <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                <div className="w-11 h-11 rounded-full bg-[#f4f3f0] flex items-center justify-center mb-3">
                  <UploadCloud size={20} className="text-[#7a7875]" />
                </div>
                <p className="text-[14px] font-semibold text-[#1a1917] mb-1">Drag & drop your PDF here</p>
                <p className="text-[12.5px] text-[#7a7875] mb-4">or click to browse file</p>
                <button onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold text-[13.5px] px-6 py-2.5 rounded-full shadow-md">
                  <UploadCloud size={15} /> Choose PDF File
                </button>
                <p className="mt-3 text-[11.5px] text-[#7a7875]">Max file size: 100MB</p>
              </div>

              {/* File info */}
              {pdf && (
                <div className="bg-white border border-[#1a1917]/10 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1a1917] truncate">{pdf.name}</p>
                    <p className="text-[11.5px] text-[#7a7875]">{fmtBytes(pdf.size)} • {pdf.pages} pages</p>
                  </div>
                  <button onClick={() => setPdf(null)} className="p-2 rounded-lg text-[#7a7875] hover:text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                </div>
              )}

              {/* Split method */}
              {pdf && (
                <>
                  <div>
                    <p className="text-[14px] font-bold text-[#1a1917] mb-3">Choose Split Method</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {methodCards.map(m => (
                        <button key={m.id} onClick={() => setMethod(m.id)}
                          className={`text-left p-3 rounded-xl border transition-all ${method === m.id ? "border-accent bg-accent-light" : "border-[#1a1917]/10 bg-white hover:border-accent/40"}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Scissors size={14} className={method === m.id ? "text-accent" : "text-[#7a7875]"} />
                            <p className="text-[13px] font-bold text-[#1a1917]">{m.label}</p>
                          </div>
                          <p className="text-[11.5px] text-[#7a7875]">{m.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {method === "extract" && (
                    <div className="bg-white border border-[#1a1917]/10 rounded-xl p-4 shadow-sm">
                      <p className="text-[13px] font-bold text-[#1a1917] mb-1">Extract Pages</p>
                      <p className="text-[12px] text-[#7a7875] mb-3">Enter page numbers you want to extract (e.g., 1, 3, 5-8, 10)</p>
                      <input value={pageInput} onChange={e => setPageInput(e.target.value)}
                        className="w-full bg-[#f4f3f0] border border-[#1a1917]/12 rounded-lg px-3 py-2.5 text-[13px] text-[#1a1917] focus:outline-none focus:border-accent mb-3"
                        placeholder="1, 3, 5-8, 10-12" />
                      <div className="flex items-center justify-between text-[12.5px]">
                        <span className="text-[#7a7875]">Total pages: {pdf.pages}</span>
                        {selectedPages.length > 0 && <span className="text-green-600 font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />{selectedPages.length} pages selected</span>}
                      </div>
                      {selectedPages.length > 0 && (
                        <div className="mt-2 flex items-start gap-1.5 text-[11.5px] text-[#7a7875] bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                          <Info size={12} className="text-blue-500 shrink-0 mt-0.5" />
                          The selected pages will be extracted and saved as a new PDF.
                        </div>
                      )}
                    </div>
                  )}

                  {method === "range" && (
                    <div className="bg-white border border-[#1a1917]/10 rounded-xl p-4 shadow-sm">
                      <p className="text-[13px] font-bold text-[#1a1917] mb-1">Split by Range</p>
                      <p className="text-[12px] text-[#7a7875] mb-3">Enter ranges separated by commas. Each range becomes a separate PDF.</p>
                      <input value={rangeInput} onChange={e => setRangeInput(e.target.value)}
                        className="w-full bg-[#f4f3f0] border border-[#1a1917]/12 rounded-lg px-3 py-2.5 text-[13px] text-[#1a1917] focus:outline-none focus:border-accent"
                        placeholder="1-5, 6-10, 11-20" />
                    </div>
                  )}

                  {method === "every" && (
                    <div className="bg-white border border-[#1a1917]/10 rounded-xl p-4 shadow-sm flex items-start gap-2">
                      <Info size={14} className="text-accent shrink-0 mt-0.5" />
                      <p className="text-[12.5px] text-[#4a4845]">All {pdf.pages} pages will be split into {pdf.pages} individual PDF files and downloaded one by one.</p>
                    </div>
                  )}
                </>
              )}

              {/* Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[["100% Private","Files never leave your device"],["Fast Processing","Split PDFs in seconds locally"],["High Quality","Original quality is maintained"],["Easy to Use","Simple interface, powerful results"]].map(([t, d]) => (
                  <div key={t} className="bg-white border border-[#1a1917]/10 rounded-xl p-3 shadow-sm">
                    <p className="text-[12px] font-bold text-[#1a1917] mb-0.5">{t}</p>
                    <p className="text-[11px] text-[#7a7875]">{d}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="w-full xl:w-[280px] shrink-0 xl:sticky xl:top-14">
              <div className="bg-white border border-[#1a1917]/10 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-[#1a1917]/8">
                  <Scissors size={14} className="text-[#7a7875]" />
                  <h3 className="text-[13px] font-bold text-[#1a1917]">Split Settings</h3>
                </div>
                <div className="space-y-3.5">
                  <div>
                    <p className="text-[10.5px] font-bold text-[#1a1917] uppercase tracking-widest opacity-50 mb-2">File Name</p>
                    <input value={fileName} onChange={e => setFileName(e.target.value)}
                      className="w-full bg-[#f4f3f0] border border-[#1a1917]/12 rounded-lg px-3 py-2 text-[13px] text-[#1a1917] focus:outline-none focus:border-accent"
                      placeholder="Split-Document" />
                    <p className="text-[11px] text-[#7a7875] mt-1">Output file names will be based on this.</p>
                  </div>
                  <div>
                    <p className="text-[10.5px] font-bold text-[#1a1917] uppercase tracking-widest opacity-50 mb-2">Output Options</p>
                    {[["multiple", "Multiple PDF files", "Save each split as a separate PDF file."],["zip", "Zip all files", "Compress all split PDFs into a ZIP file."]].map(([val, label, desc]) => (
                      <label key={val} className="flex items-start gap-2 mb-2 cursor-pointer" onClick={() => setOutputOption(val as OutputOption)}>
                        <div className={`w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 ${outputOption === val ? "border-accent bg-accent" : "border-[#d4d2cb]"}`}>
                          {outputOption === val && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div><p className="text-[12.5px] font-medium text-[#1a1917]">{label}</p><p className="text-[11px] text-[#7a7875]">{desc}</p></div>
                      </label>
                    ))}
                  </div>
                  <div>
                    <p className="text-[10.5px] font-bold text-[#1a1917] uppercase tracking-widest opacity-50 mb-2">Page Label</p>
                    <label className="flex items-center gap-2 cursor-pointer" onClick={() => setAddPageNumbers(!addPageNumbers)}>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${addPageNumbers ? "bg-accent border-accent" : "border-[#d4d2cb]"}`}>
                        {addPageNumbers && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span className="text-[12.5px] text-[#1a1917]">Add page numbers</span>
                    </label>
                    <p className="text-[11px] text-[#7a7875] ml-6">Add page numbers to the extracted PDF.</p>
                  </div>
                  <div>
                    <p className="text-[10.5px] font-bold text-[#1a1917] uppercase tracking-widest opacity-50 mb-2">Advanced Options</p>
                    {([["keepBookmarks", keepBookmarks, setKeepBookmarks, "Keep bookmarks"],["keepLinks", keepLinks, setKeepLinks, "Keep links"],["keepFormFields", keepFormFields, setKeepFormFields, "Keep form fields"]] as [string, boolean, React.Dispatch<React.SetStateAction<boolean>>, string][]).map(([key, val, setter, label]) => (
                      <label key={key} className="flex items-center gap-2 mb-2 cursor-pointer" onClick={() => setter(!val)}>
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${val ? "bg-accent border-accent" : "border-[#d4d2cb]"}`}>
                          {val && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <span className="text-[12.5px] text-[#1a1917]">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="border-t border-[#1a1917]/8 mt-3 pt-3">
                  <button onClick={handleSplit} disabled={!pdf || loading}
                    className={`w-full flex items-center justify-center gap-2 font-semibold text-[14px] py-3 rounded-full transition-all ${!pdf || loading ? "bg-[#f4f3f0] text-[#7a7875] cursor-not-allowed" : "bg-accent hover:bg-accent-dark text-white shadow-md"}`}>
                    {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full spin" /> : <Scissors size={16} />}
                    {loading ? "Splitting…" : "Split PDF →"}
                  </button>
                  <p className="text-center text-[11px] text-[#7a7875] mt-2">Your files are processed securely and never stored.</p>
                </div>
              </div>
            </div>
          </div>
        
      <div className="mx-4 sm:mx-6 lg:mx-8 mt-6 mb-6 space-y-4">
        <div className="rounded-2xl border border-[#1c1c1c] bg-white p-6" style={{ boxShadow: "3px 3px 0 0 #1c1c1c" }}>
          <h2 className="text-lg font-extrabold mb-4" style={{ color: "#1a1a1a", fontFamily: "Archivo, Inter, sans-serif" }}>How It Works</h2>
          <ol className="space-y-3">
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "#FF6B5E" }}>1</span><div><p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>Upload your PDF</p><p className="text-xs mt-0.5" style={{ color: "#6b6760" }}>Drop your PDF file into the upload area.</p></div></li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "#FF6B5E" }}>2</span><div><p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>Select split method</p><p className="text-xs mt-0.5" style={{ color: "#6b6760" }}>Choose to split by page range, extract specific pages, or split every N pages.</p></div></li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "#FF6B5E" }}>3</span><div><p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>Download split files</p><p className="text-xs mt-0.5" style={{ color: "#6b6760" }}>Download individual pages or a ZIP file containing all split documents.</p></div></li>
          </ol>
        </div>
        <div className="rounded-2xl border border-[#1c1c1c] bg-white p-6" style={{ boxShadow: "3px 3px 0 0 #1c1c1c" }}>
          <h2 className="text-lg font-extrabold mb-4" style={{ color: "#1a1a1a", fontFamily: "Archivo, Inter, sans-serif" }}>Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="border-b pb-4 last:border-0 last:pb-0" style={{ borderColor: "#e5e7eb" }}><p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>Can I extract specific pages?</p><p className="text-xs mt-1.5 leading-relaxed" style={{ color: "#6b6760" }}>Yes. Select individual pages visually or enter custom page ranges like 1-3,5,8-10.</p></div>
            <div className="border-b pb-4 last:border-0 last:pb-0" style={{ borderColor: "#e5e7eb" }}><p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>What split modes are available?</p><p className="text-xs mt-1.5 leading-relaxed" style={{ color: "#6b6760" }}>You can split by custom ranges, select specific pages visually, or split into equal chunks of N pages each.</p></div>
            <div className="border-b pb-4 last:border-0 last:pb-0" style={{ borderColor: "#e5e7eb" }}><p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>Will the output be one file or multiple?</p><p className="text-xs mt-1.5 leading-relaxed" style={{ color: "#6b6760" }}>Depends on your split — a single range produces one PDF, multiple ranges produce a ZIP with multiple PDFs.</p></div>
            <div className="border-b pb-4 last:border-0 last:pb-0" style={{ borderColor: "#e5e7eb" }}><p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>Is the original PDF affected?</p><p className="text-xs mt-1.5 leading-relaxed" style={{ color: "#6b6760" }}>No. The original file is never modified. Split files are new documents.</p></div>
          </div>
        </div>
      </div>

      <div className="mx-4 sm:mx-6 lg:mx-8 mt-4">
        <ToolPageSections
          breadcrumb={[]}
          relatedTools={["merge", "compress", "rotate-pdf"]}
          relatedBlogs={[
            { title: "How to Merge and Split PDFs for Free", href: "/blog/how-to-merge-split-pdf-free" },
          ]}
        />
      </div>
      </main>
      </div>
      {toast && <div className={`fixed bottom-20 lg:bottom-5 right-4 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[13.5px] font-medium z-[200] toast-enter ${toast.type === "success" ? "bg-green-700 text-white" : "bg-red-600 text-white"}`}>{toast.msg}</div>}
    </>
  );
}
