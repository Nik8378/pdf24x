"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

const MODES = ["light", "dark", "system"] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <span className="inline-block h-8 w-8 rounded-lg" aria-hidden />;
  }

  const current = (MODES as readonly string[]).includes(theme ?? "") ? (theme as typeof MODES[number]) : "system";
  const next = MODES[(MODES.indexOf(current) + 1) % MODES.length];
  const label = current === "light" ? "Light theme" : current === "dark" ? "Dark theme" : "Auto (follows your system)";

  return (
    <button
      onClick={() => setTheme(next)}
      title={`${label} — click to switch`}
      aria-label={`Theme: ${label}. Switch theme`}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--txt-2)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
    >
      {current === "light" ? <Sun size={15} /> : current === "dark" ? <Moon size={15} /> : <Monitor size={15} />}
    </button>
  );
}
