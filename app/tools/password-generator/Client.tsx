"use client";
import { useState, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import ToolPageSections from "@/components/tool/ToolPageSections";
import AdSlot from "@/components/ads/AdSlot";
import { KeyRound, Copy, Check, RefreshCw, ShieldCheck } from "lucide-react";

const UPPER="ABCDEFGHIJKLMNOPQRSTUVWXYZ",LOWER="abcdefghijklmnopqrstuvwxyz",NUMS="0123456789",SYMS="!@#$%^&*()_+-=[]{}|;:,.<>?";

function strength(p:string){
  let s=0;
  if(p.length>=8)s++;if(p.length>=12)s++;if(p.length>=16)s++;
  if(/[A-Z]/.test(p))s++;if(/[a-z]/.test(p))s++;if(/[0-9]/.test(p))s++;if(/[^A-Za-z0-9]/.test(p))s++;
  if(s<=2)return{label:"Weak",color:"bg-red-500",w:"25%"};
  if(s<=4)return{label:"Fair",color:"bg-orange-400",w:"50%"};
  if(s<=5)return{label:"Good",color:"bg-yellow-400",w:"75%"};
  return{label:"Strong",color:"bg-green-500",w:"100%"};
}

export default function Client() {
  const [len,setLen]=useState(16);
  const [upper,setUpper]=useState(true);
  const [lower,setLower]=useState(true);
  const [nums,setNums]=useState(true);
  const [syms,setSyms]=useState(true);
  const [qty,setQty]=useState(1);
  const [passwords,setPasswords]=useState<string[]>([]);
  const [copied,setCopied]=useState<string|null>(null);

  const generate=useCallback(()=>{
    let chars="";
    if(upper)chars+=UPPER;if(lower)chars+=LOWER;if(nums)chars+=NUMS;if(syms)chars+=SYMS;
    if(!chars)chars=LOWER+NUMS;
    setPasswords(Array.from({length:qty},()=>Array.from({length:len},()=>chars[Math.floor(Math.random()*chars.length)]).join("")));
  },[len,upper,lower,nums,syms,qty]);

  const copy=(p:string)=>{navigator.clipboard.writeText(p);setCopied(p);setTimeout(()=>setCopied(null),2000);};

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main role="main" className="flex-1 px-6 py-6 w-full">
        <div className="flex items-center gap-2 mb-6">
          <KeyRound size={22} className="text-accent" />
          <h1 className="text-xl font-bold text-[var(--txt)]">Password Generator</h1>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-[12px] font-semibold text-[var(--txt-2)] uppercase tracking-wide">Length</label>
              <span className="text-[13px] font-bold text-accent">{len}</span>
            </div>
            <input type="range" min={4} max={64} value={len} onChange={e=>setLen(+e.target.value)} className="w-full accent-[var(--accent)]" />
            <div className="flex justify-between text-[10px] text-[var(--txt-2)] mt-0.5"><span>4</span><span>64</span></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[{label:"Uppercase (A-Z)",val:upper,set:setUpper},{label:"Lowercase (a-z)",val:lower,set:setLower},{label:"Numbers (0-9)",val:nums,set:setNums},{label:"Symbols (!@#$)",val:syms,set:setSyms}].map(({label,val,set})=>(
              <label key={label} className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={val} onChange={e=>set(e.target.checked)} className="w-4 h-4 accent-[var(--accent)] rounded" />
                <span className="text-[13px] text-[var(--txt)]">{label}</span>
              </label>
            ))}
          </div>
          <div>
            <label className="text-[12px] font-semibold text-[var(--txt-2)] uppercase tracking-wide block mb-1">How many?</label>
            <div className="flex gap-1">
              {[1,5,10,20].map(n=>(
                <button key={n} onClick={()=>setQty(n)}
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${qty===n?"bg-accent text-white":"border border-[var(--border)] text-[var(--txt-2)]"}`}>{n}</button>
              ))}
            </div>
          </div>
          <button onClick={generate}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent text-white font-semibold text-[14px] hover:bg-accent/90 transition-all">
            <RefreshCw size={15}/> Generate Password{qty>1?"s":""}
          </button>
          {passwords.length>0 && (
            <div className="space-y-2">
              {passwords.map((p,i)=>{
                const s=strength(p);
                return (
                  <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-[13px] font-mono text-[var(--txt)] break-all">{p}</code>
                      <button onClick={()=>copy(p)} className="shrink-0 p-1.5 rounded-lg hover:bg-[var(--bg-2)] transition-colors">
                        {copied===p?<Check size={14} className="text-green-500"/>:<Copy size={14} className="text-[var(--txt-2)]"/>}
                      </button>
                    </div>
                    <div className="mt-2">
                      <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${s.color}`} style={{width:s.w}}/>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <ShieldCheck size={11} className="text-[var(--txt-2)]"/>
                        <span className="text-[11px] text-[var(--txt-2)]">{s.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <AdSlot slot="1234567892" format="auto" />
        <ToolPageSections
          howToSteps={[
            {title: "Set Your Options", desc: "Choose password length and character types to include."},
            {title: "Pick Quantity", desc: "Generate 1, 5, 10 or 20 passwords at once."},
            {title: "Copy and Use", desc: "Click generate then copy any password with one click."},
          ]}
          faqs={[
            {q:"Are passwords stored?",a:"No. Generated entirely in your browser. Nothing sent to any server."},
            {q:"What makes a strong password?",a:"At least 12 characters with uppercase, lowercase, numbers and symbols."},
            {q:"Can I use these for my accounts?",a:"Yes — save them in a password manager like Bitwarden or 1Password."},
          ]}
          relatedTools={["age-calculator","emi-calculator","qr-code-generator"]}
        />
      </main>
    </div>
  );
}
