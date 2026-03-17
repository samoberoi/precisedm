import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Calculator, BookOpen, CreditCard, Users, MessageSquare, HelpCircle } from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import logoIcon from "@/assets/logo-icon.png";
import AuthSlidePanel from "./AuthSlidePanel";

const navLinks = [
  { label: "Home", to: "/w" },
  { label: "Features", to: "/w/features" },
  { label: "Pricing", to: "/w/pricing" },
  { label: "About", to: "/w/about" },
  { label: "Blog", to: "/w/blog" },
  { label: "Contact", to: "/w/contact" },
];

const floatingLinks = [
  { label: "Features", to: "/w/features", icon: Calculator },
  { label: "Pricing", to: "/w/pricing", icon: CreditCard },
  { label: "About", to: "/w/about", icon: Users },
  { label: "Blog", to: "/w/blog", icon: BookOpen },
  { label: "Contact", to: "/w/contact", icon: MessageSquare },
  { label: "FAQ", to: "/w/faq", icon: HelpCircle },
];

const WebsiteHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolledPastHero(latest > 400);
  });

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <>
      {/* ─── Top Header: visible when NOT scrolled ─── */}
      <AnimatePresence>
        {!scrolledPastHero && (
          <motion.header
            initial={{ y: 0 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-2xl"
          >
            <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 xl:px-10">
              <Link to="/w" className="flex items-center gap-2.5">
                <img src={logoIcon} alt="PreciseDM" className="h-8 w-8 rounded-full" />
                <span className="text-lg font-extrabold tracking-tight text-foreground">Precise DM</span>
              </Link>

              <nav className="hidden items-center gap-0.5 md:flex">
                {navLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors hover:bg-accent ${
                      location.pathname === l.to ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>

              <div className="hidden items-center gap-2.5 md:flex">
                {user ? (
                  <Button onClick={() => navigate("/home")} className="rounded-xl gradient-primary glow-primary font-semibold">
                    Go to App
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" onClick={() => openAuth("login")} className="rounded-xl font-semibold">
                      Log In
                    </Button>
                    <Button onClick={() => openAuth("signup")} className="rounded-xl gradient-primary glow-primary font-semibold">
                      Get Started
                    </Button>
                  </>
                )}
              </div>

              <button onClick={() => setMobileOpen(!mobileOpen)} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border md:hidden">
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
              {mobileOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden border-b border-border bg-background md:hidden"
                >
                  <nav className="flex flex-col gap-1 px-5 py-4">
                    {navLinks.map((l) => (
                      <Link
                        key={l.to}
                        to={l.to}
                        onClick={() => setMobileOpen(false)}
                        className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                          location.pathname === l.to ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-accent"
                        }`}
                      >
                        {l.label}
                      </Link>
                    ))}
                    <div className="mt-3 flex flex-col gap-2">
                      {user ? (
                        <Button onClick={() => { setMobileOpen(false); navigate("/home"); }} className="rounded-xl gradient-primary glow-primary font-semibold">
                          Go to App
                        </Button>
                      ) : (
                        <>
                          <Button variant="outline" onClick={() => { setMobileOpen(false); openAuth("login"); }} className="rounded-xl font-semibold">
                            Log In
                          </Button>
                          <Button onClick={() => { setMobileOpen(false); openAuth("signup"); }} className="rounded-xl gradient-primary glow-primary font-semibold">
                            Get Started
                          </Button>
                        </>
                      )}
                    </div>
                  </nav>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.header>
        )}
      </AnimatePresence>

      {/* ─── Floating Bottom Nav: visible when scrolled past hero ─── */}
      <AnimatePresence>
        {scrolledPastHero && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 hidden md:flex"
          >
            <div className="flex items-center gap-1 rounded-2xl bg-card/90 backdrop-blur-2xl border border-border/60 shadow-2xl px-2 py-2">
              <Link to="/w" className="flex items-center gap-2 px-3 py-2 mr-1">
                <img src={logoIcon} alt="PreciseDM" className="h-7 w-7 rounded-full" />
              </Link>
              {floatingLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all hover:bg-accent ${
                    location.pathname === l.to ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  }`}
                >
                  <l.icon className="h-3.5 w-3.5" />
                  {l.label}
                </Link>
              ))}
              <div className="w-px h-6 bg-border mx-1" />
              {user ? (
                <Button size="sm" onClick={() => navigate("/home")} className="rounded-xl gradient-primary glow-primary font-semibold text-xs h-8 px-4">
                  App
                </Button>
              ) : (
                <>
                  <Button size="sm" variant="ghost" onClick={() => openAuth("login")} className="rounded-xl font-semibold text-xs h-8">
                    Log In
                  </Button>
                  <Button size="sm" onClick={() => openAuth("signup")} className="rounded-xl gradient-primary glow-primary font-semibold text-xs h-8 px-4">
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Mobile floating bottom bar when scrolled ─── */}
      <AnimatePresence>
        {scrolledPastHero && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
          >
            <div className="flex items-center justify-between rounded-2xl bg-card/90 backdrop-blur-2xl border border-border/60 shadow-2xl px-4 py-3">
              <Link to="/w" className="flex items-center gap-2">
                <img src={logoIcon} alt="PreciseDM" className="h-7 w-7 rounded-full" />
                <span className="text-sm font-bold text-foreground">Precise DM</span>
              </Link>
              {user ? (
                <Button size="sm" onClick={() => navigate("/home")} className="rounded-xl gradient-primary glow-primary font-semibold text-xs h-8 px-4">
                  Go to App
                </Button>
              ) : (
                <Button size="sm" onClick={() => openAuth("signup")} className="rounded-xl gradient-primary glow-primary font-semibold text-xs h-8 px-4">
                  Get Started
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Slide Panel */}
      <AuthSlidePanel open={authOpen} onOpenChange={setAuthOpen} mode={authMode} />
    </>
  );
};

export default WebsiteHeader;
