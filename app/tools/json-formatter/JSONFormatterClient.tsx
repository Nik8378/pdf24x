"use client";
import { useState, useCallback, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Copy, CheckCircle, Trash2, Upload, Download, ChevronDown, ChevronRight, AlertCircle, CheckCircle2, Minimize2, Maximize2 } from "lucide-react";

// ─── JSON Tree Node ───────────────────────────────────────────────────────────

interface TreeNodeProps {
  data: unknown;
  keyName?: string;
  depth?: number;
  defaultOpen?: boolean;
}

function TreeNode({ data, keyName, depth = 0, defaultOpen = true }: TreeNodeProps) {
  const [open, setOpen] = useState(defaultOpen || depth < 2);
  const isObj = typeof data === "object" && data !== null && !Array.isArray(data);
  const isArr = Array.isArray(data);
  const isCollapsible = isObj || isArr;
  const indent = depth * 16;

  const valueColor = () => {
    if (data === null) return "text-gray-400";
    if (typeof data === "boolean") return "text-purple-600";
    if (typeof data === "number") return "text-blue-600";
    if (typeof data === "string") return "text-green-700";
    return "text-[var(--txt)]";
  };

  const bracket = isArr ? ["[", "]"] : ["{", "}"];
  const children = isCollapsible ? Object.entries(data as Record<string, unknown>) : [];
  const count = children.length;

  return (
    <div style={{ marginLeft: depth === 0 ? 0 : indent }}>
      <div className="flex items-start gap-1 group min-h-[22px] hover:bg-[var(--hover-soft)] rounded px-1 cursor-pointer" onClick={() => isCollapsible && setOpen(!open)}>
        {isCollapsible ? (
          <span className="text-[var(--txt-2)] mt-0.5 shrink-0 w-4">
            {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        ) : <span className="w-4 shrink-0" />}

        {keyName !== undefined && (
          <span className="text-[var(--err)] font-medium text-[12.5px] shrink-0">
            &quot;{keyName}&quot;<span className="text-[var(--txt-2)]">:</span>&nbsp;
          </span>
        )}

        {isCollapsible ? (
          <span className="text-[12.5px] text-[var(--txt)]">
            <span className="font-bold">{bracket[0]}</span>
            {!open && (
              <span className="text-[var(--txt-2)] text-[11px]"> {count} {isArr ? "items" : "keys"} </span>
            )}
            {!open && <span className="font-bold">{bracket[1]}</span>}
          </span>
        ) : (
          <span className={`text-[12.5px] font-medium ${valueColor()}`}>
            {data === null ? "null" : typeof data === "string" ? `"${data}"` : String(data)}
          </span>
        )}
      </div>

      {isCollapsible && open && (
        <div className="border-l border-[var(--line)] ml-2">
          {children.map(([k, v], i) => (
            <TreeNode key={k} data={v} keyName={isArr ? undefined : k} depth={depth + 1} defaultOpen={depth < 1} />
          ))}
        </div>
      )}

      {isCollapsible && open && (
        <div style={{ marginLeft: depth === 0 ? 0 : indent }} className="text-[12.5px] font-bold text-[var(--txt)] px-1">
          {bracket[1]}
        </div>
      )}
    </div>
  );
}

// ─── Syntax Highlighter ───────────────────────────────────────────────────────

function syntaxHighlight(json: string): string {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "color:#2980b9"; // number
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? "color:#c0392b;font-weight:600" : "color:#27ae60";
        } else if (/true|false/.test(match)) {
          cls = "color:#8e44ad;font-weight:600";
        } else if (/null/.test(match)) {
          cls = "color:#95a5a6;font-style:italic";
        }
        return `<span style="${cls}">${match}</span>`;
      }
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type ViewMode = "formatted" | "tree" | "minified";

export default function JSONFormatterClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [parsed, setParsed] = useState<Record<string, unknown> | unknown[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [valid, setValid] = useState<boolean | null>(null);
  const [view, setView] = useState<ViewMode>("formatted");
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [stats, setStats] = useState<{ keys: number; size: string; depth: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const countKeys = (obj: unknown, depth = 0): { keys: number; maxDepth: number } => {
    if (typeof obj !== "object" || obj === null) return { keys: 0, maxDepth: depth };
    const entries = Object.entries(obj as Record<string, unknown>);
    let keys = entries.length;
    let maxDepth = depth;
    entries.forEach(([, v]) => {
      const child = countKeys(v, depth + 1);
      keys += child.keys;
      maxDepth = Math.max(maxDepth, child.maxDepth);
    });
    return { keys, maxDepth };
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    return (bytes / 1024).toFixed(1) + " KB";
  };

  const process = useCallback((raw: string) => {
    if (!raw.trim()) {
      setOutput(""); setParsed(null); setError(null); setValid(null); setStats(null);
      return;
    }
    try {
      const obj = JSON.parse(raw);
      const formatted = JSON.stringify(obj, null, indent);
      const minified = JSON.stringify(obj);
      const { keys, maxDepth } = countKeys(obj);
      setOutput(formatted);
      setParsed(obj);
      setError(null);
      setValid(true);
      setStats({
        keys,
        size: formatBytes(new Blob([raw]).size),
        depth: maxDepth,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setOutput("");
      setParsed(null);
      setValid(false);
      setStats(null);
    }
  }, [indent]);

  const handleInput = (val: string) => {
    setInput(val);
    process(val);
  };

  const handleFormat = () => process(input);

  const handleMinify = () => {
    if (!parsed) return;
    const min = JSON.stringify(parsed);
    setOutput(min);
    setView("minified");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output || input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast("Copied to clipboard!");
  };

  const handleClear = () => {
    setInput(""); setOutput(""); setParsed(null);
    setError(null); setValid(null); setStats(null);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "formatted.json"; a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded!");
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setInput(text);
      process(text);
    };
    reader.readAsText(file);
  };

  const SAMPLE = `{
  "name": "PDF24x",
  "version": "1.0.0",
  "tools": ["Image to PDF", "JSON Formatter", "ISBN Converter"],
  "features": {
    "browserBased": true,
    "noUpload": true,
    "free": true,
    "price": 0
  },
  "author": {
    "name": "PDF24x Team",
    "website": "https://pdf24x.com"
  }
}`;

  const displayOutput = view === "minified" && parsed
    ? JSON.stringify(parsed)
    : output;

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-8">

          {/* Header */}
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--txt)] mb-1">JSON Formatter & Validator</h1>
            <p className="text-[13px] text-[var(--txt-2)]">
              Format, beautify, validate and minify JSON instantly. Syntax highlighting, tree view, error detection — all in your browser.
            </p>
          </div>

          {/* SEO keyword pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {["JSON Beautifier", "JSON Validator", "JSON Minifier", "JSON Viewer", "JSON Lint", "JSON Tree", "Free"].map(tag => (
              <span key={tag} className="text-[11px] font-medium text-[var(--txt-2)] bg-[var(--hover-soft)] border border-[var(--line)] rounded-full px-3 py-1">{tag}</span>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <button onClick={handleFormat}
              className="flex items-center gap-1.5 bg-accent hover:bg-accent-dark text-white font-semibold text-[13px] px-4 py-2 rounded-full transition-all shadow-sm">
              <Maximize2 size={14} /> Format / Beautify
            </button>
            <button onClick={handleMinify} disabled={!parsed}
              className="flex items-center gap-1.5 bg-[var(--hover-soft)] hover:bg-[var(--hover-soft)] text-[var(--txt-2)] font-medium text-[13px] px-4 py-2 rounded-full transition-all disabled:opacity-40">
              <Minimize2 size={14} /> Minify
            </button>
            <button onClick={() => { setInput(SAMPLE); process(SAMPLE); }}
              className="flex items-center gap-1.5 bg-[var(--hover-soft)] hover:bg-[var(--hover-soft)] text-[var(--txt-2)] font-medium text-[13px] px-4 py-2 rounded-full transition-all">
              Sample JSON
            </button>
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 bg-[var(--hover-soft)] hover:bg-[var(--hover-soft)] text-[var(--txt-2)] font-medium text-[13px] px-4 py-2 rounded-full transition-all">
              <Upload size={14} /> Upload File
            </button>
            <input ref={fileRef} type="file" accept=".json,application/json,text/plain" className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {output && (
              <button onClick={handleDownload}
                className="flex items-center gap-1.5 bg-[var(--hover-soft)] hover:bg-[var(--hover-soft)] text-[var(--txt-2)] font-medium text-[13px] px-4 py-2 rounded-full transition-all">
                <Download size={14} /> Download
              </button>
            )}
            <button onClick={handleClear}
              className="flex items-center gap-1.5 text-red-500 hover:text-red-600 font-medium text-[13px] px-3 py-2 rounded-full transition-all hover:bg-red-50">
              <Trash2 size={14} /> Clear
            </button>

            {/* Indent selector */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[12px] text-[var(--txt-2)]">Indent:</span>
              {[2, 4].map(n => (
                <button key={n} onClick={() => { setIndent(n); if (parsed) setOutput(JSON.stringify(parsed, null, n)); }}
                  className={`w-8 h-8 rounded-lg text-[12px] font-bold transition-all ${indent === n ? "bg-accent text-white" : "bg-[var(--hover-soft)] text-[var(--txt-2)] hover:bg-[var(--hover-soft)]"}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Status bar */}
          {valid !== null && (
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl mb-4 ${valid ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"}`}>
              {valid
                ? <><CheckCircle2 size={16} className="text-green-600 shrink-0" /><span className="text-[12.5px] text-green-700 font-medium">Valid JSON</span></>
                : <><AlertCircle size={16} className="text-red-500 shrink-0" /><span className="text-[12.5px] text-red-600 font-medium">{error}</span></>}
              {stats && valid && (
                <div className="ml-auto flex items-center gap-4">
                  <span className="text-[11.5px] text-[var(--txt-2)]">Keys: <strong className="text-[var(--txt)]">{stats.keys}</strong></span>
                  <span className="text-[11.5px] text-[var(--txt-2)]">Size: <strong className="text-[var(--txt)]">{stats.size}</strong></span>
                  <span className="text-[11.5px] text-[var(--txt-2)]">Depth: <strong className="text-[var(--txt)]">{stats.depth}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* Main editor */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

            {/* Input */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-bold text-[var(--txt)] uppercase tracking-widest">Input</span>
                <span className="text-[11px] text-[var(--txt-2)]">{input.length} chars</span>
              </div>
              <textarea
                value={input}
                onChange={e => handleInput(e.target.value)}
                placeholder='Paste your JSON here... e.g. {"key": "value"}'
                spellCheck={false}
                className="flex-1 min-h-[500px] w-full bg-[var(--inv-bg)] text-[var(--inv-txt)] font-mono text-[13px] rounded-2xl p-4 border border-[var(--line-mid)] focus:outline-none focus:ring-2 focus:ring-accent resize-none leading-relaxed"
              />
            </div>

            {/* Output */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 bg-[var(--hover-soft)] rounded-lg p-0.5">
                  {(["formatted", "tree", "minified"] as ViewMode[]).map(m => (
                    <button key={m} onClick={() => setView(m)}
                      className={`px-3 py-1 rounded-md text-[12px] font-medium capitalize transition-all ${view === m ? "bg-[var(--surface)] shadow text-accent" : "text-[var(--txt-2)] hover:text-[var(--txt)]"}`}>
                      {m}
                    </button>
                  ))}
                </div>
                <button onClick={handleCopy} disabled={!output}
                  className="flex items-center gap-1.5 text-[12px] text-[var(--txt-2)] hover:text-accent transition-colors disabled:opacity-40">
                  {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className="flex-1 min-h-[500px] bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-auto">
                {!output && !error && (
                  <div className="flex items-center justify-center h-full text-[var(--txt-2)] text-[13px]">
                    Output will appear here
                  </div>
                )}

                {error && (
                  <div className="p-4">
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                      <p className="text-[13px] font-bold text-red-600 mb-1">JSON Error</p>
                      <p className="text-[12.5px] text-red-500 font-mono">{error}</p>
                    </div>
                  </div>
                )}

                {output && view === "tree" && parsed && (
                  <div className="p-4 font-mono overflow-auto">
                    <TreeNode data={parsed} defaultOpen={true} />
                  </div>
                )}

                {output && view !== "tree" && (
                  <pre
                    className="p-4 text-[13px] font-mono leading-relaxed overflow-auto h-full"
                    dangerouslySetInnerHTML={{
                      __html: syntaxHighlight(displayOutput || ""),
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Info section for SEO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { title: "What is JSON?", body: "JSON (JavaScript Object Notation) is a lightweight data format used for data interchange. It is human-readable and easy to parse for machines." },
              { title: "JSON Formatting", body: "Formatting or beautifying JSON adds proper indentation and line breaks to make it easy to read and debug. Our formatter supports 2 and 4 space indentation." },
              { title: "JSON Validation", body: "JSON validation checks if your JSON is syntactically correct. Our validator instantly detects errors and highlights exactly where the problem is." },
            ].map(card => (
              <div key={card.title} className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4">
                <h2 className="text-[13px] font-bold text-[var(--txt)] mb-2">{card.title}</h2>
                <p className="text-[12.5px] text-[var(--txt-2)] leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>

          {/* FAQ for SEO */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5">
            <h2 className="text-[14px] font-bold text-[var(--txt)] mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "How do I format JSON online?", a: "Paste your JSON into the input box and click 'Format / Beautify'. The tool will instantly format your JSON with proper indentation." },
                { q: "Is my JSON data safe?", a: "Yes — 100%. All processing happens entirely in your browser. Your JSON data is never sent to any server." },
                { q: "How do I validate JSON?", a: "Paste your JSON and the validator checks it in real-time. If there's an error, it shows the exact error message and location." },
                { q: "What is JSON minification?", a: "Minification removes all whitespace and line breaks from JSON to reduce file size. Click 'Minify' to compress your JSON." },
                { q: "Can I upload a JSON file?", a: "Yes — click 'Upload File' to load any .json file directly into the formatter." },
              ].map(faq => (
                <div key={faq.q} className="border-b border-[var(--line)] pb-4 last:border-0 last:pb-0">
                  <h3 className="text-[13px] font-semibold text-[var(--txt)] mb-1">{faq.q}</h3>
                  <p className="text-[12.5px] text-[var(--txt-2)]">{faq.a}</p>
                </div>
              ))}
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
