import type { Metadata } from "next";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Clock, ArrowRight } from "lucide-react";
import { blogPosts } from "@/lib/blogPosts";
import { AdUnit } from "@/components/ads/AdUnit";

export const metadata: Metadata = {
  title: "PDF Tools Blog – Guides, Tips & Free Tool Reviews",
  description: "Practical guides on converting, compressing, merging, and working with PDFs. Tips for students, freelancers, and small businesses.",
  alternates: { canonical: "https://pdf24x.com/blog" },
};

const tagStyles: Record<string, string> = {
  "PDF Guides":  "bg-amber-50 text-amber-700 border-amber-200",
  "PDF Tools":   "bg-blue-50 text-blue-700 border-blue-200",
  "Privacy":     "bg-red-50 text-red-700 border-red-200",
  "Productivity":"bg-green-50 text-green-700 border-green-200",
};

export default function BlogPage() {
  const featured = blogPosts[0];
  const rest = blogPosts.slice(1);

  return (
    <div className="w-full flex gap-0 items-start">
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--txt)] mb-1">Tech Blog</h1>
        <p className="text-[13.5px] text-[var(--txt-2)] mb-6">
          Practical guides on PDF conversion, compression, merging, and free tools for getting more done.
        </p>

        {/* ── Featured post ── */}
        <Link href={`/blog/${featured.slug}`}
          className="block bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden hover:border-accent/40 hover:shadow-lg transition-all group mb-6">

          {/* Full image — no crop, letterbox if needed */}
          <div className="relative w-full bg-black overflow-hidden rounded-t-2xl" style={{ maxHeight: "320px" }}>
            <img
              src={featured.image}
              alt={featured.title}
              className="w-full h-auto block object-contain"
              style={{ maxHeight: "320px", width: "100%", objectFit: "cover", objectPosition: "center top" }}
            />
            {/* Gradient only at bottom for text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
            {/* Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm ${tagStyles[featured.tag] ?? "bg-[var(--surface)]/80 text-[var(--txt)] border-white"}`}>
                {featured.tag}
              </span>
              <span className="text-[11px] bg-accent text-white font-bold px-2.5 py-1 rounded-full">Featured</span>
            </div>
            {/* Title on image */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
              <h2 className="text-[17px] sm:text-[20px] font-bold text-white leading-snug mb-2 group-hover:text-amber-200 transition-colors drop-shadow">
                {featured.title}
              </h2>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-[12px] text-white/80">
                  <Clock size={12} strokeWidth={1.8} />
                  <span>{featured.read}</span>
                  <span>·</span>
                  <span>{featured.date}</span>
                </div>
                <span className="flex items-center gap-1 text-[13px] font-semibold text-white group-hover:gap-2 transition-all">
                  Read article <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </div>

          {/* Excerpt below */}
          <div className="px-5 py-3">
            <p className="text-[13px] text-[var(--txt-2)] leading-relaxed">{featured.excerpt}</p>
          </div>
        </Link>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rest.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden hover:border-accent/40 hover:shadow-md transition-all group block">

              {/* Image — show full width, fixed height, top-aligned */}
              <div className="relative w-full overflow-hidden rounded-t-2xl bg-black" style={{ height: "200px" }}>
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full"
                  style={{ objectFit: "cover", objectPosition: "center top" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
                <span className={`absolute top-3 left-3 text-[10.5px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm ${tagStyles[post.tag] ?? "bg-[var(--surface)]/80 text-[var(--txt)] border-white"}`}>
                  {post.tag}
                </span>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5">
                <h2 className="text-[13.5px] font-bold text-[var(--txt)] leading-snug mb-2 group-hover:text-accent transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-[12px] text-[var(--txt-2)] leading-relaxed mb-3 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between text-[11.5px] text-[var(--txt-2)]">
                  <div className="flex items-center gap-1.5">
                    <Clock size={11} strokeWidth={1.8} />
                    <span>{post.read}</span>
                    <span>·</span>
                    <span>{post.date}</span>
                  </div>
                  <ArrowRight size={13} className="text-[var(--txt-2)] group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8">
          <AdUnit slot="3405712324" format="auto" className="min-h-[250px]" />
        </div>
      </main>
    </div>
  );
}
