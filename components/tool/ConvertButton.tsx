"use client";
import { FileDown, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { convertImagesToPDF, downloadBlob } from "@/lib/pdfEngine";

// ─── Convert Button ────────────────────────────────────────────────────────────
export function ConvertButton() {
  const { images, settings, setProgress, hideProgress, showToast } = useAppStore();
  const disabled = images.length === 0;

  const handleConvert = async () => {
    if (disabled) return;

    setProgress({ active: true, label: "Starting conversion…", sub: "Processing locally in your browser", percent: 5 });

    try {
      const bytes = await convertImagesToPDF(images, settings, (percent, label) => {
        setProgress({ percent, label, sub: "Files stay on your device" });
      });

      setProgress({ percent: 100, label: "PDF ready!", sub: "Starting download…" });
      await new Promise((r) => setTimeout(r, 400));

      downloadBlob(bytes, `PDF24x_${Date.now()}.pdf`);
      hideProgress();
      showToast(
        `PDF created with ${images.length} page${images.length !== 1 ? "s" : ""}!`,
        "success"
      );
    } catch (err) {
      hideProgress();
      showToast("Conversion failed. Please try again.", "error");
      console.error(err);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleConvert}
        disabled={disabled}
        className={`w-full flex items-center justify-center gap-2 font-semibold text-[14px] py-3 rounded-full transition-all ${
          disabled
            ? "bg-[#f4f3f0] border border-[#1a1917]/10 text-[#7a7875] cursor-not-allowed rounded-full"
            : "bg-[#1a1917] text-white hover:bg-[#2d2b28] active:scale-[0.99] shadow-md hover:shadow-lg rounded-full"
        }`}
      >
        <FileDown size={16} strokeWidth={2} />
        {disabled ? "Add images to convert" : `Convert ${images.length > 0 ? images.length + " images" : ""} to PDF`}
      </button>
      <p className="text-center text-[11.5px] text-[#7a7875]">
        100% free · No registration · No uploads
      </p>
    </div>
  );
}

// ─── Progress Overlay ──────────────────────────────────────────────────────────
export function ProgressOverlay() {
  const { progress } = useAppStore();
  if (!progress.active) return null;

  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white border border-[#1a1917]/12 rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
        {/* Spinner */}
        <div className="w-12 h-12 mx-auto mb-5 relative">
          <div className="w-12 h-12 border-[3px] border-surface-2 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-[3px] border-transparent border-t-accent rounded-full spin" />
        </div>

        <p className="text-[15px] font-semibold text-[#1a1917] mb-1">{progress.label}</p>
        <p className="text-[12.5px] text-[#7a7875] mb-5">{progress.sub}</p>

        {/* Progress bar */}
        <div className="bg-[#f4f3f0] rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <p className="text-[11px] text-[#7a7875] mt-2">{progress.percent}%</p>
      </div>
    </div>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
export function Toast() {
  const { toast, hideToast } = useAppStore();
  if (!toast.visible) return null;

  const icons = {
    success: <CheckCircle size={15} strokeWidth={2} />,
    error: <AlertCircle size={15} strokeWidth={2} />,
    info: <Info size={15} strokeWidth={2} />,
  };

  const colors = {
    success: "bg-[#15803d] text-white",
    error: "bg-red-600 text-white",
    info: "bg-txt text-white",
  };

  return (
    <div
      className={`fixed bottom-5 right-5 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[13.5px] font-medium max-w-sm z-[200] toast-enter cursor-pointer ${colors[toast.type]}`}
      onClick={hideToast}
    >
      {icons[toast.type]}
      <span>{toast.message}</span>
    </div>
  );
}
