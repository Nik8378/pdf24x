"use client";
export default function Offline() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] px-6 text-center">
      <p className="text-6xl mb-6">📡</p>
      <h1 className="text-2xl font-bold text-[var(--txt)] mb-3">You are offline</h1>
      <p className="text-[var(--txt-2)] text-[15px] max-w-sm mb-8">
        No internet connection. Some tools still work offline — try refreshing when you are back online.
      </p>
      <button onClick={() => window.location.reload()}
        className="px-6 py-2.5 rounded-xl bg-accent text-white font-semibold text-[14px] hover:bg-accent/90 transition-all">
        Try Again
      </button>
    </div>
  );
}
