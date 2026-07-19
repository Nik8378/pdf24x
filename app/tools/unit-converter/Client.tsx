"use client";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import ToolPageSections from "@/components/tool/ToolPageSections";
import { Ruler, ArrowLeftRight, Check, X } from "lucide-react";

type Category = "length"|"weight"|"temperature"|"speed"|"area"|"volume";

const CATS: Record<Category,{label:string;icon:string;color:string;bg:string;units:{name:string;toBase:(v:number)=>number;fromBase:(v:number)=>number}[]}> = {
  length:      { label:"Length",      icon:"📏", color:"text-[#6366F1]", bg:"bg-[#EEF2FF]", units:[
    {name:"Meter (m)",toBase:v=>v,fromBase:v=>v},{name:"Kilometer (km)",toBase:v=>v*1000,fromBase:v=>v/1000},
    {name:"Centimeter (cm)",toBase:v=>v/100,fromBase:v=>v*100},{name:"Millimeter (mm)",toBase:v=>v/1000,fromBase:v=>v*1000},
    {name:"Mile (mi)",toBase:v=>v*1609.34,fromBase:v=>v/1609.34},{name:"Yard (yd)",toBase:v=>v*0.9144,fromBase:v=>v/0.9144},
    {name:"Foot (ft)",toBase:v=>v*0.3048,fromBase:v=>v/0.3048},{name:"Inch (in)",toBase:v=>v*0.0254,fromBase:v=>v/0.0254},
  ]},
  weight:      { label:"Weight",      icon:"⚖️", color:"text-[#10B981]", bg:"bg-[#D1FAE5]", units:[
    {name:"Kilogram (kg)",toBase:v=>v,fromBase:v=>v},{name:"Gram (g)",toBase:v=>v/1000,fromBase:v=>v*1000},
    {name:"Milligram (mg)",toBase:v=>v/1e6,fromBase:v=>v*1e6},{name:"Pound (lb)",toBase:v=>v*0.453592,fromBase:v=>v/0.453592},
    {name:"Ounce (oz)",toBase:v=>v*0.0283495,fromBase:v=>v/0.0283495},{name:"Ton (metric)",toBase:v=>v*1000,fromBase:v=>v/1000},
  ]},
  temperature: { label:"Temperature", icon:"🌡️", color:"text-[#EF4444]", bg:"bg-[#FEE2E2]", units:[
    {name:"Celsius (°C)",toBase:v=>v,fromBase:v=>v},{name:"Fahrenheit (°F)",toBase:v=>(v-32)*5/9,fromBase:v=>v*9/5+32},
    {name:"Kelvin (K)",toBase:v=>v-273.15,fromBase:v=>v+273.15},
  ]},
  speed:       { label:"Speed",       icon:"🚀", color:"text-[#F59E0B]", bg:"bg-[#FEF3C7]", units:[
    {name:"m/s",toBase:v=>v,fromBase:v=>v},{name:"km/h",toBase:v=>v/3.6,fromBase:v=>v*3.6},
    {name:"mph",toBase:v=>v*0.44704,fromBase:v=>v/0.44704},{name:"knot",toBase:v=>v*0.514444,fromBase:v=>v/0.514444},
  ]},
  area:        { label:"Area",        icon:"📐", color:"text-[#8B5CF6]", bg:"bg-[#EDE9FE]", units:[
    {name:"Sq Meter (m²)",toBase:v=>v,fromBase:v=>v},{name:"Sq Kilometer (km²)",toBase:v=>v*1e6,fromBase:v=>v/1e6},
    {name:"Sq Foot (ft²)",toBase:v=>v*0.092903,fromBase:v=>v/0.092903},
    {name:"Acre",toBase:v=>v*4046.86,fromBase:v=>v/4046.86},{name:"Hectare (ha)",toBase:v=>v*10000,fromBase:v=>v/10000},
  ]},
  volume:      { label:"Volume",      icon:"🧪", color:"text-[#0EA5E9]", bg:"bg-[#E0F2FE]", units:[
    {name:"Liter (L)",toBase:v=>v,fromBase:v=>v},{name:"Milliliter (mL)",toBase:v=>v/1000,fromBase:v=>v*1000},
    {name:"Cubic Meter (m³)",toBase:v=>v*1000,fromBase:v=>v/1000},
    {name:"Gallon (US)",toBase:v=>v*3.78541,fromBase:v=>v/3.78541},{name:"Fluid Oz",toBase:v=>v*0.0295735,fromBase:v=>v/0.0295735},
  ]},
};

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1a1917] text-white shadow-2xl text-[13px] font-medium">
      <Check size={15} className="text-green-400 shrink-0" />{msg}
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100"><X size={13}/></button>
    </div>
  );
}

export default function Client() {
  const [cat, setCat] = useState<Category>("length");
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(1);
  const [input, setInput] = useState("1");
  const [toast, setToast] = useState<string|null>(null);

  const units = CATS[cat].units;
  const result = (() => {
    const v = parseFloat(input);
    if (isNaN(v)) return "";
    return parseFloat(units[toIdx].fromBase(units[fromIdx].toBase(v)).toPrecision(8)).toString();
  })();

  const swap = () => { setFromIdx(toIdx); setToIdx(fromIdx); };
  const copy = () => { navigator.clipboard.writeText(result); setToast("Result copied!"); setTimeout(() => setToast(null), 5000); };

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main role="main" className="flex-1 px-6 py-6 w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${CATS[cat].bg}`}>
            <Ruler size={20} className={CATS[cat].color} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--txt)]">Unit Converter</h1>
            <p className="text-[12px] text-[var(--txt-2)]">Convert between any units instantly</p>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(Object.keys(CATS) as Category[]).map(k => (
            <button key={k} onClick={() => { setCat(k); setFromIdx(0); setToIdx(1); setInput("1"); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium transition-all ${cat===k ? `${CATS[k].bg} ${CATS[k].color} shadow-sm` : "border border-[var(--border)] text-[var(--txt-2)] hover:bg-[var(--bg-2)]"}`}>
              <span>{CATS[k].icon}</span> {CATS[k].label}
            </button>
          ))}
        </div>

        <div className="max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[12px] font-semibold text-[var(--txt-2)] uppercase tracking-wide">From</label>
              <select value={fromIdx} onChange={e => setFromIdx(+e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--txt)] text-[13px] focus:outline-none focus:border-accent">
                {units.map((u,i) => <option key={i} value={i}>{u.name}</option>)}
              </select>
              <input type="number" value={input} onChange={e => setInput(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--txt)] text-[18px] font-bold focus:outline-none focus:border-accent" />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-semibold text-[var(--txt-2)] uppercase tracking-wide">To</label>
              <select value={toIdx} onChange={e => setToIdx(+e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--txt)] text-[13px] focus:outline-none focus:border-accent">
                {units.map((u,i) => <option key={i} value={i}>{u.name}</option>)}
              </select>
              <div onClick={copy} title="Click to copy"
                className={`w-full px-3 py-3 rounded-xl border-2 border-accent ${CATS[cat].bg} text-[18px] font-bold cursor-pointer select-all ${CATS[cat].color} min-h-[52px] flex items-center`}>
                {result || "—"}
              </div>
            </div>
          </div>
          <button onClick={swap}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--border)] text-[var(--txt-2)] text-[13px] font-medium hover:bg-[var(--bg-2)] transition-colors">
            <ArrowLeftRight size={15}/> Swap Units
          </button>
          {result && (
            <div className={`rounded-xl ${CATS[cat].bg} px-4 py-3 text-center`}>
              <p className="text-[13px] font-medium text-[var(--txt-2)]">
                <span className="font-bold text-[var(--txt)]">{input} {units[fromIdx].name}</span>
                {" = "}
                <span className={`font-bold ${CATS[cat].color}`}>{result} {units[toIdx].name}</span>
              </p>
            </div>
          )}
        </div>
        <ToolPageSections
          howToSteps={[
            {title:"Pick Category",desc:"Choose Length, Weight, Temperature, Speed, Area or Volume."},
            {title:"Select Units",desc:"Pick the From and To units from the dropdowns."},
            {title:"Enter Value",desc:"Type your value — the result appears instantly. Click the result to copy it."},
          ]}
          faqs={[
            {q:"Which categories are supported?",a:"Length, Weight, Temperature, Speed, Area and Volume."},
            {q:"How accurate are conversions?",a:"Accurate to 8 significant figures."},
            {q:"Can I swap units?",a:"Yes — click Swap Units to reverse the conversion instantly."},
          ]}
          relatedTools={["percentage-calculator","bmi-calculator","age-calculator"]}
        />
      </main>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
