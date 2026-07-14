"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";

const C = { ink: "#1a1a1a", sub: "#6b6760", brand: "#FF6B5E", line: "#1c1c1c", surface: "#ffffff", cream: "#f4f1ea" };
const shadow = "3px 3px 0 0 #1c1c1c";

const STATUS_COLORS: Record<string, string> = {
  new: "#FF6B5E", read: "#3B82F6", resolved: "#27AE60",
};

export default function AdminContacts() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push("/admin/login"); return; }
      fetchSubmissions();
    });
  }, [router]);

  const fetchSubmissions = async () => {
    const res = await fetch("/api/admin/contacts");
    if (res.ok) { const data = await res.json(); setSubmissions(data); }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/admin/contacts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    fetchSubmissions();
  };

  return (
    <div className="min-h-screen" style={{ background: C.cream }}>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/admin" style={{ color: C.sub }}><ArrowLeft size={16} /></Link>
          <h1 className="text-xl font-extrabold" style={{ color: C.ink, fontFamily: "Archivo, Inter, sans-serif" }}>Contact Submissions</h1>
        </div>
        {loading ? <p style={{ color: C.sub }}>Loading…</p> : (
          <div className="space-y-4">
            {submissions.map(s => (
              <div key={s.id} className="rounded-xl bg-white p-5 overflow-hidden" style={{ border: `1px solid ${C.line}`, boxShadow: shadow }}>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: C.ink }}>{s.name} — <span style={{ color: C.sub }}>{s.email}</span></p>
                    <p className="text-xs mt-0.5" style={{ color: C.sub }}>{new Date(s.created_at).toLocaleString()}</p>
                  </div>
                  <select value={s.status} onChange={e => updateStatus(s.id, e.target.value)}
                    className="rounded-lg px-3 py-1 text-xs font-semibold"
                    style={{ border: `1px solid ${C.line}`, background: C.cream, color: STATUS_COLORS[s.status] || C.sub }}>
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <p className="text-xs font-semibold mb-1" style={{ color: C.sub }}>Subject: {s.subject}</p>
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
