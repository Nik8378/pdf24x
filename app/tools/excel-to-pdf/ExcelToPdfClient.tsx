"use client";
import { useState, useRef, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Upload, Download, Trash2, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";

function fmtBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

interface SheetInfo {
  name: string;
  rows: number;
  cols: number;
  data: string[][];
}

export default function ExcelToPDFClient() {
  const [file, setFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<SheetInfo[]>([]);
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [options, setOptions] = useState({
    fontSize: 9,
    orientation: "landscape" as "portrait" | "landscape",
    fitToPage: true,
    showGridlines: true,
    showHeaders: true,
    pageSize: "A4",
    allSheets: false,
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleFile = useCallback(async (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext || "")) {
      setError("Please upload an Excel (.xlsx, .xls) or CSV file.");
      return;
    }
    setFile(f);
    setError(null);
    setLoading(true);
    setSheets([]);

    try {
      const XLSX = await import("xlsx");
      const buffer = await f.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(buffer), { type: "array" });

      const parsed: SheetInfo[] = wb.SheetNames.map(name => {
        const ws = wb.Sheets[name];
        const raw = XLSX.utils.sheet_to_json<string[]>(ws, {
          header: 1,
          defval: "",
          raw: false,
        });
        const data = raw.map(row =>
          Array.isArray(row) ? row.map(cell => String(cell ?? "")) : []
        );
        const maxCols = Math.max(...data.map(r => r.length), 0);
        return {
          name,
          rows: data.length,
          cols: maxCols,
          data,
        };
      });

      setSheets(parsed);
      setSelectedSheet(0);
      showToast(`Loaded ${parsed.length} sheet${parsed.length > 1 ? "s" : ""} successfully`);
    } catch (err) {
      console.error(err);
      setError("Failed to read Excel file. Make sure it's a valid .xlsx, .xls or .csv file.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleConvert = async () => {
    if (!sheets.length) return;
    setConverting(true);
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const PAGE_SIZES: Record<string, [number, number]> = {
        A4: [595, 842], A3: [842, 1191], Letter: [612, 792], Legal: [612, 1008],
      };
      let [pw, ph] = PAGE_SIZES[options.pageSize] ?? PAGE_SIZES.A4;
      if (options.orientation === "landscape") [pw, ph] = [ph, pw];

      const sheetsToConvert = options.allSheets ? sheets : [sheets[selectedSheet]];

      for (const sheet of sheetsToConvert) {
        if (!sheet.data.length) continue;

        const margin = 30;
        const fontSize = Math.max(6, options.fontSize);
        const lineH = fontSize + 5;
        const colPad = 5;
        const availW = pw - margin * 2;

        // Calculate col widths
        const maxCols = Math.max(...sheet.data.map(r => r.length), 1);
        const colWidths: number[] = Array(maxCols).fill(0);
        sheet.data.forEach(row => {
          row.forEach((cell, ci) => {
            const w = font.widthOfTextAtSize(String(cell).replace(/[^\x00-\x7F]/g, ""), fontSize) + colPad * 2;
            colWidths[ci] = Math.max(colWidths[ci] ?? 0, Math.min(w, 130));
          });
        });

        // Scale to fit page width
        const totalW = colWidths.reduce((a, b) => a + b, 0);
        const scale = options.fitToPage && totalW > availW ? availW / totalW : 1;
        const sWidths = colWidths.map(w => w * scale);
        const sFontSize = Math.max(5, fontSize * (options.fitToPage && totalW > availW ? scale : 1));
        const sLineH = sFontSize + 5;
        const rowsPerPage = Math.floor((ph - margin * 2 - 25) / sLineH);

        let rowIdx = 0;
        let pageNum = 0;

        while (rowIdx < sheet.data.length) {
          pageNum++;
          const page = pdfDoc.addPage([pw, ph]);

          // Header
          page.drawText(`${sheet.name}  |  Page ${pageNum}`, {
            x: margin, y: ph - margin + 8,
            size: 8, font: boldFont, color: rgb(0.4, 0.4, 0.4),
          });

          let y = ph - margin - 5;
          const endRow = Math.min(rowIdx + rowsPerPage, sheet.data.length);

          for (let ri = rowIdx; ri < endRow; ri++) {
            const row = sheet.data[ri] ?? [];
            const isHeader = ri === 0 && options.showHeaders;

            // Row bg
            if (isHeader) {
              page.drawRectangle({
                x: margin, y: y - sLineH + 2,
                width: availW, height: sLineH,
                color: rgb(0.1, 0.1, 0.1),
              });
            } else if (ri % 2 === 0) {
              page.drawRectangle({
                x: margin, y: y - sLineH + 2,
                width: availW, height: sLineH,
                color: rgb(0.97, 0.97, 0.97),
              });
            }

            let x = margin;
            sWidths.forEach((cw, ci) => {
              const raw = row[ci] ?? "";
              const maxChars = Math.floor((cw - colPad * 2) / (sFontSize * 0.5));
              const cellVal = String(raw).replace(/[^\x00-\x7F]/g, "").slice(0, Math.max(maxChars, 3));

              page.drawText(cellVal, {
                x: x + colPad,
                y: y - sFontSize + 1,
                size: sFontSize,
                font: isHeader ? boldFont : font,
                color: isHeader ? rgb(1, 1, 1) : rgb(0.1, 0.1, 0.1),
                maxWidth: cw - colPad,
              });

              if (options.showGridlines) {
                page.drawLine({
                  start: { x, y: y - sLineH + 2 },
                  end: { x, y: y + 2 },
                  thickness: 0.3,
                  color: rgb(0.75, 0.75, 0.75),
                });
              }
              x += cw;
            });

            if (options.showGridlines) {
              page.drawLine({
                start: { x: margin, y: y - sLineH + 2 },
                end: { x: margin + availW, y: y - sLineH + 2 },
                thickness: 0.3,
                color: rgb(0.75, 0.75, 0.75),
              });
            }

            y -= sLineH;
          }

          // Footer
          page.drawText(`Generated by PDF24x — pdf24x.com`, {
            x: margin, y: 12,
            size: 7, font, color: rgb(0.6, 0.6, 0.6),
          });

          rowIdx = endRow;
        }
      }

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes as unknown as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (file?.name.replace(/\.(xlsx|xls|csv)$/i, "") ?? "spreadsheet") + ".pdf";
      a.click();
      URL.revokeObjectURL(url);
      showToast("PDF downloaded successfully!");
    } catch (err) {
      console.error(err);
      showToast("Conversion failed. Please try again.", "error");
    } finally {
      setConverting(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const currentSheet = sheets[selectedSheet];

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-8">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--txt)] mb-1">Excel to PDF Converter</h1>
            <p className="text-[13px] text-[var(--txt-2)]">
              Convert Excel spreadsheets (.xlsx, .xls) and CSV files to PDF. Preserves table structure, headers, and formatting.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {["XLSX to PDF", "XLS to PDF", "CSV to PDF", "Spreadsheet to PDF", "Free", "No Upload"].map(tag => (
              <span key={tag} className="text-[11px] font-medium text-[var(--txt-2)] bg-[var(--hover-soft)] border border-[var(--line)] rounded-full px-3 py-1">{tag}</span>
            ))}
          </div>

          <div className="flex flex-col xl:flex-row gap-4 items-start">
            {/* Left */}
            <div className="w-full xl:w-[300px] shrink-0 space-y-4">
              {!file ? (
                <div onDragOver={e => e.preventDefault()} onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-[var(--line)] rounded-2xl p-6 text-center cursor-pointer hover:border-accent hover:bg-accent-bg transition-all">
                  <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  <FileSpreadsheet size={32} className="text-[var(--txt-2)] mx-auto mb-3" />
                  <p className="text-[13px] font-semibold text-[var(--txt)] mb-1">Drop Excel file here</p>
                  <p className="text-[12px] text-[var(--txt-2)] mb-3">Supports .xlsx, .xls, .csv</p>
                  <button className="bg-accent hover:bg-accent-dark text-white font-semibold text-[13px] px-5 py-2 rounded-full shadow-sm transition-all">
                    <Upload size={14} className="inline mr-1.5" />Choose File
                  </button>
                </div>
              ) : (
                <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FileSpreadsheet size={24} className="text-green-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[var(--txt)] truncate">{file.name}</p>
                      <p className="text-[11px] text-[var(--txt-2)]">{fmtBytes(file.size)} · {sheets.length} sheet{sheets.length > 1 ? "s" : ""}</p>
                    </div>
                    <button onClick={() => { setFile(null); setSheets([]); setError(null); }}
                      className="text-red-500 hover:text-red-600 p-1 shrink-0"><Trash2 size={14} /></button>
                  </div>
                  {sheets.length > 1 && (
                    <div>
                      <p className="text-[10.5px] font-bold text-[var(--txt-2)] uppercase tracking-widest mb-1.5">Select Sheet</p>
                      <div className="flex flex-wrap gap-1.5">
                        {sheets.map((s, i) => (
                          <button key={i} onClick={() => setSelectedSheet(i)}
                            className={`px-2.5 py-1 rounded-lg text-[12px] font-medium transition-all border ${selectedSheet === i ? "bg-accent text-white border-accent" : "bg-[var(--hover-soft)] text-[var(--txt-2)] border-[var(--line)] hover:border-accent"}`}>
                            {s.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Options */}
              <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 space-y-3">
                <p className="text-[12px] font-bold text-[var(--txt)] uppercase tracking-widest">PDF Options</p>

                <div>
                  <label className="text-[10.5px] font-bold text-[var(--txt-2)] uppercase tracking-widest mb-1 block">Page Size</label>
                  <select value={options.pageSize}
                    onChange={e => setOptions(p => ({ ...p, pageSize: e.target.value }))}
                    className="w-full bg-[var(--hover-soft)] border border-[var(--line)] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-accent">
                    {["A4", "A3", "Letter", "Legal"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10.5px] font-bold text-[var(--txt-2)] uppercase tracking-widest mb-1 block">Orientation</label>
                  <div className="flex gap-2">
                    {(["portrait", "landscape"] as const).map(o => (
                      <button key={o} onClick={() => setOptions(p => ({ ...p, orientation: o }))}
                        className={`flex-1 py-2 rounded-lg text-[12px] font-medium capitalize border transition-all ${options.orientation === o ? "bg-accent text-white border-accent" : "bg-[var(--hover-soft)] text-[var(--txt-2)] border-[var(--line)] hover:border-accent/40"}`}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-[10.5px] font-bold text-[var(--txt-2)] uppercase tracking-widest">Font Size</label>
                    <span className="text-[11px] text-accent font-bold">{options.fontSize}pt</span>
                  </div>
                  <input type="range" min={6} max={14} value={options.fontSize}
                    onChange={e => setOptions(p => ({ ...p, fontSize: parseInt(e.target.value) }))}
                    className="w-full accent-accent" />
                </div>

                {[
                  { key: "fitToPage", label: "Fit to Page Width" },
                  { key: "showGridlines", label: "Show Gridlines" },
                  { key: "showHeaders", label: "Bold Header Row" },
                  { key: "allSheets", label: "Convert All Sheets" },
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

              <button onClick={handleConvert} disabled={!sheets.length || converting}
                className={`w-full flex items-center justify-center gap-2 font-semibold text-[14px] py-3.5 rounded-full transition-all shadow-md ${!sheets.length || converting ? "bg-[var(--hover-soft)] text-[var(--txt-2)] cursor-not-allowed" : "bg-accent hover:bg-accent-dark text-white hover:shadow-lg"}`}>
                {converting
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Download size={16} />}
                {converting ? "Converting…" : "Convert to PDF"}
              </button>
            </div>

            {/* Right — Preview */}
            <div className="flex-1 min-w-0 w-full">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-4">
                  <AlertCircle size={16} className="text-red-500 shrink-0" />
                  <p className="text-[13px] text-red-500">{error}</p>
                </div>
              )}

              {loading && (
                <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-8 text-center">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-[13px] text-[var(--txt-2)]">Reading Excel file...</p>
                </div>
              )}

              {currentSheet && !loading && (
                <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)] bg-[var(--hover-soft)]">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={15} className="text-green-600" />
                      <span className="text-[12px] font-bold text-[var(--txt)]">{currentSheet.name}</span>
                      <span className="text-[11px] text-[var(--txt-2)]">{currentSheet.rows} rows × {currentSheet.cols} cols</span>
                    </div>
                  </div>
                  <div className="overflow-auto max-h-[500px]">
                    <table className="w-full text-[12px] border-collapse">
                      <tbody>
                        {currentSheet.data.slice(0, 100).map((row, ri) => (
                          <tr key={ri} className={ri === 0 ? "bg-[var(--inv-bg)] text-[var(--inv-txt)]" : ri % 2 === 0 ? "bg-[var(--surface)]" : "bg-[var(--surface-2)]"}>
                            <td className="px-2 py-1 text-[10px] text-[var(--txt-2)] border-r border-[var(--line)] w-8 text-center font-mono select-none">{ri + 1}</td>
                            {row.map((cell, ci) => (
                              <td key={ci} className={`px-3 py-1.5 border-r border-b border-[var(--line)] whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis ${ri === 0 ? "font-bold" : ""}`}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {currentSheet.rows > 100 && (
                      <div className="px-4 py-3 text-[12px] text-[var(--txt-2)] bg-[var(--hover-soft)] border-t border-[var(--line)]">
                        Showing first 100 of {currentSheet.rows} rows — all rows included in PDF
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!file && !loading && (
                <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-12 text-center">
                  <FileSpreadsheet size={40} className="text-[var(--inv-txt)] mx-auto mb-4" />
                  <p className="text-[14px] font-semibold text-[var(--txt)] mb-2">Upload an Excel file to preview</p>
                  <p className="text-[12.5px] text-[var(--txt-2)]">Supports .xlsx, .xls and .csv files</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {[
              { title: "Multiple Sheets", body: "Convert individual sheets or all sheets at once into a single PDF document." },
              { title: "Fit to Page", body: "Automatically scales wide spreadsheets to fit the page — no content gets cut off." },
              { title: "100% Private", body: "Your files are processed entirely in your browser. Nothing is uploaded to any server." },
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
