"use client";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import ToolPageSections from "@/components/tool/ToolPageSections";
import AdSlot from "@/components/ads/AdSlot";
import { Calendar } from "lucide-react";

export default function Client() {
  const [dob, setDob] = useState("");
  const [to, setTo]   = useState(new Date().toISOString().slice(0,10));
  const [res, setRes] = useState<null|{y:number;m:number;d:number;hrs:number;mins:number;days:number;next:number}>(null);

  function calc() {
    const birth = new Date(dob), ref = new Date(to);
    if (isNaN(birth.getTime())||isNaN(ref.getTime())||birth>ref) return;
    let y=ref.getFullYear()-birth.getFullYear(), m=ref.getMonth()-birth.getMonth(), d=ref.getDate()-birth.getDate();
    if(d<0){m--;d+=new Date(ref.getFullYear(),ref.getMonth(),0).getDate();}
    if(m<0){y--;m+=12;}
    const days=Math.floor((ref.getTime()-birth.getTime())/(1000*60*60*24));
    const nextB=new Date(ref.getFullYear(),birth.getMonth(),birth.getDate());
    if(nextB<=ref) nextB.setFullYear(ref.getFullYear()+1);
    const next=Math.ceil((nextB.getTime()-ref.getTime())/(1000*60*60*24));
    setRes({y,m,d,hrs:days*24,mins:days*1440,days,next});
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main role="main" className="flex-1 px-6 py-6 w-full">
        <div className="flex items-center gap-2 mb-6">
          <Calendar size={22} className="text-accent" />
          <h1 className="text-xl font-bold text-[var(--txt)]">Age Calculator</h1>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-semibold text-[var(--txt-2)] uppercase tracking-wide block mb-1">Date of Birth</label>
              <input type="date" value={dob} onChange={e=>setDob(e.target.value)} max={to}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--txt)] text-[14px] focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-[var(--txt-2)] uppercase tracking-wide block mb-1">Age At Date</label>
              <input type="date" value={to} onChange={e=>setTo(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--txt)] text-[14px] focus:outline-none focus:border-accent" />
            </div>
          </div>
          <button onClick={calc} disabled={!dob}
            className="w-full py-2.5 rounded-xl bg-accent text-white font-semibold text-[14px] hover:bg-accent/90 disabled:opacity-40 transition-all">
            Calculate Age
          </button>
          {res && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {[
                {label:"Years",val:res.y},
                {label:"Months",val:res.m},
                {label:"Days",val:res.d},
                {label:"Total Days",val:res.days.toLocaleString()},
                {label:"Hours",val:res.hrs.toLocaleString()},
                {label:"Minutes",val:res.mins.toLocaleString()},
              ].map(({label,val})=>(
                <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-center">
                  <p className="text-2xl font-bold text-accent">{val}</p>
                  <p className="text-[11px] text-[var(--txt-2)] mt-0.5">{label}</p>
                </div>
              ))}
              <div className="col-span-2 sm:col-span-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-center">
                <p className="text-[13px] text-[var(--txt-2)]">🎂 Next birthday in <span className="font-bold text-[var(--txt)]">{res.next} days</span></p>
              </div>
            </div>
          )}
        </div>
        
        <AdSlot slot="1234567890" format="auto" />
        <ToolPageSections
          howToSteps={[
            {title: "Enter Date of Birth", desc: "Pick your birth date using the date picker."},
            {title: "Set Reference Date", desc: "Leave it as today or pick any custom date."},
            {title: "Get Your Age", desc: "Click Calculate Age to see exact years, months, days, hours and minutes."},
          ]}
          faqs={[
            {q:"How accurate is this?",a:"Exact age including leap years down to the day."},
            {q:"Can I calculate age for a future date?",a:"Yes — set the Age At Date to any future date."},
            {q:"Is my data stored?",a:"No. Everything runs in your browser."},
          ]}
          relatedTools={["emi-calculator","password-generator","qr-code-generator"]}
        />
      </main>
    </div>
  );
}
