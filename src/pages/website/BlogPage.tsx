import { Clock } from "lucide-react";
import ScrollReveal from "@/components/website/ScrollReveal";
import heroDoctor from "@/assets/hero-doctor.jpg";
import aboutHero from "@/assets/about-hero.jpg";
import visionImage from "@/assets/vision-image.jpg";
import missionImage from "@/assets/mission-image.jpg";
import diaformCard from "@/assets/diaform-card.jpg";
import connectHero from "@/assets/connect-hero.jpg";

const posts = [
  { img: heroDoctor, title: "Understanding Initial Insulin Dosing: A Guide for Practitioners", excerpt: "Learn the fundamentals of calculating initial insulin doses using evidence-based algorithms and BMI categorization.", date: "Mar 15, 2026", read: "5 min read", category: "Clinical Guide" },
  { img: diaformCard, title: "How DiaForm Simplifies the 50/50 Basal-Prandial Split", excerpt: "Explore how our DiaForm calculator automates the TDD calculation and provides accurate basal-prandial split recommendations.", date: "Mar 10, 2026", read: "4 min read", category: "Product" },
  { img: aboutHero, title: "Managing Steroid-Induced Hyperglycemia", excerpt: "Best practices for insulin dosing when patients are on corticosteroid therapy and experiencing elevated blood glucose.", date: "Mar 5, 2026", read: "6 min read", category: "Clinical Guide" },
  { img: visionImage, title: "The Future of Diabetes Care Technology", excerpt: "How digital health tools like Precise DM are transforming the way healthcare providers manage diabetes treatment.", date: "Feb 28, 2026", read: "4 min read", category: "Industry" },
  { img: missionImage, title: "Insulin Sensitivity Factor: What You Need to Know", excerpt: "A deep dive into the ISF formula (1800/TDD) and how it guides maintenance dose adjustments.", date: "Feb 20, 2026", read: "5 min read", category: "Clinical Guide" },
  { img: connectHero, title: "Gestational Diabetes: Dosing Considerations", excerpt: "Trimester-specific insulin adjustments and how our Gestation calculator accounts for changing needs during pregnancy.", date: "Feb 15, 2026", read: "7 min read", category: "Clinical Guide" },
];

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
          {posts.map((post, i) => (
            <ScrollReveal key={i} delay={i * 0.06}>
              <article className="group rounded-2xl bg-card border border-border shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
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
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default BlogPage;
