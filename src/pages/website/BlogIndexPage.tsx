import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { blogPosts } from "@/lib/blog-posts";
import { SITE } from "@/lib/seo-config";

const BlogIndexPage = () => {
  const canonical = `${SITE.url}/blog`;
  return (
    <>
      <Helmet>
        <title>PreciseDM Blog — Insights on Insulin Dosing & Diabetes Care</title>
        <meta
          name="description"
          content="Clinical insights, decision-support guidance, and practical perspectives on insulin dosing for healthcare professionals."
        />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="PreciseDM Blog" />
        <meta property="og:description" content="Clinical insights for insulin dosing and diabetes care." />
        <meta property="og:url" content={canonical} />
      </Helmet>

      <section className="mx-auto max-w-5xl px-6 pt-16 pb-10 md:pt-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">PreciseDM Blog</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
          Clinical insights on insulin dosing
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
          Practical perspectives, decision-support frameworks, and honest takes on the daily realities of diabetes care.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {[...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="aspect-[16/9] overflow-hidden bg-muted">
                <img
                  src={post.image}
                  alt={post.imageAlt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {post.category}
                </span>
                <h2 className="mt-3 text-xl font-bold leading-tight text-foreground group-hover:text-primary">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {post.readTime}
                  </span>
                </div>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export default BlogIndexPage;
