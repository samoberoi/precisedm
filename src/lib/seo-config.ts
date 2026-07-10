// Central SEO / AEO / GEO configuration for PreciseDM
// Single source of truth used by both <Seo /> components and the reporting dashboard.

export const SITE = {
  name: "PreciseDM",
  legalName: "PreciseDM, LLC",
  url: "https://www.precisedm.com",
  logo: "https://www.precisedm.com/favicon.png",
  email: "precise.diabetes@gmail.com",
  twitter: "@HyperRevamp",
  locale: "en_US",
  founded: "2024",
  description:
    "PreciseDM offers four evidence-based insulin dosing calculators—DiaForm (Starting), Maintenance, Steroid, and Gestation—built for trained healthcare professionals.",
};

export type FaqItem = { q: string; a: string };

export type PageSeo = {
  path: string;
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  schemas: ("Organization" | "WebSite" | "SoftwareApplication" | "MedicalWebPage" | "BreadcrumbList" | "FAQPage" | "ContactPage" | "AboutPage")[];
  faqs?: FaqItem[];
  breadcrumbs?: { name: string; path: string }[];
  noindex?: boolean;
};

// ---------- Keyword universe (used for keyword tracker on the dashboard) ----------
export const TRACKED_KEYWORDS: string[] = [
  // Core product
  "insulin dosing calculator",
  "insulin dose calculator",
  "diabetes insulin calculator",
  "starting insulin dose calculator",
  "maintenance insulin dose calculator",
  "steroid induced hyperglycemia calculator",
  "gestational diabetes insulin calculator",
  "evidence based insulin dosing",
  "individualized insulin dosing",
  "basal bolus insulin calculator",
  "insulin to carb ratio calculator",
  "insulin sensitivity factor calculator",
  "correction insulin dose calculator",
  "total daily dose insulin calculator",
  "weight based insulin dosing",
  // Persona / use cases
  "insulin calculator for pharmacists",
  "insulin calculator for nurse practitioners",
  "insulin calculator for physicians",
  "insulin dosing tool for hospitals",
  "diabetes management software for clinicians",
  "clinical pharmacy diabetes tool",
  "inpatient insulin calculator",
  "hospital insulin dosing app",
  "diabetes care decision support",
  "insulin titration tool",
  // Conditions
  "steroid induced diabetes management",
  "gestational diabetes management tool",
  "type 2 diabetes insulin starting dose",
  "type 1 diabetes insulin calculator",
  "insulin dosing in pregnancy",
  "prednisone insulin adjustment calculator",
  "dexamethasone insulin adjustment",
  // Long tail / AEO
  "how to calculate starting insulin dose",
  "what is the formula for insulin dose adjustment",
  "how much insulin for steroid induced hyperglycemia",
  "how to dose insulin in pregnancy",
  "how to titrate basal insulin",
  "how do pharmacists calculate insulin doses",
  "what is the safest way to start insulin",
  "how to adjust insulin after starting steroids",
  // Brand
  "PreciseDM",
  "Precise DM",
  "DiaForm calculator",
  "DiaForm insulin",
  "PreciseDM app",
  "PreciseDM login",
  "PreciseDM pricing",
  // Geo / market
  "insulin calculator USA",
  "diabetes app for healthcare providers United States",
  "telehealth insulin dosing",
];

// ---------- FAQ corpus (mirrors FAQPage + extra AEO content) ----------
export const FAQS = {
  general: [
    {
      q: "What is PreciseDM?",
      a: "PreciseDM is an evidence-based insulin dosing toolkit for trained healthcare providers. It bundles four calculators—DiaForm (Starting), Maintenance, Steroid, and Gestation—to help clinicians individualize starting and ongoing insulin doses across common clinical scenarios.",
    },
    {
      q: "Who can use PreciseDM?",
      a: "PreciseDM is designed for licensed healthcare professionals, including physicians, pharmacists, nurse practitioners, physician assistants, and registered nurses with credentials to prescribe or manage insulin therapy.",
    },
    {
      q: "Is PreciseDM a replacement for clinical judgment?",
      a: "No. PreciseDM provides recommended dosage ranges based on evidence-based algorithms. Final dosing decisions must always rest with the prescribing clinician based on the full clinical picture.",
    },
    {
      q: "Is PreciseDM HIPAA compliant?",
      a: "PreciseDM does not require any patient identifiers to perform calculations. No protected health information (PHI) is required or stored alongside calculations.",
    },
  ],
  calculators: [
    {
      q: "Which insulin dosing calculators are included?",
      a: "Four: DiaForm (Starting insulin dosing), Maintenance (ongoing dose adjustments using ISF and corrections), Steroid (steroid-induced hyperglycemia dosing) and Gestation (pregnancy insulin dosing).",
    },
    {
      q: "How does the Starting (DiaForm) calculator work?",
      a: "DiaForm uses weight-based total daily dose (TDD) logic combined with diabetes type and clinical context to recommend a safe starting basal–bolus split for insulin-naive patients.",
    },
    {
      q: "How does the Steroid calculator adjust for prednisone or dexamethasone?",
      a: "The Steroid tool factors in steroid type, dose and timing, eGFR category, and weight to suggest insulin dose increments that account for the hyperglycemic effect of corticosteroids.",
    },
    {
      q: "Can I save my calculations?",
      a: "Yes. Every calculation is automatically saved to your secure account history so you can review past sessions from your profile page.",
    },
  ],
  subscription: [
    {
      q: "Do you offer a free trial?",
      a: "Yes. Every new account gets a 7-day free trial with full access to all four calculators—no credit card required.",
    },
    {
      q: "How much does PreciseDM cost?",
      a: "PreciseDM is $10 per month or $72 per year after the free trial. Yearly subscribers save 40% versus monthly billing.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes. You can cancel from PayPal at any time and your access remains active until the end of the current billing period.",
    },
    {
      q: "What payment methods are accepted?",
      a: "Payments are processed via PayPal, which supports major credit and debit cards as well as PayPal balance.",
    },
  ],
  account: [
    {
      q: "How do I reset my password?",
      a: "PreciseDM uses secure one-time-password (OTP) login. Just enter your email on the login page and we will email you a fresh 6-digit code.",
    },
    {
      q: "Can I use PreciseDM on multiple devices?",
      a: "Yes. Your subscription works across desktop browsers and the mobile app on iOS and Android.",
    },
    {
      q: "Is there a mobile app?",
      a: "Yes—PreciseDM ships as both a responsive web app and a native iOS / Android app built with Capacitor.",
    },
  ],
} satisfies Record<string, FaqItem[]>;

export const ALL_FAQS: FaqItem[] = [
  ...FAQS.general,
  ...FAQS.calculators,
  ...FAQS.subscription,
  ...FAQS.account,
];

// ---------- Per-page SEO definitions ----------
const baseKw = ["insulin dosing calculator", "diabetes management", "PreciseDM"];

export const PAGES: PageSeo[] = [
  {
    path: "/",
    title: "PreciseDM — Precision Insulin Dosing Calculators for Healthcare Providers",
    description:
      "Four evidence-based insulin dosing calculators—DiaForm, Maintenance, Steroid and Gestation—for physicians, pharmacists and nurse practitioners. Free 7-day trial.",
    keywords: [
      ...baseKw,
      "starting insulin dose calculator",
      "evidence based insulin dosing",
      "individualized insulin dosing",
      "DiaForm calculator",
      "insulin calculator for pharmacists",
    ],
    schemas: ["Organization", "WebSite", "SoftwareApplication", "FAQPage", "BreadcrumbList"],
    faqs: FAQS.general.slice(0, 3),
    breadcrumbs: [{ name: "Home", path: "/" }],
  },
  {
    path: "/features",
    title: "Features — PreciseDM Insulin Dosing Calculators",
    description:
      "Explore all four PreciseDM calculators: Starting (DiaForm), Maintenance, Steroid-induced hyperglycemia and Gestational diabetes. Built for trained clinicians.",
    keywords: [
      ...baseKw,
      "basal bolus insulin calculator",
      "insulin sensitivity factor calculator",
      "correction insulin dose calculator",
      "weight based insulin dosing",
      "diabetes care decision support",
    ],
    schemas: ["MedicalWebPage", "BreadcrumbList", "SoftwareApplication"],
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Features", path: "/features" }],
  },
  {
    path: "/pricing",
    title: "Pricing — PreciseDM | $10/mo or $72/yr with 7-Day Free Trial",
    description:
      "Simple pricing for PreciseDM: 7-day free trial, then $10/month or $72/year. Cancel anytime via PayPal. Designed for healthcare providers.",
    keywords: [
      ...baseKw,
      "PreciseDM pricing",
      "insulin calculator subscription",
      "diabetes app for clinicians pricing",
    ],
    schemas: ["MedicalWebPage", "BreadcrumbList", "FAQPage"],
    faqs: FAQS.subscription,
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }],
  },
  {
    path: "/about-us",
    title: "About PreciseDM — Built by Diabetes Care Experts",
    description:
      "PreciseDM was founded by Dr. Colleen Cook, PharmD, BC-ADM, CDCES, with a mission to bring evidence-based insulin dosing tools to every clinician.",
    keywords: [...baseKw, "PreciseDM team", "Colleen Cook PharmD", "diabetes care experts"],
    schemas: ["AboutPage", "Organization", "BreadcrumbList"],
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "About Us", path: "/about-us" }],
  },
  {
    path: "/contact",
    title: "Contact PreciseDM — Get in Touch with Our Team",
    description:
      "Reach the PreciseDM team for product questions, partnership inquiries or institutional licensing. We respond to every message.",
    keywords: [...baseKw, "PreciseDM contact", "diabetes app support"],
    schemas: ["ContactPage", "Organization", "BreadcrumbList"],
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }],
  },
  {
    path: "/faq",
    title: "FAQs — PreciseDM Insulin Dosing Calculators",
    description:
      "Answers to common questions about PreciseDM calculators, subscription, account and clinical use. Voice-search and AI-assistant ready.",
    keywords: [
      ...baseKw,
      "PreciseDM FAQ",
      "how to calculate starting insulin dose",
      "how much insulin for steroid induced hyperglycemia",
      "how to dose insulin in pregnancy",
    ],
    schemas: ["FAQPage", "BreadcrumbList"],
    faqs: ALL_FAQS,
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "FAQs", path: "/faq" }],
  },
  {
    path: "/privacy",
    title: "Privacy Policy — PreciseDM",
    description:
      "How PreciseDM collects, uses and protects your data. We never sell user information and store only what is needed to operate your account.",
    keywords: [...baseKw, "PreciseDM privacy policy", "diabetes app privacy"],
    schemas: ["MedicalWebPage", "BreadcrumbList"],
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Privacy", path: "/privacy" }],
  },
  {
    path: "/terms",
    title: "Terms & Conditions — PreciseDM",
    description: "Terms of service governing the use of PreciseDM by trained healthcare providers.",
    keywords: [...baseKw, "PreciseDM terms", "insulin calculator terms of service"],
    schemas: ["MedicalWebPage", "BreadcrumbList"],
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Terms", path: "/terms" }],
  },
  {
    path: "/disclaimer-info",
    title: "Medical Disclaimer — PreciseDM",
    description:
      "PreciseDM provides decision support only. All dosing recommendations must be reviewed by a qualified clinician before being applied to a patient.",
    keywords: [...baseKw, "PreciseDM disclaimer", "medical disclaimer insulin calculator"],
    schemas: ["MedicalWebPage", "BreadcrumbList"],
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Disclaimer", path: "/disclaimer-info" }],
  },
  {
    path: "/diaform-tool",
    title: "DiaForm — Starting Insulin Dose Calculator | PreciseDM",
    description:
      "DiaForm calculates evidence-based starting insulin doses (basal–bolus) for insulin-naive patients using weight, diabetes type and clinical context.",
    keywords: [
      ...baseKw,
      "starting insulin dose calculator",
      "DiaForm calculator",
      "type 2 diabetes insulin starting dose",
      "basal bolus insulin calculator",
    ],
    schemas: ["MedicalWebPage", "SoftwareApplication", "BreadcrumbList"],
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Features", path: "/features" },
      { name: "DiaForm", path: "/diaform-tool" },
    ],
  },
  {
    path: "/maintenance-tool",
    title: "Maintenance Insulin Dose Calculator | PreciseDM",
    description:
      "Maintenance adjusts ongoing insulin doses using insulin sensitivity factor (ISF), correction doses and titration logic for stable patients.",
    keywords: [
      ...baseKw,
      "maintenance insulin dose calculator",
      "insulin titration tool",
      "insulin sensitivity factor calculator",
      "correction insulin dose calculator",
    ],
    schemas: ["MedicalWebPage", "SoftwareApplication", "BreadcrumbList"],
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Features", path: "/features" },
      { name: "Maintenance", path: "/maintenance-tool" },
    ],
  },
  {
    path: "/steroid-tool",
    title: "Steroid-Induced Hyperglycemia Insulin Calculator | PreciseDM",
    description:
      "The Steroid calculator suggests insulin dose adjustments for patients on prednisone, dexamethasone and other corticosteroids, factoring eGFR and weight.",
    keywords: [
      ...baseKw,
      "steroid induced hyperglycemia calculator",
      "prednisone insulin adjustment calculator",
      "dexamethasone insulin adjustment",
      "steroid induced diabetes management",
    ],
    schemas: ["MedicalWebPage", "SoftwareApplication", "BreadcrumbList"],
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Features", path: "/features" },
      { name: "Steroid", path: "/steroid-tool" },
    ],
  },
  {
    path: "/gestation-tool",
    title: "Gestational Diabetes Insulin Calculator | PreciseDM",
    description:
      "The Gestation calculator delivers basal and prandial insulin recommendations tailored to pregnant patients with gestational or pre-existing diabetes.",
    keywords: [
      ...baseKw,
      "gestational diabetes insulin calculator",
      "insulin dosing in pregnancy",
      "pregnancy diabetes insulin",
    ],
    schemas: ["MedicalWebPage", "SoftwareApplication", "BreadcrumbList"],
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Features", path: "/features" },
      { name: "Gestation", path: "/gestation-tool" },
    ],
  },
  {
    path: "/subscription-plans",
    title: "Subscription Plans — PreciseDM",
    description: "Pick the PreciseDM plan that fits your practice—monthly or yearly. Start with a free 7-day trial.",
    keywords: [...baseKw, "PreciseDM subscription", "insulin calculator pricing"],
    schemas: ["MedicalWebPage", "BreadcrumbList"],
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Subscription", path: "/subscription-plans" }],
  },
  {
    path: "/account",
    title: "Your Account — PreciseDM",
    description: "Manage your PreciseDM profile, subscription and saved calculation history.",
    keywords: [...baseKw, "PreciseDM account"],
    schemas: ["BreadcrumbList"],
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Account", path: "/account" }],
    noindex: true,
  },
  {
    path: "/admin-panel",
    title: "Admin — PreciseDM",
    description: "PreciseDM administrative dashboard.",
    keywords: ["PreciseDM admin"],
    schemas: [],
    noindex: true,
  },
];

export const getPageSeo = (path: string): PageSeo | undefined =>
  PAGES.find((p) => p.path === path);
