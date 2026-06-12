"use client";
import { useState, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Copy, CheckCircle, Trash2, Upload, Download, ArrowLeftRight } from "lucide-react";

type Mode = "encode" | "decode";
type InputType = "text" | "image";

export default function Base64Client() {
  const [mode, setMode] = useState<Mode>("encode");
  const [inputType, setInputType] = useState<InputType>("text");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const process = (raw: string, m: Mode) => {
    setError(null);
    if (!raw.trim()) { setOutput(""); return; }
    try {
      if (m === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(raw))));
      } else {
        setOutput(decodeURIComponent(escape(atob(raw.trim()))));
      }
    } catch {
      setError(m === "decode" ? "Invalid Base64 string. Please check your input." : "Encoding failed.");
      setOutput("");
    }
  };

  const handleInput = (val: string) => { setInput(val); process(val, mode); };
  const handleMode = (m: Mode) => { setMode(m); setInput(""); setOutput(""); setError(null); setImagePreview(null); };
  const handleSwap = () => { const newMode = mode === "encode" ? "decode" : "encode"; setInput(output); setOutput(""); handleMode(newMode); setTimeout(() => process(output, newMode), 10); };

  const handleFile = (file: File) => {
    if (inputType === "image") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        const base64 = result.split(",")[1];
        setInput(base64);
        setOutput(base64);
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => { const t = e.target?.result as string; setInput(t); process(t, mode); };
      reader.readAsText(file);
    }
  };

  const handleCopy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); showToast("Copied!"); };
  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "base64-output.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const SAMPLE_TEXT = "Hello, World! This is a Base64 encoding test. 🚀";
  const SAMPLE_B64 = "SGVsbG8sIFdvcmxkISBUaGlzIGlzIGEgQmFzZTY0IGVuY29kaW5nIHRlc3QuIPCfmoA=";

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-8">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1a1917] mb-1">Base64 Encoder / Decoder</h1>
            <p className="text-[13px] text-[#7a7875]">Encode text or images to Base64, or decode Base64 strings back to text. Instant, free, browser-based.</p>
          </div>

          {/* Mode toggle */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex bg-[#f4f3f0] rounded-full p-1">
              {(["encode","decode"] as Mode[]).map(m => (
                <button key={m} onClick={() => handleMode(m)}
                  className={`px-5 py-2 rounded-full text-[13px] font-semibold capitalize transition-all ${mode === m ? "bg-accent text-white shadow" : "text-[#7a7875] hover:text-[#1a1917]"}`}>
                  {m}
                </button>
              ))}
            </div>
            <div className="flex bg-[#f4f3f0] rounded-full p-1">
              {(["text","image"] as InputType[]).map(t => (
                <button key={t} onClick={() => setInputType(t)}
                  className={`px-4 py-2 rounded-full text-[13px] font-medium capitalize transition-all ${inputType === t ? "bg-white shadow text-accent" : "text-[#7a7875] hover:text-[#1a1917]"}`}>
                  {t}
                </button>
              ))}
            </div>
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 bg-[#f4f3f0] hover:bg-[#e5e3de] text-[#4a4845] font-medium text-[13px] px-4 py-2 rounded-full transition-all">
              <Upload size={14} /> Upload
            </button>
            <input ref={fileRef} type="file" accept={inputType === "image" ? "image/*" : "*"} className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <button onClick={() => { const s = mode === "encode" ? SAMPLE_TEXT : SAMPLE_B64; setInput(s); process(s, mode); }} className="flex items-center gap-1.5 bg-[#f4f3f0] hover:bg-[#e5e3de] text-[#4a4845] font-medium text-[13px] px-4 py-2 rounded-full transition-all">
              Sample
            </button>
            <button onClick={() => { setInput(""); setOutput(""); setError(null); setImagePreview(null); }} className="flex items-center gap-1.5 text-red-500 hover:text-red-600 font-medium text-[13px] px-3 py-2 rounded-full transition-all hover:bg-red-50">
              <Trash2 size={14} /> Clear
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-start">
            {/* Input */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[12px] font-bold text-[#1a1917] uppercase tracking-widest">{mode === "encode" ? "Plain Text / Image" : "Base64 String"}</span>
                <span className="text-[11px] text-[#7a7875]">{input.length} chars</span>
              </div>
              {imagePreview && inputType === "image" ? (
                <div className="bg-[#f4f3f0] rounded-2xl p-4 min-h-[300px] flex items-center justify-center">
                  <img src={imagePreview} alt="preview" className="max-w-full max-h-[280px] object-contain rounded-xl" />
                </div>
              ) : (
                <textarea value={input} onChange={e => handleInput(e.target.value)} placeholder={mode === "encode" ? "Enter text to encode..." : "Enter Base64 string to decode..."}
                  spellCheck={false} className="w-full min-h-[300px] bg-[#1a1917] text-[#f4f3f0] font-mono text-[13px] rounded-2xl p-4 border border-[#1a1917]/20 focus:outline-none focus:ring-2 focus:ring-accent resize-none leading-relaxed" />
              )}
            </div>

            {/* Swap button */}
            <div className="flex items-center justify-center pt-8">
              <button onClick={handleSwap} className="p-3 rounded-full bg-accent hover:bg-accent-dark text-white shadow-md transition-all hover:scale-110">
                <ArrowLeftRight size={18} />
              </button>
            </div>

            {/* Output */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[12px] font-bold text-[#1a1917] uppercase tracking-widest">{mode === "encode" ? "Base64 Output" : "Decoded Text"}</span>
                <div className="flex gap-2">
                  {output && <button onClick={handleDownload} className="text-[11px] text-[#7a7875] hover:text-accent flex items-center gap-1"><Download size={12} />Save</button>}
                  <button onClick={handleCopy} disabled={!output} className="text-[11px] text-[#7a7875] hover:text-accent flex items-center gap-1 disabled:opacity-40">
                    {copied ? <CheckCircle size={12} className="text-green-500" /> : <Copy size={12} />}{copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              {error ? (
                <div className="min-h-[300px] bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start">
                  <p className="text-[13px] text-red-500 font-mono">{error}</p>
                </div>
              ) : (
                <textarea readOnly value={output} placeholder="Output appears here..."
                  className="w-full min-h-[300px] bg-white border border-[#1a1917]/10 text-[#1a1917] font-mono text-[13px] rounded-2xl p-4 focus:outline-none resize-none leading-relaxed" />
              )}
            </div>
          </div>

          {/* Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="bg-white border border-[#1a1917]/10 rounded-2xl p-4">
              <h2 className="text-[13px] font-bold text-[#1a1917] mb-2">What is Base64?</h2>
              <p className="text-[12.5px] text-[#7a7875] leading-relaxed">Base64 is a binary-to-text encoding scheme that converts binary data into ASCII characters. Commonly used in email, data URLs, and API authentication.</p>
            </div>
            <div className="bg-white border border-[#1a1917]/10 rounded-2xl p-4">
              <h2 className="text-[13px] font-bold text-[#1a1917] mb-2">Common Use Cases</h2>
              <ul className="text-[12.5px] text-[#7a7875] space-y-1">
                {["Embed images in HTML/CSS as data URLs","Basic HTTP authentication headers","Encode binary data for JSON APIs","Email attachments (MIME)"].map(u => <li key={u} className="flex items-start gap-1.5">→ {u}</li>)}
              </ul>
            </div>
          </div>
        </main>
      </div>
      {toast && <div className={`fixed bottom-20 lg:bottom-5 right-4 px-4 py-3 rounded-xl shadow-lg text-[13.5px] font-medium z-[200] ${toast.type === "success" ? "bg-green-700 text-white" : "bg-red-600 text-white"}`}>{toast.msg}</div>}
    </>
  );
}
