import type { Metadata } from "next";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Clock, ArrowRight } from "lucide-react";
import { blogPosts } from "@/lib/blogPosts";
import { AdUnit } from "@/components/ads/AdUnit";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 60;

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

async function getSupabasePosts() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const supabase = createClient(url, key);
    const { data } = await supabase
      .from("blog_posts")
      .select("slug,title,excerpt,author,hero_image,hero_alt,published_at,tag")
      .eq("published", true)
      .order("published_at", { ascending: false });
    return (data ?? []).map(p => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt || "",
      author: p.author || "PDF24x Team",
      image: p.hero_image || "",
      imageAlt: p.hero_alt || p.title,
      date: p.published_at ? new Date(p.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "",
      tag: p.tag || "Tools",
      read: "5 min read",
    }));
  } catch { return []; }
}

export default async function BlogPage() {
  const supabasePosts = await getSupabasePosts();
  const staticSlugs = new Set(blogPosts.map(p => p.slug));
  const newPosts = supabasePosts.filter(p => !staticSlugs.has(p.slug));

  const staticMapped = blogPosts.map(p => ({
    slug: p.slug, title: p.title, excerpt: p.excerpt,
    author: p.author, image: p.image, imageAlt: p.title,
    date: p.date, tag: p.tag, read: p.read,
  }));

  const allPosts = [...newPosts, ...staticMapped];
  const featured = allPosts[0];
  const rest = allPosts.slice(1);

  return (
    <div className="w-full flex gap-0 items-start">
      <Sidebar />
      <main role="main" className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--txt)] mb-1">Tech Blog</h1>
        <p className="text-[13.5px] text-[var(--txt-2)] mb-6">
          Practical guides on PDF conversion, compression, merging, and free tools for getting more done.
        </p>

        {featured && (
          <Link href={`/blog/${featured.slug}`}
            className="block bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden hover:border-accent/40 hover:shadow-lg transition-all group mb-6">
            {featured.image && (
              <div className="relative w-full bg-black overflow-hidden rounded-t-2xl" style={{ maxHeight: "320px" }}>
                <img src={featured.image} alt={featured.imageAlt}
                  className="w-full h-auto block" style={{ maxHeight: "320px", objectFit: "cover" }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute top-4 left-4">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm ${tagStyles[featured.tag] ?? "bg-white/80 text-gray-700 border-gray-200"}`}>
                    {featured.tag}
                  </span>
                </div>
              </div>
            )}
            <div className="p-5">
              <h2 className="text-lg font-bold text-[var(--txt)] mb-2 group-hover:text-accent transition-colors">{featured.title}</h2>
              <p className="text-[13.5px] text-[var(--txt-2)] mb-3 line-clamp-2">{featured.excerpt}</p>
              <div className="flex items-center gap-3 text-[12px] text-[var(--txt-2)]">
                <span>{featured.author}</span>
                <span>·</span><span>{featured.date}</span>
                <span className="flex items-center gap-1 ml-auto text-accent font-medium">Read more <ArrowRight size={13} /></span>
              </div>
            </div>
          </Link>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="block bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden hover:border-accent/40 hover:shadow-md transition-all group">
              {post.image && (
                <img src={post.image} alt={post.imageAlt} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tagStyles[post.tag] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                    {post.tag}
                  </span>
                  <span className="text-[11px] text-[var(--txt-2)] flex items-center gap-1"><Clock size={10} />{post.read}</span>
                </div>
                <h2 className="text-[14px] font-bold text-[var(--txt)] mb-2 line-clamp-2 group-hover:text-accent transition-colors">{post.title}</h2>
                <p className="text-[12.5px] text-[var(--txt-2)] line-clamp-2">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
