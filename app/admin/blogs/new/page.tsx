"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save } from "lucide-react";

const C = { ink: "var(--txt)", sub: "var(--txt-2)", brand: "#FF6B5E", line: "var(--line-strong)", surface: "var(--surface)", cream: "var(--cream)", redsoft: "#ffe7e3" };
const shadow = "3px 3px 0 0 var(--line-strong)";

const field = (label: string, required = false) => (
  <label className="block text-xs font-semibold mb-1" style={{ color: C.ink }}>
    {label}{required && <span style={{ color: C.brand }}> *</span>}
  </label>
);

const input = "w-full rounded-xl px-4 py-2.5 text-sm";
const inputStyle = { border: `1px solid ${C.line}`, background: C.cream, color: C.ink, outline: "none" };

export default function NewBlogPost() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    slug: "", title: "", excerpt: "", content: "",
    hero_image: "", hero_alt: "", author: "PDF24x Team",
    seo_title: "", seo_description: "", published: false,
  });

  const update = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async (publish: boolean) => {
    if (!form.slug || !form.title || !form.content) {
      setError("Slug, title, and content are required."); return;
    }
    setSaving(true); setError("");
    const { error } = await supabase.from("blog_posts").insert({
      ...form,
      published: publish,
      published_at: publish ? new Date().toISOString() : null,
    });
    if (error) { setError(error.message); setSaving(false); return; }
    router.push("/admin/blogs");
  };

  return (
    <div className="min-h-screen" style={{ background: C.cream }}>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/admin/blogs" style={{ color: C.sub }}><ArrowLeft size={16} /></Link>
          <h1 className="text-xl font-extrabold" style={{ color: C.ink, fontFamily: "Archivo, Inter, sans-serif" }}>New Blog Post</h1>
        </div>
        <div className="space-y-4 rounded-2xl bg-[var(--surface)] p-6" style={{ border: `1px solid ${C.line}`, boxShadow: shadow }}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>{field("Slug", true)}<input value={form.slug} onChange={e => update("slug", e.target.value)} placeholder="how-to-compress-pdf" className={input} style={inputStyle} /></div>
            <div>{field("Author")}<input value={form.author} onChange={e => update("author", e.target.value)} className={input} style={inputStyle} /></div>
          </div>
          <div>{field("Title", true)}<input value={form.title} onChange={e => update("title", e.target.value)} placeholder="Article title" className={input} style={inputStyle} /></div>
          <div>{field("Excerpt")}<textarea value={form.excerpt} onChange={e => update("excerpt", e.target.value)} rows={2} placeholder="Short description shown on blog index" className={`${input} resize-y`} style={inputStyle} /></div>
          <div>{field("Content (Markdown)", true)}<textarea value={form.content} onChange={e => update("content", e.target.value)} rows={16} placeholder="Write article content in Markdown..." className={`${input} font-mono text-xs resize-y`} style={inputStyle} /></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>{field("Hero Image URL")}<input value={form.hero_image} onChange={e => update("hero_image", e.target.value)} placeholder="/image1.webp or Supabase URL" className={input} style={inputStyle} /></div>
            <div>{field("Hero Image Alt")}<input value={form.hero_alt} onChange={e => update("hero_alt", e.target.value)} placeholder="Descriptive alt text" className={input} style={inputStyle} /></div>
          </div>
          <div>{field("SEO Title")}<input value={form.seo_title} onChange={e => update("seo_title", e.target.value)} placeholder="Defaults to article title if empty" className={input} style={inputStyle} /></div>
          <div>{field("SEO Description")}<input value={form.seo_description} onChange={e => update("seo_description", e.target.value)} placeholder="Meta description for search results" className={input} style={inputStyle} /></div>
          {error && <p className="text-xs rounded-lg px-3 py-2" style={{ background: C.redsoft, color: C.ink }}>{error}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={() => handleSave(false)} disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
              style={{ border: `1px solid ${C.line}`, background: C.cream, color: C.ink, boxShadow: shadow }}>
              <Save size={15} />Save Draft
            </button>
            <button onClick={() => handleSave(true)} disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              style={{ background: C.brand, border: `1px solid ${C.line}`, boxShadow: shadow }}>
              Publish Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
