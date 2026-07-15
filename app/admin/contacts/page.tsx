"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, RefreshCw } from "lucide-react";

const C = { ink: "var(--txt)", sub: "var(--txt-2)", brand: "#FF6B5E", line: "var(--line-strong)", surface: "var(--surface)", cream: "var(--cream)" };
const shadow = "3px 3px 0 0 var(--line-strong)";
const STATUS_COLORS: Record<string, string> = { new: "#FF6B5E", read: "#3B82F6", resolved: "#27AE60" };

export default function AdminContacts() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push("/admin/login"); return; }
      fetchSubmissions();
    });
  }, [router]);

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      setError("Failed to load submissions. Check RLS policies.");
      console.error(error);
    } else {
      setSubmissions(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("contact_submissions").update({ status }).eq("id", id);
    fetchSubmissions();
  };

  return (
    <div className="min-h-screen" style={{ background: C.cream }}>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" style={{ color: C.sub }}><ArrowLeft size={16} /></Link>
            <h1 className="text-xl font-extrabold" style={{ color: C.ink, fontFamily: "Archivo, Inter, sans-serif" }}>Contact Submissions</h1>
          </div>
          <button onClick={fetchSubmissions} className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold"
            style={{ border: `1px solid ${C.line}`, background: C.surface, color: C.sub, boxShadow: shadow }}>
            <RefreshCw size={13} />Refresh
          </button>
        </div>

        {loading ? <p style={{ color: C.sub }}>Loading…</p> : error ? (
          <p className="text-sm rounded-xl px-4 py-3" style={{ background: "#ffe7e3", color: C.ink }}>{error}</p>
        ) : (
          <div className="space-y-4">
            {submissions.map(s => (
              <div key={s.id} className="rounded-xl bg-[var(--surface)] p-5 overflow-hidden" style={{ border: `1px solid ${C.line}`, boxShadow: shadow }}>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: C.ink }}>{s.name} — <span style={{ color: C.sub }}>{s.email}</span></p>
                    <p className="text-xs mt-0.5" style={{ color: C.sub }}>{new Date(s.created_at).toLocaleString()}</p>
                  </div>
                  <select value={s.status} onChange={e => updateStatus(s.id, e.target.value)}
                    className="rounded-lg px-3 py-1 text-xs font-semibold cursor-pointer"
                    style={{ border: `1px solid ${C.line}`, background: C.cream, color: STATUS_COLORS[s.status] || C.sub }}>
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <p className="text-xs font-semibold mb-2" style={{ color: C.sub }}>Subject: {s.subject}</p>
                <p className="text-sm whitespace-pre-wrap break-words" style={{ color: C.ink }}>{s.message}</p>
              </div>
            ))}
            {submissions.length === 0 && <p className="text-sm" style={{ color: C.sub }}>No submissions yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
