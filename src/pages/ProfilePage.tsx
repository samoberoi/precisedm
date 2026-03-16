import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Info, LogOut, FileText, ChevronRight, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BottomNav from "@/components/BottomNav";
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
  diaform: "DiaForm Initial",
  steroid: "Steroid Dosing",
  maintenance: "Maintenance",
  gestation: "Gestation",
};

const FORM_COLORS: Record<string, string> = {
  diaform: "bg-primary/10 text-primary",
  steroid: "bg-[hsl(270,90%,60%)]/10 text-[hsl(270,90%,50%)]",
  maintenance: "bg-[hsl(48,95%,60%)]/10 text-[hsl(48,70%,35%)]",
  gestation: "bg-[hsl(14,85%,55%)]/10 text-[hsl(14,85%,45%)]",
};

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
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
    if (!user) {
      navigate("/login");
      return;
    }
    fetchProfile();
    fetchSubmissions();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, email, phone_number, user_type, custom_user_id")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      toast({ title: "Error loading profile", variant: "destructive" });
    } else if (data) {
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
    const { data } = await supabase
      .from("form_submissions" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }) as any;

    if (data) setSubmissions(data);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const fullName = `${firstName} ${lastName}`.trim();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone_number: phoneNumber || null,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Failed to update profile", variant: "destructive" });
    } else {
      setProfile((prev) =>
        prev ? { ...prev, full_name: fullName, phone_number: phoneNumber || null } : prev
      );
      toast({ title: "Profile updated successfully" });
      setEditing(false);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const displayFirstName = firstName || profile?.full_name?.split(" ")[0] || "User";

  // Group submissions by form type for stats
  const submissionStats = submissions.reduce((acc, s) => {
    acc[s.form_type] = (acc[s.form_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="px-5 pt-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-foreground mb-3">
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Hello !!</p>
            <h1 className="text-2xl font-bold text-foreground">{displayFirstName}</h1>
          </div>
          <button
            onClick={() => navigate("/disclaimer")}
            className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-border"
          >
            <Info className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Profile</h2>
        </div>

        {/* Hero Image */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-2xl mb-4">
          <img src={profileHero} alt="Profile banner" className="h-48 w-full object-cover" />
        </motion.div>

        {/* Edit Button */}
        <div className="flex justify-end mb-2">
          {editing ? (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => {
                setEditing(false);
                const nameParts = (profile?.full_name || "").split(" ");
                setFirstName(nameParts[0] || "");
                setLastName(nameParts.slice(1).join(" ") || "");
                setPhoneNumber(profile?.phone_number || "");
              }}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="text-sm font-semibold text-primary">Edit</button>
          )}
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-5 space-y-5"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">First Name</Label>
              {editing ? (
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1" />
              ) : (
                <p className="mt-1 text-sm font-semibold text-foreground">{firstName || "—"}</p>
              )}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Last Name</Label>
              {editing ? (
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1" />
              ) : (
                <p className="mt-1 text-sm font-semibold text-foreground">{lastName || "—"}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Phone Number</Label>
              {editing ? (
                <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="mt-1" placeholder="Enter phone" />
              ) : (
                <p className="mt-1 text-sm font-semibold text-foreground">{phoneNumber || "—"}</p>
              )}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email Address</Label>
              <p className="mt-1 text-sm font-semibold text-foreground break-all">{profile?.email || "—"}</p>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">User Type</Label>
            <p className="mt-1 text-sm font-semibold text-foreground">{profile?.user_type || "—"}</p>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">User ID</Label>
            <p className="mt-1 text-sm font-semibold text-foreground">{profile?.custom_user_id || "—"}</p>
          </div>
        </motion.div>

        {/* Submission History */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">My Form History</h2>
          </div>

          {/* Stats Row */}
          {submissions.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-4">
              {Object.entries(FORM_LABELS).map(([key, label]) => (
                <div key={key} className="rounded-xl border border-border bg-card p-3 text-center">
                  <p className="text-lg font-extrabold text-foreground">{submissionStats[key] || 0}</p>
                  <p className="text-[10px] font-medium text-muted-foreground leading-tight">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Submissions List */}
          <div className="space-y-2">
            {submissions.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSubmission(selectedSubmission?.id === s.id ? null : s)}
                className="w-full text-left rounded-xl border border-border bg-card p-3 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold shrink-0 ${FORM_COLORS[s.form_type] || "bg-muted text-muted-foreground"}`}>
                    {(FORM_LABELS[s.form_type] || s.form_type).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{FORM_LABELS[s.form_type] || s.form_type}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(s.created_at).toLocaleString()}
                    </p>
                  </div>
                  <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${selectedSubmission?.id === s.id ? "rotate-90" : ""}`} />
                </div>

                <AnimatePresence>
                  {selectedSubmission?.id === s.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 pt-3 border-t border-border space-y-3">
                        {/* Results */}
                        <div>
                          <p className="text-xs font-bold text-primary mb-1.5">Results</p>
                          <div className="space-y-1">
                            {Object.entries(s.results).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-xs">
                                <span className="text-muted-foreground">{formatLabel(key)}</span>
                                <span className="font-semibold text-foreground">{String(value ?? "—")}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Inputs */}
                        <div>
                          <p className="text-xs font-bold text-muted-foreground mb-1.5">Inputs</p>
                          <div className="space-y-1">
                            {Object.entries(s.inputs).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-xs">
                                <span className="text-muted-foreground">{formatLabel(key)}</span>
                                <span className="font-medium text-foreground">{String(value ?? "—")}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            ))}
            {submissions.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No form submissions yet</p>
                <p className="text-xs text-muted-foreground mt-1">Your calculation history will appear here</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Logout */}
        <Button
          variant="outline"
          className="mt-6 w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

export default ProfilePage;
