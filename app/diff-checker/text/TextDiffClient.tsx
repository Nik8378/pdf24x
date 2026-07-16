"use client";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { DiffViewer } from "@/components/diff/DiffViewer";
import { computeTextDiff, makeUnifiedPatch, makeHtmlReport, DEFAULT_OPTIONS, type DiffOptions, type DiffRow } from "@/lib/diff/textDiff";
import { computeJsonDiff, type JsonChange } from "@/lib/diff/jsonDiff";
import {
  ArrowLeftRight, Trash2, Copy, Check, Upload, Download, ChevronUp, ChevronDown,
  FileText, Settings2, AlertCircle, Wand2, Braces, EyeOff, Eye, ChevronsRight, Link2, Check as CheckIcon, ArrowRightLeft, GitMerge,
} from "lucide-react";

const EXT_LANG: Record<string, string> = {
  json: "json", js: "javascript", mjs: "javascript", jsx: "javascript",
  ts: "typescript", tsx: "typescript", py: "python", java: "java",
  css: "css", scss: "css", html: "markup", htm: "markup", xml: "markup",
  sql: "sql", yml: "yaml", yaml: "yaml", sh: "bash", bash: "bash",
  md: "markdown", markdown: "markdown",
};

const ACCEPT = ".txt,.md,.markdown,.csv,.log,.json,.xml,.yml,.yaml,.html,.htm,.css,.scss,.js,.mjs,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.h,.hpp,.go,.rs,.sql,.sh,.bash,text/*";

/* ── auto-detect JSON ── */
function looksLikeJson(a: string, b: string): boolean {
  const t = (a || b).trim();
  if (!t) return false;
  if (!(t.startsWith("{") || t.startsWith("["))) return false;
  try { JSON.parse(t); return true; } catch { return false; }
}

/* ── collapse unchanged runs for "Hide unchanged" mode ── */
type ViewRow = DiffRow | { collapsed: true; leftFrom: number; leftTo: number; rightFrom: number; rightTo: number };
function collapseUnchanged(rows: DiffRow[], context: number): ViewRow[] {
  const out: ViewRow[] = [];
  let run: DiffRow[] = [];
  const flush = (isEnd: boolean) => {
    if (!run.length) return;
    const keepHead = out.length > 0 ? context : 0;
    const keepTail = isEnd ? 0 : context;
    if (run.length <= keepHead + keepTail) { out.push(...run); run = []; return; }
    const head = run.slice(0, keepHead);
    const tail = keepTail ? run.slice(-keepTail) : [];
    const hidden = run.slice(keepHead, run.length - keepTail);
    out.push(...head);
    if (hidden.length) {
      const first = hidden[0], last = hidden[hidden.length - 1];
      out.push({
        collapsed: true,
        leftFrom: first.leftNum ?? 0, leftTo: last.leftNum ?? 0,
        rightFrom: first.rightNum ?? 0, rightTo: last.rightNum ?? 0,
      });
    }
    out.push(...tail);
    run = [];
  };
  for (const r of rows) {
    if (r.type === "same") run.push(r);
    else { flush(false); out.push(r); }
  }
  flush(true);
  return out;
}

export default function TextDiffClient() {
  /* ── inputs ── */
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [realtime, setRealtime] = useState(true);
  const [triggered, setTriggered] = useState(0); // bump to force diff when realtime is off
  const leftFile = useRef<HTMLInputElement>(null);
  const rightFile = useRef<HTMLInputElement>(null);

  /* ── options ── */
  const [precision, setPrecision] = useState<"smart" | "word" | "char">("smart");
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWs, setIgnoreWs] = useState(false);
  const [trimLines, setTrimLines] = useState(false);
  const [ignoreEmpty, setIgnoreEmpty] = useState(false);

  /* ── view ── */
  const [view, setView] = useState<"split" | "inline">("split");
  const [wrap, setWrap] = useState(true);
  const [lineNums, setLineNums] = useState(true);
  const [hideUnchanged, setHideUnchanged] = useState(false);
  const [showWs, setShowWs] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [merged, setMerged] = useState<string>("");
  const [mergeChoices, setMergeChoices] = useState<Record<number, "L" | "R" | "both" | "none">>({});
  const [shareCopied, setShareCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [diffName, setDiffName] = useState("comparison");
  const [copiedKind, setCopiedKind] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  /* ── language / JSON mode ── */
  const [lang, setLang] = useState<string>("plain");
  const isJson = lang === "json";
  const [jsonMode, setJsonMode] = useState<"text" | "tree">("text");

  /* ── UI state ── */
  const [copied, setCopied] = useState<string | null>(null);
  const [currentBlock, setCurrentBlock] = useState<number | null>(null);
  const blocks = useRef<Map<number, HTMLElement>>(new Map());
  const leftTa = useRef<HTMLTextAreaElement>(null);
  const rightTa = useRef<HTMLTextAreaElement>(null);
  const [dragOver, setDragOver] = useState<null | "L" | "R" | "both">(null);
  const restored = useRef(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const [resultsOffscreen, setResultsOffscreen] = useState(false);
  const autoScrolled = useRef(false);

  // ── Restore from URL hash first, else localStorage ──
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const hash = window.location.hash;
      if (hash.startsWith("#d=")) {
        const decoded = decodeURIComponent(escape(atob(decodeURIComponent(hash.slice(3)))));
        const s = JSON.parse(decoded);
        if (typeof s.l === "string") setLeft(s.l);
        if (typeof s.r === "string") setRight(s.r);
        if (typeof s.lang === "string") setLang(s.lang);
        return;
      }
    } catch {}
    try {
      const raw = localStorage.getItem("pdf24x:diff:v1");
      if (!raw) return;
      const s = JSON.parse(raw);
      if (typeof s.left === "string") setLeft(s.left);
      if (typeof s.right === "string") setRight(s.right);
      if (typeof s.lang === "string") setLang(s.lang);
      if (s.precision) setPrecision(s.precision);
      if (typeof s.view === "string") setView(s.view);
    } catch {}
  }, []);

  // ── Persist to localStorage (debounced) ──
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem("pdf24x:diff:v1", JSON.stringify({ left, right, lang, precision, view }));
      } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [left, right, lang, precision, view]);

  // ── Synced scrolling between the two textareas ──
  useEffect(() => {
    const l = leftTa.current, r = rightTa.current;
    if (!l || !r) return;
    let syncing = false;
    const mk = (from: HTMLTextAreaElement, to: HTMLTextAreaElement) => () => {
      if (syncing) return;
      syncing = true;
      const ratio = from.scrollHeight - from.clientHeight === 0
        ? 0 : from.scrollTop / (from.scrollHeight - from.clientHeight);
      to.scrollTop = ratio * (to.scrollHeight - to.clientHeight);
      requestAnimationFrame(() => { syncing = false; });
    };
    const onL = mk(l, r), onR = mk(r, l);
    l.addEventListener("scroll", onL);
    r.addEventListener("scroll", onR);
    return () => { l.removeEventListener("scroll", onL); r.removeEventListener("scroll", onR); };
  }, []);

  // ── Page-wide drop: drop on left half → left pane, right half → right ──
  useEffect(() => {
    const onDragOver = (e: DragEvent) => {
      if (!e.dataTransfer || !Array.from(e.dataTransfer.types).includes("Files")) return;
      e.preventDefault();
      const x = e.clientX, w = window.innerWidth;
      setDragOver(x < w / 2 ? "L" : "R");
    };
    const onDragLeave = (e: DragEvent) => {
      if (e.relatedTarget === null) setDragOver(null);
    };
    const onDrop = (e: DragEvent) => {
      if (!e.dataTransfer?.files?.length) return;
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      const side = e.clientX < window.innerWidth / 2 ? "L" : "R";
      const setter = side === "L" ? setLeft : setRight;
      readFile(f, setter);
      setDragOver(null);
    };
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  /* ── auto-detect JSON on paste ── */
  useEffect(() => {
    if (lang === "plain" && looksLikeJson(left, right)) setLang("json");
  }, [left, right, lang]);

  /* ── build options ── */
  const opts: DiffOptions = useMemo(() => ({
    ...DEFAULT_OPTIONS,
    ignoreCase, ignoreWhitespace: ignoreWs, trimLines, ignoreEmptyLines: ignoreEmpty,
    granularity: precision === "char" ? "char" : "word",
  }), [ignoreCase, ignoreWs, trimLines, ignoreEmpty, precision]);

  /* ── compute diff (respects realtime toggle) ── */
  const diffInputs = realtime ? { left, right } : { left, right, _t: triggered };
  const result = useMemo(
    () => computeTextDiff(diffInputs.left, diffInputs.right, opts),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [diffInputs.left, diffInputs.right, opts, triggered, realtime]
  );

  /* ── JSON structural diff ── */
  const jsonStruct = useMemo(() => {
    if (!isJson || jsonMode !== "tree") return null;
    try {
      const a = left.trim() ? JSON.parse(left) : null;
      const b = right.trim() ? JSON.parse(right) : null;
      return computeJsonDiff(a, b);
    } catch { return null; }
  }, [isJson, jsonMode, left, right]);

  /* ── view rows ── */
  const viewRows = useMemo<ViewRow[]>(
    () => (hideUnchanged ? collapseUnchanged(result.rows, 2) : result.rows),
    [result.rows, hideUnchanged]
  );

  /* ── helpers ── */
  const has = left.length > 0 || right.length > 0;
  const identical = has && result.stats.blocks === 0 && !result.tooLarge;
  const showResultsFirst = has && !result.tooLarge && !identical && result.stats.blocks > 0;

  // Reset auto-scroll flag when inputs are cleared
  useEffect(() => { if (!has) autoScrolled.current = false; }, [has]);

  // Track whether the result is currently visible for the floating pill
  useEffect(() => {
    const el = resultRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setResultsOffscreen(!e.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const stats = useMemo(() => {
    const leftLines = left.split("\n").length;
    const rightLines = right.split("\n").length;
    return { leftLines, rightLines };
  }, [left, right]);

  const registerBlock = useCallback((id: number, el: HTMLElement | null) => {
    if (el) blocks.current.set(id, el); else blocks.current.delete(id);
  }, []);
  const goto = (delta: number) => {
    const total = result.stats.blocks; if (!total) return;
    const next = currentBlock === null ? (delta > 0 ? 0 : total - 1) : (currentBlock + delta + total) % total;
    setCurrentBlock(next);
    blocks.current.get(next)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const gotoFirst = () => { if (result.stats.blocks) { setCurrentBlock(0); blocks.current.get(0)?.scrollIntoView({ behavior: "smooth", block: "center" }); } };
  const copy = (t: string, id: string) => {
    navigator.clipboard.writeText(t);
    setCopied(id); setTimeout(() => setCopied(null), 1500);
  };
  const copyKind = (t: string, kind: string) => {
    navigator.clipboard.writeText(t);
    setCopiedKind(kind);
    setTimeout(() => setCopiedKind(null), 1600);
  };
  const readFile = (f: File, set: (s: string) => void) => {
    if (f.size > 5 * 1024 * 1024) { alert("File larger than 5 MB — please use a smaller file."); return; }
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (EXT_LANG[ext] && lang === "plain") setLang(EXT_LANG[ext]);
    const r = new FileReader();
    r.onload = () => set(String(r.result ?? ""));
    r.readAsText(f);
  };
  const beautifyJson = (s: string): string => {
    try { return JSON.stringify(JSON.parse(s), null, 2); } catch { return s; }
  };
  const buildShareUrl = (): string => {
    try {
      const payload = JSON.stringify({ l: left, r: right, lang });
      const b64 = btoa(unescape(encodeURIComponent(payload)));
      return `${window.location.origin}${window.location.pathname}#d=${encodeURIComponent(b64)}`;
    } catch { return window.location.href; }
  };
  const copyShare = () => {
    const url = buildShareUrl();
    if (url.length > 8000) {
      alert("Diff is too large to share via URL. Please export instead.");
      return;
    }
    navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  // ── Merge helper ──
  const buildMerge = () => {
    // Walk rows; for each modified/added/removed row, use user's choice, defaulting to right
    const lines: string[] = [];
    let blockId = -1;
    for (const r of result.rows) {
      if (r.type === "same") {
        lines.push((r.left ?? []).map((s) => s.text).join(""));
        continue;
      }
      if (r.blockId !== blockId) blockId = r.blockId ?? -1;
      const choice = mergeChoices[blockId] ?? "R";
      if (choice === "none") continue;
      if (r.type === "modified") {
        if (choice === "L") lines.push((r.left ?? []).map((s) => s.text).join(""));
        else if (choice === "R") lines.push((r.right ?? []).map((s) => s.text).join(""));
        else { lines.push((r.left ?? []).map((s) => s.text).join("")); lines.push((r.right ?? []).map((s) => s.text).join("")); }
      } else if (r.type === "added") {
        if (choice === "R" || choice === "both") lines.push((r.right ?? []).map((s) => s.text).join(""));
      } else if (r.type === "removed") {
        if (choice === "L" || choice === "both") lines.push((r.left ?? []).map((s) => s.text).join(""));
      }
    }
    setMerged(lines.join("\n"));
  };

  const download = (name: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(u), 500);
  };

  return (
    <div className="w-full flex gap-0 items-start relative">
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 relative">
        {dragOver && (
          <div className="pointer-events-none fixed inset-0 z-40 flex">
            <div className={`flex-1 border-2 border-dashed transition-all ${dragOver === "L" ? "border-[#EE4B3C] bg-[#EE4B3C]/5" : "border-transparent"}`} />
            <div className={`flex-1 border-2 border-dashed transition-all ${dragOver === "R" ? "border-[#EE4B3C] bg-[#EE4B3C]/5" : "border-transparent"}`} />
          </div>
        )}
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--txt)]">Text &amp; Code Diff Checker</h1>
          <p className="text-[13px] text-[var(--txt-2)]">
            Compare text, code, or JSON. Side-by-side or inline, with word/char precision, ignore options, hide unchanged lines, syntax highlighting, and JSON tree comparison. 100% private — nothing leaves your browser.
          </p>
        </div>

        {/* Inputs (rendered above OR below the results depending on state) */}
        {(() => { const InputsBlock = (
        <div className="flex flex-col gap-3 lg:flex-row w-full min-w-0">
          <Pane
            label="Original text"
            value={left}
            onChange={(v) => { setLeft(v); setCurrentBlock(null); }}
            fileRef={leftFile} id="L"
            copied={copied} onCopy={copy} onUpload={readFile}
            isJson={isJson} onBeautify={() => setLeft(beautifyJson(left))}
            lineCount={stats.leftLines}
            onClear={() => { setLeft(""); setCurrentBlock(null); }}
            taRef={leftTa}
            highlight={dragOver === "L"}
          />
          <div className="flex items-center justify-center lg:flex-col">
            <button onClick={() => { setLeft(right); setRight(left); setCurrentBlock(null); }} title="Swap sides"
              className="rounded-xl border border-[var(--line-mid)] bg-[var(--surface)] p-2.5 text-[var(--txt-2)] hover:border-[#EE4B3C]/40 hover:text-[#EE4B3C]">
              <ArrowLeftRight size={16} />
            </button>
          </div>
          <Pane
            label="Changed text"
            value={right}
            onChange={(v) => { setRight(v); setCurrentBlock(null); }}
            fileRef={rightFile} id="R"
            copied={copied} onCopy={copy} onUpload={readFile}
            isJson={isJson} onBeautify={() => setRight(beautifyJson(right))}
            lineCount={stats.rightLines}
            onClear={() => { setRight(""); setCurrentBlock(null); }}
            taRef={rightTa}
            highlight={dragOver === "R"}
          />
        </div>
        ); return !showResultsFirst ? InputsBlock : null; })()}

        {/* Toolbar */}
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5">
          {/* View */}
          <div className="flex rounded-lg border border-[var(--line)] p-0.5 text-[12px] font-semibold">
            {(["split", "inline"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`rounded-md px-3 py-1 ${view === v ? "bg-[var(--inv-bg)] text-[var(--inv-txt)]" : "text-[var(--txt-2)] hover:text-[var(--txt)]"}`}>
                {v === "split" ? "Split" : "Unified"}
              </button>
            ))}
          </div>

          {/* Precision */}
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--txt-2)]">
            Precision:
            <div className="flex rounded-lg border border-[var(--line)] p-0.5">
              {(["smart", "word", "char"] as const).map((p) => (
                <button key={p} onClick={() => setPrecision(p)} title={p === "smart" ? "Line-level with word highlighting inside modified lines" : p === "word" ? "Whole-word differences" : "Character-level differences"}
                  className={`rounded-md px-2 py-0.5 text-[11.5px] font-semibold ${precision === p ? "bg-[var(--inv-bg)] text-[var(--inv-txt)]" : "text-[var(--txt-2)] hover:text-[var(--txt)]"}`}>
                  {p[0].toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* JSON tree toggle */}
          {isJson && (
            <div className="flex rounded-lg border border-[var(--line)] p-0.5 text-[11.5px] font-semibold">
              {(["text", "tree"] as const).map((m) => (
                <button key={m} onClick={() => setJsonMode(m)}
                  className={`rounded-md px-2 py-0.5 ${jsonMode === m ? "bg-[var(--inv-bg)] text-[var(--inv-txt)]" : "text-[var(--txt-2)] hover:text-[var(--txt)]"}`}>
                  {m === "text" ? "Text diff" : "Tree diff"}
                </button>
              ))}
            </div>
          )}

          <button onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-semibold ${showSettings ? "bg-[var(--inv-bg)] text-[var(--inv-txt)]" : "text-[var(--txt-2)] hover:text-[var(--txt)]"}`}>
            <Settings2 size={13} /> Options
          </button>

          {!realtime && (
            <button onClick={() => setTriggered((t) => t + 1)}
              className="rounded-lg bg-[#EE4B3C] px-3 py-1.5 text-[12px] font-semibold text-white hover:opacity-90">
              Find difference
            </button>
          )}

          {/* Right side */}
          <div className="ml-auto flex items-center gap-1.5">
            <button onClick={gotoFirst} disabled={!result.stats.blocks} title="Go to first change"
              className="flex items-center gap-1 rounded-lg border border-[var(--line-mid)] bg-[var(--surface)] px-2 py-1.5 text-[11.5px] font-semibold text-[var(--txt-2)] hover:border-[#EE4B3C]/40 hover:text-[#EE4B3C] disabled:opacity-40">
              <ChevronsRight size={13} /> First
            </button>
            <button onClick={() => goto(-1)} disabled={!result.stats.blocks} className="rounded-lg border border-[var(--line-mid)] bg-[var(--surface)] p-1.5 text-[var(--txt-2)] hover:border-[#EE4B3C]/40 hover:text-[#EE4B3C] disabled:opacity-40">
              <ChevronUp size={15} />
            </button>
            <button onClick={() => goto(1)} disabled={!result.stats.blocks} className="rounded-lg border border-[var(--line-mid)] bg-[var(--surface)] p-1.5 text-[var(--txt-2)] hover:border-[#EE4B3C]/40 hover:text-[#EE4B3C] disabled:opacity-40">
              <ChevronDown size={15} />
            </button>
            {currentBlock !== null && result.stats.blocks > 0 && (
              <span className="text-[12px] font-semibold text-[var(--txt-2)]">{currentBlock + 1} / {result.stats.blocks}</span>
            )}
            <button onClick={() => setShareOpen(true)} disabled={!has} title="Share this diff"
              className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-2.5 py-1.5 text-[12px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40 disabled:opacity-40">
              <Link2 size={13} /> Share
            </button>
            <button onClick={() => { buildMerge(); setMergeOpen(true); }} disabled={!has || result.stats.blocks === 0} title="Open merge helper"
              className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-2.5 py-1.5 text-[12px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40 disabled:opacity-40">
              <GitMerge size={13} /> Merge
            </button>
            <button onClick={() => download(`${diffName || "comparison"}.diff`, makeUnifiedPatch(left, right), "text/plain")}
              disabled={!has || result.tooLarge} title="Download .diff patch"
              className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-2.5 py-1.5 text-[12px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40 disabled:opacity-40">
              <Download size={13} /> .diff
            </button>
            <button onClick={() => download(`${diffName || "comparison"}-report.html`, makeHtmlReport(result.rows, result.stats), "text/html")}
              disabled={!has || result.tooLarge} title="Download HTML report"
              className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-2.5 py-1.5 text-[12px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40 disabled:opacity-40">
              <FileText size={13} /> Report
            </button>
          </div>
        </div>

        {/* Options row */}
        {showSettings && (
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
            <Toggle label="Real-time editor" checked={realtime} onChange={setRealtime} tip="Compare as you type. Turn off to use the Find difference button instead." />
            <Toggle label="Hide unchanged lines" checked={hideUnchanged} onChange={setHideUnchanged} tip="Collapse long identical sections; show only changes with a small amount of context." icon={hideUnchanged ? EyeOff : Eye} />
            <Toggle label="Ignore case" checked={ignoreCase} onChange={setIgnoreCase} tip="Treat 'Hello' and 'hello' as identical." />
            <Toggle label="Ignore whitespace" checked={ignoreWs} onChange={setIgnoreWs} tip="Collapse runs of spaces/tabs before comparing." />
            <Toggle label="Trim lines" checked={trimLines} onChange={setTrimLines} tip="Ignore leading and trailing spaces on each line." />
            <Toggle label="Ignore empty lines" checked={ignoreEmpty} onChange={setIgnoreEmpty} tip="Skip blank lines during comparison." />
            <Toggle label="Word wrap" checked={wrap} onChange={setWrap} tip="Wrap long lines instead of horizontal scrolling." />
            <Toggle label="Line numbers" checked={lineNums} onChange={setLineNums} />
            <Toggle label="Show whitespace" checked={showWs} onChange={setShowWs} tip="Visualize spaces (·) and tabs (→) in the diff." />
            <Toggle label="Change minimap" checked={showMinimap} onChange={setShowMinimap} tip="Show a change-density strip on the right." />
          </div>
        )}

        {/* Stats */}
        {has && !result.tooLarge && (
          <p className="mt-3 font-mono text-[12.5px]">
            {identical ? (
              <span className="font-sans text-[13px] font-semibold text-[#27AE60]">
                ✓ The two inputs are identical{ignoreCase || ignoreWs || trimLines || ignoreEmpty ? " (with current options)" : ""}.
              </span>
            ) : (
              <>
                <span className="text-[#27AE60]">+{result.stats.added}</span>{" "}
                <span className="text-[#C0392B]">−{result.stats.removed}</span>{" "}
                <span className="text-[#B7791F]">~{result.stats.modified}</span>{" "}
                <span className="text-[var(--txt-2)]">across {result.stats.blocks} block{result.stats.blocks === 1 ? "" : "s"}</span>
              </>
            )}
          </p>
        )}

        {result.tooLarge && (
          <p className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-[#C0392B]">
            <AlertCircle size={15} /> Too large to compare in the browser (60,000+ lines combined). Try smaller inputs.
          </p>
        )}

        {/* Result */}
        <div ref={resultRef} className="mt-3 scroll-mt-20">
          {isJson && jsonMode === "tree" ? (
            jsonStruct ? (
              jsonStruct.changes.length === 0 ? (
                <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[#27AE60]"><Check size={15} /> The two JSON documents are structurally identical.</p>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                  {jsonStruct.changes.map((c: JsonChange, i: number) => (
                    <div key={i} className="grid grid-cols-[110px_1fr] gap-3 border-b border-[var(--line)] px-4 py-2.5 last:border-0 sm:grid-cols-[110px_minmax(0,320px)_1fr]">
                      <span className={`inline-flex h-5 items-center justify-center rounded-md px-1.5 text-[10.5px] font-bold uppercase ${
                        c.type === "added" ? "bg-[#E9F9EF] text-[#14532D]" :
                        c.type === "removed" ? "bg-[#FDECEA] text-[#7F1D1D]" :
                        c.type === "changed" ? "bg-[#FFF8E6] text-[#7C4A03]" :
                        "bg-[#E6EEFF] text-[#1E3A8A]"
                      }`}>{c.type.replace("-", " ")}</span>
                      <span className="break-all font-mono text-[12.5px] text-[var(--txt)]">{c.path}</span>
                      <span className="break-all font-mono text-[12px] text-[var(--txt-2)]">
                        {c.type === "added" ? `→ ${JSON.stringify(c.after)}` :
                          c.type === "removed" ? `${JSON.stringify(c.before)} →` :
                          `${JSON.stringify(c.before)} → ${JSON.stringify(c.after)}`}
                      </span>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-[var(--line-mid)] bg-[var(--surface)] p-10 text-center">
                <p className="text-[14px] font-semibold text-[var(--txt)]">Paste valid JSON on both sides for a tree diff</p>
                <p className="mt-1 text-[12.5px] text-[var(--txt-2)]">Structural changes will appear here as a list of paths.</p>
              </div>
            )
          ) : has && !result.tooLarge && !identical ? (
            <CollapsibleDiffViewer
              rows={viewRows}
              view={view}
              wrap={wrap}
              showLineNumbers={lineNums}
              currentBlock={currentBlock}
              registerBlock={registerBlock}
              showWhitespace={showWs}
              showMinimap={showMinimap}
            />
          ) : !has ? (
            <div className="rounded-2xl border-2 border-dashed border-[var(--line-mid)] bg-[var(--surface)] p-10 text-center">
              <p className="text-[14px] font-semibold text-[var(--txt)]">Paste or upload two texts to compare</p>
              <p className="mt-1 text-[12.5px] text-[var(--txt-2)]">Additions in green, deletions in red — with word-level highlighting inside modified lines.</p>
            </div>
          ) : null}
        </div>

        {showResultsFirst && (
          <div className="mt-6 flex flex-col gap-3 lg:flex-row w-full min-w-0">
            <Pane
              label="Original text"
              value={left}
              onChange={(v) => { setLeft(v); setCurrentBlock(null); }}
              fileRef={leftFile} id="L2"
              copied={copied} onCopy={copy} onUpload={readFile}
              isJson={isJson} onBeautify={() => setLeft(beautifyJson(left))}
              lineCount={stats.leftLines}
              onClear={() => { setLeft(""); setCurrentBlock(null); }}
              taRef={leftTa}
              highlight={dragOver === "L"}
            />
            <div className="flex items-center justify-center lg:flex-col">
              <button onClick={() => { setLeft(right); setRight(left); setCurrentBlock(null); }} title="Swap sides"
                className="rounded-xl border border-[var(--line-mid)] bg-[var(--surface)] p-2.5 text-[var(--txt-2)] hover:border-[#EE4B3C]/40 hover:text-[#EE4B3C]">
                <ArrowLeftRight size={16} />
              </button>
            </div>
            <Pane
              label="Changed text"
              value={right}
              onChange={(v) => { setRight(v); setCurrentBlock(null); }}
              fileRef={rightFile} id="R2"
              copied={copied} onCopy={copy} onUpload={readFile}
              isJson={isJson} onBeautify={() => setRight(beautifyJson(right))}
              lineCount={stats.rightLines}
              onClear={() => { setRight(""); setCurrentBlock(null); }}
              taRef={rightTa}
              highlight={dragOver === "R"}
            />
          </div>
        )}

        {has && !result.tooLarge && !identical && result.stats.blocks > 0 && resultsOffscreen && (
          <button
            onClick={() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#EE4B3C] px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-lg hover:opacity-90"
            title="Jump to results"
          >
            <ChevronDown size={15} />
            Jump to {result.stats.blocks} difference{result.stats.blocks === 1 ? "" : "s"}
          </button>
        )}

        {/* ── Share modal ── */}
        {shareOpen && (
          <ShareModal
            name={diffName}
            setName={setDiffName}
            url={buildShareUrl()}
            onClose={() => setShareOpen(false)}
            copyKind={copyKind}
            copiedKind={copiedKind}
            diffContent={makeUnifiedPatch(left, right)}
            reportContent={makeHtmlReport(result.rows, result.stats)}
            download={download}
          />
        )}

        {/* ── Merge modal (advanced) ── */}
        {mergeOpen && (
          <MergeModal
            rows={result.rows}
            totalBlocks={result.stats.blocks}
            choices={mergeChoices}
            setChoices={setMergeChoices}
            merged={merged}
            rebuild={buildMerge}
            name={diffName}
            setName={setDiffName}
            onClose={() => setMergeOpen(false)}
            onApply={() => { setLeft(merged); setRight(merged); setMergeOpen(false); }}
            download={download}
          />
        )}

        <p className="mt-6 text-xs text-[var(--txt-2)]">
          🔒 100% private — your text never leaves your device. Comparison, reports, and patches are all generated locally.
        </p>
      </main>
    </div>
  );
}

/* ═══ Sub-components ═══ */

type PaneProps = {
  label: string; value: string; onChange: (v: string) => void;
  fileRef: React.RefObject<HTMLInputElement | null>; id: string;
  copied: string | null; onCopy: (t: string, id: string) => void;
  onUpload: (f: File, set: (s: string) => void) => void;
  isJson: boolean; onBeautify: () => void;
  lineCount: number; onClear: () => void;
  taRef?: React.RefObject<HTMLTextAreaElement | null>;
  highlight?: boolean;
};
function Pane({ label, value, onChange, fileRef, id, copied, onCopy, onUpload, isJson, onBeautify, lineCount, onClear, taRef, highlight }: PaneProps) {
  return (
    <div className={`min-w-0 flex-1 rounded-2xl border bg-[var(--surface)] transition-all ${highlight ? "border-[#EE4B3C] ring-2 ring-[#EE4B3C]/25 shadow-lg" : "border-[var(--line)]"}`}>
      <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2">
        <p className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--txt-2)]">
          {label} <span className="ml-2 font-mono font-normal normal-case text-[var(--txt-3)]">{lineCount} line{lineCount === 1 ? "" : "s"}</span>
        </p>
        <div className="flex items-center gap-0.5">
          {isJson && (
            <button onClick={onBeautify} title="Beautify JSON"
              className="rounded-md p-1.5 text-[var(--txt-2)] hover:bg-[var(--hover-soft)] hover:text-[var(--txt)]">
              <Wand2 size={14} />
            </button>
          )}
          <button onClick={() => fileRef.current?.click()} title="Upload file"
            className="rounded-md p-1.5 text-[var(--txt-2)] hover:bg-[var(--hover-soft)] hover:text-[var(--txt)]">
            <Upload size={14} />
          </button>
          <button onClick={() => onCopy(value, id)} title="Copy"
            className="rounded-md p-1.5 text-[var(--txt-2)] hover:bg-[var(--hover-soft)] hover:text-[var(--txt)]">
            {copied === id ? <Check size={14} className="text-[#27AE60]" /> : <Copy size={14} />}
          </button>
          <button onClick={onClear} title="Clear"
            className="rounded-md p-1.5 text-[var(--txt-2)] hover:bg-[var(--hover-soft)] hover:text-[#EE4B3C]">
            <Trash2 size={14} />
          </button>
          <input ref={fileRef} type="file" className="hidden" accept={ACCEPT}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f, onChange); e.target.value = ""; }} />
        </div>
      </div>
      <textarea ref={taRef} value={value} spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste text here, upload, or drag a file onto either half of the page…"
        className="block h-56 w-full resize-y rounded-b-2xl bg-transparent p-3 font-mono text-[12.5px] leading-relaxed text-[var(--txt)] outline-none placeholder:text-[var(--txt-3)]" />
    </div>
  );
}

function Toggle({ label, checked, onChange, tip, icon: Icon }: { label: string; checked: boolean; onChange: (b: boolean) => void; tip?: string; icon?: React.ComponentType<{ size?: number }> }) {
  return (
    <label title={tip} className="flex cursor-pointer items-center gap-1.5 text-[12px] font-medium text-[var(--txt-2)]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-[#EE4B3C]" />
      {Icon && <Icon size={13} />}
      {label}
    </label>
  );
}

/* Wraps DiffViewer to render collapsed section rows for "Hide unchanged lines" */
function CollapsibleDiffViewer({ rows, view, wrap, showLineNumbers, currentBlock, registerBlock, showWhitespace, showMinimap }: {
  rows: ViewRow[]; view: "split" | "inline"; wrap: boolean; showLineNumbers: boolean;
  currentBlock: number | null; registerBlock: (id: number, el: HTMLElement | null) => void;
  showWhitespace: boolean; showMinimap: boolean;
}) {
  // Split rows into contiguous runs separated by collapsed markers, render each run with DiffViewer.
  const parts: (DiffRow[] | { collapsed: true; leftFrom: number; leftTo: number; rightFrom: number; rightTo: number })[] = [];
  let buf: DiffRow[] = [];
  for (const r of rows) {
    if ("collapsed" in r) {
      if (buf.length) { parts.push(buf); buf = []; }
      parts.push(r);
    } else buf.push(r);
  }
  if (buf.length) parts.push(buf);

  return (
    <div className="space-y-2">
      {parts.map((p, i) =>
        "collapsed" in p ? (
          <div key={i} className="rounded-xl border border-dashed border-[var(--line-mid)] bg-[var(--surface-2)] px-4 py-2 text-center text-[11.5px] font-mono text-[var(--txt-2)]">
            <Braces size={11} className="inline -mt-0.5 mr-1.5" />
            {p.leftFrom === p.leftTo
              ? `1 unchanged line`
              : `${p.leftTo - p.leftFrom + 1} unchanged lines`}
            {" "}
            <span className="text-[var(--txt-3)]">(L {p.leftFrom}–{p.leftTo} · R {p.rightFrom}–{p.rightTo})</span>
          </div>
        ) : (
          <DiffViewer key={i} rows={p} view={view} wrap={wrap} showLineNumbers={showLineNumbers}
            currentBlock={currentBlock} registerBlock={registerBlock}
            showWhitespace={showWhitespace} showMinimap={showMinimap && parts.length === 1} />
        )
      )}
    </div>
  );
}


/* ═══ Share Modal ═══ */
function ShareModal({ name, setName, url, onClose, copyKind, copiedKind, diffContent, reportContent, download }: {
  name: string;
  setName: (s: string) => void;
  url: string;
  onClose: () => void;
  copyKind: (t: string, k: string) => void;
  copiedKind: string | null;
  diffContent: string;
  reportContent: string;
  download: (name: string, content: string, mime: string) => void;
}) {
  const tooLong = url.length > 8000;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-[var(--surface)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3">
          <p className="text-[15px] font-bold text-[var(--txt)]">Share this diff</p>
          <button onClick={onClose} className="rounded-md p-1.5 text-[var(--txt-2)] hover:bg-[var(--hover-soft)]">✕</button>
        </div>
        <div className="space-y-4 px-5 py-4">
          <p className="text-[12.5px] text-[var(--txt-2)]">
            The link below embeds the full diff — nothing is uploaded to any server.
            Recipients see the same comparison in their browser.
          </p>
          <div>
            <label className="mb-1 block text-[11.5px] font-bold uppercase tracking-wide text-[var(--txt-2)]">Name (used as filename)</label>
            <input value={name} onChange={(e) => setName(e.target.value.replace(/[^\w\- .]/g, "").slice(0, 60))} spellCheck={false}
              placeholder="comparison"
              className="w-full rounded-lg border border-[var(--line-mid)] bg-[var(--surface-2)] px-3 py-2 text-[13px] text-[var(--txt)] outline-none focus:border-[#EE4B3C]/50" />
          </div>
          <div>
            <label className="mb-1 block text-[11.5px] font-bold uppercase tracking-wide text-[var(--txt-2)]">Shareable link</label>
            <div className="flex gap-2">
              <input readOnly value={tooLong ? "Diff is too large for URL sharing — use Download instead" : url}
                className={`min-w-0 flex-1 rounded-lg border bg-[var(--surface-2)] px-3 py-2 font-mono text-[12px] outline-none ${tooLong ? "border-[var(--line)] text-[#C0392B]" : "border-[var(--line-mid)] text-[var(--txt)]"}`} />
              <button onClick={() => !tooLong && copyKind(url, "url")} disabled={tooLong}
                className="flex items-center gap-1.5 rounded-lg bg-[#EE4B3C] px-3 py-2 text-[12.5px] font-semibold text-white hover:opacity-90 disabled:opacity-40">
                {copiedKind === "url" ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
              </button>
            </div>
          </div>
          <div className="border-t border-[var(--line)] pt-3">
            <p className="mb-2 text-[11.5px] font-bold uppercase tracking-wide text-[var(--txt-2)]">Or download</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => download(`${name || "comparison"}.diff`, diffContent, "text/plain")}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-3 py-1.5 text-[12px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40">
                <Download size={13} /> {name || "comparison"}.diff
              </button>
              <button onClick={() => download(`${name || "comparison"}-report.html`, reportContent, "text/html")}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-3 py-1.5 text-[12px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40">
                <FileText size={13} /> {name || "comparison"}-report.html
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end border-t border-[var(--line)] px-5 py-3">
          <button onClick={onClose} className="rounded-lg bg-[var(--inv-bg)] px-4 py-1.5 text-[12.5px] font-semibold text-[var(--inv-txt)] hover:opacity-90">Done</button>
        </div>
      </div>
    </div>
  );
}

/* ═══ Merge Modal (advanced) ═══ */
type Choice = "L" | "R" | "both" | "none";
function MergeModal({ rows, totalBlocks, choices, setChoices, merged, rebuild, name, setName, onClose, onApply, download }: {
  rows: DiffRow[];
  totalBlocks: number;
  choices: Record<number, Choice>;
  setChoices: (c: Record<number, Choice>) => void;
  merged: string;
  rebuild: () => void;
  name: string;
  setName: (s: string) => void;
  onClose: () => void;
  onApply: () => void;
  download: (name: string, content: string, mime: string) => void;
}) {
  // Group rows by blockId for preview
  const blocks = useMemo(() => {
    const map = new Map<number, DiffRow[]>();
    for (const r of rows) {
      if (r.blockId === null) continue;
      if (!map.has(r.blockId)) map.set(r.blockId, []);
      map.get(r.blockId)!.push(r);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [rows]);

  // Rebuild merged output whenever choices change
  useEffect(() => { rebuild(); }, [choices, rebuild]);

  // Keyboard shortcuts: focus a block, then press L/R/B/D
  const [focus, setFocus] = useState<number>(0);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      const k = e.key.toLowerCase();
      if (k === "arrowdown" || k === "j") { e.preventDefault(); setFocus((f) => Math.min(totalBlocks - 1, f + 1)); return; }
      if (k === "arrowup" || k === "k") { e.preventDefault(); setFocus((f) => Math.max(0, f - 1)); return; }
      const map: Record<string, Choice> = { l: "L", r: "R", b: "both", d: "none" };
      if (map[k] && blocks[focus]) {
        e.preventDefault();
        setChoices({ ...choices, [blocks[focus][0]]: map[k] });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus, blocks, choices, setChoices, totalBlocks]);

  const bulk = (c: Choice) => {
    const next: Record<number, Choice> = {};
    for (const [id] of blocks) next[id] = c;
    setChoices(next);
  };

  const decided = Object.keys(choices).length;
  const pct = totalBlocks ? Math.round((decided / totalBlocks) * 100) : 0;

  const renderBlock = (blockRows: DiffRow[]) => {
    const left: string[] = [], right: string[] = [];
    for (const r of blockRows) {
      if (r.type === "removed" || r.type === "modified") left.push((r.left ?? []).map((s) => s.text).join(""));
      if (r.type === "added" || r.type === "modified") right.push((r.right ?? []).map((s) => s.text).join(""));
    }
    return { left: left.join("\n"), right: right.join("\n") };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-[var(--surface)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3">
          <div>
            <p className="text-[15px] font-bold text-[var(--txt)]">Merge helper</p>
            <p className="text-[11.5px] text-[var(--txt-2)]">Pick which version of each change to keep. Shortcuts: <kbd className="rounded bg-[var(--hover-soft)] px-1 font-mono">L</kbd> keep left · <kbd className="rounded bg-[var(--hover-soft)] px-1 font-mono">R</kbd> keep right · <kbd className="rounded bg-[var(--hover-soft)] px-1 font-mono">B</kbd> both · <kbd className="rounded bg-[var(--hover-soft)] px-1 font-mono">D</kbd> drop · <kbd className="rounded bg-[var(--hover-soft)] px-1 font-mono">↑↓</kbd> move</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-[var(--txt-2)] hover:bg-[var(--hover-soft)]">✕</button>
        </div>

        {/* Bulk actions + progress */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] bg-[var(--surface-2)] px-5 py-2.5">
          <span className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--txt-2)]">Bulk:</span>
          <button onClick={() => bulk("L")} className="rounded-md border border-[var(--line-mid)] px-2 py-1 text-[11.5px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40">All original</button>
          <button onClick={() => bulk("R")} className="rounded-md border border-[var(--line-mid)] px-2 py-1 text-[11.5px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40">All changed</button>
          <button onClick={() => bulk("both")} className="rounded-md border border-[var(--line-mid)] px-2 py-1 text-[11.5px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40">All both</button>
          <button onClick={() => bulk("none")} className="rounded-md border border-[var(--line-mid)] px-2 py-1 text-[11.5px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40">All drop</button>
          <div className="ml-auto flex items-center gap-2">
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[var(--line)]">
              <div className="h-full bg-[#27AE60] transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[11.5px] font-semibold text-[var(--txt-2)]">{decided} / {totalBlocks} decided</span>
          </div>
        </div>

        {/* Body: left = per-change picker, right = merged preview */}
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_1fr]">
          <div className="min-h-0 overflow-y-auto border-b border-[var(--line)] px-5 py-4 lg:border-b-0 lg:border-r">
            <div className="space-y-2">
              {blocks.map(([blockId, brs], idx) => {
                const { left, right } = renderBlock(brs);
                const choice = choices[blockId] ?? "R";
                const focused = idx === focus;
                return (
                  <div key={blockId}
                    onClick={() => setFocus(idx)}
                    className={`cursor-pointer rounded-lg border px-3 py-2 transition-all ${focused ? "border-[#EE4B3C] bg-[#EE4B3C]/5" : "border-[var(--line)] hover:border-[var(--line-mid)]"}`}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-[var(--txt)]">Change {idx + 1}</span>
                      <div className="flex gap-1">
                        {(["L", "R", "both", "none"] as const).map((k) => (
                          <button key={k}
                            onClick={(e) => { e.stopPropagation(); setChoices({ ...choices, [blockId]: k }); }}
                            className={`rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold ${choice === k ? "bg-[var(--inv-bg)] text-[var(--inv-txt)]" : "border border-[var(--line-mid)] text-[var(--txt-2)] hover:border-[#EE4B3C]/40"}`}>
                            {k === "L" ? "Original" : k === "R" ? "Changed" : k === "both" ? "Both" : "Drop"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11.5px]">
                      <div className="min-w-0">
                        <p className="mb-0.5 font-bold uppercase tracking-wide text-[#7F1D1D]">Original</p>
                        <pre className="max-h-24 overflow-auto whitespace-pre-wrap break-all rounded bg-[#FDECEA] px-2 py-1 font-mono text-[11px] text-[var(--txt)]">{left || <em className="not-italic text-[var(--txt-3)]">(empty)</em>}</pre>
                      </div>
                      <div className="min-w-0">
                        <p className="mb-0.5 font-bold uppercase tracking-wide text-[#14532D]">Changed</p>
                        <pre className="max-h-24 overflow-auto whitespace-pre-wrap break-all rounded bg-[#E9F9EF] px-2 py-1 font-mono text-[11px] text-[var(--txt)]">{right || <em className="not-italic text-[var(--txt-3)]">(empty)</em>}</pre>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex min-h-0 flex-col px-5 py-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--txt-2)]">Merged output — live preview</p>
              <span className="text-[11px] text-[var(--txt-3)]">{merged.split("\n").length} lines · {merged.length} chars</span>
            </div>
            <textarea readOnly value={merged}
              className="block min-h-0 flex-1 w-full resize-none rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3 font-mono text-[12.5px] leading-relaxed text-[var(--txt)] outline-none" />
            <div className="mt-3">
              <label className="mb-1 block text-[11.5px] font-bold uppercase tracking-wide text-[var(--txt-2)]">Filename</label>
              <input value={name} onChange={(e) => setName(e.target.value.replace(/[^\w\- .]/g, "").slice(0, 60))} spellCheck={false}
                placeholder="merged"
                className="w-full rounded-lg border border-[var(--line-mid)] bg-[var(--surface-2)] px-3 py-2 text-[13px] text-[var(--txt)] outline-none focus:border-[#EE4B3C]/50" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--line)] px-5 py-3">
          <button onClick={() => navigator.clipboard.writeText(merged)}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-3 py-1.5 text-[12px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40">
            <Copy size={13} /> Copy merged
          </button>
          <button onClick={() => download(`${name || "merged"}.txt`, merged, "text/plain")}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-3 py-1.5 text-[12px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40">
            <Download size={13} /> Download
          </button>
          <button onClick={onApply}
            className="rounded-lg bg-[#EE4B3C] px-3 py-1.5 text-[12px] font-semibold text-white hover:opacity-90">
            Apply as new baseline
          </button>
        </div>
      </div>
    </div>
  );
}
