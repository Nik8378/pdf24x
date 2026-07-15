"use client";
import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Copy, CheckCircle, AlertCircle, Trash2 } from "lucide-react";

const SAMPLE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3NTAwMDAwMDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function b64Decode(str: string): string {
  try {
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - base64.length % 4) % 4);
    return decodeURIComponent(escape(atob(padded)));
  } catch { return ""; }
}

export default function JWTDecoderClient() {
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const showToast = (msg: string, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const decoded = useMemo(() => {
    const t = token.trim();
    if (!t) return null;
    const parts = t.split(".");
    if (parts.length !== 3) return { error: "Invalid JWT — must have 3 parts separated by dots (header.payload.signature)" };
    try {
      const header = JSON.parse(b64Decode(parts[0]));
      const payload = JSON.parse(b64Decode(parts[1]));
      const sig = parts[2];
      const now = Math.floor(Date.now() / 1000);
      const expired = payload.exp ? payload.exp < now : null;
      const issuedAt = payload.iat ? new Date(payload.iat * 1000).toLocaleString() : null;
      const expiresAt = payload.exp ? new Date(payload.exp * 1000).toLocaleString() : null;
      return { header, payload, sig, expired, issuedAt, expiresAt, error: null };
    } catch { return { error: "Failed to decode JWT. Please check your token." }; }
  }, [token]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
    showToast("Copied!");
  };

  const parts = token.trim().split(".");
  const COLORS = ["text-red-500", "text-purple-600", "text-blue-500"];

  const JsonDisplay = ({ data }: { data: Record<string, unknown> }) => (
    <div className="space-y-1">
      {Object.entries(data).map(([k, v]) => (
        <div key={k} className="flex items-start gap-2 py-1 border-b border-[#f4f3f0] last:border-0">
          <span className="text-[12px] font-bold text-[#C0392B] shrink-0 min-w-[120px]">{k}</span>
          <span className="text-[12.5px] text-[#1a1917] font-mono break-all">
            {v === null ? <span className="text-gray-400 italic">null</span>
              : typeof v === "boolean" ? <span className="text-purple-600 font-bold">{String(v)}</span>
              : typeof v === "number" ? <span className="text-blue-600">{String(v)}</span>
              : <span className="text-green-700">&quot;{String(v)}&quot;</span>}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-8">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1a1917] mb-1">JWT Decoder</h1>
            <p className="text-[13px] text-[#7a7875]">Decode and inspect JSON Web Tokens. View header, payload, expiry status and all claims instantly. 100% client-side — your token never leaves your browser.</p>
          </div>

          {/* Token input */}
          <div className="bg-white border border-[#1a1917]/10 rounded-2xl p-4 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-[12px] font-bold text-[#1a1917] uppercase tracking-widest">JWT Token</span>
              <div className="flex gap-2">
                <button onClick={() => setToken(SAMPLE_JWT)} className="text-[11.5px] text-accent hover:underline font-medium">Load Sample</button>
                <button onClick={() => setToken("")} className="text-[11.5px] text-red-500 flex items-center gap-1"><Trash2 size={11} />Clear</button>
              </div>
            </div>
            <textarea value={token} onChange={e => setToken(e.target.value)}
              placeholder="Paste your JWT token here... eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."
              spellCheck={false} rows={4}
              className="w-full bg-[#1a1917] text-[#f4f3f0] font-mono text-[12.5px] rounded-xl p-4 border border-[#1a1917]/20 focus:outline-none focus:ring-2 focus:ring-accent resize-none leading-relaxed break-all" />

            {/* Colorized token */}
            {token.trim() && parts.length === 3 && (
              <div className="mt-3 p-3 bg-[#f4f3f0] rounded-xl font-mono text-[12px] break-all leading-relaxed">
                {parts.map((part, i) => (
                  <span key={i}>
                    <span className={`${COLORS[i]} font-semibold`}>{part}</span>
                    {i < 2 && <span className="text-[#7a7875] font-bold">.</span>}
                  </span>
                ))}
              </div>
            )}
          </div>

          {decoded?.error && (
            <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl mb-4">
              <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
              <span className="text-[12.5px] text-red-500">{decoded.error}</span>
            </div>
          )}

          {decoded && !decoded.error && (
            <div className="space-y-4">
              {/* Expiry status */}
              {decoded.expired !== null && (
                <div className={`flex flex-wrap items-center gap-4 px-4 py-3 rounded-xl border ${decoded.expired ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"}`}>
                  {decoded.expired ? <AlertCircle size={15} className="text-red-500" /> : <CheckCircle size={15} className="text-green-600" />}
                  <span className={`text-[12.5px] font-bold ${decoded.expired ? "text-red-600" : "text-green-700"}`}>{decoded.expired ? "Token Expired" : "Token Valid"}</span>
                  {decoded.issuedAt && <span className="text-[11.5px] text-[#7a7875]">Issued: <strong className="text-[#1a1917]">{decoded.issuedAt}</strong></span>}
                  {decoded.expiresAt && <span className="text-[11.5px] text-[#7a7875]">Expires: <strong className={decoded.expired ? "text-red-500" : "text-[#1a1917]"}>{decoded.expiresAt}</strong></span>}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Header */}
                <div className="bg-white border border-[#1a1917]/10 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e3de] bg-red-50">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="text-[12px] font-bold text-red-700 uppercase tracking-widest">Header</span>
                    </div>
                    <button onClick={() => handleCopy(JSON.stringify(decoded.header, null, 2), "header")} className="text-[11px] text-[#7a7875] hover:text-accent flex items-center gap-1">
                      {copied === "header" ? <CheckCircle size={12} className="text-green-500" /> : <Copy size={12} />}{copied === "header" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="p-4"><JsonDisplay data={decoded.header as Record<string, unknown>} /></div>
                </div>

                {/* Payload */}
                <div className="bg-white border border-[#1a1917]/10 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e3de] bg-purple-50">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-400" />
                      <span className="text-[12px] font-bold text-purple-700 uppercase tracking-widest">Payload</span>
                    </div>
                    <button onClick={() => handleCopy(JSON.stringify(decoded.payload, null, 2), "payload")} className="text-[11px] text-[#7a7875] hover:text-accent flex items-center gap-1">
                      {copied === "payload" ? <CheckCircle size={12} className="text-green-500" /> : <Copy size={12} />}{copied === "payload" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="p-4"><JsonDisplay data={decoded.payload as Record<string, unknown>} /></div>
                </div>
              </div>

              {/* Signature */}
              <div className="bg-white border border-[#1a1917]/10 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e3de] bg-blue-50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-400" />
                    <span className="text-[12px] font-bold text-blue-700 uppercase tracking-widest">Signature</span>
                    <span className="text-[11px] text-[#7a7875]">(cannot be verified client-side)</span>
                  </div>
                  <button onClick={() => handleCopy(decoded.sig ?? "", "sig")} className="text-[11px] text-[#7a7875] hover:text-accent flex items-center gap-1">
                    {copied === "sig" ? <CheckCircle size={12} className="text-green-500" /> : <Copy size={12} />}Copy
                  </button>
                </div>
                <div className="p-4"><span className="font-mono text-[12px] text-blue-500 break-all">{decoded.sig}</span></div>
              </div>

              {/* Info */}
              <div className="bg-[#f4f3f0] border border-[#e5e3de] rounded-2xl p-4">
                <p className="text-[11px] font-bold text-[#7a7875] uppercase tracking-widest mb-1">🔒 Security Note</p>
                <p className="text-[12px] text-[#7a7875]">This tool decodes JWTs client-side — your token never leaves your browser. However, JWT signatures cannot be verified without the secret key. Never share your secret key publicly.</p>
              </div>
            </div>
          )}
        </main>
      </div>
      {toast && <div className={`fixed bottom-20 lg:bottom-5 right-4 px-4 py-3 rounded-xl shadow-lg text-[13.5px] font-medium z-[200] ${toast.type === "success" ? "bg-green-700 text-white" : "bg-red-600 text-white"}`}>{toast.msg}</div>}
    </>
  );
}
