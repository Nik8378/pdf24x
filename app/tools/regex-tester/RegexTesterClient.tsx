"use client";
import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Copy, CheckCircle, Trash2, AlertCircle } from "lucide-react";

const COMMON_PATTERNS = [
  { name: "Email", pattern: "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}", flags: "gi" },
  { name: "URL", pattern: "https?:\\/\\/[^\\s]+", flags: "gi" },
  { name: "Phone (US)", pattern: "\\+?1?[\\s\\-.]?\\(?\\d{3}\\)?[\\s\\-.]?\\d{3}[\\s\\-.]?\\d{4}", flags: "g" },
  { name: "IPv4", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b", flags: "g" },
  { name: "Date (YYYY-MM-DD)", pattern: "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])", flags: "g" },
  { name: "HTML Tag", pattern: "<[^>]+>", flags: "g" },
  { name: "Hex Color", pattern: "#[0-9a-fA-F]{3,6}\\b", flags: "g" },
  { name: "Credit Card", pattern: "\\b\\d{4}[\\s\\-]?\\d{4}[\\s\\-]?\\d{4}[\\s\\-]?\\d{4}\\b", flags: "g" },
];

const SAMPLE_TEXT = `Contact us at support@pdf24x.com or visit https://pdf24x.com
Call us at +1 (555) 123-4567 or +44 20 7946 0958
Server IP: 192.168.1.1 or 10.0.0.254
Date range: 2024-01-15 to 2025-12-31
Colors used: #FF5733, #3498DB, #2ECC71, #fff
Card ending: 4532 1234 5678 9012
<div class="container"><p>Hello World</p></div>`;

export default function RegexTesterClient() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testStr, setTestStr] = useState(SAMPLE_TEXT);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const showToast = (msg: string, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const result = useMemo(() => {
    if (!pattern || !testStr) return { matches: [], highlighted: testStr, error: null, count: 0 };
    try {
      const regex = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      const matches: { match: string; index: number; groups: string[] }[] = [];
      let m;
      const gRegex = new RegExp(pattern, "g" + flags.replace("g", ""));
      while ((m = gRegex.exec(testStr)) !== null) {
        matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
        if (m[0].length === 0) gRegex.lastIndex++;
      }
      // Highlight
      let highlighted = "";
      let last = 0;
      for (const match of matches) {
        highlighted += escHtml(testStr.slice(last, match.index));
        highlighted += `<mark class="bg-yellow-200 text-yellow-900 rounded px-0.5">${escHtml(match.match)}</mark>`;
        last = match.index + match.match.length;
      }
      highlighted += escHtml(testStr.slice(last));
      return { matches, highlighted, error: null, count: matches.length };
    } catch (e: unknown) {
      return { matches: [], highlighted: escHtml(testStr), error: e instanceof Error ? e.message : "Invalid regex", count: 0 };
    }
  }, [pattern, flags, testStr]);

  function escHtml(s: string) { return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  const FLAG_OPTIONS = [
    { f: "g", label: "g", title: "Global — find all matches" },
    { f: "i", label: "i", title: "Case insensitive" },
    { f: "m", label: "m", title: "Multiline" },
    { f: "s", label: "s", title: "Dot matches newline" },
  ];

  const toggleFlag = (f: string) => {
    setFlags(prev => prev.includes(f) ? prev.replace(f, "") : prev + f);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`/${pattern}/${flags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast("Regex copied!");
  };

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-8">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1a1917] mb-1">Regex Tester</h1>
            <p className="text-[13px] text-[#7a7875]">Test regular expressions with live match highlighting. See all matches, groups, and indexes instantly.</p>
          </div>

          {/* Regex input */}
          <div className="bg-white border border-[#1a1917]/10 rounded-2xl p-4 mb-4">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="flex-1 min-w-0 flex items-center gap-2 bg-[#f4f3f0] rounded-xl px-4 py-2.5 border border-[#e5e3de] focus-within:border-accent transition-colors">
                <span className="text-[18px] text-[#7a7875] font-mono shrink-0">/</span>
                <input value={pattern} onChange={e => setPattern(e.target.value)} placeholder="Enter your regex pattern..."
                  className="flex-1 bg-transparent font-mono text-[14px] text-[#1a1917] focus:outline-none" />
                <span className="text-[18px] text-[#7a7875] font-mono shrink-0">/{flags}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {FLAG_OPTIONS.map(({ f, label, title }) => (
                  <button key={f} onClick={() => toggleFlag(f)} title={title}
                    className={`w-8 h-8 rounded-lg text-[13px] font-mono font-bold transition-all border ${flags.includes(f) ? "bg-accent text-white border-accent" : "bg-[#f4f3f0] text-[#7a7875] border-[#e5e3de] hover:border-accent"}`}>
                    {label}
                  </button>
                ))}
              </div>
              <button onClick={handleCopy} disabled={!pattern} className="flex items-center gap-1.5 text-[12px] text-[#7a7875] hover:text-accent disabled:opacity-40 transition-colors">
                {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}{copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Status */}
            {pattern && (
              result.error
                ? <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg"><AlertCircle size={14} className="text-red-500 shrink-0" /><span className="text-[12px] text-red-500 font-mono">{result.error}</span></div>
                : <div className="flex items-center gap-3 px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
                  <CheckCircle size={14} className="text-green-600 shrink-0" />
                  <span className="text-[12.5px] text-green-700 font-medium">{result.count} match{result.count !== 1 ? "es" : ""} found</span>
                  {result.count > 0 && <span className="text-[11.5px] text-[#7a7875] ml-auto font-mono">/{pattern}/{flags}</span>}
                </div>
            )}
          </div>

          {/* Common patterns */}
          <div className="bg-white border border-[#1a1917]/10 rounded-2xl p-4 mb-4">
            <p className="text-[11px] font-bold text-[#7a7875] uppercase tracking-widest mb-3">Common Patterns</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_PATTERNS.map(p => (
                <button key={p.name} onClick={() => { setPattern(p.pattern); setFlags(p.flags); }}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all ${pattern === p.pattern ? "bg-accent text-white border-accent" : "bg-[#f4f3f0] text-[#4a4845] border-[#e5e3de] hover:border-accent hover:text-accent"}`}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Test string */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[12px] font-bold text-[#1a1917] uppercase tracking-widest">Test String</span>
                <button onClick={() => setTestStr("")} className="text-[11px] text-red-500 flex items-center gap-1"><Trash2 size={11} />Clear</button>
              </div>
              <textarea value={testStr} onChange={e => setTestStr(e.target.value)} spellCheck={false}
                className="w-full min-h-[400px] bg-[#1a1917] text-[#f4f3f0] font-mono text-[13px] rounded-2xl p-4 border border-[#1a1917]/20 focus:outline-none focus:ring-2 focus:ring-accent resize-none leading-relaxed" />
            </div>

            {/* Results */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[12px] font-bold text-[#1a1917] uppercase tracking-widest">Highlighted Matches</span>
                <span className="text-[11px] text-accent font-bold">{result.count} matches</span>
              </div>
              <div className="min-h-[200px] bg-white border border-[#1a1917]/10 rounded-2xl p-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{ __html: result.highlighted || '<span class="text-[#7a7875]">Enter a pattern above to see matches highlighted here...</span>' }} />

              {result.matches.length > 0 && (
                <div className="mt-4 bg-white border border-[#1a1917]/10 rounded-2xl overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-[#e5e3de] bg-[#f4f3f0]">
                    <span className="text-[11px] font-bold text-[#7a7875] uppercase tracking-widest">Match Details</span>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto divide-y divide-[#f4f3f0]">
                    {result.matches.slice(0, 50).map((m, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-2 hover:bg-[#f4f3f0] transition-colors">
                        <span className="text-[10.5px] font-bold text-[#7a7875] w-6 shrink-0">#{i + 1}</span>
                        <span className="flex-1 font-mono text-[12.5px] text-[#1a1917] truncate">{m.match}</span>
                        <span className="text-[11px] text-[#7a7875] shrink-0">idx: {m.index}</span>
                        <span className="text-[11px] text-[#7a7875] shrink-0">len: {m.match.length}</span>
                      </div>
                    ))}
                    {result.matches.length > 50 && <div className="px-4 py-2 text-[11px] text-[#7a7875]">...and {result.matches.length - 50} more</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      {toast && <div className={`fixed bottom-20 lg:bottom-5 right-4 px-4 py-3 rounded-xl shadow-lg text-[13.5px] font-medium z-[200] ${toast.type === "success" ? "bg-green-700 text-white" : "bg-red-600 text-white"}`}>{toast.msg}</div>}
    </>
  );
}
