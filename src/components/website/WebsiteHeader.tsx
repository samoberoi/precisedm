import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PreciseLogo from "@/components/PreciseLogo";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Home", to: "/w" },
  { label: "Features", to: "/w/features" },
  { label: "Pricing", to: "/w/pricing" },
  { label: "About", to: "/w/about" },
  { label: "Blog", to: "/w/blog" },
  { label: "Contact", to: "/w/contact" },
];

const WebsiteHeader = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/w" className="flex items-center gap-2.5">
          <PreciseLogo size={32} variant="icon" />
          <span className="text-lg font-extrabold tracking-tight text-foreground">Precise DM</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
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
              <Button variant="ghost" onClick={() => navigate("/login")} className="rounded-xl font-semibold">
                Log In
              </Button>
              <Button onClick={() => navigate("/signup")} className="rounded-xl gradient-primary glow-primary font-semibold">
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border md:hidden">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
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
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    location.pathname === l.to ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-accent"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-3 flex flex-col gap-2">
                {user ? (
                  <Button onClick={() => { setOpen(false); navigate("/home"); }} className="rounded-xl gradient-primary glow-primary font-semibold">
                    Go to App
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => { setOpen(false); navigate("/login"); }} className="rounded-xl font-semibold">
                      Log In
                    </Button>
                    <Button onClick={() => { setOpen(false); navigate("/signup"); }} className="rounded-xl gradient-primary glow-primary font-semibold">
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default WebsiteHeader;
