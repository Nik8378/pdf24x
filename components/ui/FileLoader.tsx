"use client";
import { useEffect, useState } from "react";
import { Loader2, FileText, CheckCircle2 } from "lucide-react";

interface FileLoaderProps {
  isProcessing: boolean;
  fileName?: string;
  stage?: string;
  progress?: number;
}

const STAGES = ["Reading file…","Processing…","Optimising…","Finalising…","Almost done…"];

export function FileLoader({ isProcessing, fileName, stage, progress }: FileLoaderProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [fakeProgress, setFakeProgress] = useState(0);

  useEffect(() => {
    if (!isProcessing) { setCurrentStage(0); setFakeProgress(0); return; }
    const stageTimer = setInterval(() => setCurrentStage(s => s < STAGES.length-1 ? s+1 : s), 1200);
    const progTimer = setInterval(() => {
      setFakeProgress(p => { if(progress!==undefined)return progress; if(p>=90)return p; return p+Math.random()*8; });
    }, 300);
    return () => { clearInterval(stageTimer); clearInterval(progTimer); };
  }, [isProcessing, progress]);

  if (!isProcessing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-2xl p-8 w-full max-w-sm mx-4 space-y-5">
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center">
              <FileText size={28} className="text-accent" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-accent flex items-center justify-center">
              <Loader2 size={14} className="text-white animate-spin" />
            </div>
          </div>
        </div>
        {fileName && <p className="text-center text-[13px] text-[var(--txt-2)] truncate px-2">📄 {fileName}</p>}
        <p className="text-center text-[15px] font-semibold text-[var(--txt)]">{stage || STAGES[currentStage]}</p>
        <div className="space-y-2">
          <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
            <div className="h-full rounded-full bg-accent transition-all duration-300" style={{width:`${Math.min(progress??fakeProgress,99)}%`}} />
          </div>
          <p className="text-right text-[11px] text-[var(--txt-2)]">{Math.min(Math.round(progress??fakeProgress),99)}%</p>
        </div>
        <div className="flex justify-center gap-1.5">
          {STAGES.map((_,i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i<=currentStage?"bg-accent w-4":"bg-[var(--border)] w-1.5"}`} />
          ))}
        </div>
        <p className="text-center text-[11px] text-[var(--txt-2)]">Please don&apos;t close this tab</p>
      </div>
    </div>
  );
}

export function InlineLoader({ stage = "Processing…" }: { stage?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20">
      <Loader2 size={16} className="text-accent animate-spin shrink-0" />
      <span className="text-[13px] font-medium text-accent">{stage}</span>
    </div>
  );
}

export function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
      <CheckCircle2 size={16} className="text-green-500 shrink-0" />
      <span className="text-[13px] font-medium text-green-600">{message}</span>
    </div>
  );
}
