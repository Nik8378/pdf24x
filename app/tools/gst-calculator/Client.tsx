"use client";
import { useState, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import ToolPageSections from "@/components/tool/ToolPageSections";
import { IndianRupee, Copy, Check, X, PlusCircle, MinusCircle } from "lucide-react";

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1a1917] text-white shadow-2xl text-[13px] font-medium">
      <Check size={15} className="text-green-400 shrink-0"/>{msg}
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100"><X size={13}/></button>
    </div>
  );
}

const SLABS = [3,5,12,18,28];

export default function Client() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState(18);
  const [mode, setMode] = useState<"add"|"remove">("add");
  const [toast, setToast] = useState<string|null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fmt = (n:number) => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(n);
  const showToast = (msg:string) => { setToast(msg); if (timer.current) clearTimeout(timer.current); timer.current=setTimeout(()=>setToast(null),5000); };
  const copy = (val:string) => { navigator.clipboard.writeText(val); showToast("Copied to clipboard!"); };

  const result = (() => {
    const a = parseFloat(amount);
    if(!a) return null;
    if(mode==="add") { const gst=(a*rate)/100; return {original:a,gst,cgst:gst/2,sgst:gst/2,total:a+gst}; }
    const original=(a*100)/(100+rate), gst=a-original;
    return {original,gst,cgst:gst/2,sgst:gst/2,total:a};
  })();

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar/>
      <main role="main" className="flex-1 px-6 py-6 w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EDE9FE]">
            <IndianRupee size={20} className="text-[#8B5CF6]"/>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--txt)]">GST Calculator</h1>
            <p className="text-[12px] text-[var(--txt-2)]">Add or remove GST with CGST & SGST split</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5">
            {/* Mode */}
            <div className="grid grid-cols-2 gap-2">
              {([["add","Add GST","➕"],["remove","Remove GST","➖"]] as const).map(([m,label,icon])=>(
                <button key={m} onClick={()=>setMode(m)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold transition-all ${mode===m?"bg-accent text-white shadow-sm":"border border-[var(--border)] text-[var(--txt-2)] hover:bg-[var(--bg-2)]"}`}>
                  {icon} {label}
                </button>
              ))}
            </div>
            {/* Amount */}
            <div>
              <label className="text-[12px] font-semibold text-[var(--txt-2)] uppercase tracking-wide block mb-1">
                {mode==="add"?"Original Amount (₹)":"GST Inclusive Amount (₹)"}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--txt-2)] font-semibold">₹</span>
                <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="e.g. 1000"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--txt)] text-[16px] font-semibold focus:outline-none focus:border-accent"/>
              </div>
            </div>
            {/* Slabs */}
            <div>
              <label className="text-[12px] font-semibold text-[var(--txt-2)] uppercase tracking-wide block mb-2">GST Rate</label>
              <div className="flex gap-2 flex-wrap">
                {SLABS.map(s=>(
                  <button key={s} onClick={()=>setRate(s)}
                    className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${rate===s?"bg-accent text-white shadow-sm":"border border-[var(--border)] text-[var(--txt-2)] hover:bg-[var(--bg-2)]"}`}>
                    {s}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          {result ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-3">
              <h3 className="text-[13px] font-semibold text-[var(--txt)] mb-1">Breakdown</h3>
              {[
                {label:mode==="add"?"Original Amount":"Pre-GST Amount",val:fmt(result.original),accent:false},
                {label:`CGST @ ${rate/2}%`,val:fmt(result.cgst),accent:false},
                {label:`SGST @ ${rate/2}%`,val:fmt(result.sgst),accent:false},
                {label:`Total GST @ ${rate}%`,val:fmt(result.gst),accent:false,bold:true},
                {label:mode==="add"?"Total (with GST)":"GST Inclusive Amount",val:fmt(result.total),accent:true},
              ].map(({label,val,accent,bold})=>(
                <div key={label} className={`flex items-center justify-between px-4 py-3 rounded-xl ${accent?"bg-accent/10 border-2 border-accent/30":"bg-[var(--bg)] border border-[var(--border)]"}`}>
                  <span className={`text-[13px] ${bold?"font-bold text-[var(--txt)]":"text-[var(--txt-2)]"}`}>{label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[14px] font-bold ${accent?"text-accent":"text-[var(--txt)]"}`}>{val}</span>
                    <button onClick={()=>copy(val)} className="p-1 rounded-lg hover:bg-black/10 opacity-50 hover:opacity-100 transition-all">
                      <Copy size={12}/>
                    </button>
                  </div>
                </div>
              ))}
              <div className="h-3 rounded-full overflow-hidden bg-[var(--border)] flex mt-2">
                <div className="bg-accent h-full transition-all" style={{width:`${(result.original/result.total*100).toFixed(0)}%`}}/>
                <div className="bg-[#8B5CF6] h-full transition-all" style={{width:`${(result.gst/result.total*100).toFixed(0)}%`}}/>
              </div>
              <div className="flex justify-between text-[11px] text-[var(--txt-2)]">
                <span>● Amount {(result.original/result.total*100).toFixed(1)}%</span>
                <span>● GST {(result.gst/result.total*100).toFixed(1)}%</span>
              </div>
            </div>
          ):(
            <div className="rounded-2xl border border-dashed border-[var(--border)] p-6 flex items-center justify-center text-[var(--txt-2)] text-[13px] opacity-50">
              Enter an amount to see the breakdown
            </div>
          )}
        </div>
        <ToolPageSections
          howToSteps={[
            {title:"Choose Mode",desc:"Add GST to get the total, or Remove GST to find the pre-GST price."},
            {title:"Enter Amount",desc:"Type the amount in the input field."},
            {title:"Pick GST Slab",desc:"Select 3%, 5%, 12%, 18% or 28%. CGST and SGST split shown instantly."},
          ]}
          faqs={[
            {q:"What GST rates are supported?",a:"3%, 5%, 12%, 18% and 28% — all standard Indian GST slabs."},
            {q:"What is CGST and SGST?",a:"GST is split equally into CGST (Central) and SGST (State) for intra-state sales."},
            {q:"Can I do reverse GST?",a:"Yes — use Remove GST mode to find the pre-GST price from an inclusive amount."},
          ]}
          relatedTools={["percentage-calculator","emi-calculator","age-calculator"]}
        />
      </main>
      {toast && <Toast msg={toast} onClose={()=>setToast(null)}/>}
    </div>
  );
}
