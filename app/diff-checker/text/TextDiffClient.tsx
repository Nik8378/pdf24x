"use client";
import { useState, useMemo, useRef, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { DiffViewer } from "@/components/diff/DiffViewer";
import { computeTextDiff, makeUnifiedPatch, makeHtmlReport, DEFAULT_OPTIONS, type DiffOptions } from "@/lib/diff/textDiff";
import {
  ArrowLeftRight, Trash2, Copy, Check, Upload, Download, ChevronUp, ChevronDown,
  FileText, Settings2, AlertCircle,
} from "lucide-react";

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export default function TextDiffClient() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [opts, setOpts] = useState<DiffOptions>(DEFAULT_OPTIONS);
  const [view, setView] = useState<"split" | "inline">("split");
  const [wrap, setWrap] = useState(true);
  const [lineNums, setLineNums] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [currentBlock, setCurrentBlock] = useState<number | null>(null);
  const blockEls = useRef<Map<number, HTMLElement>>(new Map());
  const leftFile = useRef<HTMLInputElement>(null);
  const rightFile = useRef<HTMLInputElement>(null);

  const result = useMemo(() => computeTextDiff(left, right, opts), [left, right, opts]);
  const hasInput = left.length > 0 || right.length > 0;
  const identical = hasInput && result.stats.blocks === 0 && !result.tooLarge;

  const registerBlock = useCallback((id: number, el: HTMLElement | null) => {
    if (el) blockEls.current.set(id, el); else blockEls.current.delete(id);
  }, []);

  const goto = (delta: number) => {
    const total = result.stats.blocks;
    if (total === 0) return;
    const next = currentBlock === null ? (delta > 0 ? 0 : total - 1) : (currentBlock + delta + total) % total;
    setCurrentBlock(next);
    blockEls.current.get(next)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const readFile = (f: File, set: (s: string) => void) => {
    if (f.size > 5 * 1024 * 1024) { alert("File larger than 5 MB — please use a smaller text file."); return; }
    const r = new FileReader();
    r.onload = () => set(String(r.result ?? ""));
    r.readAsText(f);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id); setTimeout(() => setCopied(null), 1500);
  };

  const setOpt = (k: keyof DiffOptions, v: boolean | string) => {
    setOpts((o) => ({ ...o, [k]: v }));
    setCurrentBlock(null);
  };

  const Pane = ({ label, value, onChange, fileRef, id }: {
    label: string; value: string; onChange: (v: string) => void;
    fileRef: React.RefObject<HTMLInputElement | null>; id: string;
  }) => (
    <div className="min-w-0 flex-1 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2">
        <p className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--txt-2)]">{label}</p>
        <div className="flex items-center gap-0.5">
          <button onClick={() => fileRef.current?.click()} title="Upload file"
            className="rounded-md p-1.5 text-[var(--txt-2)] hover:bg-[var(--hover-soft)] hover:text-[var(--txt)]"><Upload size={14} /></button>
          <button onClick={() => copyText(value, id)} title="Copy"
            className="rounded-md p-1.5 text-[var(--txt-2)] hover:bg-[var(--hover-soft)] hover:text-[var(--txt)]">
            {copied === id ? <Check size={14} className="text-[var(--ok)]" /> : <Copy size={14} />}
          </button>
          <button onClick={() => { onChange(""); setCurrentBlock(null); }} title="Clear"
            className="rounded-md p-1.5 text-[var(--txt-2)] hover:bg-[var(--hover-soft)] hover:text-[#EE4B3C]"><Trash2 size={14} /></button>
        </div>
        <input ref={fileRef} type="file" className="hidden"
          accept=".txt,.md,.csv,.log,.json,.xml,.yml,.yaml,.html,.css,.js,.ts,.jsx,.tsx,.py,.java,.c,.cpp,.sql,text/*"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f, onChange); e.target.value = ""; }} />
      </div>
      <textarea value={value} spellCheck={false}
        onChange={(e) => { onChange(e.target.value); setCurrentBlock(null); }}
        placeholder="Paste text here, or upload a file…"
        className="h-48 w-full resize-y rounded-b-2xl bg-transparent p-3 font-mono text-[12.5px] leading-relaxed text-[var(--txt)] outline-none placeholder:text-[var(--txt-3)]" />
    </div>
  );

  const chk = (label: string, key: keyof DiffOptions, tip: string) => (
    <label key={key} title={tip} className="flex cursor-pointer items-center gap-1.5 text-[12px] font-medium text-[var(--txt-2)]">
      <input type="checkbox" checked={opts[key] as boolean} onChange={(e) => setOpt(key, e.target.checked)} className="accent-[#EE4B3C]" />
      {label}
    </label>
  );

  return (
    <div className="w-full flex gap-0 items-start">
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5">
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--txt)]">Text Diff Checker</h1>
          <p className="text-[13px] text-[var(--txt-2)]">
            Compare two texts and instantly see every difference — line by line, word by word.
            100% private: comparison runs entirely in your browser.
          </p>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-3 lg:flex-row">
          <Pane label="Original text" value={left} onChange={setLeft} fileRef={leftFile} id="L" />
          <div className="flex items-center justify-center lg:flex-col">
            <button onClick={() => { setLeft(right); setRight(left); setCurrentBlock(null); }} title="Swap sides"
              className="rounded-xl border border-[var(--line-mid)] bg-[var(--surface)] p-2.5 text-[var(--txt-2)] hover:border-[#EE4B3C]/40 hover:text-[#EE4B3C]">
              <ArrowLeftRight size={16} />
            </button>
          </div>
          <Pane label="Changed text" value={right} onChange={setRight} fileRef={rightFile} id="R" />
        </div>

        {/* Toolbar */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5">
          <div className="flex rounded-lg border border-[var(--line)] p-0.5 text-[12px] font-semibold">
            {(["split", "inline"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`rounded-md px-3 py-1 ${view === v ? "bg-[var(--inv-bg)] text-[var(--inv-txt)]" : "text-[var(--txt-2)] hover:text-[var(--txt)]"}`}>
                {v === "split" ? "Side by side" : "Inline"}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--txt-2)]" title="Highlight differences by whole words or single characters">
            Highlight:
            <select value={opts.granularity} onChange={(e) => setOpt("granularity", e.target.value)}
              className="rounded-md border border-[var(--line-mid)] bg-[var(--surface-2)] px-1.5 py-0.5 text-[12px] font-semibold outline-none">
              <option value="word">Words</option>
              <option value="char">Characters</option>
            </select>
          </label>
          <button onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-semibold ${showSettings ? "bg-[var(--inv-bg)] text-[var(--inv-txt)]" : "text-[var(--txt-2)] hover:text-[var(--txt)]"}`}>
            <Settings2 size={13} /> Options
          </button>
          <div className="ml-auto flex items-center gap-1.5">
            <button onClick={() => download("comparison.diff", makeUnifiedPatch(left, right), "text/plain")}
              disabled={!hasInput || result.tooLarge} title="Download unified .diff patch"
              className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-2.5 py-1.5 text-[12px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40 disabled:opacity-40">
              <Download size={13} /> .diff
            </button>
            <button onClick={() => download("comparison-report.html", makeHtmlReport(result.rows, result.stats), "text/html")}
              disabled={!hasInput || result.tooLarge} title="Download HTML report"
              className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-2.5 py-1.5 text-[12px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40 disabled:opacity-40">
              <FileText size={13} /> Report
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
            {chk("Ignore case", "ignoreCase", "Treat 'Hello' and 'hello' as identical")}
            {chk("Ignore whitespace", "ignoreWhitespace", "Ignore differences in spaces and tabs inside lines")}
            {chk("Trim lines", "trimLines", "Ignore spaces at the start and end of each line")}
            {chk("Ignore empty lines", "ignoreEmptyLines", "Skip blank lines entirely when comparing")}
            <label className="flex cursor-pointer items-center gap-1.5 text-[12px] font-medium text-[var(--txt-2)]" title="Wrap long lines instead of horizontal scrolling">
              <input type="checkbox" checked={wrap} onChange={(e) => setWrap(e.target.checked)} className="accent-[#EE4B3C]" /> Word wrap
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-[12px] font-medium text-[var(--txt-2)]">
              <input type="checkbox" checked={lineNums} onChange={(e) => setLineNums(e.target.checked)} className="accent-[#EE4B3C]" /> Line numbers
            </label>
          </div>
        )}

        {/* Stats + navigation */}
        {hasInput && !result.tooLarge && (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            {identical ? (
              <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ok)]">
                <Check size={15} /> The two texts are identical{opts.ignoreCase || opts.ignoreWhitespace || opts.trimLines || opts.ignoreEmptyLines ? " (with current options)" : ""}.
              </p>
            ) : (
              <>
                <p className="text-[13px] font-semibold text-[var(--txt)]">
                  {result.stats.blocks} difference{result.stats.blocks === 1 ? "" : "s"}
                  <span className="ml-3 font-mono text-[12.5px]">
                    <span className="text-[var(--ok)]">+{result.stats.added}</span>{" "}
                    <span className="text-[var(--err)]">−{result.stats.removed}</span>{" "}
                    <span className="text-[var(--warn)]">~{result.stats.modified}</span>
                  </span>
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => goto(-1)} title="Previous difference"
                    className="rounded-lg border border-[var(--line-mid)] bg-[var(--surface)] p-1.5 text-[var(--txt-2)] hover:border-[#EE4B3C]/40 hover:text-[#EE4B3C]"><ChevronUp size={15} /></button>
                  <button onClick={() => goto(1)} title="Next difference"
                    className="rounded-lg border border-[var(--line-mid)] bg-[var(--surface)] p-1.5 text-[var(--txt-2)] hover:border-[#EE4B3C]/40 hover:text-[#EE4B3C]"><ChevronDown size={15} /></button>
                  {currentBlock !== null && (
                    <span className="ml-1 text-[12px] font-semibold text-[var(--txt-2)]">{currentBlock + 1} / {result.stats.blocks}</span>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {result.tooLarge && (
          <p className="mt-4 flex items-center gap-1.5 text-[13px] font-semibold text-[var(--err)]">
            <AlertCircle size={15} /> The texts are too large to compare in the browser (over 60,000 lines combined). Try splitting them into smaller parts.
          </p>
        )}

        {/* Result */}
        <div className="mt-3">
          {hasInput && !result.tooLarge && !identical ? (
            <DiffViewer rows={result.rows} view={view} wrap={wrap} showLineNumbers={lineNums}
              currentBlock={currentBlock} registerBlock={registerBlock} />
          ) : !hasInput ? (
            <div className="rounded-2xl border-2 border-dashed border-[var(--line-mid)] bg-[var(--surface)] p-10 text-center">
              <p className="text-[14px] font-semibold text-[var(--txt)]">Paste or upload two texts to compare</p>
              <p className="mt-1 text-[12.5px] text-[var(--txt-2)]">Differences appear here instantly as you type — additions in green, deletions in red.</p>
            </div>
          ) : null}
        </div>

        <p className="mt-6 text-xs text-[var(--txt-2)]">
          🔒 100% private — your text never leaves your device. Comparison, exports and reports are all generated locally in your browser.
        </p>
      </main>
    </div>
  );
}
