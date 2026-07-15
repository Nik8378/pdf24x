"use client";
import { useState, useCallback } from "react";
import { ShieldCheck, Upload, Download, RefreshCcw, X, Loader2, Eye, EyeOff, CheckCircle2, Info } from "lucide-react";

const C = { ink: "var(--txt)", sub: "var(--txt-2)", brand: "#FF6B5E", line: "var(--line-strong)", surface: "var(--surface)", cream: "var(--cream)", redsoft: "#ffe7e3" };
const shadow = "3px 3px 0 0 var(--line-strong)";
const API = process.env.NEXT_PUBLIC_API_URL || "";

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

const PERMISSION_OPTIONS = [
  { key: "allow_printing", label: "Allow Printing", desc: "Recipients can print the PDF", defaultOn: true },
  { key: "allow_copying", label: "Allow Copying Text", desc: "Recipients can copy text content", defaultOn: false },
  { key: "allow_editing", label: "Allow Editing", desc: "Recipients can modify the PDF", defaultOn: false },
];

const STRENGTH_LEVELS = [
  { value: 4, label: "Weak", color: "#EF4444", desc: "4+ characters" },
  { value: 8, label: "Medium", color: "#F59E0B", desc: "8+ characters" },
  { value: 12, label: "Strong", color: "var(--ok)", desc: "12+ characters with mixed chars" },
];

function getStrength(pwd: string) {
  if (pwd.length >= 12 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return 2;
  if (pwd.length >= 8) return 1;
  if (pwd.length >= 4) return 0;
  return -1;
}

export default function ProtectPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [userPassword, setUserPassword] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    allow_printing: true, allow_copying: false, allow_editing: false,
  });
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (f.type !== "application/pdf") return;
    setFile(f); setResultUrl(null); setError("");
  }, []);

  const reset = () => { setFile(null); setResultUrl(null); setError(""); setUserPassword(""); setOwnerPassword(""); };

  const togglePermission = (key: string) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProtect = async () => {
    if (!file) return;
    if (userPassword.length < 4) { setError("Password must be at least 4 characters."); return; }
    setLoading(true); setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_password", userPassword);
      formData.append("owner_password", ownerPassword);
      formData.append("allow_printing", String(permissions.allow_printing));
      formData.append("allow_copying", String(permissions.allow_copying));
      formData.append("allow_editing", String(permissions.allow_editing));
      const res = await fetch(`${API}/api/pdf/protect`, { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to protect PDF.");
      }
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(userPassword);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ background: "#E4F5EC", border: `1px solid ${C.line}`, boxShadow: shadow }}>
          <ShieldCheck size={26} style={{ color: "var(--ok)" }} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl" style={{ color: C.ink, fontFamily: "Archivo, Inter, sans-serif" }}>Protect PDF</h1>
          <p className="mt-1 text-sm sm:text-base" style={{ color: C.sub }}>Add password protection and control permissions on your PDF.</p>
        </div>
      </div>

      {!file ? (
        <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => document.getElementById("protect-input")?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all"
          style={{ borderColor: dragging ? "#27AE60" : C.line, background: dragging ? "#E4F5EC" : C.surface }}>
          <input id="protect-input" type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "#E4F5EC" }}>
            <Upload size={28} style={{ color: "var(--ok)" }} />
          </span>
          <p className="mt-4 text-base font-semibold" style={{ color: C.ink }}>Drop your PDF file here</p>
          <p className="mt-1 text-sm" style={{ color: C.sub }}>or click to browse</p>
        </div>
      ) : !resultUrl ? (
        <div className="space-y-6">
          {/* File row */}
          <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ border: `1px solid ${C.line}`, background: C.surface, boxShadow: shadow }}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "#E4F5EC" }}>
              <ShieldCheck size={16} style={{ color: "var(--ok)" }} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold" style={{ color: C.ink }}>{file.name}</p>
              <p className="text-xs" style={{ color: C.sub }}>{formatBytes(file.size)}</p>
            </div>
            <button onClick={reset} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ border: `1px solid ${C.line}`, background: C.cream }}>
              <X size={15} style={{ color: C.sub }} />
            </button>
          </div>

          {/* Password settings */}
          <div className="rounded-2xl p-5 space-y-5" style={{ border: `1px solid ${C.line}`, background: C.surface, boxShadow: shadow }}>
            <h3 className="text-sm font-bold" style={{ color: C.ink }}>Password Settings</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold" style={{ color: C.ink }}>
                  Open Password <span style={{ color: C.brand }}>*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    autoComplete="new-password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="Min. 4 characters"
                    className="w-full rounded-xl px-4 py-2.5 pr-10 text-sm"
                    style={{ border: `1px solid ${C.line}`, background: C.cream, color: C.ink, outline: "none" }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: C.sub }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Strength indicator */}
                {userPassword.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {STRENGTH_LEVELS.map((s, i) => (
                        <div key={i} className="h-1.5 flex-1 rounded-full transition-all" style={{ background: strength >= i ? s.color : "#e5e7eb" }} />
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: strength >= 0 ? STRENGTH_LEVELS[Math.max(0, strength)].color : C.sub }}>
                      {strength === -1 ? "Too short" : STRENGTH_LEVELS[strength].label + " password"}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold" style={{ color: C.ink }}>
                  Owner Password
                  <span className="ml-1 text-xs font-normal" style={{ color: C.sub }}>(optional)</span>
                </label>
                <input
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  placeholder="For permissions control"
                  className="w-full rounded-xl px-4 py-2.5 text-sm"
                  style={{ border: `1px solid ${C.line}`, background: C.cream, color: C.ink, outline: "none" }}
                />
                <p className="mt-1.5 text-xs" style={{ color: C.sub }}>Owner password lets you change permissions later.</p>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="rounded-2xl p-5 space-y-4" style={{ border: `1px solid ${C.line}`, background: C.surface, boxShadow: shadow }}>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold" style={{ color: C.ink }}>Document Permissions</h3>
              <Info size={14} style={{ color: C.sub }} />
            </div>
            <div className="space-y-3">
              {PERMISSION_OPTIONS.map((opt) => (
                <div key={opt.key} className="flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer transition-all"
                  style={{ border: `1px solid ${permissions[opt.key] ? "#27AE60" : C.line}`, background: permissions[opt.key] ? "#E4F5EC" : C.cream }}
                  onClick={() => togglePermission(opt.key)}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: C.ink }}>{opt.label}</p>
                    <p className="text-xs" style={{ color: C.sub }}>{opt.desc}</p>
                  </div>
                  <div className="flex h-6 w-11 items-center rounded-full transition-all shrink-0"
                    style={{ background: permissions[opt.key] ? "#27AE60" : "#d1d5db", justifyContent: permissions[opt.key] ? "flex-end" : "flex-start", padding: "2px" }}>
                    <div className="h-5 w-5 rounded-full bg-[var(--surface)] shadow" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="rounded-xl px-4 py-3 text-sm" style={{ border: `1px solid ${C.line}`, background: C.redsoft, color: C.ink }}>{error}</p>}

          <div className="flex flex-wrap gap-3">
            <button onClick={handleProtect} disabled={loading || userPassword.length < 4}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50 transition-all hover:-translate-y-0.5"
              style={{ background: "#27AE60", border: `1px solid ${C.line}`, boxShadow: shadow }}>
              {loading ? <><Loader2 size={16} className="animate-spin" />Protecting…</> : <><ShieldCheck size={16} />Protect PDF</>}
            </button>
            <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
              style={{ border: `1px solid ${C.line}`, background: C.cream, color: C.ink, boxShadow: shadow }}>
              <RefreshCcw size={15} />Start over
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl p-10 text-center" style={{ border: `1px solid ${C.line}`, background: C.surface, boxShadow: shadow }}>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "#E4F5EC" }}>
            <ShieldCheck size={26} style={{ color: "var(--ok)" }} />
          </span>
          <p className="text-base font-bold" style={{ color: C.ink }}>PDF protected successfully!</p>
          <div className="space-y-1.5 text-sm" style={{ color: C.sub }}>
            <div className="flex items-center gap-2 justify-center"><CheckCircle2 size={15} style={{ color: "var(--ok)" }} />Password protection applied</div>
            <div className="flex items-center gap-2 justify-center"><CheckCircle2 size={15} style={{ color: "var(--ok)" }} />Printing: {permissions.allow_printing ? "Allowed" : "Blocked"}</div>
            <div className="flex items-center gap-2 justify-center"><CheckCircle2 size={15} style={{ color: "var(--ok)" }} />Copying: {permissions.allow_copying ? "Allowed" : "Blocked"}</div>
            <div className="flex items-center gap-2 justify-center"><CheckCircle2 size={15} style={{ color: "var(--ok)" }} />Editing: {permissions.allow_editing ? "Allowed" : "Blocked"}</div>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            <a href={resultUrl} download="protected.pdf"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ background: "#27AE60", border: `1px solid ${C.line}`, boxShadow: shadow }}>
              <Download size={16} />Download Protected PDF
            </a>
            <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
              style={{ border: `1px solid ${C.line}`, background: C.cream, color: C.ink, boxShadow: shadow }}>
              <RefreshCcw size={15} />Protect another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
