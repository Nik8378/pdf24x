import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Clock, ArrowLeft, ArrowRight, Share2 } from "lucide-react";
import { blogPosts, getPostBySlug } from "@/lib/blogPosts";
import { AdUnit } from "@/components/ads/AdUnit";

interface Props { params: Promise<{ slug: string }>; }

export async function generateStaticParams() {
  return blogPosts.filter(Boolean).map((p) => ({ slug: p!.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `https://pdf24x.com/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.dateISO,
      authors: [post.author],
      url: `https://pdf24x.com/blog/${post.slug}`,
      images: [{ url: `https://pdf24x.com${post.image}` }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt },
  };
}

const tagStyles: Record<string, string> = {
  "PDF Guides":  "bg-amber-50 text-amber-700 border-amber-200",
  "PDF Tools":   "bg-blue-50 text-blue-700 border-blue-200",
  "Privacy":     "bg-red-50 text-red-700 border-red-200",
  "Productivity":"bg-green-50 text-green-700 border-green-200",
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const currentIdx = blogPosts.findIndex((p) => p.slug === slug);
  const prev = blogPosts[currentIdx - 1];
  const next = blogPosts[currentIdx + 1];
  const related = blogPosts.filter((p) => p.slug !== slug).slice(0, 3);


  // Article schema for Google News / rich results
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: `https://pdf24x.com${post.image}`,
    datePublished: post.dateISO,
    dateModified: post.dateISO,
    author: { "@type": "Organization", name: post.author, url: "https://pdf24x.com" },
    publisher: {
      "@type": "Organization",
      name: "PDF24x",
      url: "https://pdf24x.com",
      logo: { "@type": "ImageObject", url: "https://pdf24x.com/logo.png" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://pdf24x.com/blog/${post.slug}` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
    <div className="w-full flex gap-0 items-start">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-24 lg:pb-8">

        {/* ── Hero — full image visible, no crop ── */}
        <div className="relative w-full bg-black overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-auto block"
            style={{
              maxHeight: "420px",
              width: "100%",
              objectFit: "cover",
              objectPosition: "center top",
            }}
          />
          {/* Gradient over bottom half only */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

          {/* Back + Tag row */}
          <div className="absolute top-4 left-4 sm:left-6 lg:left-8 right-4 sm:right-6 lg:right-8 flex items-center justify-between">
            <Link href="/blog"
              className="inline-flex items-center gap-1.5 text-[12.5px] text-white/90 hover:text-white bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors">
              <ArrowLeft size={13} /> Back to Blog
            </Link>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm ${tagStyles[post.tag] ?? "bg-white/80 text-[#1a1917] border-white"}`}>
              {post.tag}
            </span>
          </div>

          {/* Title + meta pinned to bottom of image */}
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-6 pt-16">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight mb-3 max-w-3xl drop-shadow-lg">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 text-[12.5px] text-white/80 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-white">P</span>
                </div>
                <span className="font-medium text-white">{post.author}</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1">
                <Clock size={12} strokeWidth={1.8} />
                <span>{post.read}</span>
              </div>
              <span>·</span>
              <time dateTime={post.dateISO}>{post.date}</time>
            </div>
          </div>
        </div>

        {/* Excerpt strip */}
        <div className="bg-[#f4f3f0] border-b border-[#e5e3de] px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-[14px] text-[#4a4845] leading-relaxed max-w-3xl italic">{post.excerpt}</p>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-8 max-w-6xl">

            {/* Article body */}
            <article className="flex-1 min-w-0 max-w-3xl">
              <div className="mb-6">
                <AdUnit slot="3405712324" format="horizontal" className="min-h-[90px]" />
              </div>
              <div className="prose-content" dangerouslySetInnerHTML={{ __html: post.content }} />
              <div className="mt-6">
                <AdUnit slot="3405712324" format="horizontal" className="min-h-[90px]" />
              </div>

              {/* Share */}
              <div className="mt-8 pt-6 border-t border-[#e5e3de] flex items-center justify-between flex-wrap gap-3">
                <p className="text-[13px] font-semibold text-[#1a1917]">Found this helpful?</p>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://pdf24x.com/blog/${post.slug}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#4a4845] bg-white border border-[#e5e3de] hover:border-[#1a1917]/30 hover:text-[#1a1917] px-3 py-1.5 rounded-lg transition-all">
                  <Share2 size={13} /> Share on X
                </a>
              </div>

              {/* Prev / Next with thumbnail images */}
              <nav className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {prev && (
                  <Link href={`/blog/${prev.slug}`}
                    className="bg-white border border-[#e5e3de] rounded-xl overflow-hidden hover:border-accent/40 hover:shadow-sm transition-all group">
                    <div className="relative h-24 overflow-hidden bg-black">
                      <img src={prev.image} alt={prev.title}
                        className="w-full h-full"
                        style={{ objectFit: "cover", objectPosition: "center top" }} />
                      <div className="absolute inset-0 bg-black/40" />
                      <p className="absolute top-2 left-3 text-[10.5px] text-white/80 flex items-center gap-1">
                        <ArrowLeft size={10} /> Previous
                      </p>
                    </div>
                    <p className="text-[12.5px] font-semibold text-[#1a1917] group-hover:text-accent transition-colors line-clamp-2 p-3">
                      {prev.title}
                    </p>
                  </Link>
                )}
                {next && (
                  <Link href={`/blog/${next.slug}`}
                    className="bg-white border border-[#e5e3de] rounded-xl overflow-hidden hover:border-accent/40 hover:shadow-sm transition-all group">
                    <div className="relative h-24 overflow-hidden bg-black">
                      <img src={next.image} alt={next.title}
                        className="w-full h-full"
                        style={{ objectFit: "cover", objectPosition: "center top" }} />
                      <div className="absolute inset-0 bg-black/40" />
                      <p className="absolute top-2 right-3 text-[10.5px] text-white/80 flex items-center gap-1">
                        Next <ArrowRight size={10} />
                      </p>
                    </div>
                    <p className="text-[12.5px] font-semibold text-[#1a1917] group-hover:text-accent transition-colors line-clamp-2 p-3">
                      {next.title}
                    </p>
                  </Link>
                )}
              </nav>
            </article>

            {/* Sidebar */}
            <aside className="w-full lg:w-[260px] shrink-0 space-y-4">
              {/* CTA */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-5">
                <p className="text-[13px] font-bold text-[#1a1917] mb-1">Free PDF Tools</p>
                <p className="text-[12px] text-[#7a7875] mb-3 leading-relaxed">
                  Convert, compress, merge and split PDFs — free, private, no sign-up.
                </p>
                <Link href="/"
                  className="block text-center bg-accent hover:bg-accent-dark text-white font-semibold text-[13px] px-4 py-2.5 rounded-full transition-all">
                  Try PDF24x Free →
                </Link>
              </div>

              {/* Related */}
              <div className="bg-white border border-[#e5e3de] rounded-2xl overflow-hidden">
                <p className="text-[11px] font-bold text-[#1a1917] uppercase tracking-widest opacity-50 px-4 pt-4 pb-3">
                  More Articles
                </p>
                <div className="divide-y divide-[#e5e3de]">
                  {related.map((r) => (
                    <Link key={r.slug} href={`/blog/${r.slug}`}
                      className="flex gap-3 p-3 hover:bg-[#f4f3f0] transition-colors group">
                      <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-black">
                        <img src={r.image} alt={r.title}
                          className="w-full h-full"
                          style={{ objectFit: "cover", objectPosition: "center top" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${tagStyles[r.tag] ?? "bg-[#f4f3f0] text-[#7a7875] border-[#e5e3de]"}`}>
                          {r.tag}
                        </span>
                        <p className="text-[12px] font-medium text-[#1a1917] group-hover:text-accent transition-colors mt-1 leading-snug line-clamp-2">
                          {r.title}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}
