"use client";
import { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import ToolPageSections from "@/components/tool/ToolPageSections";
import { Timer, Play, Pause, RotateCcw, Flag } from "lucide-react";

function fmt(ms:number) {
  const h=Math.floor(ms/3600000), m=Math.floor((ms%3600000)/60000), s=Math.floor((ms%60000)/1000), cs=Math.floor((ms%1000)/10);
  return `${h?String(h).padStart(2,"0")+":":""}${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}.${String(cs).padStart(2,"0")}`;
}

export default function Client() {
  const [tab, setTab] = useState<"stopwatch"|"timer">("stopwatch");
  const [swMs, setSwMs] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState<{ms:number;split:number}[]>([]);
  const swRef = useRef(0); const swStart = useRef(0);

  const [timerH, setTimerH] = useState("0");
  const [timerM, setTimerM] = useState("5");
  const [timerS, setTimerS] = useState("0");
  const [timerMs, setTimerMs] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const timerEnd = useRef(0);

  useEffect(() => {
    if(!swRunning) return;
    swStart.current = Date.now() - swRef.current;
    const id = setInterval(() => { swRef.current=Date.now()-swStart.current; setSwMs(swRef.current); }, 10);
    return () => clearInterval(id);
  }, [swRunning]);

  useEffect(() => {
    if(!timerRunning) return;
    timerEnd.current = Date.now() + timerMs;
    const id = setInterval(() => {
      const left = timerEnd.current - Date.now();
      if(left<=0){setTimerMs(0);setTimerRunning(false);setTimerDone(true);clearInterval(id);}
      else setTimerMs(left);
    }, 10);
    return () => clearInterval(id);
  }, [timerRunning]);

  const swReset = () => { setSwRunning(false); swRef.current=0; setSwMs(0); setLaps([]); };
  const swLap = () => {
    const prev = laps[0]?.ms ?? 0;
    setLaps(l => [{ms:swRef.current, split:swRef.current-prev}, ...l]);
  };
  const timerTotal = (+timerH*3600 + +timerM*60 + +timerS)*1000;
  const startTimer = () => { setTimerDone(false); setTimerMs(timerTotal); setTimerRunning(true); };
  const resetTimer = () => { setTimerRunning(false); setTimerMs(0); setTimerDone(false); };
  const pct = timerTotal > 0 ? ((timerTotal - timerMs) / timerTotal) * 100 : 0;

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar/>
      <main role="main" className="flex-1 px-6 py-6 w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FCE4EF]">
            <Timer size={20} className="text-[#EC4899]"/>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--txt)]">Stopwatch & Timer</h1>
            <p className="text-[12px] text-[var(--txt-2)]">Stopwatch with laps + countdown timer</p>
          </div>
        </div>

        <div className="max-w-lg">
          <div className="flex rounded-2xl border border-[var(--border)] overflow-hidden mb-6 bg-[var(--surface)]">
            {(["stopwatch","timer"] as const).map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                className={`flex-1 py-3 text-[13px] font-semibold capitalize transition-colors ${tab===t?"bg-accent text-white":"text-[var(--txt-2)] hover:bg-[var(--bg-2)]"}`}>
                {t==="stopwatch"?"⏱ Stopwatch":"⏲ Timer"}
              </button>
            ))}
          </div>

          {tab==="stopwatch" ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5">
              <div className="text-center py-4">
                <div className={`text-6xl font-mono font-bold tabular-nums transition-colors ${swRunning?"text-accent":"text-[var(--txt)]"}`}>
                  {fmt(swMs)}
                </div>
                {laps.length>0 && <p className="text-[12px] text-[var(--txt-2)] mt-2">Lap {laps.length+1} — running</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={()=>setSwRunning(r=>!r)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-white font-semibold text-[14px] hover:bg-accent/90 transition-all">
                  {swRunning?<Pause size={18}/>:<Play size={18}/>}{swRunning?"Pause":"Start"}
                </button>
                <button onClick={swLap} disabled={!swRunning}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-[var(--border)] text-[var(--txt)] text-[13px] disabled:opacity-40 hover:bg-[var(--bg-2)] transition-colors">
                  <Flag size={15}/> Lap
                </button>
                <button onClick={swReset}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-[var(--border)] text-[var(--txt)] text-[13px] hover:bg-[var(--bg-2)] transition-colors">
                  <RotateCcw size={15}/>
                </button>
              </div>
              {laps.length>0 && (
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  <div className="flex justify-between text-[11px] text-[var(--txt-2)] px-3 font-semibold uppercase tracking-wide">
                    <span>Lap</span><span>Split</span><span>Total</span>
                  </div>
                  {laps.map((l,i)=>(
                    <div key={i} className={`flex justify-between px-3 py-2 rounded-xl text-[13px] ${i===0?"bg-accent/10 border border-accent/20":"bg-[var(--bg)]"}`}>
                      <span className="text-[var(--txt-2)] w-12">#{laps.length-i}</span>
                      <span className="font-mono text-[var(--txt)]">{fmt(l.split)}</span>
                      <span className="font-mono text-[var(--txt-2)]">{fmt(l.ms)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ):(
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5">
              {!timerRunning&&timerMs===0?(
                <div className="grid grid-cols-3 gap-3">
                  {([["Hours",timerH,setTimerH],["Minutes",timerM,setTimerM],["Seconds",timerS,setTimerS]] as [string,string,(v:string)=>void][]).map(([label,val,set])=>(
                    <div key={label} className="text-center">
                      <label className="text-[11px] text-[var(--txt-2)] uppercase font-semibold block mb-2">{label}</label>
                      <input type="number" value={val} min="0" max={label==="Hours"?"99":"59"}
                        onChange={e=>set(e.target.value)}
                        className="w-full px-2 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--txt)] text-[24px] font-mono font-bold text-center focus:outline-none focus:border-accent"/>
                    </div>
                  ))}
                </div>
              ):(
                <div className="text-center py-4 space-y-3">
                  <div className={`text-6xl font-mono font-bold tabular-nums ${timerDone?"text-green-500 animate-pulse":timerMs<10000?"text-red-500":"text-[var(--txt)]"}`}>
                    {fmt(timerMs)}
                  </div>
                  {timerDone&&<p className="text-green-500 font-semibold text-[15px]">⏰ Time is up!</p>}
                  {!timerDone&&timerTotal>0&&(
                    <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${timerMs<10000?"bg-red-500":"bg-accent"}`} style={{width:`${100-pct}%`}}/>
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                {!timerRunning&&timerMs===0?(
                  <button onClick={startTimer} disabled={timerTotal===0}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-white font-semibold text-[14px] hover:bg-accent/90 disabled:opacity-40 transition-all">
                    <Play size={18}/> Start Timer
                  </button>
                ):(
                  <>
                    <button onClick={()=>setTimerRunning(r=>!r)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-white font-semibold text-[14px] hover:bg-accent/90 transition-all">
                      {timerRunning?<Pause size={18}/>:<Play size={18}/>}{timerRunning?"Pause":"Resume"}
                    </button>
                    <button onClick={resetTimer}
                      className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-[var(--border)] text-[var(--txt)] text-[13px] hover:bg-[var(--bg-2)] transition-colors">
                      <RotateCcw size={15}/>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        <ToolPageSections
          howToSteps={[
            {title:"Choose Mode",desc:"Switch between Stopwatch and Countdown Timer."},
            {title:"Start Timing",desc:"Click Start. Use Lap to record split times on the stopwatch."},
            {title:"Reset Anytime",desc:"Click Reset to clear and start fresh."},
          ]}
          faqs={[
            {q:"Does the stopwatch support laps?",a:"Yes — click Lap while running to record split and total times."},
            {q:"Does the timer alert me?",a:"Yes — the display pulses green and shows Time is up! when done."},
            {q:"Does this work offline?",a:"Yes — everything runs in your browser."},
          ]}
          relatedTools={["age-calculator","unit-converter","percentage-calculator"]}
        />
      </main>
    </div>
  );
}
