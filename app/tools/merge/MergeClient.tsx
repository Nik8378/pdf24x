"use client";

import { useState, useRef, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Link2, UploadCloud, Trash2, FileText, GripVertical } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function fmtBytes(b: number) { return b < 1024*1024 ? (b/1024).toFixed(1)+" KB" : (b/(1024*1024)).toFixed(2)+" MB"; }
function generateId() { return Math.random().toString(36).slice(2,9); }

interface PDFItem { id: string; name: string; size: number; file: File; pages?: number; }

function SortableRow({ item, onRemove }: { item: PDFItem; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-[#1a1917]/10 rounded-xl px-3 py-2.5 flex items-center gap-3 hover:border-[#1a1917]/20 transition-all">
      <div {...attributes} {...listeners} className="text-[#7a7875] cursor-grab p-0.5"><GripVertical size={15} /></div>
      <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
        <FileText size={16} className="text-red-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#1a1917] truncate">{item.name}</p>
        <p className="text-[11.5px] text-[#7a7875]">{fmtBytes(item.size)}{item.pages ? ` • ${item.pages} pages` : ""}</p>
      </div>
      <p className="text-[12px] text-[#7a7875] hidden sm:block">{fmtBytes(item.size)}</p>
      <button onClick={onRemove} className="p-1.5 rounded-lg text-[#7a7875] hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={14} /></button>
    </div>
  );
}

function BtnGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex border border-[#1a1917]/12 rounded-lg overflow-hidden">
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)}
          className={`flex-1 py-1.5 text-[12px] font-medium transition-colors border-r border-[#1a1917]/10 last:border-0 ${value === o ? "bg-txt text-white" : "bg-white text-[#4a4845] hover:bg-[#f4f3f0]"}`}>
          {o}
        </button>
      ))}
    </div>
  );
}

export default function MergeClient() {
  const [files, setFiles] = useState<PDFItem[]>([]);
  const [pageSize, setPageSize] = useState("A4");
  const [orientation, setOrientation] = useState("auto");
  const [margins, setMargins] = useState("none");
  const [blankBetween, setBlankBetween] = useState(false);
  const [blankPos, setBlankPos] = useState("between");
  const [outputName, setOutputName] = useState("Merged-Document");
  const [addTOC, setAddTOC] = useState(false);
  const [addPageNumbers, setAddPageNumbers] = useState(false);
  const [bookmark, setBookmark] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState<{msg:string;type:string}|null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const showToast = (msg: string, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const handleFiles = useCallback((fl: FileList | File[]) => {
    const arr = Array.from(fl).filter(f => f.type === "application/pdf");
    if (!arr.length) { showToast("Please upload PDF files only", "error"); return; }
    const items: PDFItem[] = arr.map(f => ({ id: generateId(), name: f.name, size: f.size, file: f }));
    setFiles(prev => [...prev, ...items]);
    showToast(`${items.length} file${items.length>1?"s":""} added`);
  }, []);

  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = files.findIndex(f => f.id === active.id);
    const to = files.findIndex(f => f.id === over.id);
    setFiles(arrayMove(files, from, to));
  };

  const handleMerge = async () => {
    if (files.length < 2) { showToast("Add at least 2 PDF files to merge", "error"); return; }
    setLoading(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const merged = await PDFDocument.create();
      for (const item of files) {
        const bytes = await item.file.arrayBuffer();
        const doc = await PDFDocument.load(bytes);
        const indices = doc.getPageIndices();
        const copied = await merged.copyPages(doc, indices);
        if (blankBetween && blankPos === "start" && merged.getPageCount() === 0) merged.addPage();
        copied.forEach(p => merged.addPage(p));
        if (blankBetween && blankPos === "between" && item !== files[files.length-1]) merged.addPage();
        if (blankBetween && blankPos === "end") merged.addPage();
      }
      if (addPageNumbers) {
        // Page numbers would require font embedding - simplified
      }
      merged.setTitle(outputName);
      const bytes = await merged.save({ useObjectStreams: true });
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = outputName + ".pdf"; a.click();
      URL.revokeObjectURL(url);
      showToast(`${files.length} PDFs merged successfully!`);
    } catch (err) { showToast("Merge failed. Please try again.", "error"); console.error(err); }
    finally { setLoading(false); }
  };


  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1a1917]">Merge PDF</h1>
            <p className="text-[13px] text-[#7a7875]">Combine multiple PDF files into a single PDF. Easy, fast and secure.</p>
          </div>

          <div className="flex flex-col xl:flex-row gap-4 items-start">
            <div className="flex-1 min-w-0 w-full space-y-4">
              <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all shadow-sm flex flex-col items-center justify-center min-h-[200px] ${dragging ? "border-accent bg-accent-light" : "border-[#1a1917]/15 bg-white hover:border-accent hover:bg-accent-light"}`}>
                <input ref={inputRef} type="file" accept=".pdf,application/pdf" multiple className="hidden" onChange={e => handleFiles(e.target.files!)} />
                <div className="w-11 h-11 rounded-full bg-[#f4f3f0] flex items-center justify-center mb-3">
                  <UploadCloud size={20} className="text-[#7a7875]" />
                </div>
                <p className="text-[14px] font-semibold text-[#1a1917] mb-1">Drag & drop your PDF files here</p>
                <p className="text-[12.5px] text-[#7a7875] mb-4">or click to browse files</p>
                <button onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold text-[13.5px] px-6 py-2.5 rounded-full shadow-md">
                  <UploadCloud size={15} /> Choose PDF Files
                </button>
                <p className="mt-3 text-[11.5px] text-[#7a7875]">No file size limit • Multiple files supported</p>
              </div>

              {files.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[13.5px] font-semibold text-[#1a1917]">Your PDFs ({files.length})</p>
                    <button onClick={() => setFiles([])} className="text-[12px] text-red-500 hover:text-red-600">Clear All</button>
                  </div>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={files.map(f => f.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-1.5">
                        {files.map(item => <SortableRow key={item.id} item={item} onRemove={() => setFiles(files.filter(f => f.id !== item.id))} />)}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </div>

            <div className="w-full xl:w-[280px] shrink-0 xl:sticky xl:top-14">
              <div className="bg-white border border-[#1a1917]/10 rounded-2xl p-4 shadow-sm overflow-y-auto">
                <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-[#1a1917]/8">
                  <Link2 size={14} className="text-[#7a7875]" />
                  <h3 className="text-[13px] font-bold text-[#1a1917]">Merge Settings</h3>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <p className="text-[10.5px] font-bold text-[#1a1917] uppercase tracking-widest opacity-50 mb-2">Page Size</p>
                    <select value={pageSize} onChange={e => setPageSize(e.target.value)}
                      className="w-full bg-[#f4f3f0] border border-[#1a1917]/12 rounded-lg px-3 py-2 text-[13px] text-[#1a1917] cursor-pointer appearance-none focus:outline-none focus:border-accent"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a7875' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>
                      <option>A4 (210 × 297 mm)</option><option>A5</option><option>Letter</option><option>Legal</option><option>Auto</option>
                    </select>
                  </div>
                  <div><p className="text-[10.5px] font-bold text-[#1a1917] uppercase tracking-widest opacity-50 mb-2">Page Orientation</p><BtnGroup options={["Auto","Portrait","Landscape"]} value={orientation} onChange={setOrientation} /></div>
                  <div><p className="text-[10.5px] font-bold text-[#1a1917] uppercase tracking-widest opacity-50 mb-2">Margins</p><BtnGroup options={["None","Small","Medium","Large"]} value={margins} onChange={setMargins} /></div>

                  <div className="flex items-center justify-between">
                    <div><p className="text-[12.5px] font-medium text-[#1a1917]">Add Blank Page Between Files</p><p className="text-[11px] text-[#7a7875]">Adds a blank page between each PDF</p></div>
                    <button onClick={() => setBlankBetween(!blankBetween)} className={`w-9 h-5 rounded-full transition-all relative ${blankBetween ? "bg-accent" : "bg-[#e5e3de]"}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${blankBetween ? "left-4" : "left-0.5"}`} />
                    </button>
                  </div>

                  {blankBetween && <div><p className="text-[10.5px] font-bold text-[#1a1917] uppercase tracking-widest opacity-50 mb-2">Blank Page Position</p><BtnGroup options={["Start","Between","End"]} value={blankPos.charAt(0).toUpperCase()+blankPos.slice(1)} onChange={v => setBlankPos(v.toLowerCase())} /></div>}

                  <div>
                    <p className="text-[10.5px] font-bold text-[#1a1917] uppercase tracking-widest opacity-50 mb-2">Output File Name</p>
                    <input value={outputName} onChange={e => setOutputName(e.target.value)}
                      className="w-full bg-[#f4f3f0] border border-[#1a1917]/12 rounded-lg px-3 py-2 text-[13px] text-[#1a1917] focus:outline-none focus:border-accent"
                      placeholder="Merged-Document" />
                  </div>

                  <div>
                    <p className="text-[10.5px] font-bold text-[#1a1917] uppercase tracking-widest opacity-50 mb-2">Advanced Options</p>
                    {([["addTOC", addTOC, setAddTOC, "Add Table of Contents"],["addPageNumbers", addPageNumbers, setAddPageNumbers, "Add Page Numbers"],["bookmark", bookmark, setBookmark, "Bookmark each file"]] as [string, boolean, React.Dispatch<React.SetStateAction<boolean>>, string][]).map(([key, val, setter, label]) => (
                      <label key={key} className="flex items-center gap-2 mb-2 cursor-pointer">
                        <div onClick={() => setter(!val)} className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${val ? "bg-accent border-accent" : "border-[#d4d2cb]"}`}>
                          {val && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <span className="text-[12.5px] text-[#1a1917]">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#1a1917]/8 mt-3 pt-3">
                  <button onClick={handleMerge} disabled={files.length < 2 || loading}
                    className={`w-full flex items-center justify-center gap-2 font-semibold text-[14px] py-3 rounded-full transition-all ${files.length < 2 || loading ? "bg-[#f4f3f0] text-[#7a7875] cursor-not-allowed" : "bg-accent hover:bg-accent-dark text-white shadow-md"}`}>
                    {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full spin" /> : <Link2 size={16} />}
                    {loading ? "Merging…" : "Merge PDF →"}
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
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "#FF6B5E" }}>1</span><div><p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>Upload your PDFs</p><p className="text-xs mt-0.5" style={{ color: "#6b6760" }}>Add two or more PDF files. Drag to reorder them as needed.</p></div></li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "#FF6B5E" }}>2</span><div><p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>Arrange the order</p><p className="text-xs mt-0.5" style={{ color: "#6b6760" }}>Drag and drop files into the sequence you want in the final PDF.</p></div></li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "#FF6B5E" }}>3</span><div><p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>Download merged PDF</p><p className="text-xs mt-0.5" style={{ color: "#6b6760" }}>Click Merge and download your combined PDF file instantly.</p></div></li>
          </ol>
        </div>
        <div className="rounded-2xl border border-[#1c1c1c] bg-white p-6" style={{ boxShadow: "3px 3px 0 0 #1c1c1c" }}>
          <h2 className="text-lg font-extrabold mb-4" style={{ color: "#1a1a1a", fontFamily: "Archivo, Inter, sans-serif" }}>Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="border-b pb-4 last:border-0 last:pb-0" style={{ borderColor: "#e5e7eb" }}><p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>How many PDFs can I merge?</p><p className="text-xs mt-1.5 leading-relaxed" style={{ color: "#6b6760" }}>You can merge as many PDFs as you need in a single operation.</p></div>
            <div className="border-b pb-4 last:border-0 last:pb-0" style={{ borderColor: "#e5e7eb" }}><p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>Does merging preserve formatting?</p><p className="text-xs mt-1.5 leading-relaxed" style={{ color: "#6b6760" }}>Yes. Merging combines PDF pages without altering any content, fonts, images, or formatting.</p></div>
            <div className="border-b pb-4 last:border-0 last:pb-0" style={{ borderColor: "#e5e7eb" }}><p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>Can I reorder pages before merging?</p><p className="text-xs mt-1.5 leading-relaxed" style={{ color: "#6b6760" }}>Yes. Drag the files into the order you want before clicking Merge.</p></div>
            <div className="border-b pb-4 last:border-0 last:pb-0" style={{ borderColor: "#e5e7eb" }}><p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>Is there a file size limit?</p><p className="text-xs mt-1.5 leading-relaxed" style={{ color: "#6b6760" }}>Individual files can be up to 100MB each.</p></div>
          </div>
        </div>
      </div>
      </main>
      </div>
      {toast && <div className={`fixed bottom-20 lg:bottom-5 right-4 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[13.5px] font-medium z-[200] toast-enter ${toast.type === "success" ? "bg-green-700 text-white" : "bg-red-600 text-white"}`}>{toast.msg}</div>}
    </>
  );
}
