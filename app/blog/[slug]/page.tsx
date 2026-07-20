import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";

export const revalidate = 60;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
  return createClient(url, key);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data } = await getSupabase()
    .from("blog_posts")
    .select("title,seo_title,seo_description,excerpt,hero_image,slug")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();
  if (!data) return { title: "Post Not Found" };
  return {
    title: data.seo_title || data.title,
    description: data.seo_description || data.excerpt,
    alternates: { canonical: `https://pdf24x.com/blog/${data.slug}` },
    openGraph: {
      title: data.seo_title || data.title,
      description: data.seo_description || data.excerpt,
      images: data.hero_image ? [data.hero_image] : [],
    },
  };
}

export async function generateStaticParams() {
  const { data } = await getSupabase()
    .from("blog_posts")
    .select("slug")
    .eq("published", true);
  return (data ?? []).map(p => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const supabase = getSupabase();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();

  if (!post) notFound();

  const { data: related } = await supabase
    .from("blog_posts")
    .select("slug,title,excerpt,hero_image,hero_alt,published_at")
    .eq("published", true)
    .neq("slug", params.slug)
    .limit(3);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.seo_description || post.excerpt,
    "author": { "@type": "Person", "name": post.author || "PDF24x Team" },
    "publisher": { "@type": "Organization", "name": "PDF24X", "url": "https://pdf24x.com" },
    "datePublished": post.published_at,
    "dateModified": post.updated_at || post.published_at,
    "url": `https://pdf24x.com/blog/${post.slug}`,
    "image": post.hero_image || "https://pdf24x.com/og-image.png",
  };

  return (
    <div className="w-full flex gap-0 items-start">
      <Sidebar />
      <main role="main" className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-8 max-w-4xl">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-[13px] text-[var(--txt-2)] hover:text-accent mb-5 transition-colors">
          <ArrowLeft size={14} /> Back to Blog
        </Link>
        {post.hero_image && (
          <div className="rounded-2xl overflow-hidden mb-6">
            <img src={post.hero_image} alt={post.hero_alt || post.title} className="w-full h-auto max-h-80 object-cover" />
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--txt)] mb-3 leading-tight">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-[12px] text-[var(--txt-2)] mb-6 pb-5 border-b border-[var(--border)]">
          <span className="font-medium text-[var(--txt)]">{post.author || "PDF24x Team"}</span>
          {post.published_at && (
            <span>{new Date(post.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
          )}
        </div>
        <article className="prose prose-sm sm:prose max-w-none
          prose-headings:text-[var(--txt)] prose-headings:font-bold
          prose-p:text-[var(--txt)] prose-p:leading-relaxed
          prose-a:text-accent prose-a:no-underline hover:prose-a:underline
          prose-strong:text-[var(--txt)]
          prose-code:text-accent prose-code:bg-[var(--surface)] prose-code:px-1 prose-code:rounded
          prose-pre:bg-[var(--surface)] prose-pre:border prose-pre:border-[var(--border)]
          prose-li:text-[var(--txt)]">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>
        {related && related.length > 0 && (
          <div className="mt-12 pt-6 border-t border-[var(--border)]">
            <h2 className="text-[15px] font-bold text-[var(--txt)] mb-4">Related Posts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(r => (
                <Link key={r.slug} href={`/blog/${r.slug}`}
                  className="block bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-accent/40 transition-all group">
                  {r.hero_image && <img src={r.hero_image} alt={r.hero_alt || r.title} className="w-full h-28 object-cover" />}
                  <div className="p-3">
                    <p className="text-[13px] font-semibold text-[var(--txt)] line-clamp-2 group-hover:text-accent transition-colors">{r.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
