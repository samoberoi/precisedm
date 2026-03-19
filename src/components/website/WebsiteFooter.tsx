import { Link } from "react-router-dom";
import logoIcon from "@/assets/logo-icon.png";

const footerLinks = {
  Product: [
    { label: "Features", to: "/w/features" },
    { label: "Pricing", to: "/w/pricing" },
    { label: "Blog", to: "/w/blog" },
    { label: "FAQs", to: "/w/faq" },
  ],
  Company: [
    { label: "About Us", to: "/w/about" },
    { label: "Contact", to: "/w/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", to: "/w/privacy" },
    { label: "Terms & Conditions", to: "/w/terms" },
    { label: "Disclaimer", to: "/w/disclaimer" },
  ],
};

const WebsiteFooter = () => (
  <footer className="border-t border-border bg-card/50">
    <div className="mx-auto max-w-[1440px] px-6 py-14 xl:px-10">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <img src={logoIcon} alt="PreciseDM" className="h-7 w-7 rounded-full" />
            <span className="text-base font-extrabold text-foreground">PreciseDM</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            An innovative insulin dosing toolkit designed for trained healthcare providers across a range of clinical scenarios.
          </p>
        </div>
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="text-sm font-bold text-foreground mb-4">{title}</h4>
            <ul className="space-y-2.5">
              {links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-12 border-t border-border pt-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} PreciseDM, LLC. All rights reserved.</p>
          <a href="mailto:precise.diabetes@gmail.com" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            precise.diabetes@gmail.com
          </a>
        </div>
        <div className="mt-4 flex justify-end">
          <p className="text-xs text-muted-foreground">
            Designed & Developed by{" "}
            <a href="https://www.hyperrevamp.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:text-primary transition-colors">
              HyperRevamp
            </a>
          </p>
        </div>
      </div>
    </div>
  </footer>
);

export default WebsiteFooter;
