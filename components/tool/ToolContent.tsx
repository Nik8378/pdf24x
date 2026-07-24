interface ToolContentProps {
  title: string;
  intro: string;
  useCases: string[];
  features: string[];
  tips: string[];
  conclusion: string;
}

export function ToolContent({ title, intro, useCases, features, tips, conclusion }: ToolContentProps) {
  return (
    <div className="mx-4 sm:mx-6 lg:mx-8 mt-6 mb-4 space-y-5">
      {/* Intro */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-lg font-extrabold mb-3 text-[var(--txt)]">About {title}</h2>
        <p className="text-[14px] text-[var(--txt-2)] leading-relaxed">{intro}</p>
      </div>

      {/* Use cases + Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-[15px] font-bold mb-3 text-[var(--txt)]">Who Uses This Tool</h2>
          <ul className="space-y-2">
            {useCases.map((u, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--txt-2)]">
                <span className="text-accent mt-0.5 shrink-0">✓</span>{u}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-[15px] font-bold mb-3 text-[var(--txt)]">Key Features</h2>
          <ul className="space-y-2">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--txt-2)]">
                <span className="text-accent mt-0.5 shrink-0">→</span>{f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-[15px] font-bold mb-3 text-[var(--txt)]">Tips for Best Results</h2>
        <ol className="space-y-2">
          {tips.map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--txt-2)]">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent text-[11px] font-bold mt-0.5">{i+1}</span>
              {t}
            </li>
          ))}
        </ol>
      </div>

      {/* Conclusion */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-[13px] text-[var(--txt-2)] leading-relaxed">{conclusion}</p>
      </div>
    </div>
  );
}
