"use client";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import ToolPageSections from "@/components/tool/ToolPageSections";
import { Activity } from "lucide-react";

const RANGES = [
  { label:"Severely Underweight", range:"< 16",    color:"#0EA5E9", check:(b:number)=>b<16 },
  { label:"Underweight",          range:"16–18.5",  color:"#6366F1", check:(b:number)=>b>=16&&b<18.5 },
  { label:"Normal",               range:"18.5–25",  color:"#10B981", check:(b:number)=>b>=18.5&&b<25 },
  { label:"Overweight",           range:"25–30",    color:"#F59E0B", check:(b:number)=>b>=25&&b<30 },
  { label:"Obese I",              range:"30–35",    color:"#F97316", check:(b:number)=>b>=30&&b<35 },
  { label:"Obese II",             range:"≥ 35",     color:"#EF4444", check:(b:number)=>b>=35 },
];

export default function Client() {
  const [unit, setUnit] = useState<"metric"|"imperial">("metric");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");

  const bmi = (() => {
    const w = parseFloat(weight);
    if (unit==="metric") { const h=parseFloat(height)/100; if(!w||!h)return null; return w/(h*h); }
    const totalIn = (parseFloat(heightFt)||0)*12+(parseFloat(heightIn)||0);
    if(!w||!totalIn)return null;
    return (w/(totalIn*totalIn))*703;
  })();

  const category = bmi ? RANGES.find(r=>r.check(bmi)) : null;
  const idealMin = (() => { if(unit==="metric"){const h=parseFloat(height)/100;return h?Math.round(18.5*h*h):null;} const i=(parseFloat(heightFt)||0)*12+(parseFloat(heightIn)||0);return i?Math.round((18.5*i*i)/703):null; })();
  const idealMax = (() => { if(unit==="metric"){const h=parseFloat(height)/100;return h?Math.round(24.9*h*h):null;} const i=(parseFloat(heightFt)||0)*12+(parseFloat(heightIn)||0);return i?Math.round((24.9*i*i)/703):null; })();

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main role="main" className="flex-1 px-6 py-6 w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D1FAE5]">
            <Activity size={20} className="text-[#10B981]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--txt)]">BMI Calculator</h1>
            <p className="text-[12px] text-[var(--txt-2)]">Body Mass Index with full health category breakdown</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
            <div className="flex rounded-xl border border-[var(--border)] overflow-hidden w-fit">
              {(["metric","imperial"] as const).map(u=>(
                <button key={u} onClick={()=>setUnit(u)}
                  className={`px-5 py-2 text-[13px] font-medium transition-colors ${unit===u?"bg-accent text-white":"bg-[var(--bg)] text-[var(--txt-2)]"}`}>
                  {u==="metric"?"Metric (kg/cm)":"Imperial (lb/ft)"}
                </button>
              ))}
            </div>
            <div>
              <label className="text-[12px] font-semibold text-[var(--txt-2)] uppercase tracking-wide block mb-1">Weight ({unit==="metric"?"kg":"lbs"})</label>
              <input type="number" value={weight} onChange={e=>setWeight(e.target.value)} placeholder={unit==="metric"?"e.g. 70":"e.g. 154"}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--txt)] text-[14px] focus:outline-none focus:border-accent"/>
            </div>
            {unit==="metric"?(
              <div>
                <label className="text-[12px] font-semibold text-[var(--txt-2)] uppercase tracking-wide block mb-1">Height (cm)</label>
                <input type="number" value={height} onChange={e=>setHeight(e.target.value)} placeholder="e.g. 175"
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--txt)] text-[14px] focus:outline-none focus:border-accent"/>
              </div>
            ):(
              <div>
                <label className="text-[12px] font-semibold text-[var(--txt-2)] uppercase tracking-wide block mb-1">Height</label>
                <div className="flex gap-2">
                  <input type="number" value={heightFt} onChange={e=>setHeightFt(e.target.value)} placeholder="ft"
                    className="flex-1 px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--txt)] text-[14px] focus:outline-none focus:border-accent"/>
                  <input type="number" value={heightIn} onChange={e=>setHeightIn(e.target.value)} placeholder="in"
                    className="flex-1 px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--txt)] text-[14px] focus:outline-none focus:border-accent"/>
                </div>
              </div>
            )}
            {bmi&&category&&(
              <div className="space-y-3 pt-2">
                <div className="rounded-2xl p-5 text-center" style={{background:`${category.color}15`,border:`2px solid ${category.color}40`}}>
                  <p className="text-5xl font-bold" style={{color:category.color}}>{bmi.toFixed(1)}</p>
                  <p className="text-[12px] text-[var(--txt-2)] mt-1">Your BMI</p>
                  <span className="inline-block mt-2 px-4 py-1 rounded-full text-[12px] font-semibold text-white" style={{background:category.color}}>{category.label}</span>
                </div>
                {idealMin&&idealMax&&(
                  <p className="text-[12px] text-[var(--txt-2)] text-center">Ideal weight range: <span className="font-semibold text-[var(--txt)]">{idealMin}–{idealMax} {unit==="metric"?"kg":"lbs"}</span></p>
                )}
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-2">
            <h3 className="text-[13px] font-semibold text-[var(--txt)] mb-3">BMI Categories</h3>
            {RANGES.map(r=>(
              <div key={r.label} className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${category?.label===r.label?"ring-2 scale-[1.02]":""}`}
                style={{background:`${r.color}10`}}>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{background:r.color}}/>
                  <span className="text-[13px] font-medium text-[var(--txt)]">{r.label}</span>
                </div>
                <span className="text-[12px] text-[var(--txt-2)] font-mono">{r.range}</span>
              </div>
            ))}
          </div>
        </div>
        <ToolPageSections
          howToSteps={[
            {title:"Choose Units",desc:"Pick Metric (kg/cm) or Imperial (lb/ft)."},
            {title:"Enter Weight & Height",desc:"Fill in your measurements."},
            {title:"See Results",desc:"Your BMI, category and ideal weight range appear instantly."},
          ]}
          faqs={[
            {q:"What is a healthy BMI?",a:"18.5 to 24.9 is considered normal and healthy."},
            {q:"Is BMI accurate for everyone?",a:"BMI is a general indicator. May not be accurate for athletes, elderly or children."},
            {q:"Is my data stored?",a:"No. All calculations run entirely in your browser."},
          ]}
          relatedTools={["age-calculator","unit-converter","percentage-calculator"]}
        />
      </main>
    </div>
  );
}
