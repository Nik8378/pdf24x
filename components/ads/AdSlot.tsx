"use client";
import { useEffect, useRef, useState } from "react";

interface AdSlotProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

export default function AdSlot({ slot, format = "auto", className = "" }: AdSlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}

    // Only show container if ad fills (check after short delay)
    const timer = setTimeout(() => {
      const ins = ref.current?.querySelector("ins");
      const filled = ins?.getAttribute("data-ad-status") === "filled" ||
                     (ins?.offsetHeight ?? 0) > 0;
      if (filled) setVisible(true);
    }, 1500);

    // Also observe for ad filling dynamically
    const observer = new MutationObserver(() => {
      const ins = ref.current?.querySelector("ins");
      if ((ins?.offsetHeight ?? 0) > 0) {
        setVisible(true);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current, { childList: true, subtree: true, attributes: true });

    return () => { clearTimeout(timer); observer.disconnect(); };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-300 ${visible ? "opacity-100" : "opacity-0 h-0 overflow-hidden pointer-events-none"} ${className}`}
    >
      {visible && (
        <div className="my-4 rounded-xl overflow-hidden border border-[var(--border)]">
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive="true"
          />
        </div>
      )}
    </div>
  );
}
