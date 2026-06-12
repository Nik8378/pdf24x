"use client";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Copy, CheckCircle, Trash2, ArrowLeftRight } from "lucide-react";

type Mode = "encode" | "decode";

export default function URLEncoderClient() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const showToast = (msg: string, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const process = (val: string, m: Mode) => {
    setError(null);
    if (!val.trim()) { setOutput(""); return; }
    try {
      setOutput(m === "encode" ? encodeURIComponent(val) : decodeURIComponent(val));
    } catch {
      setError("Invalid URL encoded string.");
      setOutput("");
    }
  };

  const handleInput = (val: string) => { setInput(val); process(val, mode); };
  const handleMode = (m: Mode) => { setMode(m); setInput(""); setOutput(""); setError(null); };
  const handleSwap = () => { const nm = mode === "encode" ? "decode" : "encode"; setInput(output); process(output, nm); setMode(nm); };
  const handleCopy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); showToast("Copied!"); };

  const SAMPLES = {
    encode: "https://pdf24x.com/search?q=hello world&lang=en&page=1",
    decode: "https%3A%2F%2Fpdf24x.com%2Fsearch%3Fq%3Dhello%20world%26lang%3Den%26page%3D1",
  };

  const SPECIAL_CHARS = [
    { char: " ", encoded: "%20" }, { char: "!", encoded: "%21" }, { char: "#", encoded: "%23" },
    { char: "$", encoded: "%24" }, { char: "&", encoded: "%26" }, { char: "=", encoded: "%3D" },
    { char: "?", encoded: "%3F" }, { char: "@", encoded: "%40" }, { char: "/", encoded: "%2F" },
  ];

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-8">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1a1917] mb-1">URL Encoder / Decoder</h1>
            <p className="text-[13px] text-[#7a7875]">Encode or decode URLs and query strings instantly. Handles all special characters per RFC 3986.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex bg-[#f4f3f0] rounded-full p-1">
              {(["encode","decode"] as Mode[]).map(m => (
                <button key={m} onClick={() => handleMode(m)} className={`px-5 py-2 rounded-full text-[13px] font-semibold capitalize transition-all ${mode === m ? "bg-accent text-white shadow" : "text-[#7a7875] hover:text-[#1a1917]"}`}>{m}</button>
              ))}
            </div>
            <button onClick={() => { const s = SAMPLES[mode]; setInput(s); process(s, mode); }} className="flex items-center gap-1.5 bg-[#f4f3f0] hover:bg-[#e5e3de] text-[#4a4845] font-medium text-[13px] px-4 py-2 rounded-full transition-all">Sample URL</button>
            <button onClick={() => { setInput(""); setOutput(""); setError(null); }} className="flex items-center gap-1.5 text-red-500 hover:bg-red-50 font-medium text-[13px] px-3 py-2 rounded-full transition-all"><Trash2 size={14} /> Clear</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-start mb-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[12px] font-bold text-[#1a1917] uppercase tracking-widest">{mode === "encode" ? "Plain URL / Text" : "Encoded URL"}</span>
                <span className="text-[11px] text-[#7a7875]">{input.length} chars</span>
              </div>
              <textarea value={input} onChange={e => handleInput(e.target.value)} placeholder={mode === "encode" ? "https://example.com/search?q=hello world" : "https%3A%2F%2Fexample.com%2F..."}
                spellCheck={false} className="w-full min-h-[220px] bg-[#1a1917] text-[#f4f3f0] font-mono text-[13px] rounded-2xl p-4 border border-[#1a1917]/20 focus:outline-none focus:ring-2 focus:ring-accent resize-none" />
            </div>
            <div className="flex items-center justify-center pt-8">
              <button onClick={handleSwap} className="p-3 rounded-full bg-accent hover:bg-accent-dark text-white shadow-md transition-all hover:scale-110"><ArrowLeftRight size={18} /></button>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[12px] font-bold text-[#1a1917] uppercase tracking-widest">{mode === "encode" ? "Encoded Output" : "Decoded URL"}</span>
                <button onClick={handleCopy} disabled={!output} className="text-[11px] text-[#7a7875] hover:text-accent flex items-center gap-1 disabled:opacity-40">
                  {copied ? <CheckCircle size={12} className="text-green-500" /> : <Copy size={12} />}{copied ? "Copied!" : "Copy"}
                </button>
              </div>
              {error ? (
                <div className="min-h-[220px] bg-red-50 border border-red-100 rounded-2xl p-4"><p className="text-[13px] text-red-500 font-mono">{error}</p></div>
              ) : (
                <textarea readOnly value={output} placeholder="Output appears here..." className="w-full min-h-[220px] bg-white border border-[#1a1917]/10 text-[#1a1917] font-mono text-[13px] rounded-2xl p-4 focus:outline-none resize-none" />
              )}
            </div>
          </div>

          {/* Special chars reference */}
          <div className="bg-white border border-[#1a1917]/10 rounded-2xl p-5">
            <h2 className="text-[13px] font-bold text-[#1a1917] mb-3">Common URL Encodings</h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
              {SPECIAL_CHARS.map(({ char, encoded }) => (
                <button key={char} onClick={() => { const v = input + char; setInput(v); process(v, mode); }}
                  className="flex flex-col items-center bg-[#f4f3f0] hover:bg-accent-bg hover:border-accent border border-[#e5e3de] rounded-xl p-2 transition-all group">
                  <span className="text-[14px] font-bold text-[#1a1917] group-hover:text-accent">{char === " " ? "space" : char}</span>
                  <span className="text-[10px] font-mono text-[#7a7875] mt-0.5">{encoded}</span>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
      {toast && <div className={`fixed bottom-20 lg:bottom-5 right-4 px-4 py-3 rounded-xl shadow-lg text-[13.5px] font-medium z-[200] ${toast.type === "success" ? "bg-green-700 text-white" : "bg-red-600 text-white"}`}>{toast.msg}</div>}
    </>
  );
}
