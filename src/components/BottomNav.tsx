import { useLocation, useNavigate } from "react-router-dom";
import { Home, Users, Phone, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const userNavItems = [
  { label: "Home", icon: Home, path: "/home" },
  { label: "About Us", icon: Users, path: "/about" },
  { label: "Connect", icon: Phone, path: "/connect" },
  { label: "Profile", icon: User, path: "/profile" },
];

const adminNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Profile", icon: User, path: "/profile" },
];

const BottomNav = () => {
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
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-4 mb-4 rounded-2xl bg-card/80 backdrop-blur-2xl border border-border/60 shadow-xl">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 px-4 py-2 transition-all"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full transition-all ${
                    isActive
                      ? "gradient-primary text-primary-foreground shadow-md glow-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <span
                  className={`text-[11px] font-semibold ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
