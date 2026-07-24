import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { blogPosts, getPostBySlug } from "@/lib/blogPosts";
import ReactMarkdown from "react-markdown";

export const revalidate = 3600;
export const dynamicParams = true;


function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
  return createClient(url, key);
}

async function getPost(slug: string) {
  // Always check static first for static slugs
  const staticPost = getPostBySlug(slug);

  // Try Supabase
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const { data, error } = await createClient(url, key)
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();
      if (data && !error) return { ...data, fromSupabase: true };
    }
  } catch {}

  // Fall back to static
  if (staticPost) return {
    ...staticPost,
    fromSupabase: false,
    hero_image: staticPost.image,
    hero_alt: staticPost.title,
    published_at: staticPost.dateISO,
    seo_title: staticPost.title,
    seo_description: staticPost.excerpt,
  };
  return null;
}


export async function generateStaticParams() {
  const staticSlugs = blogPosts.map(p => ({ slug: p.slug }));
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const { data } = await createClient(url, key)
        .from("blog_posts")
        .select("slug")
        .eq("published", true);
      const dbSlugs = (data ?? []).map((p: { slug: string }) => ({ slug: p.slug }));
      return [...staticSlugs, ...dbSlugs];
    }
  } catch {}
  return staticSlugs;
}
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    alternates: { canonical: `https://pdf24x.com/blog/${params.slug}` },
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      images: post.hero_image ? [post.hero_image] : [],
    },
  };
}



export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.seo_description || post.excerpt,
    "author": { "@type": "Person", "name": post.author || "PDF24x Team" },
    "publisher": { "@type": "Organization", "name": "PDF24X", "url": "https://pdf24x.com" },
    "datePublished": post.published_at || post.dateISO,
    "url": `https://pdf24x.com/blog/${params.slug}`,
    "image": post.hero_image || post.image || "https://pdf24x.com/og-image.png",
  };

  const content = post.content || "";
  const isHtml = content.trim().startsWith("<");

  return (
    <div className="w-full flex gap-0 items-start">
      <Sidebar />
      <main role="main" className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-8 max-w-4xl">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-[13px] text-[var(--txt-2)] hover:text-accent mb-5 transition-colors">
          <ArrowLeft size={14} /> Back to Blog
        </Link>
        {(post.hero_image || post.image) && (
          <div className="rounded-2xl overflow-hidden mb-6">
            <img
              src={post.hero_image || post.image}
              alt={post.hero_alt || post.title}
              className="w-full h-auto max-h-80 object-cover"
            />
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--txt)] mb-3 leading-tight">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-[12px] text-[var(--txt-2)] mb-6 pb-5 border-b border-[var(--border)]">
          <span className="font-medium text-[var(--txt)]">{post.author || "PDF24x Team"}</span>
          {(post.published_at || post.dateISO) && (
            <span>{new Date(post.published_at || post.dateISO).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
          )}
        </div>
        <article className="prose prose-sm sm:prose max-w-none
          prose-headings:text-[var(--txt)] prose-headings:font-bold
          prose-p:text-[var(--txt)] prose-p:leading-relaxed
          prose-a:text-accent prose-a:no-underline hover:prose-a:underline
          prose-strong:text-[var(--txt)]
          prose-code:text-accent prose-code:bg-[var(--surface)] prose-code:px-1 prose-code:rounded
          prose-pre:bg-[var(--surface)] prose-pre:border prose-pre:border-[var(--border)]
          prose-li:text-[var(--txt)]
          prose-table:text-[var(--txt)] prose-th:text-[var(--txt)] prose-td:text-[var(--txt)]">
          {isHtml
            ? <div dangerouslySetInnerHTML={{ __html: content }} />
            : <ReactMarkdown>{content}</ReactMarkdown>
          }
        </article>
      </main>
    </div>
  );
}
