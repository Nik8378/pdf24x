import { diffArrays, diffWords, diffChars, createTwoFilesPatch } from "diff";

export interface DiffOptions {
  ignoreCase: boolean;
  ignoreWhitespace: boolean;
  trimLines: boolean;
  ignoreEmptyLines: boolean;
  granularity: "word" | "char";
}

export const DEFAULT_OPTIONS: DiffOptions = {
  ignoreCase: false,
  ignoreWhitespace: false,
  trimLines: false,
  ignoreEmptyLines: false,
  granularity: "word",
};

export interface InlineSeg { text: string; type: "same" | "added" | "removed"; }
export type RowType = "same" | "added" | "removed" | "modified";
export interface DiffRow {
  type: RowType;
  leftNum: number | null;
  rightNum: number | null;
  left: InlineSeg[] | null;
  right: InlineSeg[] | null;
  blockId: number | null;
}
export interface DiffResult {
  rows: DiffRow[];
  stats: { added: number; removed: number; modified: number; blocks: number };
  tooLarge: boolean;
}

interface Line { text: string; num: number; }

const MAX_LINES = 60000;
const MAX_INTRALINE = 3000;

function toLines(text: string, ignoreEmpty: boolean): Line[] {
  const out: Line[] = [];
  const arr = text.split("\n");
  for (let i = 0; i < arr.length; i++) {
    if (ignoreEmpty && arr[i].trim() === "") continue;
    out.push({ text: arr[i], num: i + 1 });
  }
  return out;
}

function makeKey(opts: DiffOptions) {
  return (line: string) => {
    let s = line;
    if (opts.trimLines) s = s.trim();
    if (opts.ignoreWhitespace) s = s.replace(/\s+/g, " ").trim();
    if (opts.ignoreCase) s = s.toLowerCase();
    return s;
  };
}

function intraline(oldStr: string, newStr: string, opts: DiffOptions): { left: InlineSeg[]; right: InlineSeg[] } {
  if (oldStr.length > MAX_INTRALINE || newStr.length > MAX_INTRALINE) {
    return { left: [{ text: oldStr, type: "removed" }], right: [{ text: newStr, type: "added" }] };
  }
  const fn = opts.granularity === "char" ? diffChars : diffWords;
  const parts = fn(oldStr, newStr, { ignoreCase: opts.ignoreCase });
  const left: InlineSeg[] = [];
  const right: InlineSeg[] = [];
  for (const p of parts) {
    if (p.added) right.push({ text: p.value, type: "added" });
    else if (p.removed) left.push({ text: p.value, type: "removed" });
    else { left.push({ text: p.value, type: "same" }); right.push({ text: p.value, type: "same" }); }
  }
  return { left, right };
}

const plain = (t: string): InlineSeg[] => [{ text: t, type: "same" }];
const allRemoved = (t: string): InlineSeg[] => [{ text: t, type: "removed" }];
const allAdded = (t: string): InlineSeg[] => [{ text: t, type: "added" }];

export function computeTextDiff(a: string, b: string, opts: DiffOptions): DiffResult {
  const empty: DiffResult = { rows: [], stats: { added: 0, removed: 0, modified: 0, blocks: 0 }, tooLarge: false };
  if (!a && !b) return empty;

  const la = toLines(a, opts.ignoreEmptyLines);
  const lb = toLines(b, opts.ignoreEmptyLines);
  if (la.length + lb.length > MAX_LINES) return { ...empty, tooLarge: true };

  const key = makeKey(opts);
  const parts = diffArrays(la, lb, { comparator: (x: Line, y: Line) => key(x.text) === key(y.text) });

  const rows: DiffRow[] = [];
  const stats = { added: 0, removed: 0, modified: 0, blocks: 0 };
  let blockId = -1;
  let inBlock = false;
  let pendingRemoved: Line[] | null = null;

  const openBlock = () => { if (!inBlock) { blockId++; stats.blocks++; inBlock = true; } };
  const closeBlock = () => { inBlock = false; };

  const flushRemoved = () => {
    if (!pendingRemoved) return;
    openBlock();
    for (const ln of pendingRemoved) {
      rows.push({ type: "removed", leftNum: ln.num, rightNum: null, left: allRemoved(ln.text), right: null, blockId });
      stats.removed++;
    }
    pendingRemoved = null;
  };

  for (const part of parts) {
    if (part.removed) {
      flushRemoved();
      pendingRemoved = part.value as Line[];
    } else if (part.added) {
      const addedLines = part.value as Line[];
      if (pendingRemoved) {
        openBlock();
        const n = Math.min(pendingRemoved.length, addedLines.length);
        for (let i = 0; i < n; i++) {
          const { left, right } = intraline(pendingRemoved[i].text, addedLines[i].text, opts);
          rows.push({ type: "modified", leftNum: pendingRemoved[i].num, rightNum: addedLines[i].num, left, right, blockId });
          stats.modified++;
        }
        for (let i = n; i < pendingRemoved.length; i++) {
          rows.push({ type: "removed", leftNum: pendingRemoved[i].num, rightNum: null, left: allRemoved(pendingRemoved[i].text), right: null, blockId });
          stats.removed++;
        }
        for (let i = n; i < addedLines.length; i++) {
          rows.push({ type: "added", leftNum: null, rightNum: addedLines[i].num, left: null, right: allAdded(addedLines[i].text), blockId });
          stats.added++;
        }
        pendingRemoved = null;
      } else {
        openBlock();
        for (const ln of addedLines) {
          rows.push({ type: "added", leftNum: null, rightNum: ln.num, left: null, right: allAdded(ln.text), blockId });
          stats.added++;
        }
      }
    } else {
      flushRemoved();
      closeBlock();
      for (const ln of part.value as Line[]) {
        rows.push({ type: "same", leftNum: ln.num, rightNum: ln.num, left: plain(ln.text), right: plain(ln.text), blockId: null });
      }
    }
  }
  flushRemoved();

  // Fix right-side line numbers for unchanged rows (they may differ between files)
  // Recompute by walking rows: unchanged rows should carry both original numbers.
  // diffArrays kept left Line objects for common parts, so map right numbers:
  let rIdx = 0;
  const rightLines = lb;
  for (const row of rows) {
    if (row.type === "same") {
      // advance rIdx to the matching line by key
      while (rIdx < rightLines.length && key(rightLines[rIdx].text) !== key(row.left![0].text)) rIdx++;
      if (rIdx < rightLines.length) { row.rightNum = rightLines[rIdx].num; rIdx++; }
    } else if (row.type === "modified" || row.type === "added") {
      rIdx++;
    }
  }

  return { rows, stats, tooLarge: false };
}

export function makeUnifiedPatch(a: string, b: string): string {
  return createTwoFilesPatch("original.txt", "changed.txt", a, b, "", "", { context: 3 });
}

export function makeHtmlReport(rows: DiffRow[], stats: DiffResult["stats"]): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const seg = (segs: InlineSeg[] | null) =>
    (segs ?? []).map((s) =>
      s.type === "same" ? esc(s.text)
      : s.type === "added" ? `<mark style="background:#b7ebc6;color:#14532d;">${esc(s.text)}</mark>`
      : `<mark style="background:#f8c9c4;color:#7f1d1d;text-decoration:line-through;">${esc(s.text)}</mark>`
    ).join("");
  const bg: Record<string, string> = { same: "#ffffff", added: "#e9f9ef", removed: "#fdecea", modified: "#fff8e6" };
  const body = rows.map((r) => `
    <tr style="background:${bg[r.type]}">
      <td style="color:#999;text-align:right;padding:1px 8px;user-select:none;">${r.leftNum ?? ""}</td>
      <td style="padding:1px 8px;white-space:pre-wrap;word-break:break-all;">${seg(r.left)}</td>
      <td style="color:#999;text-align:right;padding:1px 8px;user-select:none;">${r.rightNum ?? ""}</td>
      <td style="padding:1px 8px;white-space:pre-wrap;word-break:break-all;">${seg(r.right)}</td>
    </tr>`).join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Text Comparison Report — PDF24X</title></head>
<body style="font-family:ui-monospace,Menlo,monospace;font-size:12.5px;margin:24px;">
<h2 style="font-family:system-ui,sans-serif;">Text Comparison Report</h2>
<p style="font-family:system-ui,sans-serif;color:#555;">+${stats.added} additions · −${stats.removed} deletions · ~${stats.modified} modified · generated by pdf24x.com/diff-checker/text</p>
<table style="border-collapse:collapse;width:100%;table-layout:fixed;">
<colgroup><col style="width:44px"><col><col style="width:44px"><col></colgroup>${body}</table></body></html>`;
}
