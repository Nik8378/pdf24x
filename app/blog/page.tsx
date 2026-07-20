import type { Metadata } from "next";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Clock, ArrowRight } from "lucide-react";
import { AdUnit } from "@/components/ads/AdUnit";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 60; // revalidate every 60 seconds

export const metadata: Metadata = {
  title: "PDF Tools Blog – Guides, Tips & Free Tool Reviews",
  description: "Practical guides on converting, compressing, merging, and working with PDFs. Tips for students, freelancers, and small businesses.",
  alternates: { canonical: "https://pdf24x.com/blog" },
};

const tagStyles: Record<string, string> = {
  "PDF Guides":   "bg-amber-50 text-amber-700 border-amber-200",
  "PDF Tools":    "bg-blue-50 text-blue-700 border-blue-200",
  "Privacy":      "bg-red-50 text-red-700 border-red-200",
  "Productivity": "bg-green-50 text-green-700 border-green-200",
  "Calculator":   "bg-purple-50 text-purple-700 border-purple-200",
  "Tools":        "bg-teal-50 text-teal-700 border-teal-200",
};

async function getPosts() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug,title,excerpt,author,hero_image,hero_alt,published_at,seo_title,seo_description,content")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export default async function BlogPage() {
  const posts = await getPosts();
  const featured = posts[0];
  const rest = posts.slice(1);

  if (!featured) {
    return (
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5">
          <h1 className="text-xl font-bold text-[var(--txt)] mb-4">Tech Blog</h1>
          <p className="text-[var(--txt-2)]">No posts published yet.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full flex gap-0 items-start">
      <Sidebar />
      <main role="main" className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--txt)] mb-1">Tech Blog</h1>
        <p className="text-[13.5px] text-[var(--txt-2)] mb-6">
          Practical guides on PDF conversion, compression, merging, and free tools for getting more done.
        </p>

        {/* Featured post */}
        <Link href={`/blog/${featured.slug}`}
          className="block bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden hover:border-accent/40 hover:shadow-lg transition-all group mb-6">
          {featured.hero_image && (
            <div className="relative w-full bg-black overflow-hidden rounded-t-2xl" style={{ maxHeight: "320px" }}>
              <img src={featured.hero_image} alt={featured.hero_alt || featured.title}
                className="w-full h-auto block" style={{ maxHeight: "320px", objectFit: "cover", objectPosition: "center top" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
            </div>
          )}
          <div className="p-5">
            <p className="text-[11px] font-bold text-[var(--txt-2)] uppercase tracking-widest mb-1">Featured</p>
            <h2 className="text-lg font-bold text-[var(--txt)] mb-2 group-hover:text-accent transition-colors">{featured.title}</h2>
            {featured.excerpt && <p className="text-[13.5px] text-[var(--txt-2)] mb-3 line-clamp-2">{featured.excerpt}</p>}
            <div className="flex items-center gap-3 text-[12px] text-[var(--txt-2)]">
              <span>{featured.author || "PDF24x Team"}</span>
              {featured.published_at && <span>· {new Date(featured.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
              <span className="flex items-center gap-1 ml-auto text-accent font-medium">Read more <ArrowRight size={13} /></span>
            </div>
          </div>
        </Link>

        {/* Rest of posts */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`}
                className="block bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden hover:border-accent/40 hover:shadow-md transition-all group">
                {post.hero_image && (
                  <img src={post.hero_image} alt={post.hero_alt || post.title}
                    className="w-full h-40 object-cover" />
                )}
                <div className="p-4">
                  <h2 className="text-[14px] font-bold text-[var(--txt)] mb-2 line-clamp-2 group-hover:text-accent transition-colors">{post.title}</h2>
                  {post.excerpt && <p className="text-[12.5px] text-[var(--txt-2)] line-clamp-2 mb-3">{post.excerpt}</p>}
                  <div className="flex items-center justify-between text-[11px] text-[var(--txt-2)]">
                    <span>{post.author || "PDF24x Team"}</span>
                    {post.published_at && <span>{new Date(post.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
