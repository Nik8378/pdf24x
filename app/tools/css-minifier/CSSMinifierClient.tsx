"use client";
import { useState, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Copy, CheckCircle, Trash2, Upload, Download, Minimize2, Maximize2 } from "lucide-react";

function minifyCSS(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*{\s*/g, "{")
    .replace(/\s*}\s*/g, "}")
    .replace(/\s*:\s*/g, ":")
    .replace(/\s*;\s*/g, ";")
    .replace(/\s*,\s*/g, ",")
    .replace(/;}/g, "}")
    .trim();
}

function formatCSS(css: string): string {
  let result = "";
  let depth = 0;
  const tokens = css.match(/[^{};]+[{};]?/g) || [];
  for (let token of tokens) {
    token = token.trim();
    if (!token) continue;
    if (token.endsWith("{")) {
      result += "  ".repeat(depth) + token.slice(0, -1).trim() + " {\n";
      depth++;
    } else if (token === "}") {
      depth = Math.max(0, depth - 1);
      result += "  ".repeat(depth) + "}\n\n";
    } else if (token.endsWith(";")) {
      result += "  ".repeat(depth) + token.trim() + "\n";
    } else {
      result += token.trim() + "\n";
    }
  }
  return result.trim();
}

const SAMPLE = `/* Navigation */
.navbar{display:flex;align-items:center;justify-content:space-between;padding:16px 24px;background-color:#1a1917;color:#ffffff;position:sticky;top:0;z-index:50;}
.navbar-brand{font-size:18px;font-weight:700;color:#ffffff;text-decoration:none;}
.navbar-links{display:flex;gap:24px;list-style:none;margin:0;padding:0;}
.navbar-links a{color:rgba(255,255,255,0.8);text-decoration:none;font-size:14px;transition:color 0.2s;}
.navbar-links a:hover{color:#ffffff;}
/* Button */
.btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:999px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;}
.btn-primary{background-color:#e85d04;color:#ffffff;border:none;}
.btn-primary:hover{background-color:#c44d03;transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,0.15);}`;

export default function CSSMinifierClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"minify" | "format">("minify");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [savings, setSavings] = useState<{ original: number; minified: number; pct: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const process = (val: string, m: typeof mode) => {
    if (!val.trim()) { setOutput(""); setSavings(null); return; }
    const result = m === "minify" ? minifyCSS(val) : formatCSS(val);
    setOutput(result);
    if (m === "minify") {
      const orig = new Blob([val]).size;
      const min = new Blob([result]).size;
      setSavings({ original: orig, minified: min, pct: Math.round((1 - min / orig) * 100) });
    } else setSavings(null);
  };

  const handleInput = (val: string) => { setInput(val); process(val, mode); };
  const handleMode = (m: typeof mode) => { setMode(m); process(input, m); };
  const handleFile = (file: File) => { const r = new FileReader(); r.onload = e => { const t = e.target?.result as string; setInput(t); process(t, mode); }; r.readAsText(file); };
  const handleCopy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); showToast("Copied!"); };
  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = mode === "minify" ? "styles.min.css" : "styles.css"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-8">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1a1917] mb-1">CSS Minifier & Formatter</h1>
            <p className="text-[13px] text-[#7a7875]">Minify CSS to reduce file size or format/beautify CSS for readability. Removes comments, whitespace, and redundant characters.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex bg-[#f4f3f0] rounded-full p-1">
              <button onClick={() => handleMode("minify")} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${mode === "minify" ? "bg-accent text-white shadow" : "text-[#7a7875] hover:text-[#1a1917]"}`}><Minimize2 size={13} /> Minify</button>
              <button onClick={() => handleMode("format")} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${mode === "format" ? "bg-accent text-white shadow" : "text-[#7a7875] hover:text-[#1a1917]"}`}><Maximize2 size={13} /> Format</button>
            </div>
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 bg-[#f4f3f0] hover:bg-[#e5e3de] text-[#4a4845] font-medium text-[13px] px-4 py-2 rounded-full transition-all"><Upload size={14} /> Upload .css</button>
            <input ref={fileRef} type="file" accept=".css,text/css" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <button onClick={() => { setInput(SAMPLE); process(SAMPLE, mode); }} className="bg-[#f4f3f0] hover:bg-[#e5e3de] text-[#4a4845] font-medium text-[13px] px-4 py-2 rounded-full transition-all">Sample CSS</button>
            <button onClick={() => { setInput(""); setOutput(""); setSavings(null); }} className="flex items-center gap-1.5 text-red-500 hover:bg-red-50 font-medium text-[13px] px-3 py-2 rounded-full transition-all"><Trash2 size={14} /> Clear</button>
          </div>

          {savings && (
            <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-green-50 border border-green-100 rounded-xl mb-4">
              <CheckCircle size={15} className="text-green-600 shrink-0" />
              <span className="text-[12.5px] text-green-700 font-bold">Saved {savings.pct}%</span>
              <span className="text-[11.5px] text-[#7a7875]">Original: <strong className="text-[#1a1917]">{savings.original} B</strong></span>
              <span className="text-[11.5px] text-[#7a7875]">Minified: <strong className="text-[#1a1917]">{savings.minified} B</strong></span>
              <span className="text-[11.5px] text-[#7a7875]">Saved: <strong className="text-green-600">{savings.original - savings.minified} B</strong></span>
              <div className="ml-auto w-32 h-2 bg-[#e5e3de] rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${savings.pct}%` }} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[12px] font-bold text-[#1a1917] uppercase tracking-widest">Input CSS</span>
                <span className="text-[11px] text-[#7a7875]">{input.length} chars</span>
              </div>
              <textarea value={input} onChange={e => handleInput(e.target.value)} placeholder="Paste your CSS here..." spellCheck={false}
                className="w-full min-h-[500px] bg-[#1a1917] text-[#f4f3f0] font-mono text-[13px] rounded-2xl p-4 border border-[#1a1917]/20 focus:outline-none focus:ring-2 focus:ring-accent resize-none leading-relaxed" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[12px] font-bold text-[#1a1917] uppercase tracking-widest">Output</span>
                <div className="flex gap-2">
                  {output && <button onClick={handleDownload} className="text-[11px] text-[#7a7875] hover:text-accent flex items-center gap-1"><Download size={12} />Save</button>}
                  <button onClick={handleCopy} disabled={!output} className="text-[11px] text-[#7a7875] hover:text-accent flex items-center gap-1 disabled:opacity-40">
                    {copied ? <CheckCircle size={12} className="text-green-500" /> : <Copy size={12} />}{copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <textarea readOnly value={output} placeholder="Output appears here..." className="w-full min-h-[500px] bg-white border border-[#1a1917]/10 text-[#1a1917] font-mono text-[13px] rounded-2xl p-4 focus:outline-none resize-none leading-relaxed" />
            </div>
          </div>
        </main>
      </div>
      {toast && <div className={`fixed bottom-20 lg:bottom-5 right-4 px-4 py-3 rounded-xl shadow-lg text-[13.5px] font-medium z-[200] ${toast.type === "success" ? "bg-green-700 text-white" : "bg-red-600 text-white"}`}>{toast.msg}</div>}
    </>
  );
}
