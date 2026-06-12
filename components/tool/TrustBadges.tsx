import { Shield, Zap, Star, Smartphone } from "lucide-react";

const badges = [
  {
    icon: Shield,
    title: "100% Private",
    desc: "Files never leave your browser",
  },
  {
    icon: Zap,
    title: "Instant",
    desc: "Converts in seconds locally",
  },
  {
    icon: Star,
    title: "Original Quality",
    desc: "No compression or quality loss",
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    desc: "Works on any device or screen",
  },
];

export function TrustBadges() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
      {badges.map((b) => (
        <div
          key={b.title}
          className="bg-white border border-[#1a1917]/10 rounded-xl p-3 flex gap-2.5 items-start shadow-sm hover:shadow-md hover:border-[#1a1917]/20 transition-all"
        >
          <div className="mt-0.5 shrink-0">
            <b.icon size={15} strokeWidth={1.8} className="text-accent" />
          </div>
          <div>
            <p className="text-[12px] font-bold text-[#1a1917]">{b.title}</p>
            <p className="text-[11px] text-[#7a7875] leading-snug">{b.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
