"use client";
import { useAppStore } from "@/store/useAppStore";
import type { PDFSettings } from "@/types";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10.5px] font-bold text-[#1a1917] mb-2 uppercase tracking-widest opacity-50">
      {children}
    </p>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#f4f3f0] border border-[#1a1917]/12 rounded-lg px-3 py-2 text-[13px] text-[#1a1917] font-medium cursor-pointer appearance-none focus:outline-none focus:border-accent transition-colors"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a7875' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 10px center",
      }}
    >
      {children}
    </select>
  );
}

function BtnGroup({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex border border-[#1a1917]/12 rounded-lg overflow-hidden">
      {options.map((o, i) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 py-1.5 text-[12px] font-medium transition-colors border-r border-[#e5e3de] last:border-r-0 ${
            value === o.value
              ? "bg-[#f4f3f0] text-[#1a1917]"
              : "bg-white text-[#4a4845] hover:bg-[#f4f3f0]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const qualityOptions = [
  { value: "original", label: "Original", desc: "Best quality, larger file" },
  { value: "balanced", label: "Balanced", desc: "Good quality, medium size" },
  { value: "smallest", label: "Smallest", desc: "Smaller file, lower quality" },
];

export function SettingsPanel() {
  const { settings, updateSettings } = useAppStore();

  const update = <K extends keyof PDFSettings>(key: K, val: PDFSettings[K]) =>
    updateSettings({ [key]: val });

  return (
    <div className="space-y-3.5">
      {/* Page Size */}
      <div>
        <Label>Page Size</Label>
        <Select
          value={settings.pageSize}
          onChange={(v) => update("pageSize", v as PDFSettings["pageSize"])}
        >
          <option value="A4">A4 – 210 × 297 mm</option>
          <option value="A5">A5 – 148 × 210 mm</option>
          <option value="Letter">Letter – 8.5 × 11 in</option>
          <option value="Legal">Legal – 8.5 × 14 in</option>
          <option value="Auto">Auto – match image size</option>
        </Select>
      </div>

      {/* Orientation */}
      <div>
        <Label>Orientation</Label>
        <BtnGroup
          value={settings.orientation}
          onChange={(v) => update("orientation", v as PDFSettings["orientation"])}
          options={[
            { label: "Auto", value: "auto" },
            { label: "Portrait", value: "portrait" },
            { label: "Landscape", value: "landscape" },
          ]}
        />
      </div>

      {/* Margins */}
      <div>
        <Label>Margins</Label>
        <BtnGroup
          value={settings.margins}
          onChange={(v) => update("margins", v as PDFSettings["margins"])}
          options={[
            { label: "None", value: "none" },
            { label: "Small", value: "small" },
            { label: "Medium", value: "medium" },
          ]}
        />
      </div>

      {/* Image Fit */}
      <div>
        <Label>Image Fit</Label>
        <BtnGroup
          value={settings.imageFit}
          onChange={(v) => update("imageFit", v as PDFSettings["imageFit"])}
          options={[
            { label: "Fit", value: "fit" },
            { label: "Fill", value: "fill" },
            { label: "Original", value: "original" },
          ]}
        />
        <p className="text-[11px] text-[#7a7875] mt-1.5">
          {settings.imageFit === "fit" && "Scale image to fit within the page"}
          {settings.imageFit === "fill" && "Fill the entire page (may crop)"}
          {settings.imageFit === "original" && "Use image's actual pixel size"}
        </p>
      </div>

      {/* Quality */}
      <div>
        <Label>Image Quality</Label>
        <div className="space-y-1.5">
          {qualityOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update("quality", opt.value as PDFSettings["quality"])}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all ${
                settings.quality === opt.value
                  ? "border-accent bg-gradient-to-r from-accent-light to-amber-50/60 shadow-sm"
                  : "border-[#1a1917]/10 bg-white hover:border-[#1a1917]/20 hover:bg-[#f4f3f0]"
              }`}
            >
              <div>
                <p className="text-[13px] font-bold text-[#1a1917]">{opt.label}</p>
                <p className="text-[11px] text-[#7a7875]">{opt.desc}</p>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  settings.quality === opt.value
                    ? "border-accent bg-accent"
                    : "border-[#d4d2cb]"
                }`}
              >
                {settings.quality === opt.value && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
