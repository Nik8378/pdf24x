"use client";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Copy, CheckCircle, Trash2, Download, Minimize2, Maximize2 } from "lucide-react";

function formatHTML(html: string, indentSize: number): string {
  const VOID_TAGS = new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);
  const INLINE_TAGS = new Set(["a","abbr","acronym","b","bdo","big","br","cite","code","dfn","em","i","img","input","kbd","label","map","object","output","q","samp","select","small","span","strong","sub","sup","textarea","time","tt","var"]);
  let result = "";
  let depth = 0;
  const indent = " ".repeat(indentSize);
  const tokens = html.match(/<[^>]+>|[^<]+/g) || [];
  for (let token of tokens) {
    token = token.trim();
    if (!token) continue;
    if (token.startsWith("</")) {
      depth = Math.max(0, depth - 1);
      result += indent.repeat(depth) + token + "\n";
    } else if (token.startsWith("<") && !token.startsWith("<!--")) {
      const tagName = (token.match(/<([a-zA-Z][a-zA-Z0-9-]*)/) || [])[1]?.toLowerCase() || "";
      result += indent.repeat(depth) + token + "\n";
      if (!VOID_TAGS.has(tagName) && !token.endsWith("/>")) depth++;
    } else if (token.startsWith("<!--")) {
      result += indent.repeat(depth) + token + "\n";
    } else {
      if (token.trim()) result += indent.repeat(depth) + token.trim() + "\n";
    }
  }
  return result.trim();
}

function minifyHTML(html: string): string {
  return html.replace(/\s+/g, " ").replace(/>\s+</g, "><").replace(/<!--[\s\S]*?-->/g, "").trim();
}

const SAMPLE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>My Page</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
<header>
<nav>
<ul>
<li><a href="/">Home</a></li>
<li><a href="/about">About</a></li>
</ul>
</nav>
</header>
<main>
<h1>Hello World</h1>
<p>This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
<img src="image.png" alt="example">
</main>
<footer><p>&copy; 2025</p></footer>
</body>
</html>`;

export default function HTMLFormatterClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"format" | "minify">("format");
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [stats, setStats] = useState<{ size: string; lines: number } | null>(null);

  const showToast = (msg: string, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const process = (val: string, m: typeof mode, ind: number) => {
    if (!val.trim()) { setOutput(""); setStats(null); return; }
    const result = m === "format" ? formatHTML(val, ind) : minifyHTML(val);
    setOutput(result);
    setStats({ size: (new Blob([result]).size / 1024).toFixed(1) + " KB", lines: result.split("\n").length });
  };

  const handleInput = (val: string) => { setInput(val); process(val, mode, indent); };
  const handleMode = (m: typeof mode) => { setMode(m); process(input, m, indent); };
  const handleIndent = (n: number) => { setIndent(n); process(input, mode, n); };
  const handleCopy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); showToast("Copied!"); };
  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "formatted.html"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-8">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1a1917] mb-1">HTML Formatter & Minifier</h1>
            <p className="text-[13px] text-[#7a7875]">Beautify or minify HTML code instantly. Clean indentation, remove whitespace, format tags properly.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex bg-[#f4f3f0] rounded-full p-1">
              <button onClick={() => handleMode("format")} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${mode === "format" ? "bg-accent text-white shadow" : "text-[#7a7875] hover:text-[#1a1917]"}`}><Maximize2 size={13} /> Format</button>
              <button onClick={() => handleMode("minify")} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${mode === "minify" ? "bg-accent text-white shadow" : "text-[#7a7875] hover:text-[#1a1917]"}`}><Minimize2 size={13} /> Minify</button>
            </div>
            {mode === "format" && (
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#7a7875]">Indent:</span>
                {[2, 4].map(n => <button key={n} onClick={() => handleIndent(n)} className={`w-8 h-8 rounded-lg text-[12px] font-bold transition-all ${indent === n ? "bg-accent text-white" : "bg-[#f4f3f0] text-[#4a4845] hover:bg-[#e5e3de]"}`}>{n}</button>)}
              </div>
            )}
            <button onClick={() => { setInput(SAMPLE); process(SAMPLE, mode, indent); }} className="bg-[#f4f3f0] hover:bg-[#e5e3de] text-[#4a4845] font-medium text-[13px] px-4 py-2 rounded-full transition-all">Sample HTML</button>
            <button onClick={() => { setInput(""); setOutput(""); setStats(null); }} className="flex items-center gap-1.5 text-red-500 hover:bg-red-50 font-medium text-[13px] px-3 py-2 rounded-full transition-all"><Trash2 size={14} /> Clear</button>
          </div>

          {stats && (
            <div className="flex items-center gap-4 px-4 py-2.5 bg-green-50 border border-green-100 rounded-xl mb-4">
              <CheckCircle size={15} className="text-green-600" />
              <span className="text-[12.5px] text-green-700 font-medium">Processed successfully</span>
              <span className="text-[11.5px] text-[#7a7875] ml-auto">Size: <strong className="text-[#1a1917]">{stats.size}</strong></span>
              <span className="text-[11.5px] text-[#7a7875]">Lines: <strong className="text-[#1a1917]">{stats.lines}</strong></span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[12px] font-bold text-[#1a1917] uppercase tracking-widest">Input HTML</span>
                <span className="text-[11px] text-[#7a7875]">{input.length} chars</span>
              </div>
              <textarea value={input} onChange={e => handleInput(e.target.value)} placeholder="Paste your HTML code here..." spellCheck={false}
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
              <textarea readOnly value={output} placeholder="Formatted HTML appears here..." className="w-full min-h-[500px] bg-white border border-[#1a1917]/10 text-[#1a1917] font-mono text-[13px] rounded-2xl p-4 focus:outline-none resize-none leading-relaxed" />
            </div>
          </div>
        </main>
      </div>
      {toast && <div className={`fixed bottom-20 lg:bottom-5 right-4 px-4 py-3 rounded-xl shadow-lg text-[13.5px] font-medium z-[200] ${toast.type === "success" ? "bg-green-700 text-white" : "bg-red-600 text-white"}`}>{toast.msg}</div>}
    </>
  );
}
