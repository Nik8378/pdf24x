"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Copy, Check, AlertCircle, CheckCircle, Trash2, Wand2, ShieldCheck, ShieldAlert, Shield } from "lucide-react";

/* ─── base64url helpers ─────────────────────────────── */
function b64uToStr(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return decodeURIComponent(escape(atob(padded)));
}
function strToB64u(str: string): string {
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function bufToB64u(buf: ArrayBuffer): string {
  let s = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/* ─── HMAC sign/verify via Web Crypto ────────────────── */
const HMAC_HASH: Record<string, string> = { HS256: "SHA-256", HS384: "SHA-384", HS512: "SHA-512" };
async function hmacSignature(alg: string, secret: string, data: string, secretIsB64: boolean): Promise<string> {
  const keyBytes = secretIsB64 ? b64ToBytes(secret) : new TextEncoder().encode(secret);
  const key = await crypto.subtle.importKey("raw", keyBytes as BufferSource, { name: "HMAC", hash: HMAC_HASH[alg] }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return bufToB64u(sig);
}

/* ─── Standard claim explanations ────────────────────── */
const CLAIM_INFO: Record<string, string> = {
  alg: "The algorithm used to sign the JWT.",
  typ: "The media type of this complete JWT.",
  cty: "Content type of the secured payload.",
  kid: "Key ID — indicates which key was used to sign.",
  iss: "Issuer — who created and signed this token.",
  sub: "The subject of the JWT (the user).",
  aud: "Audience — who the token is intended for.",
  exp: "Expiration time, after which the JWT must be rejected.",
  nbf: "Not valid before this time.",
  iat: "The time at which the JWT was issued.",
  jti: "Unique identifier for this token.",
};
const TIME_CLAIMS = new Set(["exp", "nbf", "iat"]);
function fmtClaim(k: string, v: unknown): string {
  if (TIME_CLAIMS.has(k) && typeof v === "number") {
    return `${v} (${new Date(v * 1000).toString()})`;
  }
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

const SAMPLE = {
  header: { alg: "HS256", typ: "JWT" },
  payload: { sub: "1234567890", name: "John Doe", admin: true, iat: 1516239022 },
  secret: "a-string-secret-at-least-256-bits-long",
};

const PART_COLORS = ["#EE4B3C", "#7B61FF", "#2D9CDB"];

/* ─── Small UI atoms ─────────────────────────────────── */
function CopyBtn({ text, id, copied, onCopy }: { text: string; id: string; copied: string | null; onCopy: (t: string, id: string) => void }) {
  return (
    <button onClick={() => onCopy(text, id)} title="Copy"
      className="rounded-md p-1.5 text-[var(--txt-2)] hover:bg-[var(--hover-soft)] hover:text-[var(--txt)]">
      {copied === id ? <Check size={14} className="text-[var(--ok)]" /> : <Copy size={14} />}
    </button>
  );
}
function ViewToggle({ view, setView }: { view: "json" | "claims"; setView: (v: "json" | "claims") => void }) {
  return (
    <div className="flex rounded-lg border border-[var(--line)] p-0.5 text-[11px] font-semibold">
      {(["json", "claims"] as const).map((v) => (
        <button key={v} onClick={() => setView(v)}
          className={`rounded-md px-2.5 py-1 ${view === v ? "bg-[var(--inv-bg)] text-[var(--inv-txt)]" : "text-[var(--txt-2)] hover:text-[var(--txt)]"}`}>
          {v === "json" ? "JSON" : "Claims Breakdown"}
        </button>
      ))}
    </div>
  );
}
function ClaimsTable({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="divide-y divide-[var(--line)]">
      {Object.entries(data).map(([k, v]) => (
        <div key={k} className="grid grid-cols-[90px_1fr] gap-3 py-2.5 sm:grid-cols-[90px_1fr_1fr]">
          <span className="font-mono text-[12px] font-bold text-[var(--err)]">{k}</span>
          <span className="break-all font-mono text-[12px] text-[var(--txt)]">{fmtClaim(k, v)}</span>
          <span className="hidden text-[12px] text-[var(--txt-2)] sm:block">{CLAIM_INFO[k] ?? ""}</span>
        </div>
      ))}
    </div>
  );
}
function JsonView({ data }: { data: Record<string, unknown> }) {
  return (
    <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-[12.5px] leading-relaxed text-[var(--txt)]">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

/* ─── Main component ─────────────────────────────────── */
export default function JWTDecoderClient() {
  const [tab, setTab] = useState<"decoder" | "encoder">("decoder");
  const [copied, setCopied] = useState<string | null>(null);
  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id); setTimeout(() => setCopied(null), 1600);
  }, []);

  /* ── Decoder state ── */
  const [token, setToken] = useState("");
  const [headerView, setHeaderView] = useState<"json" | "claims">("claims");
  const [payloadView, setPayloadView] = useState<"json" | "claims">("claims");
  const [secret, setSecret] = useState("");
  const [secretIsB64, setSecretIsB64] = useState(false);
  const [sigStatus, setSigStatus] = useState<"none" | "checking" | "valid" | "invalid" | "unsupported">("none");

  const decoded = useMemo(() => {
    const t = token.trim();
    if (!t) return null;
    const parts = t.split(".");
    if (parts.length !== 3) return { error: "Invalid JWT — must have 3 parts separated by dots (header.payload.signature)" } as const;
    try {
      const header = JSON.parse(b64uToStr(parts[0]));
      const payload = JSON.parse(b64uToStr(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      const expired: boolean | null = typeof payload.exp === "number" ? payload.exp < now : null;
      return { header, payload, parts, expired, error: null } as const;
    } catch {
      return { error: "Failed to decode JWT — header or payload is not valid base64url JSON." } as const;
    }
  }, [token]);

  /* verify signature whenever token or secret changes */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!decoded || decoded.error || !secret) { setSigStatus("none"); return; }
      const alg = (decoded.header as Record<string, unknown>).alg as string;
      if (!HMAC_HASH[alg]) { setSigStatus("unsupported"); return; }
      setSigStatus("checking");
      try {
        const computed = await hmacSignature(alg, secret, `${decoded.parts[0]}.${decoded.parts[1]}`, secretIsB64);
        if (!cancelled) setSigStatus(computed === decoded.parts[2] ? "valid" : "invalid");
      } catch {
        if (!cancelled) setSigStatus("invalid");
      }
    })();
    return () => { cancelled = true; };
  }, [decoded, secret, secretIsB64]);

  const loadExample = useCallback(async () => {
    const h = strToB64u(JSON.stringify(SAMPLE.header));
    const p = strToB64u(JSON.stringify(SAMPLE.payload));
    const s = await hmacSignature("HS256", SAMPLE.secret, `${h}.${p}`, false);
    setToken(`${h}.${p}.${s}`);
    setSecret(SAMPLE.secret);
  }, []);

  /* ── Encoder state ── */
  const [encHeader, setEncHeader] = useState(JSON.stringify(SAMPLE.header, null, 2));
  const [encPayload, setEncPayload] = useState(JSON.stringify(SAMPLE.payload, null, 2));
  const [encAlg, setEncAlg] = useState("HS256");
  const [encSecret, setEncSecret] = useState(SAMPLE.secret);
  const [encSecretIsB64, setEncSecretIsB64] = useState(false);
  const [encToken, setEncToken] = useState("");
  const [encError, setEncError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const h = JSON.parse(encHeader);
        const p = JSON.parse(encPayload);
        h.alg = encAlg;
        if (!encSecret) { setEncToken(""); setEncError("Enter a secret to sign the token."); return; }
        const hh = strToB64u(JSON.stringify(h));
        const pp = strToB64u(JSON.stringify(p));
        const sig = await hmacSignature(encAlg, encSecret, `${hh}.${pp}`, encSecretIsB64);
        if (!cancelled) { setEncToken(`${hh}.${pp}.${sig}`); setEncError(""); }
      } catch (e) {
        if (!cancelled) { setEncToken(""); setEncError(e instanceof SyntaxError ? "Header or payload is not valid JSON." : "Failed to generate token."); }
      }
    })();
    return () => { cancelled = true; };
  }, [encHeader, encPayload, encAlg, encSecret, encSecretIsB64]);

  const parts = token.trim().split(".");

  return (
    <div className="w-full flex gap-0 items-start">
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--txt)]">JSON Web Token (JWT) Debugger</h1>
            <p className="text-[13px] text-[var(--txt-2)]">
              Decode, verify, and generate JSON Web Tokens — an open, industry-standard (RFC 7519) method for
              representing claims securely between two parties. Everything runs in your browser; tokens are never sent to any server.
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1">
              {(["decoder", "encoder"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`rounded-lg px-4 py-1.5 text-[13px] font-semibold transition-all ${tab === t ? "bg-[var(--inv-bg)] text-[var(--inv-txt)]" : "text-[var(--txt-2)] hover:text-[var(--txt)]"}`}>
                  {t === "decoder" ? "JWT Decoder" : "JWT Encoder"}
                </button>
              ))}
            </div>
            {tab === "decoder" && (
              <button onClick={loadExample}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] bg-[var(--surface)] px-3 py-1.5 text-[12px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40">
                <Wand2 size={14} /> Generate example
              </button>
            )}
          </div>

          {tab === "decoder" ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {/* ── Left: encoded token ── */}
              <div>
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                  <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2.5">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-[var(--txt-2)]">Encoded Token</p>
                    <div className="flex items-center gap-1">
                      <CopyBtn text={token} id="tok" copied={copied} onCopy={handleCopy} />
                      <button onClick={() => { setToken(""); setSecret(""); }} title="Clear"
                        className="rounded-md p-1.5 text-[var(--txt-2)] hover:bg-[var(--hover-soft)] hover:text-[#EE4B3C]"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <textarea value={token} onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste a JWT here that you'd like to decode, validate, and verify…"
                    spellCheck={false}
                    className="h-44 w-full resize-y rounded-b-2xl bg-transparent p-4 font-mono text-[12.5px] leading-relaxed text-[var(--txt)] outline-none placeholder:text-[var(--txt-3)]" />
                </div>

                {/* colored preview */}
                {decoded && !decoded.error && (
                  <div className="mt-3 break-all rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 font-mono text-[12px] leading-relaxed">
                    {parts.map((p, i) => (
                      <span key={i}>
                        <span style={{ color: PART_COLORS[i] }}>{p}</span>
                        {i < 2 && <span className="text-[var(--txt)]">.</span>}
                      </span>
                    ))}
                  </div>
                )}

                {/* status row */}
                {decoded && (
                  <div className="mt-3 space-y-1.5">
                    {decoded.error ? (
                      <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--err)]"><AlertCircle size={15} /> {decoded.error}</p>
                    ) : (
                      <>
                        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ok)]"><CheckCircle size={15} /> Valid JWT</p>
                        {decoded.expired === true && <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--err)]"><AlertCircle size={15} /> Token has expired</p>}
                        {decoded.expired === false && <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ok)]"><CheckCircle size={15} /> Not expired</p>}
                        {sigStatus === "valid" && <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ok)]"><ShieldCheck size={15} /> Signature Verified</p>}
                        {sigStatus === "invalid" && <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--err)]"><ShieldAlert size={15} /> Invalid Signature</p>}
                        {sigStatus === "unsupported" && <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--warn)]"><Shield size={15} /> Only HS256 / HS384 / HS512 verification is supported in-browser</p>}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* ── Right: decoded ── */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                  <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2.5">
                    <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: PART_COLORS[0] }}>Decoded Header</p>
                    <div className="flex items-center gap-2">
                      <ViewToggle view={headerView} setView={setHeaderView} />
                      {decoded && !decoded.error && <CopyBtn text={JSON.stringify(decoded.header, null, 2)} id="hdr" copied={copied} onCopy={handleCopy} />}
                    </div>
                  </div>
                  <div className="p-4">
                    {decoded && !decoded.error
                      ? (headerView === "json" ? <JsonView data={decoded.header} /> : <ClaimsTable data={decoded.header} />)
                      : <p className="text-[13px] text-[var(--txt-3)]">Header will appear here</p>}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                  <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2.5">
                    <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: PART_COLORS[1] }}>Decoded Payload</p>
                    <div className="flex items-center gap-2">
                      <ViewToggle view={payloadView} setView={setPayloadView} />
                      {decoded && !decoded.error && <CopyBtn text={JSON.stringify(decoded.payload, null, 2)} id="pld" copied={copied} onCopy={handleCopy} />}
                    </div>
                  </div>
                  <div className="p-4">
                    {decoded && !decoded.error
                      ? (payloadView === "json" ? <JsonView data={decoded.payload} /> : <ClaimsTable data={decoded.payload} />)
                      : <p className="text-[13px] text-[var(--txt-3)]">Payload will appear here</p>}
                  </div>
                </div>

                {/* signature verification */}
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                  <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2.5">
                    <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: PART_COLORS[2] }}>
                      JWT Signature Verification <span className="font-medium normal-case text-[var(--txt-3)]">(Optional)</span>
                    </p>
                    <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-semibold text-[var(--txt-2)]">
                      <input type="checkbox" checked={secretIsB64} onChange={(e) => setSecretIsB64(e.target.checked)} className="accent-[#EE4B3C]" />
                      base64url encoded
                    </label>
                  </div>
                  <div className="p-4">
                    <p className="mb-2 text-[12px] text-[var(--txt-2)]">Enter the secret used to sign the JWT:</p>
                    <input value={secret} onChange={(e) => setSecret(e.target.value)} spellCheck={false}
                      placeholder="your-256-bit-secret"
                      className="w-full rounded-lg border border-[var(--line-mid)] bg-[var(--surface-2)] px-3 py-2 font-mono text-[12.5px] text-[var(--txt)] outline-none focus:border-[#EE4B3C]/50" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ── Encoder ── */
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                  <div className="border-b border-[var(--line)] px-4 py-2.5">
                    <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: PART_COLORS[0] }}>Header</p>
                  </div>
                  <textarea value={encHeader} onChange={(e) => setEncHeader(e.target.value)} spellCheck={false}
                    className="h-32 w-full resize-y rounded-b-2xl bg-transparent p-4 font-mono text-[12.5px] text-[var(--txt)] outline-none" />
                </div>
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                  <div className="border-b border-[var(--line)] px-4 py-2.5">
                    <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: PART_COLORS[1] }}>Payload</p>
                  </div>
                  <textarea value={encPayload} onChange={(e) => setEncPayload(e.target.value)} spellCheck={false}
                    className="h-44 w-full resize-y rounded-b-2xl bg-transparent p-4 font-mono text-[12.5px] text-[var(--txt)] outline-none" />
                </div>
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: PART_COLORS[2] }}>Sign</p>
                    <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-semibold text-[var(--txt-2)]">
                      <input type="checkbox" checked={encSecretIsB64} onChange={(e) => setEncSecretIsB64(e.target.checked)} className="accent-[#EE4B3C]" />
                      base64url encoded secret
                    </label>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <select value={encAlg} onChange={(e) => setEncAlg(e.target.value)}
                      className="rounded-lg border border-[var(--line-mid)] bg-[var(--surface-2)] px-3 py-2 text-[12.5px] font-semibold text-[var(--txt)] outline-none">
                      {Object.keys(HMAC_HASH).map((a) => <option key={a}>{a}</option>)}
                    </select>
                    <input value={encSecret} onChange={(e) => setEncSecret(e.target.value)} spellCheck={false}
                      placeholder="Secret"
                      className="flex-1 rounded-lg border border-[var(--line-mid)] bg-[var(--surface-2)] px-3 py-2 font-mono text-[12.5px] text-[var(--txt)] outline-none focus:border-[#EE4B3C]/50" />
                  </div>
                </div>
              </div>

              <div>
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                  <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2.5">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-[var(--txt-2)]">Generated Token</p>
                    {encToken && <CopyBtn text={encToken} id="enc" copied={copied} onCopy={handleCopy} />}
                  </div>
                  <div className="min-h-44 break-all p-4 font-mono text-[12.5px] leading-relaxed">
                    {encError ? (
                      <p className="flex items-center gap-1.5 font-sans text-[13px] font-semibold text-[var(--err)]"><AlertCircle size={15} /> {encError}</p>
                    ) : encToken ? (
                      encToken.split(".").map((p, i) => (
                        <span key={i}>
                          <span style={{ color: PART_COLORS[i] }}>{p}</span>
                          {i < 2 && <span className="text-[var(--txt)]">.</span>}
                        </span>
                      ))
                    ) : (
                      <p className="font-sans text-[13px] text-[var(--txt-3)]">Token will appear here</p>
                    )}
                  </div>
                </div>
                {encToken && (
                  <p className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ok)]"><CheckCircle size={15} /> Token signed with {encAlg}</p>
                )}
              </div>
            </div>
          )}

          <p className="mt-6 text-xs text-[var(--txt-2)]">
            🔒 100% private — decoding, verification and signing all happen locally in your browser using the Web Crypto API.
            Never paste production secrets into any website you don&apos;t trust.
          </p>
      </main>
    </div>
  );
}
