import { Link, Navigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ArrowRight, Calendar, Clock, Tag } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { getBlogPost, type BlogBlock } from "@/lib/blog-posts";
import { SITE } from "@/lib/seo-config";

const renderBlock = (block: BlogBlock, i: number) => {
  switch (block.type) {
    case "h2":
      return (
        <h2 key={i} className="mt-12 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={i} className="mt-8 text-xl font-semibold text-foreground">
          {block.text}
        </h3>
      );
    case "p":
      return (
        <p key={i} className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
          {block.text}
        </p>
      );
    case "ul":
      return (
        <ul key={i} className="mt-4 space-y-2 pl-5">
          {block.items.map((item, j) => (
            <li key={j} className="list-disc text-base leading-relaxed text-muted-foreground md:text-lg">
              {item}
            </li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <div
          key={i}
          className="my-8 rounded-2xl border border-primary/20 bg-primary/5 p-5 md:p-6"
        >
          {block.href ? (
            <Link
              to={block.href}
              className="inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline"
            >
              {block.text}
            </Link>
          ) : (
            <p className="text-base font-semibold text-primary">{block.text}</p>
          )}
        </div>
      );
  }
};

const BlogPostPage = () => {
  const { slug } = useParams();
  const post = slug ? getBlogPost(slug) : undefined;

  if (!post) return <Navigate to="/blog" replace />;

  const canonical = `${SITE.url}/blog/${post.slug}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    image: [post.image.startsWith("http") ? post.image : `${SITE.url}${post.image}`],
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: SITE.logo },
    },
    mainEntityOfPage: canonical,
  };

  const faqSchema = post.faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <>
      <Helmet>
        <title>{post.metaTitle}</title>
        <meta name="description" content={post.metaDescription} />
        <meta name="keywords" content={post.keywords.join(", ")} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.metaTitle} />
        <meta property="og:description" content={post.metaDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={post.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.metaTitle} />
        <meta name="twitter:description" content={post.metaDescription} />
        <meta name="twitter:image" content={post.image} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
      </Helmet>

      <article className="mx-auto max-w-3xl px-6 pt-12 pb-24 md:pt-20">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> All articles
        </Link>

        <div className="mt-6">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {post.category}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
          {post.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {post.readTime}
          </span>
          <span className="inline-flex items-center gap-1.5">
            By <span className="font-semibold text-foreground">{post.author}</span>
          </span>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border">
          <img src={post.image} alt={post.imageAlt} className="h-auto w-full object-cover" />
        </div>

        <div className="mt-2">{post.content.map(renderBlock)}</div>

        {/* CTA */}
        <div className="mt-14 rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-8 md:p-10">
          <h3 className="text-2xl font-bold text-foreground md:text-3xl">
            Try PreciseDM in your clinical workflow
          </h3>
          <p className="mt-3 text-base text-muted-foreground">
            Four evidence-based insulin dosing tools — DiaForm (Starting), Maintenance, Steroid, and
            Gestation — designed for trained healthcare professionals.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="rounded-xl gradient-primary glow-primary font-semibold">
              <Link to="/subscription-plans">
                Start free trial <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl font-semibold">
              <Link to="/features">Explore the tools</Link>
            </Button>
          </div>
        </div>

        {/* FAQ */}
        {post.faqs.length > 0 && (
          <section className="mt-14">
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="mt-6">
              {post.faqs.map((f, i) => (
                <AccordionItem key={i} value={`q-${i}`}>
                  <AccordionTrigger className="text-left text-base font-semibold">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-border pt-8">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {post.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </article>
    </>
  );
};

export default BlogPostPage;
