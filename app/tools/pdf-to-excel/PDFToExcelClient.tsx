"use client";
import { useState, useRef, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Upload, Download, Trash2, FileText, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";

function fmtBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

interface ExtractedTable {
  page: number;
  rows: string[][];
  title: string;
}

export default function PDFToExcelClient() {
  const [file, setFile] = useState<File | null>(null);
  const [tables, setTables] = useState<ExtractedTable[]>([]);
  const [allText, setAllText] = useState<{ page: number; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"tables" | "text">("tables");
  const [options, setOptions] = useState({
    sheetPerPage: false,
    includePageNumbers: true,
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleFile = useCallback(async (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf") && f.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      return;
    }
    setFile(f);
    setError(null);
    setLoading(true);
    setTables([]);
    setAllText([]);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

      const arrayBuffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      const extractedTables: ExtractedTable[] = [];
      const extractedText: { page: number; text: string }[] = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();

        // Group text items by Y position
        const byY = new Map<number, { x: number; str: string }[]>();
        for (const item of content.items) {
          if (!("str" in item) || !item.str.trim()) continue;
          const transform = (item as { transform: number[] }).transform;
          const y = Math.round(transform[5]);
          const x = Math.round(transform[4]);
          if (!byY.has(y)) byY.set(y, []);
          byY.get(y)!.push({ x, str: item.str });
        }

        // Sort rows top to bottom
        const sortedYs = Array.from(byY.keys()).sort((a, b) => b - a);
        const rows: string[][] = sortedYs
          .map(y => byY.get(y)!.sort((a, b) => a.x - b.x).map(i => i.str.trim()).filter(Boolean))
          .filter(r => r.length > 0);

        // Full text
        const fullText = rows.map(r => r.join("  ")).join("\n");
        extractedText.push({ page: pageNum, text: fullText });

        // Detect table rows (2+ columns)
        const tableRows = rows.filter(r => r.length >= 2);
        if (tableRows.length >= 3) {
          extractedTables.push({
            page: pageNum,
            rows: tableRows,
            title: `Page ${pageNum} — Table`,
          });
        }
      }

      setAllText(extractedText);
      setTables(extractedTables);

      if (extractedTables.length === 0) {
        showToast("No tables detected — extracted all text. Download to get it as Excel.", "success");
        setActiveTab("text");
      } else {
        showToast(`Found ${extractedTables.length} table${extractedTables.length > 1 ? "s" : ""} across ${numPages} page${numPages > 1 ? "s" : ""}`);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to read PDF. Make sure it's a valid, non-password-protected PDF.");
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadExcel = async () => {
    if (!allText.length && !tables.length) {
      showToast("No data to download.", "error");
      return;
    }
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();

      // Tables sheet
      if (tables.length > 0) {
        if (options.sheetPerPage) {
          const byPage = new Map<number, string[][]>();
          tables.forEach(t => {
            if (!byPage.has(t.page)) byPage.set(t.page, []);
            byPage.get(t.page)!.push(...t.rows, [""]);
          });
          byPage.forEach((rows, page) => {
            const ws = XLSX.utils.aoa_to_sheet(rows);
            XLSX.utils.book_append_sheet(wb, ws, `Page ${page}`);
          });
        } else {
          const allRows: string[][] = [];
          tables.forEach(t => {
            if (options.includePageNumbers) allRows.push([`=== ${t.title} ===`]);
            allRows.push(...t.rows);
            allRows.push([""]);
          });
          const ws = XLSX.utils.aoa_to_sheet(allRows);
          XLSX.utils.book_append_sheet(wb, ws, "Extracted Tables");
        }
      }

      // Full text sheet
      const textRows: string[][] = [];
      allText.forEach(({ page, text }) => {
        textRows.push([`--- Page ${page} ---`]);
        text.split("\n").forEach(line => { if (line.trim()) textRows.push([line]); });
        textRows.push([""]);
      });
      const textWs = XLSX.utils.aoa_to_sheet(textRows);
      XLSX.utils.book_append_sheet(wb, textWs, "Full Text");

      const fileName = (file?.name.replace(/\.pdf$/i, "") ?? "document") + ".xlsx";
      XLSX.writeFile(wb, fileName);
      showToast("Excel file downloaded successfully!");
    } catch (err) {
      console.error(err);
      showToast("Download failed. Please try again.", "error");
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-8">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--txt)] mb-1">PDF to Excel Converter</h1>
            <p className="text-[13px] text-[var(--txt-2)]">
              Extract tables and text from PDF files into Excel spreadsheets. Works best with text-based PDFs with clear table structures.
            </p>
          </div>

          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-4">
            <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[12.5px] text-amber-700">Best results with text-based PDFs. Scanned/image PDFs and complex layouts may not extract perfectly — this is a browser limitation.</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {["PDF to Excel", "PDF to XLSX", "Extract Table from PDF", "PDF Data Extractor", "Free", "No Upload"].map(tag => (
              <span key={tag} className="text-[11px] font-medium text-[var(--txt-2)] bg-[var(--hover-soft)] border border-[var(--line)] rounded-full px-3 py-1">{tag}</span>
            ))}
          </div>

          <div className="flex flex-col xl:flex-row gap-4 items-start">
            {/* Left */}
            <div className="w-full xl:w-[280px] shrink-0 space-y-4">
              {!file ? (
                <div onDragOver={e => e.preventDefault()} onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-[var(--line)] rounded-2xl p-6 text-center cursor-pointer hover:border-accent hover:bg-accent-bg transition-all">
                  <input ref={fileRef} type="file" accept=".pdf,application/pdf" className="hidden"
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  <FileText size={32} className="text-[var(--txt-2)] mx-auto mb-3" />
                  <p className="text-[13px] font-semibold text-[var(--txt)] mb-1">Drop PDF here</p>
                  <p className="text-[12px] text-[var(--txt-2)] mb-3">Text-based PDFs work best</p>
                  <button className="bg-accent hover:bg-accent-dark text-white font-semibold text-[13px] px-5 py-2 rounded-full shadow-sm transition-all">
                    <Upload size={14} className="inline mr-1.5" />Choose PDF
                  </button>
                </div>
              ) : (
                <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText size={20} className="text-red-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[var(--txt)] truncate">{file.name}</p>
                      <p className="text-[11px] text-[var(--txt-2)]">{fmtBytes(file.size)}</p>
                    </div>
                    <button onClick={() => { setFile(null); setTables([]); setAllText([]); setError(null); }}
                      className="text-red-500 p-1 shrink-0"><Trash2 size={14} /></button>
                  </div>
                  {!loading && (
                    <div className="flex gap-4 text-[12px] text-[var(--txt-2)]">
                      <span className="flex items-center gap-1"><CheckCircle size={12} className="text-green-500" />{tables.length} tables</span>
                      <span className="flex items-center gap-1"><CheckCircle size={12} className="text-green-500" />{allText.length} pages</span>
                    </div>
                  )}
                </div>
              )}

              {file && !loading && (
                <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 space-y-3">
                  <p className="text-[12px] font-bold text-[var(--txt)] uppercase tracking-widest">Excel Options</p>
                  {[
                    { key: "sheetPerPage", label: "Separate sheet per page" },
                    { key: "includePageNumbers", label: "Include page headers" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-[12.5px] text-[var(--txt)]">{label}</span>
                      <button onClick={() => setOptions(p => ({ ...p, [key]: !(p as Record<string, unknown>)[key] }))}
                        className={`w-9 h-5 rounded-full transition-all relative shrink-0 ${(options as Record<string, unknown>)[key] ? "bg-accent" : "bg-[var(--hover-soft)]"}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-[var(--surface)] rounded-full shadow transition-all ${(options as Record<string, unknown>)[key] ? "left-4" : "left-0.5"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {file && !loading && (
                <button onClick={downloadExcel}
                  className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold text-[14px] py-3.5 rounded-full shadow-md hover:shadow-lg transition-all">
                  <Download size={16} /> Download Excel (.xlsx)
                </button>
              )}
            </div>

            {/* Right */}
            <div className="flex-1 min-w-0 w-full">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-4">
                  <AlertCircle size={16} className="text-red-500 shrink-0" />
                  <p className="text-[13px] text-red-500">{error}</p>
                </div>
              )}

              {loading && (
                <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-12 text-center">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-[13px] text-[var(--txt-2)]">Extracting data from PDF...</p>
                  <p className="text-[11.5px] text-[var(--txt-2)] mt-1">This may take a moment for large files</p>
                </div>
              )}

              {!loading && (tables.length > 0 || allText.length > 0) && (
                <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden">
                  <div className="flex border-b border-[var(--line)]">
                    <button onClick={() => setActiveTab("tables")}
                      className={`px-5 py-3 text-[12.5px] font-medium transition-colors ${activeTab === "tables" ? "text-accent border-b-2 border-accent bg-accent-bg" : "text-[var(--txt-2)] hover:text-[var(--txt)]"}`}>
                      Tables ({tables.length})
                    </button>
                    <button onClick={() => setActiveTab("text")}
                      className={`px-5 py-3 text-[12.5px] font-medium transition-colors ${activeTab === "text" ? "text-accent border-b-2 border-accent bg-accent-bg" : "text-[var(--txt-2)] hover:text-[var(--txt)]"}`}>
                      Full Text ({allText.length} pages)
                    </button>
                  </div>

                  <div className="max-h-[500px] overflow-auto">
                    {activeTab === "tables" && (
                      tables.length > 0 ? (
                        <div className="divide-y divide-[var(--line)]">
                          {tables.map((table, ti) => (
                            <div key={ti} className="p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <FileSpreadsheet size={14} className="text-green-600" />
                                <span className="text-[12px] font-bold text-[var(--txt)]">{table.title}</span>
                                <span className="text-[11px] text-[var(--txt-2)]">{table.rows.length} rows</span>
                              </div>
                              <div className="overflow-auto">
                                <table className="w-full text-[11.5px] border-collapse">
                                  <tbody>
                                    {table.rows.slice(0, 15).map((row, ri) => (
                                      <tr key={ri} className={ri === 0 ? "bg-[var(--inv-bg)] text-[var(--inv-txt)]" : ri % 2 === 0 ? "bg-[var(--surface)]" : "bg-[var(--surface-2)]"}>
                                        {row.map((cell, ci) => (
                                          <td key={ci} className={`px-3 py-1.5 border border-[var(--line)] whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis ${ri === 0 ? "font-bold" : ""}`}>
                                            {cell}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {table.rows.length > 15 && (
                                  <p className="text-[11px] text-[var(--txt-2)] mt-2 px-1">+{table.rows.length - 15} more rows included in download</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <p className="text-[13px] text-[var(--txt-2)]">No clear tables detected.</p>
                          <p className="text-[12px] text-[var(--txt-2)] mt-1">Switch to Full Text tab — all text is available to download as Excel.</p>
                        </div>
                      )
                    )}

                    {activeTab === "text" && (
                      <div className="divide-y divide-[var(--line)]">
                        {allText.map(({ page, text }) => (
                          <div key={page} className="p-4">
                            <p className="text-[11px] font-bold text-[var(--txt-2)] uppercase tracking-widest mb-2">Page {page}</p>
                            <pre className="text-[12px] text-[var(--txt)] whitespace-pre-wrap font-mono leading-relaxed">
                              {text.slice(0, 600)}{text.length > 600 ? "..." : ""}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!file && !loading && (
                <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-12 text-center">
                  <FileSpreadsheet size={40} className="text-[var(--inv-txt)] mx-auto mb-4" />
                  <p className="text-[14px] font-semibold text-[var(--txt)] mb-2">Upload a PDF to extract data</p>
                  <p className="text-[12.5px] text-[var(--txt-2)]">Tables and text will be extracted and converted to Excel</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {[
              { title: "Table Detection", body: "Automatically detects table structures by analyzing text positions and column alignment." },
              { title: "Full Text Export", body: "All text from every page is exported to Excel even if no tables are detected." },
              { title: "Best Results", body: "Works best with text-based PDFs. Scanned image PDFs require OCR (not yet supported)." },
            ].map(c => (
              <div key={c.title} className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4">
                <h2 className="text-[13px] font-bold text-[var(--txt)] mb-1">{c.title}</h2>
                <p className="text-[12.5px] text-[var(--txt-2)]">{c.body}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
      {toast && (
        <div className={`fixed bottom-20 lg:bottom-5 right-4 px-4 py-3 rounded-xl shadow-lg text-[13.5px] font-medium z-[200] ${toast.type === "success" ? "bg-green-700 text-white" : "bg-red-600 text-white"}`}>
          {toast.msg}
        </div>
      )}
    </>
  );
}
