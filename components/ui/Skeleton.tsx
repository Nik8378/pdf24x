"use client";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[var(--border)] ${className}`} />;
}

export function ToolPageSkeleton() {
  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <div className="hidden lg:flex flex-col w-56 shrink-0 border-r border-[var(--border)] p-4 gap-3">
        <Skeleton className="h-8 w-32 mb-4" />
        {Array.from({length:8}).map((_,i) => <Skeleton key={i} className="h-7 w-full" />)}
      </div>
      <div className="flex-1 px-6 py-6 space-y-5">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-10 w-10 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--bg)] px-6 py-10 space-y-8">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-6 w-72" />
        <Skeleton className="h-12 w-full max-w-xl rounded-2xl" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {Array.from({length:8}).map((_,i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-2xl" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}
