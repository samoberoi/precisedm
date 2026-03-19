import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Calculator, BookOpen, CreditCard, Users, MessageSquare, HelpCircle, User, LogIn, LayoutDashboard, LogOut } from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import logoIcon from "@/assets/logo-icon.png";
import AuthSlidePanel from "./AuthSlidePanel";

const navLinks = [
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
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { firstName } = useProfile();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolledPastHero(latest > 400);
  });

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      setIsAdmin(!!data);
    });
  }, [user]);

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/w");
  };

  const initials = firstName && firstName !== "There" ? firstName.charAt(0).toUpperCase() : "U";

  const ProfileDropdown = ({ size = "default" }: { size?: "default" | "sm" }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`flex items-center justify-center rounded-full gradient-primary text-primary-foreground font-bold ${size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm"}`}>
          {initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-xl">
        <div className="px-3 py-2">
          <p className="text-sm font-bold text-foreground">{firstName}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        {isAdmin && (
          <DropdownMenuItem onClick={() => navigate("/w/admin")} className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => navigate("/w/profile")} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" /> My Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {/* ─── Top Header ─── */}
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
                <span className="text-lg font-extrabold tracking-tight text-foreground">PreciseDM</span>
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
                  <ProfileDropdown />
                ) : (
                  <Button onClick={() => openAuth("login")} className="rounded-xl gradient-primary glow-primary font-semibold gap-2">
                    <LogIn className="h-4 w-4" /> Login
                  </Button>
                )}
              </div>

              <button onClick={() => setMobileOpen(!mobileOpen)} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border md:hidden">
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

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
                        <>
                          {isAdmin && (
                            <Button variant="outline" onClick={() => { setMobileOpen(false); navigate("/w/admin"); }} className="rounded-xl font-semibold justify-start gap-2">
                              <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                            </Button>
                          )}
                          <Button variant="outline" onClick={() => { setMobileOpen(false); navigate("/w/profile"); }} className="rounded-xl font-semibold justify-start gap-2">
                            <User className="h-4 w-4" /> My Profile
                          </Button>
                          <Button variant="ghost" onClick={() => { setMobileOpen(false); handleLogout(); }} className="rounded-xl font-semibold justify-start gap-2 text-destructive">
                            <LogOut className="h-4 w-4" /> Sign Out
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => { setMobileOpen(false); openAuth("login"); }} className="rounded-xl gradient-primary glow-primary font-semibold">
                          Login
                        </Button>
                      )}
                    </div>
                  </nav>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.header>
        )}
      </AnimatePresence>

      {/* ─── Floating Bottom Nav ─── */}
      <AnimatePresence>
        {scrolledPastHero && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed bottom-6 left-0 right-0 z-50 hidden md:flex justify-center"
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
                <ProfileDropdown size="sm" />
              ) : (
                <Button size="sm" onClick={() => openAuth("login")} className="rounded-xl gradient-primary glow-primary font-semibold text-xs h-8 px-4">
                  Login
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Mobile floating bottom bar ─── */}
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
                <span className="text-sm font-bold text-foreground">PreciseDM</span>
              </Link>
              {user ? (
                <ProfileDropdown size="sm" />
              ) : (
                <Button size="sm" onClick={() => openAuth("login")} className="rounded-xl gradient-primary glow-primary font-semibold text-xs h-8 px-4">
                  Login
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthSlidePanel open={authOpen} onOpenChange={setAuthOpen} mode={authMode} />
    </>
  );
};

export default WebsiteHeader;
