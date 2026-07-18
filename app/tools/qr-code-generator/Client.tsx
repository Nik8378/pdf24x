"use client";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import ToolPageSections from "@/components/tool/ToolPageSections";
import AdSlot from "@/components/ads/AdSlot";
import { QrCode, Download, Copy, Check } from "lucide-react";

const TYPES=["URL","Text","Email","Phone","SMS","WiFi"];

export default function Client() {
  const [type,setType]=useState("URL");
  const [text,setText]=useState("");
  const [size,setSize]=useState(256);
  const [fg,setFg]=useState("#000000");
  const [bg,setBg]=useState("#ffffff");
  const [qr,setQr]=useState<string|null>(null);
  const [copied,setCopied]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const [ssid,setSsid]=useState("");
  const [pass,setPass]=useState("");
  const [enc,setEnc]=useState("WPA");

  function buildText(){
    if(type==="URL") return text.startsWith("http")?text:`https://${text}`;
    if(type==="Email") return `mailto:${text}`;
    if(type==="Phone") return `tel:${text}`;
    if(type==="SMS") return `sms:${text}`;
    if(type==="WiFi") return `WIFI:T:${enc};S:${ssid};P:${pass};;`;
    return text;
  }

  async function generate(){
    setError(null);
    const val=buildText();
    if(!val.trim()){setError("Please enter some content first.");return;}
    try{
      const QRCode=(await import("qrcode")).default;
      const url=await QRCode.toDataURL(val,{width:size,color:{dark:fg,light:bg},errorCorrectionLevel:"H"});
      setQr(url);
    }catch{setError("Failed to generate QR code.");}
  }

  const download=()=>{if(!qr)return;const a=document.createElement("a");a.href=qr;a.download="qrcode.png";a.click();};
  const copyImg=async()=>{
    if(!qr)return;
    const res=await fetch(qr);const blob=await res.blob();
    await navigator.clipboard.write([new ClipboardItem({"image/png":blob})]);
    setCopied(true);setTimeout(()=>setCopied(false),2000);
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 px-6 py-6 w-full">
        <div className="flex items-center gap-2 mb-6">
          <QrCode size={22} className="text-accent"/>
          <h1 className="text-xl font-bold text-[var(--txt)]">QR Code Generator</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
            <div>
              <label className="text-[12px] font-semibold text-[var(--txt-2)] uppercase tracking-wide block mb-2">Type</label>
              <div className="flex flex-wrap gap-1.5">
                {TYPES.map(t=>(
                  <button key={t} onClick={()=>{setType(t);setText("");setQr(null);}}
                    className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-colors ${type===t?"bg-accent text-white":"border border-[var(--border)] text-[var(--txt-2)]"}`}>{t}</button>
                ))}
              </div>
            </div>
            {type==="WiFi"?(
              <div className="space-y-3">
                <input value={ssid} onChange={e=>setSsid(e.target.value)} placeholder="Network name (SSID)"
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--txt)] text-[14px] focus:outline-none focus:border-accent"/>
                <input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="Password"
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--txt)] text-[14px] focus:outline-none focus:border-accent"/>
                <div className="flex gap-1">
                  {["WPA","WEP","nopass"].map(e=>(
                    <button key={e} onClick={()=>setEnc(e)}
                      className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-colors ${enc===e?"bg-accent text-white":"border border-[var(--border)] text-[var(--txt-2)]"}`}>{e}</button>
                  ))}
                </div>
              </div>
            ):(
              <div>
                <label className="text-[12px] font-semibold text-[var(--txt-2)] uppercase tracking-wide block mb-1">
                  {type==="URL"?"URL":type==="Email"?"Email address":type==="Phone"||type==="SMS"?"Phone number":"Text"}
                </label>
                <textarea value={text} onChange={e=>setText(e.target.value)} rows={3}
                  placeholder={type==="URL"?"https://example.com":type==="Email"?"hello@example.com":type==="Phone"||type==="SMS"?"+91 9876543210":"Enter text..."}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--txt)] text-[14px] focus:outline-none focus:border-accent resize-none"/>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-semibold text-[var(--txt-2)] uppercase tracking-wide block mb-1">Size</label>
                <select value={size} onChange={e=>setSize(+e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--txt)] text-[13px]">
                  {[128,256,512,1024].map(s=><option key={s} value={s}>{s}×{s}px</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[12px] font-semibold text-[var(--txt-2)] uppercase tracking-wide block mb-1">FG</label>
                  <input type="color" value={fg} onChange={e=>setFg(e.target.value)} className="w-full h-9 rounded-lg border border-[var(--border)] cursor-pointer p-0.5 bg-[var(--bg)]"/>
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[var(--txt-2)] uppercase tracking-wide block mb-1">BG</label>
                  <input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="w-full h-9 rounded-lg border border-[var(--border)] cursor-pointer p-0.5 bg-[var(--bg)]"/>
                </div>
              </div>
            </div>
            {error&&<p className="text-[13px] text-red-500">{error}</p>}
            <button onClick={generate}
              className="w-full py-2.5 rounded-xl bg-accent text-white font-semibold text-[14px] hover:bg-accent/90 transition-all">
              Generate QR Code
            </button>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col items-center justify-center gap-4 min-h-[300px]">
            {qr?(
              <>
                <img src={qr} alt="QR Code" className="rounded-xl" style={{width:Math.min(size,220),height:Math.min(size,220)}}/>
                <div className="flex gap-2 w-full">
                  <button onClick={download}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-accent text-white text-[13px] font-semibold hover:bg-accent/90 transition-all">
                    <Download size={14}/> Download PNG
                  </button>
                  <button onClick={copyImg}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] text-[var(--txt)] text-[13px] font-medium hover:bg-[var(--bg-2)] transition-colors">
                    {copied?<Check size={14} className="text-green-500"/>:<Copy size={14}/>}
                  </button>
                </div>
              </>
            ):(
              <div className="flex flex-col items-center gap-3 opacity-30">
                <QrCode size={80} className="text-[var(--txt-2)]"/>
                <p className="text-[13px] text-[var(--txt-2)]">QR code preview</p>
              </div>
            )}
          </div>
        </div>
        
        <AdSlot slot="1234567893" format="auto" />
        <ToolPageSections
          howToSteps={[
            {title: "Choose QR Type", desc: "Select URL, text, email, phone, SMS or WiFi."},
            {title: "Enter Content", desc: "Type the URL, message or WiFi credentials to encode."},
            {title: "Download or Copy", desc: "Click Generate then download as PNG or copy the image."},
          ]}
          faqs={[
            {q:"What types can I generate?",a:"URL, text, email, phone, SMS and WiFi QR codes."},
            {q:"Can I customise colors?",a:"Yes — pick any foreground and background color."},
            {q:"What size for print?",a:"Use 512px or 1024px for print, 256px for web."},
            {q:"Is this free?",a:"100% free, no login required."},
          ]}
          relatedTools={["password-generator","age-calculator","emi-calculator"]}
        />
      </main>
    </div>
  );
}
