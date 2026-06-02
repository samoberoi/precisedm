import { Helmet } from "react-helmet-async";
import { SITE, type PageSeo, type FaqItem } from "@/lib/seo-config";

type SchemaName = PageSeo["schemas"][number];

const buildSchema = (name: SchemaName, page: PageSeo, canonical: string): Record<string, unknown> | null => {
  switch (name) {
    case "Organization":
      return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE.name,
        legalName: SITE.legalName,
        url: SITE.url,
        logo: SITE.logo,
        email: SITE.email,
        foundingDate: SITE.founded,
        sameAs: ["https://hyperrevamp.com"],
        contactPoint: [{
          "@type": "ContactPoint",
          email: SITE.email,
          contactType: "customer support",
          availableLanguage: ["English"],
        }],
      };
    case "WebSite":
      return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE.name,
        url: SITE.url,
        inLanguage: "en-US",
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
      };
    case "SoftwareApplication":
      return {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: SITE.name,
        applicationCategory: "HealthApplication",
        operatingSystem: "Web, iOS, Android",
        url: SITE.url,
        description: SITE.description,
        offers: [
          { "@type": "Offer", price: "0", priceCurrency: "USD", description: "7-day free trial" },
          { "@type": "Offer", price: "10.00", priceCurrency: "USD", description: "Monthly plan" },
          { "@type": "Offer", price: "72.00", priceCurrency: "USD", description: "Yearly plan" },
        ],
        aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "120" },
        creator: { "@type": "Organization", name: "HyperRevamp", url: "https://hyperrevamp.com" },
      };
    case "MedicalWebPage":
      return {
        "@context": "https://schema.org",
        "@type": "MedicalWebPage",
        name: page.title,
        description: page.description,
        url: canonical,
        inLanguage: "en-US",
        about: {
          "@type": "MedicalCondition",
          name: "Diabetes mellitus",
          alternateName: ["Type 1 diabetes", "Type 2 diabetes", "Gestational diabetes", "Steroid-induced hyperglycemia"],
        },
        audience: { "@type": "MedicalAudience", audienceType: "Healthcare professionals" },
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url, logo: SITE.logo },
      };
    case "BreadcrumbList":
      if (!page.breadcrumbs?.length) return null;
      return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: page.breadcrumbs.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: b.name,
          item: `${SITE.url}${b.path}`,
        })),
      };
    case "FAQPage":
      if (!page.faqs?.length) return null;
      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: page.faqs.map((f: FaqItem) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      };
    case "ContactPage":
      return {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: page.title,
        url: canonical,
        mainEntity: {
          "@type": "Organization",
          name: SITE.name,
          email: SITE.email,
          url: SITE.url,
        },
      };
    case "AboutPage":
      return {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: page.title,
        url: canonical,
        about: { "@type": "Organization", name: SITE.name, url: SITE.url },
      };
    default:
      return null;
  }
};

interface SeoProps {
  page: PageSeo;
}

const Seo = ({ page }: SeoProps) => {
  const canonical = `${SITE.url}${page.path === "/" ? "" : page.path}`;
  const ogImage = page.ogImage || `${SITE.url}/favicon.png`;
  const schemas = page.schemas
    .map((s) => buildSchema(s, page, canonical))
    .filter(Boolean) as Record<string, unknown>[];

  return (
    <Helmet>
      <title>{page.title}</title>
      <meta name="description" content={page.description} />
      <meta name="keywords" content={page.keywords.join(", ")} />
      {page.noindex ? <meta name="robots" content="noindex, nofollow" /> : <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />}
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:title" content={page.title} />
      <meta property="og:description" content={page.description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content={SITE.locale} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE.twitter} />
      <meta name="twitter:title" content={page.title} />
      <meta name="twitter:description" content={page.description} />
      <meta name="twitter:image" content={ogImage} />

      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
      ))}
    </Helmet>
  );
};

export default Seo;
