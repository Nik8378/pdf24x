"use client";
import { useState, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import ToolPageSections from "@/components/tool/ToolPageSections";
import { Percent, Copy, Check, X } from "lucide-react";

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1a1917] text-white shadow-2xl text-[13px] font-medium">
      <Check size={15} className="text-green-400 shrink-0" />{msg}
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100"><X size={13}/></button>
    </div>
  );
}

function CalcCard({ title, emoji, color, bg, result, unit="", children }: { title:string;emoji:string;color:string;bg:string;result:string|null;unit?:string;children:React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { if(!result)return; navigator.clipboard.writeText(result+unit); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <h2 className="font-semibold text-[var(--txt)] text-[14px]">{title}</h2>
      </div>
      {children}
      {result !== null && (
        <div className={`flex items-center justify-between rounded-xl ${bg} px-4 py-3`}>
          <span className={`text-2xl font-bold ${color}`}>{result}{unit}</span>
          <button onClick={copy} className="p-1.5 rounded-lg hover:bg-black/10 transition-colors">
            {copied ? <Check size={14} className="text-green-500"/> : <Copy size={14} className="opacity-50"/>}
          </button>
        </div>
      )}
    </div>
  );
}

const inp = (val:string, set:(v:string)=>void, ph:string) => (
  <input type="number" value={val} onChange={e=>set(e.target.value)} placeholder={ph}
    className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--txt)] text-[14px] focus:outline-none focus:border-accent" />
);

export default function Client() {
  const [a1,setA1]=useState(""); const [b1,setB1]=useState("");
  const [a2,setA2]=useState(""); const [b2,setB2]=useState("");
  const [a3,setA3]=useState(""); const [b3,setB3]=useState("");
  const [a4,setA4]=useState(""); const [b4,setB4]=useState("");
  const [a5,setA5]=useState(""); const [b5,setB5]=useState("");

  const r1 = a1&&b1 ? ((+a1/100)*+b1).toFixed(2) : null;
  const r2 = a2&&b2 ? ((+a2/+b2)*100).toFixed(2) : null;
  const r3 = a3&&b3 ? (((+b3-+a3)/+a3)*100).toFixed(2) : null;
  const r4 = a4&&b4 ? (+a4+(+a4*+b4)/100).toFixed(2) : null;
  const r5 = a5&&b5 ? (+a5-(+a5*+b5)/100).toFixed(2) : null;

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main role="main" className="flex-1 px-6 py-6 w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FEF3C7]">
            <Percent size={20} className="text-[#F59E0B]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--txt)]">Percentage Calculator</h1>
            <p className="text-[12px] text-[var(--txt-2)]">5 types of percentage calculations — all instant</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <CalcCard title="X% of Y" emoji="🔢" color="text-[#6366F1]" bg="bg-[#EEF2FF]" result={r1}>
            <div className="flex items-center gap-2">
              {inp(a1,setA1,"X (e.g. 20)")}
              <span className="text-[var(--txt-2)] shrink-0 text-[13px]">% of</span>
              {inp(b1,setB1,"Y (e.g. 500)")}
            </div>
          </CalcCard>
          <CalcCard title="X is what % of Y?" emoji="❓" color="text-[#10B981]" bg="bg-[#D1FAE5]" result={r2} unit="%">
            <div className="flex items-center gap-2">
              {inp(a2,setA2,"X (e.g. 80)")}
              <span className="text-[var(--txt-2)] shrink-0 text-[13px]">of</span>
              {inp(b2,setB2,"Y (e.g. 200)")}
            </div>
          </CalcCard>
          <CalcCard title="% Change" emoji="📈" color={r3&&+r3>=0?"text-[#10B981]":"text-[#EF4444]"} bg={r3&&+r3>=0?"bg-[#D1FAE5]":"bg-[#FEE2E2]"} result={r3} unit="%">
            <div className="flex items-center gap-2">
              {inp(a3,setA3,"From")}
              <span className="text-[var(--txt-2)] shrink-0 text-[13px]">→</span>
              {inp(b3,setB3,"To")}
            </div>
            {r3 && <p className="text-[11px] text-[var(--txt-2)]">{+r3>=0?"▲ Increase":"▼ Decrease"}</p>}
          </CalcCard>
          <CalcCard title="Add % to Amount" emoji="➕" color="text-[#F59E0B]" bg="bg-[#FEF3C7]" result={r4}>
            <div className="flex items-center gap-2">
              {inp(b4,setB4,"Amount")}
              <span className="text-[var(--txt-2)] shrink-0 text-[13px]">+</span>
              {inp(a4,setA4,"% (e.g. 18)")}
            </div>
          </CalcCard>
          <CalcCard title="Remove % from Amount" emoji="➖" color="text-[#EF4444]" bg="bg-[#FEE2E2]" result={r5}>
            <div className="flex items-center gap-2">
              {inp(b5,setB5,"Amount")}
              <span className="text-[var(--txt-2)] shrink-0 text-[13px]">−</span>
              {inp(a5,setA5,"% (e.g. 10)")}
            </div>
          </CalcCard>
        </div>
        <ToolPageSections
          howToSteps={[
            {title:"Pick a Calculation",desc:"Choose from 5 percentage formulas."},
            {title:"Enter Values",desc:"Fill in the numbers — results appear instantly."},
            {title:"Copy Result",desc:"Click the copy icon on any result card."},
          ]}
          faqs={[
            {q:"What calculations are supported?",a:"X% of Y, X is what % of Y, % change, add % and remove %."},
            {q:"Can I calculate GST?",a:"Yes — use Add % with 18 for GST calculation."},
            {q:"Is this free?",a:"100% free, no login required."},
          ]}
          relatedTools={["gst-calculator","emi-calculator","unit-converter"]}
        />
      </main>
    </div>
  );
}
