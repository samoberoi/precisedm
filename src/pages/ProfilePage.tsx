import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, LogOut, FileText, ChevronRight, Calendar, Sun, Moon, Shield } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import profileHero from "@/assets/profile-hero.jpg";

interface ProfileData {
  full_name: string;
  email: string;
  phone_number: string | null;
  user_type: string;
  custom_user_id: string | null;
}

interface SubmissionRecord {
  id: string;
  form_type: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  created_at: string;
}

const FORM_LABELS: Record<string, string> = {
  diaform: "DiaForm",
  steroid: "Steroid",
  maintenance: "Maintenance",
  gestation: "Gestation",
};

const FORM_COLORS: Record<string, string> = {
  diaform: "bg-primary/15 text-primary",
  steroid: "bg-[hsl(270,90%,60%)]/15 text-[hsl(270,90%,70%)]",
  maintenance: "bg-[hsl(48,95%,60%)]/15 text-[hsl(48,90%,55%)]",
  gestation: "bg-[hsl(14,85%,55%)]/15 text-[hsl(14,85%,60%)]",
};

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { subscription, isActive, daysRemaining, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionRecord | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchProfile();
    fetchSubmissions();
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

  const fetchSubmissions = async () => {
    if (!user) return;
    const { data } = await supabase.from("form_submissions" as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false }) as any;
    if (data) setSubmissions(data);
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
  const submissionStats = submissions.reduce((acc, s) => { acc[s.form_type] = (acc[s.form_type] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background pb-36">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-sm">
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Profile</h1>
        <div className="w-10" />
      </div>

      {/* Profile Hero */}
      <div className="px-5 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl h-[180px]"
          style={{
            background: "linear-gradient(135deg, hsl(197 50% 85%), hsl(197 40% 75%), hsl(200 30% 65%))",
          }}
        >
          <img src={profileHero} alt="Profile" className="absolute inset-0 w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(200,30%,18%)]/80 to-transparent" />
          <div className="relative z-10 flex flex-col justify-end h-full p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 mb-2">
              <span className="text-xl font-extrabold text-white">{displayFirstName.charAt(0)}</span>
            </div>
            <h2 className="text-xl font-extrabold text-white">{displayFirstName}</h2>
            <p className="text-xs text-white/60 capitalize">{profile?.user_type || "User"}</p>
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
              <p className="mt-1 text-sm font-semibold text-foreground capitalize">{profile?.user_type || "—"}</p>
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">User ID</Label>
              <p className="mt-1 text-sm font-semibold text-foreground">{profile?.custom_user_id || "—"}</p>
            </div>
          </div>
        </motion.div>

        {/* Subscription Status */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="mt-4 rounded-2xl bg-card border border-border shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Subscription</h2>
          </div>
          {subLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : isActive && subscription ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Plan</span>
                <span className="text-sm font-bold text-foreground capitalize">{subscription.plan_type === "monthly" ? "Monthly" : subscription.plan_type === "trial" ? "Free Trial" : "Yearly"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Status</span>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-500">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Valid For</span>
                <span className="text-sm font-bold text-foreground">{daysRemaining} day{daysRemaining !== 1 ? "s" : ""}</span>
              </div>
              {subscription.next_billing_date && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Next Renewal</span>
                  <span className="text-sm font-medium text-foreground">{new Date(subscription.next_billing_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-3">
              <p className="text-sm text-muted-foreground">No active subscription</p>
              <Button size="sm" className="mt-2 rounded-xl gradient-primary" onClick={() => navigate("/subscription")}>
                View Plans
              </Button>
            </div>
          )}
        </motion.div>

        {submissions.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-4">
            {Object.entries(FORM_LABELS).map(([key, label]) => (
              <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-card border border-border shadow-sm p-3 text-center">
                <p className="text-lg font-extrabold text-foreground">{submissionStats[key] || 0}</p>
                <p className="text-[10px] font-medium text-muted-foreground leading-tight">{label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* History */}
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Form History</h2>
          </div>
          <div className="space-y-2">
            {submissions.map((s) => (
              <button key={s.id} onClick={() => setSelectedSubmission(selectedSubmission?.id === s.id ? null : s)}
                className="w-full text-left rounded-2xl bg-card border border-border shadow-sm p-3 active:scale-[0.98] transition-transform">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold shrink-0 ${FORM_COLORS[s.form_type] || "bg-muted text-muted-foreground"}`}>
                    {(FORM_LABELS[s.form_type] || s.form_type).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{FORM_LABELS[s.form_type] || s.form_type}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(s.created_at).toLocaleString()}</p>
                  </div>
                  <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${selectedSubmission?.id === s.id ? "rotate-90" : ""}`} />
                </div>
                <AnimatePresence>
                  {selectedSubmission?.id === s.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-3 pt-3 border-t border-border space-y-3">
                        <div>
                          <p className="text-xs font-bold text-primary mb-1.5">Results</p>
                          <div className="space-y-1">{Object.entries(s.results).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{formatLabel(key)}</span>
                              <span className="font-semibold text-foreground">{String(value ?? "—")}</span>
                            </div>
                          ))}</div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground mb-1.5">Inputs</p>
                          <div className="space-y-1">{Object.entries(s.inputs).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{formatLabel(key)}</span>
                              <span className="font-medium text-foreground">{String(value ?? "—")}</span>
                            </div>
                          ))}</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            ))}
            {submissions.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No form submissions yet</p>
                <p className="text-xs text-muted-foreground mt-1">Your history will appear here</p>
              </div>
            )}
          </div>
        </div>

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
  );
};

function formatLabel(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()).trim();
}

export default ProfilePage;
