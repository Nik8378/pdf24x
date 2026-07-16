"use client";
import { useCallback } from "react";
import type { DiffRow, InlineSeg } from "@/lib/diff/textDiff";

const ROW_BG: Record<string, string> = {
  same: "bg-[var(--surface)]",
  added: "bg-[var(--diff-add-bg)]",
  removed: "bg-[var(--diff-del-bg)]",
  modified: "bg-[var(--diff-mod-bg)]",
};

function visualizeWs(text: string) {
  const parts: React.ReactNode[] = [];
  let buf = "";
  const flush = () => { if (buf) { parts.push(buf); buf = ""; } };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === " ") { flush(); parts.push(<span key={"s"+i} className="text-[var(--txt-3)] opacity-60">·</span>); }
    else if (ch === "	") { flush(); parts.push(<span key={"t"+i} className="text-[var(--txt-3)] opacity-60">→   </span>); }
    else buf += ch;
  }
  flush();
  return <>{parts}</>;
}

function Segs({ segs, side, showWs }: { segs: InlineSeg[] | null; side: "left" | "right"; showWs?: boolean }) {
  if (segs === null) return <span className="select-none">&nbsp;</span>;
  const render = (t: string) => showWs ? visualizeWs(t) : t;
  return (
    <>
      {segs.map((s, i) =>
        s.type === "same" ? (
          <span key={i}>{render(s.text)}</span>
        ) : s.type === "added" && side === "right" ? (
          <span key={i} className="rounded-sm bg-[#B7EBC6] text-[#14532D]">{render(s.text)}</span>
        ) : s.type === "removed" && side === "left" ? (
          <span key={i} className="rounded-sm bg-[#F8C9C4] text-[#7F1D1D]">{render(s.text)}</span>
        ) : (
          <span key={i}>{render(s.text)}</span>
        )
      )}
      {segs.length === 0 && <span className="select-none">&nbsp;</span>}
    </>
  );
}


function Minimap({ rows }: { rows: DiffRow[] }) {
  const MAX = 200;
  const step = Math.max(1, Math.floor(rows.length / MAX));
  const items: { color: string }[] = [];
  for (let i = 0; i < rows.length; i += step) {
    const r = rows[i];
    const color =
      r.type === "added" ? "bg-[#B7EBC6]"
      : r.type === "removed" ? "bg-[#F8C9C4]"
      : r.type === "modified" ? "bg-[#FBE4A5]"
      : "bg-transparent";
    items.push({ color });
  }
  return (
    <div className="hidden lg:flex w-1.5 self-stretch shrink-0 flex-col overflow-hidden rounded border border-[var(--line)] bg-[var(--surface-2)]"
      title="Change minimap — green = added, red = removed, yellow = modified">
      {items.map((it, i) => <span key={i} className={`flex-1 ${it.color}`} />)}
    </div>
  );
}

export function DiffViewer({
  rows, view, wrap, showLineNumbers, currentBlock, registerBlock,
  showWhitespace = false, showMinimap = false,
}: {
  rows: DiffRow[];
  view: "split" | "inline";
  wrap: boolean;
  showLineNumbers: boolean;
  currentBlock: number | null;
  registerBlock: (blockId: number, el: HTMLElement | null) => void;
  showWhitespace?: boolean;
  showMinimap?: boolean;
}) {
  const cellCls = `px-2 py-[1px] font-mono text-[12.5px] leading-[1.55] ${wrap ? "whitespace-pre-wrap break-all" : "whitespace-pre"}`;
  const numCls = "w-11 shrink-0 select-none px-2 py-[1px] text-right font-mono text-[11px] leading-[1.55] text-[var(--txt-3)]";
  const ring = (r: DiffRow) =>
    r.blockId !== null && r.blockId === currentBlock ? "outline outline-2 -outline-offset-2 outline-[#EE4B3C]/60" : "";

  const refCb = useCallback(
    (blockId: number | null) => (el: HTMLElement | null) => {
      if (blockId !== null) registerBlock(blockId, el);
    },
    [registerBlock]
  );

  if (view === "inline") {
    const minimap = showMinimap ? <Minimap rows={rows} /> : null;
    // Expand modified rows into removed line + added line
    const lines: { row: DiffRow; side: "left" | "right"; segs: InlineSeg[] | null; num: string; bg: string }[] = [];
    for (const r of rows) {
      if (r.type === "same") lines.push({ row: r, side: "left", segs: r.left, num: `${r.leftNum ?? ""}`, bg: ROW_BG.same });
      else if (r.type === "removed") lines.push({ row: r, side: "left", segs: r.left, num: `${r.leftNum ?? ""}`, bg: ROW_BG.removed });
      else if (r.type === "added") lines.push({ row: r, side: "right", segs: r.right, num: `${r.rightNum ?? ""}`, bg: ROW_BG.added });
      else {
        lines.push({ row: r, side: "left", segs: r.left, num: `${r.leftNum ?? ""}`, bg: ROW_BG.removed });
        lines.push({ row: r, side: "right", segs: r.right, num: `${r.rightNum ?? ""}`, bg: ROW_BG.added });
      }
    }
    return (
      <div className="flex gap-2">
        <div className={`w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] ${wrap ? "" : "overflow-x-auto"}`}>
        {lines.map((l, i) => {
          const isFirstOfBlock = l.row.blockId !== null && (i === 0 || lines[i - 1].row.blockId !== l.row.blockId);
          return (
            <div key={i} ref={isFirstOfBlock ? refCb(l.row.blockId) : undefined}
              className={`flex ${l.bg} ${ring(l.row)}`}>
              {showLineNumbers && <span className={numCls}>{l.num}</span>}
              <span className="w-5 shrink-0 select-none text-center font-mono text-[12px] text-[var(--txt-2)]">
                {l.bg === ROW_BG.removed ? "−" : l.bg === ROW_BG.added ? "+" : ""}
              </span>
              <span className={`flex-1 ${cellCls}`}><Segs segs={l.segs} side={l.side} showWs={showWhitespace} /></span>
            </div>
          );
        })}
        </div>
        {minimap}
      </div>
    );
  }

  const minimap = showMinimap ? <Minimap rows={rows} /> : null;
  return (
    <div className="flex gap-2">
      <div className={`w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] ${wrap ? "" : "overflow-x-auto"}`}>
      {rows.map((r, i) => {
        const isFirstOfBlock = r.blockId !== null && (i === 0 || rows[i - 1].blockId !== r.blockId);
        const leftBg = r.type === "same" ? ROW_BG.same : r.left === null ? "bg-[var(--surface-2)]" : r.type === "added" ? ROW_BG.same : ROW_BG.removed;
        const rightBg = r.type === "same" ? ROW_BG.same : r.right === null ? "bg-[var(--surface-2)]" : r.type === "removed" ? ROW_BG.same : ROW_BG.added;
        return (
          <div key={i} ref={isFirstOfBlock ? refCb(r.blockId) : undefined}
            className={`grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] divide-x divide-[var(--line)] ${ring(r)}`}>
            <div className={`flex min-w-0 ${leftBg}`}>
              {showLineNumbers && <span className={numCls}>{r.leftNum ?? ""}</span>}
              <span className={`min-w-0 flex-1 ${cellCls}`}><Segs segs={r.left} side="left" showWs={showWhitespace} /></span>
            </div>
            <div className={`flex min-w-0 ${rightBg}`}>
              {showLineNumbers && <span className={numCls}>{r.rightNum ?? ""}</span>}
              <span className={`min-w-0 flex-1 ${cellCls}`}><Segs segs={r.right} side="right" showWs={showWhitespace} /></span>
            </div>
          </div>
        );
      })}
      </div>
      {minimap}
    </div>
  );
}
