import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import profileHero from "@/assets/profile-hero.jpg";
import ProfileSubscriptionSection from "@/components/profile/ProfileSubscriptionSection";
import ProfileFormHistory from "@/components/profile/ProfileFormHistory";

interface ProfileData {
  full_name: string;
  email: string;
  phone_number: string | null;
  user_type: string;
  custom_user_id: string | null;
}

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
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

  const handleLogout = async () => { await signOut(); navigate("/login"); };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const displayFirstName = firstName || profile?.full_name?.split(" ")[0] || "User";

  return (
    <div className="min-h-screen bg-background pb-36 md:pb-16">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-12 pb-3 md:pt-8">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-sm md:hidden">
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg md:text-2xl font-bold text-foreground md:w-full">Profile</h1>
          <div className="w-10 md:hidden" />
        </div>

        {/* Profile Hero */}
        <div className="px-5 pt-2">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl h-[180px] md:h-[220px]"
            style={{
              background: "linear-gradient(135deg, hsl(197 50% 85%), hsl(197 40% 75%), hsl(200 30% 65%))",
            }}
          >
            <img src={profileHero} alt="Profile" className="absolute inset-0 w-full h-full object-cover opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(200,30%,18%)]/80 to-transparent" />
            <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 mb-2">
                <span className="text-xl font-extrabold text-white">{displayFirstName.charAt(0)}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-white">{displayFirstName}</h2>
              <p className="text-xs text-white/60 capitalize">{isAdmin ? "Admin" : profile?.user_type || "User"}</p>
            </div>
          </motion.div>
        </div>

        <div className="px-5 mt-5">
          {/* Edit */}
          <div className="flex justify-end mb-2">
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
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="text-sm font-semibold text-primary">Edit</button>
            )}
          </div>

          {/* Profile Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl bg-card border border-border shadow-sm p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">First Name</Label>
                {editing ? <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1 rounded-xl bg-background border-border h-10" />
                  : <p className="mt-1 text-sm font-semibold text-foreground">{firstName || "—"}</p>}
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Last Name</Label>
                {editing ? <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 rounded-xl bg-background border-border h-10" />
                  : <p className="mt-1 text-sm font-semibold text-foreground">{lastName || "—"}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Phone</Label>
                {editing ? <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="mt-1 rounded-xl bg-background border-border h-10" placeholder="Enter phone" />
                  : <p className="mt-1 text-sm font-semibold text-foreground">{phoneNumber || "—"}</p>}
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Email</Label>
                <p className="mt-1 text-sm font-semibold text-foreground break-all">{profile?.email || "—"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">User Type</Label>
                <p className="mt-1 text-sm font-semibold text-foreground capitalize">{isAdmin ? "Admin" : profile?.user_type || "—"}</p>
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">User ID</Label>
                <p className="mt-1 text-sm font-semibold text-foreground">{profile?.custom_user_id || "—"}</p>
              </div>
            </div>
          </motion.div>

          {!isAdmin && (
            <>
              <ProfileSubscriptionSection />
              <ProfileFormHistory userId={user?.id} />
            </>
          )}

          {/* Settings */}
          <div className="mt-5 rounded-2xl bg-card border border-border shadow-sm p-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Settings</h3>
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
                <motion.span
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`absolute top-0.5 flex items-center justify-center h-6 w-6 rounded-full bg-white shadow-md ${theme === "dark" ? "left-[22px]" : "left-0.5"}`}
                >
                  {theme === "dark" ? <Moon className="h-3 w-3 text-primary" /> : <Sun className="h-3 w-3 text-muted-foreground" />}
                </motion.span>
              </button>
            </div>
          </div>

          {/* Logout */}
          <Button variant="outline" className="mt-4 w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 rounded-2xl h-12" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
