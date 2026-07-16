export type ChangeType = "added" | "removed" | "changed" | "type-changed";
export interface JsonChange { path: string; type: ChangeType; before?: unknown; after?: unknown; }
export interface JsonDiffResult { changes: JsonChange[]; stats: { added: number; removed: number; changed: number }; }

function kind(v: unknown): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}
function esc(k: string | number): string {
  if (typeof k === "number") return `[${k}]`;
  return /^[a-zA-Z_$][\w$]*$/.test(k) ? `.${k}` : `[${JSON.stringify(k)}]`;
}
function walk(a: unknown, b: unknown, path: string, out: JsonChange[]) {
  const ka = kind(a), kb = kind(b);
  if (ka !== kb) { out.push({ path: path || "$", type: "type-changed", before: a, after: b }); return; }
  if (ka === "object") {
    const ao = a as Record<string, unknown>, bo = b as Record<string, unknown>;
    const keys = new Set([...Object.keys(ao), ...Object.keys(bo)]);
    for (const k of keys) {
      const p = (path || "$") + esc(k);
      if (!(k in ao)) out.push({ path: p, type: "added", after: bo[k] });
      else if (!(k in bo)) out.push({ path: p, type: "removed", before: ao[k] });
      else walk(ao[k], bo[k], p, out);
    }
  } else if (ka === "array") {
    const aa = a as unknown[], ba = b as unknown[];
    const n = Math.max(aa.length, ba.length);
    for (let i = 0; i < n; i++) {
      const p = (path || "$") + esc(i);
      if (i >= aa.length) out.push({ path: p, type: "added", after: ba[i] });
      else if (i >= ba.length) out.push({ path: p, type: "removed", before: aa[i] });
      else walk(aa[i], ba[i], p, out);
    }
  } else if (a !== b) {
    out.push({ path: path || "$", type: "changed", before: a, after: b });
  }
}
export function computeJsonDiff(a: unknown, b: unknown): JsonDiffResult {
  const changes: JsonChange[] = [];
  walk(a, b, "", changes);
  const stats = { added: 0, removed: 0, changed: 0 };
  for (const c of changes) {
    if (c.type === "added") stats.added++;
    else if (c.type === "removed") stats.removed++;
    else stats.changed++;
  }
  return { changes, stats };
}
