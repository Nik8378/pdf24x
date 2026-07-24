import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { ArrowLeft, Clock, User, Calendar } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { blogPosts, getPostBySlug } from "@/lib/blogPosts";
import ReactMarkdown from "react-markdown";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  const staticPost = getPostBySlug(slug);
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const { data, error } = await createClient(url, key)
        .from("blog_posts")
        .select("slug,title,excerpt,content,author,hero_image,hero_alt,published_at,seo_title,seo_description")
        .eq("slug", slug)
        .eq("published", true)
        .single();
      if (data && !error) {
        return {
          slug: data.slug,
          title: data.title,
          excerpt: data.excerpt || "",
          content: data.content || "",
          author: data.author || "PDF24x Team",
          image: data.hero_image || "",
          imageAlt: data.hero_alt || data.title,
          publishedAt: data.published_at,
          seoTitle: data.seo_title || data.title,
          seoDesc: data.seo_description || data.excerpt,
          isStatic: false,
        };
      }
    }
  } catch {}
  if (staticPost) {
    return {
      slug: staticPost.slug,
      title: staticPost.title,
      excerpt: staticPost.excerpt,
      content: staticPost.content,
      author: staticPost.author,
      image: staticPost.image,
      imageAlt: staticPost.title,
      publishedAt: staticPost.dateISO,
      seoTitle: staticPost.title,
      seoDesc: staticPost.excerpt,
      isStatic: true,
    };
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.seoTitle,
    description: post.seoDesc,
    alternates: { canonical: `https://pdf24x.com/blog/${slug}` },
    openGraph: {
      title: post.seoTitle,
      description: post.seoDesc,
      images: post.image ? [{ url: post.image }] : [],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.seoDesc,
    "author": { "@type": "Person", "name": post.author },
    "publisher": { "@type": "Organization", "name": "PDF24X", "url": "https://pdf24x.com" },
    "datePublished": post.publishedAt,
    "url": `https://pdf24x.com/blog/${slug}`,
    "image": post.image || "https://pdf24x.com/og-image.png",
  };

  const isHtml = post.content.trim().startsWith("<");
  const readTime = Math.ceil(post.content.split(" ").length / 200);

  return (
    <div className="w-full flex gap-0 items-start min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main role="main" className="flex-1 min-w-0 w-full">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

        {/* Hero Image */}
        {post.image && (
          <div className="w-full bg-[var(--surface)] border-b border-[var(--border)]" style={{maxHeight:"420px",overflow:"hidden"}}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image}
              alt={post.imageAlt}
              className="w-full object-cover"
              style={{maxHeight:"420px",width:"100%",display:"block"}}
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-4xl">
          {/* Back */}
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-[13px] text-[var(--txt-2)] hover:text-accent mb-5 transition-colors">
            <ArrowLeft size={14} /> Back to Blog
          </Link>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--txt)] mb-4 leading-tight">{post.title}</h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-[12px] text-[var(--txt-2)] mb-6 pb-5 border-b border-[var(--border)]">
            <span className="flex items-center gap-1.5"><User size={13} />{post.author}</span>
            {post.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            )}
            <span className="flex items-center gap-1.5"><Clock size={13} />{readTime} min read</span>
          </div>

          {/* Ad slot — top */}
          <div className="w-full rounded-2xl bg-[var(--surface)] border border-[var(--border)] mb-6 min-h-[90px] flex items-center justify-center text-[11px] text-[var(--txt-2)] overflow-hidden">
            <ins className="adsbygoogle w-full"
              style={{display:"block"}}
              data-ad-client="ca-pub-3512613566035809"
              data-ad-slot="auto"
              data-ad-format="horizontal"
              data-full-width-responsive="true" />
          </div>

          {/* Content */}
          <article className="prose prose-sm sm:prose lg:prose-lg max-w-none
            prose-headings:text-[var(--txt)] prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-3
            prose-h2:text-xl prose-h3:text-lg
            prose-p:text-[var(--txt)] prose-p:leading-relaxed prose-p:mb-4
            prose-a:text-accent prose-a:no-underline hover:prose-a:underline
            prose-strong:text-[var(--txt)] prose-strong:font-semibold
            prose-code:text-accent prose-code:bg-[var(--surface)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[13px]
            prose-pre:bg-[var(--surface)] prose-pre:border prose-pre:border-[var(--border)] prose-pre:rounded-xl
            prose-li:text-[var(--txt)] prose-li:mb-1
            prose-table:text-[var(--txt)] prose-th:bg-[var(--surface)] prose-th:text-[var(--txt)] prose-td:text-[var(--txt)]
            prose-img:rounded-xl prose-img:w-full prose-blockquote:text-[var(--txt-2)]">
            {isHtml
              ? <div dangerouslySetInnerHTML={{ __html: post.content }} />
              : <ReactMarkdown>{post.content}</ReactMarkdown>
            }
          </article>

          {/* Ad slot — bottom */}
          <div className="w-full rounded-2xl bg-[var(--surface)] border border-[var(--border)] mt-8 mb-6 min-h-[90px] flex items-center justify-center overflow-hidden">
            <ins className="adsbygoogle w-full"
              style={{display:"block"}}
              data-ad-client="ca-pub-3512613566035809"
              data-ad-slot="auto"
              data-ad-format="horizontal"
              data-full-width-responsive="true" />
          </div>

          {/* Back to blog */}
          <div className="mt-8 pt-6 border-t border-[var(--border)]">
            <Link href="/blog"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-white font-semibold text-[14px] hover:bg-accent/90 transition-all">
              <ArrowLeft size={15} /> Back to Blog
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
