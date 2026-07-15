"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Lock, Loader2 } from "lucide-react";

const C = { ink: "#1a1a1a", sub: "#6b6760", brand: "#FF6B5E", line: "#1c1c1c", cream: "#f4f1ea", redsoft: "#ffe7e3" };
const shadow = "3px 3px 0 0 #1c1c1c";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    if (data.session) {
      // Small delay to ensure session is stored
      await new Promise(r => setTimeout(r, 500));
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.cream }}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-8" style={{ border: `1px solid ${C.line}`, boxShadow: shadow }}>
        <div className="mb-6 flex items-center gap-3">
          <Lock size={20} style={{ color: C.brand }} />
          <h1 className="text-lg font-extrabold" style={{ color: C.ink, fontFamily: "Archivo, Inter, sans-serif" }}>Admin Login</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email" required autoComplete="email"
            className="w-full rounded-xl px-4 py-2.5 text-sm"
            style={{ border: `1px solid ${C.line}`, background: C.cream, color: C.ink, outline: "none" }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Password" required autoComplete="current-password"
            className="w-full rounded-xl px-4 py-2.5 text-sm"
            style={{ border: `1px solid ${C.line}`, background: C.cream, color: C.ink, outline: "none" }} />
          {error && (
            <p className="text-xs rounded-lg px-3 py-2" style={{ background: C.redsoft, color: C.ink }}>{error}</p>
          )}
          <button type="submit" disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-50"
            style={{ background: C.brand, border: `1px solid ${C.line}`, boxShadow: shadow }}>
            {loading ? <><Loader2 size={15} className="animate-spin" />Signing in…</> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
