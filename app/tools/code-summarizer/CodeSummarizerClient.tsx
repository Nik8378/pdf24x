"use client";
import { useState, useRef, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import ToolPageSections from "@/components/tool/ToolPageSections";
import {
  Upload, Code2, Copy, Check, Trash2, AlertCircle,
  FileCode, ChevronDown, Zap, RefreshCw
} from "lucide-react";

const LANGUAGES = [
  "Auto Detect","JavaScript","TypeScript","Python","Java","C","C++","C#",
  "Go","Rust","PHP","Ruby","Swift","Kotlin","Dart","Bash","SQL","HTML","CSS","Other"
];

const LEVELS = [
  { id: "light",   label: "Light",    desc: "Remove comments & whitespace only" },
  { id: "medium",  label: "Medium",   desc: "Refactor + merge redundancies" },
  { id: "deep",    label: "Deep",     desc: "Maximum compression, same logic" },
];

type Level = "light" | "medium" | "deep";

export default function CodeSummarizerClient() {
  const [input, setInput]       = useState("");
  const [output, setOutput]     = useState("");
  const [lang, setLang]         = useState("Auto Detect");
  const [level, setLevel]       = useState<Level>("medium");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [copied, setCopied]     = useState(false);
  const [stats, setStats]       = useState<{ before: number; after: number } | null>(null);
  const [source, setSource]     = useState<"ollama" | "rule-based" | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const loadFile = useCallback((file: File) => {
    if (file.size > 500_000) { setError("File too large — max 500 KB"); return; }
    const r = new FileReader();
    r.onload = e => setInput((e.target?.result as string) ?? "");
    r.readAsText(file);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) loadFile(f);
  }, [loadFile]);

  const summarize = useCallback(async () => {
    if (!input.trim()) { setError("Paste or upload some code first."); return; }
    setError(null); setOutput(""); setLoading(true); setCopied(false); setStats(null);
    abortRef.current = new AbortController();
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        signal: abortRef.current.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: input, lang, level,
        }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value);
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") continue;
          try {
            const j = JSON.parse(raw);
            const t = j?.delta?.text ?? j?.content?.[0]?.text ?? "";
            if (t) { full += t; setOutput(full); }
          } catch {}
        }
      }
      // Strip accidental markdown fences
      const clean = full.replace(/^```[\w]*\n?/,"").replace(/\n?```$/,"").trim();
      setOutput(clean);
      setStats({ before: input.trim().split("\n").length, after: clean.split("\n").length });
    } catch (e: unknown) {
      if ((e as Error).name !== "AbortError") setError((e as Error).message || "Something went wrong.");
    } finally { setLoading(false); }
  }, [input, lang, level]);

  const stop = () => { abortRef.current?.abort(); setLoading(false); };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const reduction = stats ? Math.round((1 - stats.after / stats.before) * 100) : 0;
  const sourceBadge = source === "ollama" ? "⚡ Ollama AI" : source === "rule-based" ? "⚙️ Rule-based" : null;

  return (
    <>
      <div className="flex min-h-screen bg-[var(--bg)]">
        <Sidebar />
        <main className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Code2 size={22} className="text-accent" />
              <h1 className="text-xl font-bold text-[var(--txt)]">Code Summarizer</h1>
            </div>
            <p className="text-sm text-[var(--txt-2)]">
              Paste or upload any code file — get the same logic in far fewer lines. Same language, same behaviour, zero bugs.
            </p>
          </div>

          {/* Controls bar */}
          <div className="flex flex-wrap gap-3 mb-4">
            {/* Language picker */}
            <div className="relative">
              <select
                value={lang}
                onChange={e => setLang(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--txt)] cursor-pointer"
              >
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--txt-2)] pointer-events-none" />
            </div>

            {/* Level pills */}
            <div className="flex gap-1 p-1 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
              {LEVELS.map(lv => (
                <button
                  key={lv.id}
                  onClick={() => setLevel(lv.id as Level)}
                  title={lv.desc}
                  className={`px-3 py-1 text-[12px] font-medium rounded-md transition-all ${
                    level === lv.id
                      ? "bg-accent text-white shadow-sm"
                      : "text-[var(--txt-2)] hover:text-[var(--txt)]"
                  }`}
                >{lv.label}</button>
              ))}
            </div>

            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--txt)] hover:bg-[var(--bg-2)] transition-colors"
            >
              <Upload size={14} /> Upload File
            </button>
            <input ref={fileRef} type="file" className="hidden"
              accept=".js,.ts,.tsx,.jsx,.py,.java,.c,.cpp,.cs,.go,.rs,.php,.rb,.swift,.kt,.dart,.sh,.sql,.html,.css,.txt"
              onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f); }} />
          </div>

          {/* Editor area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Input */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] font-semibold text-[var(--txt-2)] uppercase tracking-wide">Input Code</span>
                {input && (
                  <button onClick={() => { setInput(""); setOutput(""); setStats(null); }}
                    className="flex items-center gap-1 text-[11px] text-[var(--txt-2)] hover:text-red-500 transition-colors">
                    <Trash2 size={12} /> Clear
                  </button>
                )}
              </div>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`relative flex-1 rounded-xl border-2 transition-colors ${
                  dragOver ? "border-accent bg-accent/5" : "border-[var(--border)]"
                }`}
              >
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Paste your code here, or drag & drop a file…"
                  spellCheck={false}
                  className="w-full h-72 lg:h-96 p-4 bg-transparent text-[13px] font-mono text-[var(--txt)] resize-none focus:outline-none rounded-xl placeholder:text-[var(--txt-2)]/50"
                />
                {!input && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-2 opacity-40">
                    <FileCode size={32} className="text-[var(--txt-2)]" />
                    <span className="text-[12px] text-[var(--txt-2)]">Drag & drop any code file</span>
                  </div>
                )}
              </div>
              {input && (
                <p className="text-[11px] text-[var(--txt-2)] mt-1">{input.trim().split("\n").length} lines · {input.length.toLocaleString()} chars</p>
              )}
            </div>

            {/* Output */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] font-semibold text-[var(--txt-2)] uppercase tracking-wide">Compressed Output</span>
                {output && (
                  <button onClick={copy}
                    className="flex items-center gap-1 text-[11px] text-[var(--txt-2)] hover:text-accent transition-colors">
                    {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                )}
              </div>
              <div className={`flex-1 rounded-xl border-2 border-[var(--border)] relative overflow-hidden ${loading ? "animate-pulse" : ""}`}>
                {output ? (
                  <textarea
                    value={output}
                    readOnly
                    spellCheck={false}
                    className="w-full h-72 lg:h-96 p-4 bg-transparent text-[13px] font-mono text-[var(--txt)] resize-none focus:outline-none"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-30">
                    <Zap size={32} className="text-[var(--txt-2)]" />
                    <span className="text-[12px] text-[var(--txt-2)]">{loading ? "Compressing…" : "Output will appear here"}</span>
                  </div>
                )}
              </div>
              {stats && (
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-[11px] text-[var(--txt-2)]">{stats.after} lines · {output.length.toLocaleString()} chars</p>
                  <span className={`text-[11px] font-semibold ${reduction > 0 ? "text-green-600" : "text-[var(--txt-2)]"}`}>
                    {reduction > 0 ? `▼ ${reduction}% fewer lines` : "No reduction"}{sourceBadge && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-[var(--surface)] border border-[var(--border)] text-[var(--txt-2)]">{sourceBadge}</span>}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[13px]">
              <AlertCircle size={15} />{error}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 justify-center mb-8">
            {loading ? (
              <button onClick={stop}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-[14px] hover:bg-red-600 transition-colors">
                <RefreshCw size={16} className="animate-spin" /> Stop
              </button>
            ) : (
              <button onClick={summarize} disabled={!input.trim()}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-accent text-white font-semibold text-[14px] hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
                <Zap size={16} /> Compress Code
              </button>
            )}
            {output && (
              <button
                onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--txt)] font-medium text-[14px] hover:bg-[var(--bg-2)] transition-colors">
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy Output"}
              </button>
            )}
          </div>

          <ToolPageSections
            
            faqs={[
              { q: "Does this change my code's logic?", a: "No. The AI is instructed to preserve every logic branch, edge case, and side-effect. It only removes redundancy and verbose patterns." },
              { q: "Which languages are supported?", a: "Any language the AI knows — JavaScript, TypeScript, Python, Java, C/C++, Go, Rust, PHP, Ruby, Swift, Kotlin, Dart, Bash, SQL, HTML, CSS and more." },
              { q: "What is the Deep compression level?", a: "Deep uses advanced refactoring — one-liners, idiomatic patterns, short variable names — while keeping 100% of the original behaviour." },
              { q: "Is my code sent anywhere?", a: "Code is sent to the Anthropic API for processing, the same way you'd use Claude.ai. Nothing is stored on our servers." },
              { q: "What's the file size limit?", a: "500 KB per file. For larger codebases, compress file by file." },
            ]}
            relatedTools={["isbn-validator","duplicate-isbn-finder","isbn-range-checker"]}
          />
        </main>
      </div>
    </>
  );
}
