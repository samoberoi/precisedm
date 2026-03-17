import { useLocation, useNavigate } from "react-router-dom";
import { Home, Users, Phone, User, LayoutDashboard, Info, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PreciseLogo from "@/components/PreciseLogo";

const userNavItems = [
  { label: "Home", icon: Home, path: "/home" },
  { label: "About Us", icon: Users, path: "/about" },
  { label: "Connect", icon: Phone, path: "/connect" },
  { label: "Subscription", icon: CreditCard, path: "/subscription" },
  { label: "Disclaimer", icon: Info, path: "/disclaimer" },
  { label: "Profile", icon: User, path: "/profile" },
];

const adminNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Profile", icon: User, path: "/profile" },
];

const DesktopNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      if (data) setIsAdmin(true);
    });
  }, [user]);

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-2xl border-b border-border/60">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <button onClick={() => navigate("/home")} className="flex items-center gap-2">
          <PreciseLogo size={32} variant="icon" />
        </button>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default DesktopNav;
