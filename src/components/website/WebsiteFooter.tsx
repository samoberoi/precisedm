import { Link } from "react-router-dom";
import logoIcon from "@/assets/logo-icon.png";

const footerLinks = {
  Product: [
    { label: "Features", to: "/features" },
    { label: "Pricing", to: "/pricing" },
    { label: "FAQs", to: "/faq" },
  ],
  Company: [
    { label: "About Us", to: "/about-us" },
    { label: "Contact", to: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms & Conditions", to: "/terms" },
    { label: "Disclaimer", to: "/disclaimer-info" },
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
          <div className="flex items-center gap-5">
            <a
              href="https://www.instagram.com/precise_dm"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="PreciseDM on Instagram"
              className="transition-transform hover:scale-110"
            >
              <svg className="h-7 w-7" viewBox="0 0 24 24" aria-hidden="true">
                <defs>
                  <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
                    <stop offset="0%" stopColor="#fdf497" />
                    <stop offset="5%" stopColor="#fdf497" />
                    <stop offset="45%" stopColor="#fd5949" />
                    <stop offset="60%" stopColor="#d6249f" />
                    <stop offset="90%" stopColor="#285AEB" />
                  </radialGradient>
                </defs>
                <path fill="url(#ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0 1.838c-3.155 0-3.507.012-4.745.068-1.06.048-1.633.224-2.014.371a3.36 3.36 0 0 0-1.246.81 3.36 3.36 0 0 0-.81 1.246c-.147.381-.323.954-.371 2.014C2.012 8.493 2 8.845 2 12c0 3.155.012 3.507.068 4.745.048 1.06.224 1.633.371 2.014.182.466.435.835.81 1.246.411.375.78.628 1.246.81.381.147.954.323 2.014.371C8.493 21.988 8.845 22 12 22c3.155 0 3.507-.012 4.745-.068 1.06-.048 1.633-.224 2.014-.371a3.36 3.36 0 0 0 1.246-.81 3.36 3.36 0 0 0 .81-1.246c.147-.381.323-.954.371-2.014.056-1.238.068-1.59.068-4.745 0-3.155-.012-3.507-.068-4.745-.048-1.06-.224-1.633-.371-2.014a3.36 3.36 0 0 0-.81-1.246 3.36 3.36 0 0 0-1.246-.81c-.381-.147-.954-.323-2.014-.371C15.507 2.012 15.155 2 12 2zm0 3.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-10.845a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/>
              </svg>
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61588806494168"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="PreciseDM on Facebook"
              className="transition-transform hover:scale-110"
            >
              <svg className="h-7 w-7" fill="#1877F2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.99 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.99 22 12z"/>
              </svg>
            </a>
            <a href="mailto:precise.diabetes@gmail.com" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              precise.diabetes@gmail.com
            </a>
          </div>
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
