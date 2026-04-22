// Centralized list of website route prefixes (renamed from former /w/* layout).
// Used by shared pages (calculators, subscription, admin) to decide whether
// they're being rendered inside the website shell vs. the mobile app shell.

const WEBSITE_PATHS = [
  "/features",
  "/pricing",
  "/about-us",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
  "/disclaimer-info",
  "/account",
  "/subscription-plans",
  "/steroid-tool",
  "/maintenance-tool",
  "/gestation-tool",
  "/diaform-tool",
  "/admin-panel",
];

export const isWebsitePath = (pathname: string): boolean => {
  if (pathname === "/") return true;
  return WEBSITE_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
};

// Convenience route map for navigation from shared pages.
export const websiteRoutes = {
  home: "/",
  features: "/features",
  pricing: "/pricing",
  about: "/about-us",
  contact: "/contact",
  faq: "/faq",
  privacy: "/privacy",
  terms: "/terms",
  disclaimer: "/disclaimer-info",
  profile: "/account",
  subscription: "/subscription-plans",
  subscriptionSuccess: "/subscription-plans/success",
  steroid: "/steroid-tool",
  maintenance: "/maintenance-tool",
  gestation: "/gestation-tool",
  diaform: "/diaform-tool",
  admin: "/admin-panel",
};
