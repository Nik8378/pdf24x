import { NextRequest } from "next/server";

export const runtime = "nodejs";

// ── Rule-based compressor ─────────────────────────────────────────────────────
function ruleBased(code: string, level: string): string {
  let out = code;

  // Remove single-line comments (// and #)
  out = out.replace(/(?<!["'`])\/\/[^\n]*/g, "");
  out = out.replace(/(?<!["'`])#[^\n]*/g, "");

  // Remove multi-line comments /* */ and """ """
  out = out.replace(/\/\*[\s\S]*?\*\//g, "");
  out = out.replace(/"""[\s\S]*?"""/g, '""');
  out = out.replace(/'''[\s\S]*?'''/g, "''");

  // Remove blank lines
  out = out.split("\n").filter(l => l.trim()).join("\n");

  if (level === "light") return out.trim();

  if (level === "medium" || level === "deep") {
    // Collapse multiple spaces (outside strings) to single
    out = out.replace(/([^"'`])\s{2,}/g, "$1 ");
    // Remove trailing whitespace per line
    out = out.split("\n").map(l => l.trimEnd()).join("\n");
    // Remove blank lines again after trimming
    out = out.split("\n").filter(l => l.trim()).join("\n");
  }

  if (level === "deep") {
    // Collapse simple one-liner if/return patterns
    out = out.replace(/\{\s*\n\s*(return [^\n]+)\n\s*\}/g, "{ $1 }");
    // Remove unnecessary semicolons before closing braces
    out = out.replace(/;\s*\n(\s*\})/g, "\n$1");
  }

  return out.trim();
}

// ── Ollama check ──────────────────────────────────────────────────────────────
async function tryOllama(code: string, lang: string, level: string): Promise<string | null> {
  try {
    const prompt = `Compress this ${lang === "Auto Detect" ? "" : lang} code to fewer lines.
Rules: same logic, same language, no bugs, no comments, idiomatic style.
Level: ${level}. Output ONLY the code, no markdown, no explanation.\n\n${code}`;

    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "qwen2.5-coder:7b", prompt, stream: false }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) return null;
    const j = await res.json();
    const text = (j.response ?? "").replace(/^```[\w]*\n?/, "").replace(/\n?```$/, "").trim();
    return text || null;
  } catch {
    return null; // Ollama not running — silent fallback
  }
}

export async function POST(req: NextRequest) {
  const { code, lang, level } = await req.json();
  if (!code?.trim()) return new Response("No code provided", { status: 400 });

  // Try Ollama first
  const aiResult = await tryOllama(code, lang, level);
  const result = aiResult ?? ruleBased(code, level);
  const source = aiResult ? "ollama" : "rule-based";

  return new Response(JSON.stringify({ result, source }), {
    headers: { "Content-Type": "application/json" },
  });
}
