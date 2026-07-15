"use client";
import { useEffect } from "react";

interface AdUnitProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

const FORMAT_MIN_HEIGHT: Record<string, string> = {
  horizontal: "90px",
  rectangle: "250px",
  vertical: "600px",
  auto: "90px",
};

export function AdUnit({ slot, format = "auto", className = "" }: AdUnitProps) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, []);

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{ minHeight: FORMAT_MIN_HEIGHT[format] || "90px" }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-3512613566035809"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
