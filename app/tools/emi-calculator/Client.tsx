"use client";
import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import ToolPageSections from "@/components/tool/ToolPageSections";
import AdSlot from "@/components/ads/AdSlot";
import { IndianRupee } from "lucide-react";

export default function Client() {
  const [principal, setPrincipal] = useState("1000000");
  const [rate, setRate]           = useState("8.5");
  const [tenure, setTenure]       = useState("20");
  const [tenureType, setTenureType] = useState<"years"|"months">("years");

  const result = useMemo(()=>{
    const P=parseFloat(principal), r=parseFloat(rate)/(12*100);
    const n=tenureType==="years"?parseFloat(tenure)*12:parseFloat(tenure);
    if(!P||!r||!n) return null;
    const emi=P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
    const total=emi*n;
    return {emi,total,interest:total-P,principal:P};
  },[principal,rate,tenure,tenureType]);

  const fmt=(n:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 px-6 py-6 w-full">
        <div className="flex items-center gap-2 mb-6">
          <IndianRupee size={22} className="text-accent" />
          <h1 className="text-xl font-bold text-[var(--txt)]">EMI Calculator</h1>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <div>
            <label className="text-[12px] font-semibold text-[var(--txt-2)] uppercase tracking-wide block mb-1">Loan Amount (₹)</label>
            <input type="number" value={principal} onChange={e=>setPrincipal(e.target.value)} min="1000" placeholder="e.g. 1000000"
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--txt)] text-[14px] focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-[var(--txt-2)] uppercase tracking-wide block mb-1">Interest Rate (% per annum)</label>
            <input type="number" value={rate} onChange={e=>setRate(e.target.value)} min="0.1" step="0.1" placeholder="e.g. 8.5"
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--txt)] text-[14px] focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-[var(--txt-2)] uppercase tracking-wide block mb-1">Loan Tenure</label>
            <div className="flex gap-2">
              <input type="number" value={tenure} onChange={e=>setTenure(e.target.value)} min="1" placeholder="e.g. 20"
                className="flex-1 px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--txt)] text-[14px] focus:outline-none focus:border-accent" />
              <div className="flex rounded-xl border border-[var(--border)] overflow-hidden">
                {(["years","months"] as const).map(t=>(
                  <button key={t} onClick={()=>setTenureType(t)}
                    className={`px-4 py-2 text-[13px] font-medium transition-colors ${tenureType===t?"bg-accent text-white":"bg-[var(--bg)] text-[var(--txt-2)]"}`}>
                    {t.charAt(0).toUpperCase()+t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {result && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                {label:"Monthly EMI",val:fmt(result.emi),accent:true},
                {label:"Total Interest",val:fmt(result.interest),accent:false},
                {label:"Total Amount",val:fmt(result.total),accent:false},
              ].map(({label,val,accent})=>(
                <div key={label} className={`rounded-xl border p-4 text-center ${accent?"border-accent bg-accent/5":"border-[var(--border)] bg-[var(--bg)]"}`}>
                  <p className={`text-xl font-bold ${accent?"text-accent":"text-[var(--txt)]"}`}>{val}</p>
                  <p className="text-[11px] text-[var(--txt-2)] mt-1">{label}</p>
                </div>
              ))}
              <div className="col-span-1 sm:col-span-3">
                <div className="h-3 rounded-full overflow-hidden bg-[var(--border)] flex">
                  <div className="bg-accent h-full" style={{width:`${(result.principal/result.total*100).toFixed(1)}%`}} />
                  <div className="bg-orange-400 h-full" style={{width:`${(result.interest/result.total*100).toFixed(1)}%`}} />
                </div>
                <div className="flex justify-between text-[11px] text-[var(--txt-2)] mt-1">
                  <span>● Principal {(result.principal/result.total*100).toFixed(1)}%</span>
                  <span>● Interest {(result.interest/result.total*100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <AdSlot slot="1234567891" format="auto" />
        <ToolPageSections
          howToSteps={[
            {title: "Enter Loan Details", desc: "Add loan amount, interest rate per annum and tenure."},
            {title: "Choose Tenure Type", desc: "Select years or months based on your loan term."},
            {title: "See EMI Breakdown", desc: "Instantly see monthly EMI, total interest and total amount."},
          ]}
          faqs={[
            {q:"What is EMI?",a:"EMI is the fixed monthly amount you pay to repay your loan including principal and interest."},
            {q:"Does this work for all loan types?",a:"Yes — home, car, personal loans. Enter any amount, rate, and tenure."},
            {q:"Is GST included?",a:"No. This shows pure EMI. Processing fees vary by lender."},
          ]}
          relatedTools={["age-calculator","password-generator","qr-code-generator"]}
        />
      </main>
    </div>
  );
}
