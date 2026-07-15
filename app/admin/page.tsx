"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { FileText, Mail, LogOut, PlusCircle } from "lucide-react";

const C = { ink: "var(--txt)", sub: "var(--txt-2)", brand: "#FF6B5E", line: "var(--line-strong)", surface: "var(--surface)", cream: "var(--cream)" };
const shadow = "3px 3px 0 0 var(--line-strong)";

export default function AdminDashboard() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Try refreshing the session
        const { data: { session: refreshed } } = await supabase.auth.refreshSession();
        if (!refreshed) { router.push("/admin/login"); return; }
      }
      setChecking(false);
    };
    checkSession();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (checking) return <div className="min-h-screen flex items-center justify-center" style={{ background: C.cream }}><p style={{ color: C.sub }}>Loading…</p></div>;

  return (
    <div className="min-h-screen" style={{ background: C.cream }}>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold" style={{ color: C.ink, fontFamily: "Archivo, Inter, sans-serif" }}>PDF24X Admin</h1>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ border: `1px solid ${C.line}`, background: C.surface, color: C.sub, boxShadow: shadow }}>
            <LogOut size={15} />Sign out
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link href="/admin/blogs" className="flex items-center gap-4 rounded-2xl bg-[var(--surface)] p-6 transition-all hover:-translate-y-0.5"
            style={{ border: `1px solid ${C.line}`, boxShadow: shadow }}>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "#ffe7e3" }}>
              <FileText size={22} style={{ color: C.brand }} />
            </span>
            <div>
              <p className="font-bold" style={{ color: C.ink }}>Blog Posts</p>
              <p className="text-sm" style={{ color: C.sub }}>Manage articles</p>
            </div>
          </Link>
          <Link href="/admin/contacts" className="flex items-center gap-4 rounded-2xl bg-[var(--surface)] p-6 transition-all hover:-translate-y-0.5"
            style={{ border: `1px solid ${C.line}`, boxShadow: shadow }}>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "#E5EEFC" }}>
              <Mail size={22} style={{ color: "#3B82F6" }} />
            </span>
            <div>
              <p className="font-bold" style={{ color: C.ink }}>Contact Submissions</p>
              <p className="text-sm" style={{ color: C.sub }}>View messages</p>
            </div>
          </Link>
        </div>
        <div className="mt-6">
          <Link href="/admin/blogs/new" className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
            style={{ background: C.brand, border: `1px solid ${C.line}`, boxShadow: shadow }}>
            <PlusCircle size={16} />New Blog Post
          </Link>
        </div>
      </div>
    </div>
  );
}
