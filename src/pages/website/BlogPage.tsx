import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import ScrollReveal from "@/components/website/ScrollReveal";
import { blogPosts } from "./blogData";

const BlogPage = () => (
  <div>
    <section className="py-24 lg:py-32" style={{ background: "linear-gradient(160deg, hsl(197 50% 92%), hsl(200 20% 98%))" }}>
      <div className="mx-auto max-w-[1440px] px-6 xl:px-10 text-center">
        <ScrollReveal>
          <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl lg:text-6xl tracking-tight">Precise DM <span className="text-gradient">Blog</span></h1>
          <p className="mt-6 text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">Insights, guides, and best practices for insulin dosing and diabetes care.</p>
        </ScrollReveal>
      </div>
    </section>

    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-6 xl:px-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post, i) => (
            <ScrollReveal key={post.slug} delay={i * 0.06}>
              <Link to={`/w/blog/${post.slug}`} className="block h-full">
                <article className="group rounded-2xl bg-card border border-border shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="h-52 overflow-hidden">
                    <img src={post.img} alt={post.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <span className="inline-block rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1 mb-3">{post.category}</span>
                    <h3 className="text-base font-bold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
                      <span>{post.date}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.read}</span>
                    </div>
                  </div>
                </article>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default BlogPage;
