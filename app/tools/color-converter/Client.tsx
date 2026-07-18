"use client";
import { useState, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import ToolPageSections from "@/components/tool/ToolPageSections";
import { Palette, Copy, Check, X } from "lucide-react";

function hexToRgb(hex:string){return{r:parseInt(hex.slice(1,3),16),g:parseInt(hex.slice(3,5),16),b:parseInt(hex.slice(5,7),16)};}
function rgbToHsl(r:number,g:number,b:number){
  r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b);let h=0,s=0,l=(max+min)/2;
  if(max!==min){const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break;}h/=6;}
  return{h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};
}
function rgbToHex(r:number,g:number,b:number){return"#"+[r,g,b].map(v=>v.toString(16).padStart(2,"0")).join("");}
function hslToRgb(h:number,s:number,l:number){s/=100;l/=100;const a=s*Math.min(l,1-l);const f=(n:number)=>{const k=(n+h/30)%12;return Math.round((l-a*Math.max(-1,Math.min(k-3,9-k,1)))*255);};return{r:f(0),g:f(8),b:f(4)};}
function getLuminance(r:number,g:number,b:number){return(0.299*r+0.587*g+0.114*b)/255;}

const PRESETS = [
  {name:"Coral",hex:"#FF6B5E"},{name:"Blue",hex:"#3B82F6"},{name:"Green",hex:"#10B981"},
  {name:"Amber",hex:"#F59E0B"},{name:"Purple",hex:"#8B5CF6"},{name:"Pink",hex:"#EC4899"},
  {name:"Black",hex:"#000000"},{name:"White",hex:"#FFFFFF"},{name:"Gray",hex:"#6B7280"},
  {name:"Red",hex:"#EF4444"},{name:"Indigo",hex:"#6366F1"},{name:"Teal",hex:"#14B8A6"},
];

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1a1917] text-white shadow-2xl text-[13px] font-medium">
      <Check size={15} className="text-green-400 shrink-0"/>{msg}
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100"><X size={13}/></button>
    </div>
  );
}

export default function Client() {
  const [hex, setHex] = useState("#FF6B5E");
  const [toast, setToast] = useState<string|null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const lum = getLuminance(rgb.r, rgb.g, rgb.b);
  const textColor = lum > 0.5 ? "#1a1917" : "#ffffff";

  const showToast = (msg:string) => { setToast(msg); if (timer.current) if (timer.current) clearTimeout(timer.current); timer.current=setTimeout(()=>setToast(null),5000); };
  const copy = (val:string) => { navigator.clipboard.writeText(val); showToast(`Copied: ${val}`); };

  const updateFromRgb = (r:number,g:number,b:number) => {
    const clamp=(v:number)=>Math.max(0,Math.min(255,v));
    setHex(rgbToHex(clamp(r),clamp(g),clamp(b)));
  };
  const updateFromHsl = (h:number,s:number,l:number) => { const {r,g,b}=hslToRgb(h,s,l); setHex(rgbToHex(r,g,b)); };

  const formats = [
    { label:"HEX",  val:hex.toUpperCase() },
    { label:"RGB",  val:`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label:"HSL",  val:`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label:"CSS",  val:`color: ${hex.toUpperCase()};` },
    { label:"RGB Raw", val:`${rgb.r}, ${rgb.g}, ${rgb.b}` },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar/>
      <main className="flex-1 px-6 py-6 w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FEE2E2]">
            <Palette size={20} className="text-[#EF4444]"/>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--txt)]">Color Converter</h1>
            <p className="text-[12px] text-[var(--txt-2)]">Convert HEX ↔ RGB ↔ HSL with live preview</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
          {/* Picker */}
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden border border-[var(--border)]" style={{background:hex}}>
              <div className="h-36 flex items-end p-4">
                <span className="text-[13px] font-bold opacity-80" style={{color:textColor}}>{hex.toUpperCase()}</span>
              </div>
              <div className="p-4 bg-[var(--surface)] space-y-3">
                <div className="flex items-center gap-3">
                  <input type="color" value={hex} onChange={e=>setHex(e.target.value)}
                    className="h-10 w-12 rounded-xl border border-[var(--border)] cursor-pointer p-0.5 bg-transparent"/>
                  <input type="text" value={hex} onChange={e=>{ if(/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) setHex(e.target.value); }}
                    className="flex-1 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--txt)] font-mono text-[14px] focus:outline-none focus:border-accent"/>
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-[11px] font-semibold text-[var(--txt-2)] uppercase tracking-wide mb-3">Quick Presets</p>
              <div className="grid grid-cols-6 gap-2">
                {PRESETS.map(p=>(
                  <button key={p.hex} onClick={()=>setHex(p.hex)} title={p.name}
                    className={`h-8 w-8 rounded-xl border-2 transition-all hover:scale-110 ${hex.toLowerCase()===p.hex.toLowerCase()?"border-accent scale-110":"border-transparent"}`}
                    style={{background:p.hex}}/>
                ))}
              </div>
            </div>
          </div>

          {/* Sliders */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
            <p className="text-[12px] font-semibold text-[var(--txt-2)] uppercase tracking-wide">RGB Sliders</p>
            {([["R","r",rgb.r,"#EF4444"],[" G","g",rgb.g,"#10B981"],["B","b",rgb.b,"#3B82F6"]] as [string,string,number,string][]).map(([label,key,val,color])=>(
              <div key={key}>
                <div className="flex justify-between mb-1">
                  <span className="text-[12px] font-semibold" style={{color}}>{label.trim()}</span>
                  <span className="text-[12px] font-mono text-[var(--txt)]">{val}</span>
                </div>
                <input type="range" min={0} max={255} value={val}
                  style={{"--accent-color":color} as React.CSSProperties}
                  onChange={e=>updateFromRgb(key==="r"?+e.target.value:rgb.r,key==="g"?+e.target.value:rgb.g,key==="b"?+e.target.value:rgb.b)}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer" />
              </div>
            ))}
            <div className="border-t border-[var(--border)] pt-4">
              <p className="text-[12px] font-semibold text-[var(--txt-2)] uppercase tracking-wide mb-3">HSL Sliders</p>
              {([["H°","h",hsl.h,360,"#6366F1"],["S%","s",hsl.s,100,"#EC4899"],["L%","l",hsl.l,100,"#F59E0B"]] as [string,string,number,number,string][]).map(([label,key,val,max,color])=>(
                <div key={key} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-[12px] font-semibold" style={{color}}>{label}</span>
                    <span className="text-[12px] font-mono text-[var(--txt)]">{val}</span>
                  </div>
                  <input type="range" min={0} max={max} value={val}
                    onChange={e=>updateFromHsl(key==="h"?+e.target.value:hsl.h,key==="s"?+e.target.value:hsl.s,key==="l"?+e.target.value:hsl.l)}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[var(--accent)]"/>
                </div>
              ))}
            </div>
          </div>

          {/* Formats */}
          <div className="space-y-3">
            <p className="text-[12px] font-semibold text-[var(--txt-2)] uppercase tracking-wide">All Formats</p>
            {formats.map(({label,val})=>(
              <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 flex items-center justify-between gap-3 hover:border-accent/50 transition-colors">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-[var(--txt-2)] uppercase tracking-wide">{label}</p>
                  <p className="text-[13px] font-mono text-[var(--txt)] truncate">{val}</p>
                </div>
                <button onClick={()=>copy(val)} className="shrink-0 p-2 rounded-lg hover:bg-[var(--bg-2)] transition-colors">
                  <Copy size={14} className="text-[var(--txt-2)]"/>
                </button>
              </div>
            ))}
            {/* Contrast check */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-[10px] font-semibold text-[var(--txt-2)] uppercase tracking-wide mb-2">Text on this color</p>
              <div className="flex gap-2">
                {["#FFFFFF","#000000","#1a1917"].map(c=>(
                  <div key={c} className="flex-1 rounded-lg py-2 text-center text-[12px] font-bold" style={{background:hex,color:c}}>Aa</div>
                ))}
              </div>
              <p className="text-[11px] text-[var(--txt-2)] mt-2">Best contrast: <span className="font-semibold text-[var(--txt)]">{lum>0.5?"Dark text":"Light text"}</span></p>
            </div>
          </div>
        </div>
        <ToolPageSections
          howToSteps={[
            {title:"Pick a Color",desc:"Use the color picker, type a HEX code, or click a preset."},
            {title:"Adjust with Sliders",desc:"Fine-tune using RGB or HSL sliders."},
            {title:"Copy Any Format",desc:"Click copy next to HEX, RGB, HSL or CSS values."},
          ]}
          faqs={[
            {q:"What formats are supported?",a:"HEX, RGB, HSL and CSS. All update live."},
            {q:"Can I enter a custom HEX?",a:"Yes — type any valid 6-digit HEX code in the input."},
            {q:"What is the contrast checker?",a:"It shows how text looks on your chosen color to help with accessibility."},
          ]}
          relatedTools={["password-generator","qr-code-generator","unit-converter"]}
        />
      </main>
      {toast && <Toast msg={toast} onClose={()=>setToast(null)}/>}
    </div>
  );
}
