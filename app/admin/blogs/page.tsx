"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { PlusCircle, Edit, Eye, EyeOff, ArrowLeft } from "lucide-react";

const C = { ink: "#1a1a1a", sub: "#6b6760", brand: "#FF6B5E", line: "#1c1c1c", surface: "#ffffff", cream: "#f4f1ea" };
const shadow = "3px 3px 0 0 #1c1c1c";

export default function AdminBlogs() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push("/admin/login"); return; }
      fetchPosts();
    });
  }, [router]);

  const fetchPosts = async () => {
    const { data } = await supabase.from("blog_posts").select("id,slug,title,published,created_at").order("created_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from("blog_posts").update({ published: !current, published_at: !current ? new Date().toISOString() : null }).eq("id", id);
    fetchPosts();
  };

  return (
    <div className="min-h-screen" style={{ background: C.cream }}>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm" style={{ color: C.sub }}><ArrowLeft size={16} /></Link>
            <h1 className="text-xl font-extrabold" style={{ color: C.ink, fontFamily: "Archivo, Inter, sans-serif" }}>Blog Posts</h1>
          </div>
          <Link href="/admin/blogs/new" className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white"
            style={{ background: C.brand, border: `1px solid ${C.line}`, boxShadow: shadow }}>
            <PlusCircle size={15} />New Post
          </Link>
        </div>
        {loading ? <p style={{ color: C.sub }}>Loading…</p> : (
          <div className="space-y-3">
            {posts.map(post => (
              <div key={post.id} className="flex items-center justify-between rounded-xl bg-white px-4 py-3"
                style={{ border: `1px solid ${C.line}`, boxShadow: shadow }}>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold" style={{ color: C.ink }}>{post.title}</p>
                  <p className="text-xs" style={{ color: C.sub }}>/blog/{post.slug}</p>
                </div>
                <div className="ml-4 flex items-center gap-2 shrink-0">
                  <span className="rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{ background: post.published ? "#E4F5EC" : "#f4f1ea", color: post.published ? "#27AE60" : C.sub }}>
                    {post.published ? "Published" : "Draft"}
                  </span>
                  <button onClick={() => togglePublish(post.id, post.published)} className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{ border: `1px solid ${C.line}`, background: C.cream }} title={post.published ? "Unpublish" : "Publish"}>
                    {post.published ? <EyeOff size={13} style={{ color: C.sub }} /> : <Eye size={13} style={{ color: C.sub }} />}
                  </button>
                  <Link href={`/admin/blogs/${post.id}`} className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{ border: `1px solid ${C.line}`, background: C.cream }}>
                    <Edit size={13} style={{ color: C.sub }} />
                  </Link>
                </div>
              </div>
            ))}
            {posts.length === 0 && <p className="text-sm" style={{ color: C.sub }}>No blog posts yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
