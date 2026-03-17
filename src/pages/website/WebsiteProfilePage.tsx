import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Sun, Moon, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/use-subscription";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ScrollReveal from "@/components/website/ScrollReveal";
import profileHero from "@/assets/profile-hero.jpg";

interface ProfileData {
  full_name: string;
  email: string;
  phone_number: string | null;
  user_type: string;
  custom_user_id: string | null;
}

const WebsiteProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { subscription, isActive, daysRemaining, loading: subLoading } = useSubscription();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (!user) { navigate("/w"); return; }
    fetchProfile();
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      if (data) setIsAdmin(true);
    });
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("profiles").select("full_name, email, phone_number, user_type, custom_user_id").eq("user_id", user.id).single();
    if (error) { toast({ title: "Error loading profile", variant: "destructive" }); }
    else if (data) {
      setProfile(data);
      const nameParts = (data.full_name || "").split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      setPhoneNumber(data.phone_number || "");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const fullName = `${firstName} ${lastName}`.trim();
    const { error } = await supabase.from("profiles").update({ full_name: fullName, phone_number: phoneNumber || null }).eq("user_id", user.id);
    if (error) { toast({ title: "Failed to update profile", variant: "destructive" }); }
    else {
      setProfile((prev) => prev ? { ...prev, full_name: fullName, phone_number: phoneNumber || null } : prev);
      toast({ title: "Profile updated successfully" });
      setEditing(false);
    }
    setSaving(false);
  };

  const handleLogout = async () => { await signOut(); navigate("/w"); };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const displayFirstName = firstName || profile?.full_name?.split(" ")[0] || "User";
  const displayName = profile?.full_name || "User";

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-3xl px-6 xl:px-10">
        {/* Profile Hero */}
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl h-[220px] lg:h-[260px] mb-8" style={{ background: "linear-gradient(135deg, hsl(197 50% 85%), hsl(197 40% 75%), hsl(200 30% 65%))" }}>
            <img src={profileHero} alt="Profile" className="absolute inset-0 w-full h-full object-cover opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(200,30%,18%)]/80 to-transparent" />
            <div className="relative z-10 flex flex-col justify-end h-full p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 mb-3">
                <span className="text-2xl font-extrabold text-white">{displayFirstName.charAt(0)}</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white">{displayName}</h1>
              <p className="text-sm text-white/60 capitalize">{isAdmin ? "Admin" : profile?.user_type || "User"}</p>
            </div>
          </div>
        </ScrollReveal>

        {/* Edit toggle */}
        <div className="flex justify-end mb-3">
          {editing ? (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => {
                setEditing(false);
                const nameParts = (profile?.full_name || "").split(" ");
                setFirstName(nameParts[0] || "");
                setLastName(nameParts.slice(1).join(" ") || "");
                setPhoneNumber(profile?.phone_number || "");
              }}>Cancel</Button>
              <Button size="sm" className="rounded-xl gradient-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="text-sm font-semibold text-primary hover:underline">Edit Profile</button>
          )}
        </div>

        {/* Profile Details Card */}
        <ScrollReveal delay={0.05}>
          <div className="rounded-2xl bg-card border border-border shadow-sm p-6 lg:p-8 space-y-5">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <Label className="text-xs text-muted-foreground font-medium">First Name</Label>
                {editing ? <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1.5 rounded-xl bg-background border-border h-11" />
                  : <p className="mt-1.5 text-sm font-semibold text-foreground">{firstName || "—"}</p>}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground font-medium">Last Name</Label>
                {editing ? <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1.5 rounded-xl bg-background border-border h-11" />
                  : <p className="mt-1.5 text-sm font-semibold text-foreground">{lastName || "—"}</p>}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground font-medium">Phone</Label>
                {editing ? <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="mt-1.5 rounded-xl bg-background border-border h-11" placeholder="Enter phone" />
                  : <p className="mt-1.5 text-sm font-semibold text-foreground">{phoneNumber || "—"}</p>}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground font-medium">Email</Label>
                <p className="mt-1.5 text-sm font-semibold text-foreground break-all">{profile?.email || "—"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground font-medium">User Type</Label>
                <p className="mt-1.5 text-sm font-semibold text-foreground capitalize">{isAdmin ? "Admin" : profile?.user_type || "—"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground font-medium">User ID</Label>
                <p className="mt-1.5 text-sm font-semibold text-foreground">{profile?.custom_user_id || "—"}</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Subscription */}
        {!isAdmin && (
          <ScrollReveal delay={0.1}>
            <div className="mt-6 rounded-2xl bg-card border border-border shadow-sm p-6 lg:p-8">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Subscription</h2>
              {subLoading ? (
                <div className="flex justify-center py-4"><div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent" /></div>
              ) : isActive && subscription ? (
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground capitalize">{subscription.plan_type === "trial" ? "Free Trial" : subscription.plan_type} Plan</p>
                    <p className="text-xs text-muted-foreground">
                      {daysRemaining !== null && `${daysRemaining} days remaining`}
                      {subscription.next_billing_date && ` · Renews ${new Date(subscription.next_billing_date).toLocaleDateString()}`}
                    </p>
                  </div>
                  <span className="ml-auto text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full">Active</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active subscription. <button onClick={() => navigate("/w/pricing")} className="text-primary font-semibold hover:underline">View plans</button></p>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* Settings */}
        <ScrollReveal delay={0.15}>
          <div className="mt-6 rounded-2xl bg-card border border-border shadow-sm p-6 lg:p-8">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Settings</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
                <div>
                  <p className="text-sm font-medium text-foreground">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">{theme === "dark" ? "On" : "Off"}</p>
                </div>
              </div>
              <button onClick={toggleTheme}
                className={`relative h-7 w-12 rounded-full transition-colors duration-300 ${theme === "dark" ? "bg-primary" : "bg-muted-foreground/30"}`}>
                <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`absolute top-0.5 flex items-center justify-center h-6 w-6 rounded-full bg-white shadow-md ${theme === "dark" ? "left-[22px]" : "left-0.5"}`}>
                  {theme === "dark" ? <Moon className="h-3 w-3 text-primary" /> : <Sun className="h-3 w-3 text-muted-foreground" />}
                </motion.span>
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Logout */}
        <ScrollReveal delay={0.2}>
          <Button variant="outline" className="mt-6 w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 rounded-2xl h-13 font-semibold" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default WebsiteProfilePage;
