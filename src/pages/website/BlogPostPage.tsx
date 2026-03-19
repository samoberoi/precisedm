import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Tag } from "lucide-react";
import { blogPosts } from "./blogData";
import ScrollReveal from "@/components/website/ScrollReveal";
import { useEffect } from "react";

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  useEffect(() => {
    if (post) document.title = `${post.title} | PreciseDM Blog`;
  }, [post]);

  if (!post) {
    return (
      <div className="py-32 text-center">
        <h1 className="text-3xl font-extrabold text-foreground mb-4">Post Not Found</h1>
        <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
        <Link to="/w/blog" className="text-primary font-semibold hover:underline">← Back to Blog</Link>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <div className="h-72 sm:h-96 lg:h-[28rem] overflow-hidden">
          <img src={post.img} alt={post.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-3xl px-6 pb-10 lg:pb-14">
            <ScrollReveal>
              <Link to="/w/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mb-5">
                <ArrowLeft className="h-4 w-4" /> Back to Blog
              </Link>
              <span className="inline-block rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1 mb-4">
                <Tag className="inline h-3 w-3 mr-1 -mt-0.5" />{post.category}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight tracking-tight">{post.title}</h1>
              <div className="flex items-center gap-4 mt-5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{post.date}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{post.read}</span>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-extrabold prose-headings:tracking-tight prose-h2:text-2xl prose-h3:text-xl prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-li:text-muted-foreground prose-a:text-primary prose-blockquote:border-primary/50 prose-table:text-sm prose-th:text-foreground prose-td:text-muted-foreground">
            {/* Render markdown-like content as HTML */}
            <BlogContent content={post.content} />
          </div>
        </div>
      </article>

      {/* Related posts */}
      <section className="border-t border-border py-16 lg:py-20">
        <div className="mx-auto max-w-[1440px] px-6 xl:px-10">
          <h2 className="text-2xl font-extrabold text-foreground mb-10">More Articles</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts
              .filter((p) => p.slug !== slug)
              .slice(0, 3)
              .map((p) => (
                <Link
                  key={p.slug}
                  to={`/w/blog/${p.slug}`}
                  className="group rounded-2xl bg-card border border-border shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="h-44 overflow-hidden">
                    <img src={p.img} alt={p.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <span className="inline-block rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1 mb-2">{p.category}</span>
                    <h3 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors">{p.title}</h3>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{p.excerpt}</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  );
};

/* Simple markdown-ish renderer for the blog content */
const BlogContent = ({ content }: { content: string }) => {
  const lines = content.trim().split("\n");
  const html: string[] = [];
  let inList = false;
  let inTable = false;
  let tableRows: string[][] = [];

  const flushTable = () => {
    if (tableRows.length < 2) return;
    const header = tableRows[0];
    const body = tableRows.slice(2); // skip separator row
    let t = `<table><thead><tr>${header.map((h) => `<th>${h.trim()}</th>`).join("")}</tr></thead><tbody>`;
    body.forEach((row) => {
      t += `<tr>${row.map((c) => `<td>${c.trim()}</td>`).join("")}</tr>`;
    });
    t += "</tbody></table>";
    html.push(t);
    tableRows = [];
    inTable = false;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    // Table rows
    if (line.startsWith("|") && line.endsWith("|")) {
      if (!inTable) inTable = true;
      const cells = line.split("|").filter((c) => c !== "");
      // Check separator row
      if (cells.every((c) => /^[\s-:]+$/.test(c))) {
        tableRows.push(cells);
        continue;
      }
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (inList && !line.startsWith("- ")) {
      html.push("</ul>");
      inList = false;
    }

    if (line.startsWith("### ")) {
      html.push(`<h3>${inline(line.slice(4))}</h3>`);
    } else if (line.startsWith("## ")) {
      html.push(`<h2>${inline(line.slice(3))}</h2>`);
    } else if (line.startsWith("---")) {
      html.push("<hr />");
    } else if (line.startsWith("- ")) {
      if (!inList) { html.push("<ul>"); inList = true; }
      html.push(`<li>${inline(line.slice(2))}</li>`);
    } else if (line.trim() === "") {
      // skip
    } else if (line.startsWith("*") && line.endsWith("*")) {
      html.push(`<p><em>${inline(line.slice(1, -1))}</em></p>`);
    } else {
      html.push(`<p>${inline(line)}</p>`);
    }
  }

  if (inList) html.push("</ul>");
  if (inTable) flushTable();

  return <div dangerouslySetInnerHTML={{ __html: html.join("") }} />;
};

function inline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

export default BlogPostPage;
