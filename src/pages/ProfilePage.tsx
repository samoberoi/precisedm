import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Info, LogOut } from "lucide-react";
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

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchProfile();
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

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="px-5 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-foreground mb-3"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Hello !!</p>
            <h1 className="text-2xl font-bold text-foreground">{displayFirstName}</h1>
          </div>
          <button className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-border">
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl mb-4"
        >
          <img
            src={profileHero}
            alt="Profile banner"
            className="h-48 w-full object-cover"
          />
        </motion.div>

        {/* Edit Button */}
        <div className="flex justify-end mb-2">
          {editing ? (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditing(false);
                  // Reset to saved values
                  const nameParts = (profile?.full_name || "").split(" ");
                  setFirstName(nameParts[0] || "");
                  setLastName(nameParts.slice(1).join(" ") || "");
                  setPhoneNumber(profile?.phone_number || "");
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-sm font-semibold text-primary"
            >
              Edit
            </button>
          )}
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-5 space-y-5"
        >
          {/* First Name / Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">First Name</Label>
              {editing ? (
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm font-semibold text-foreground">{firstName || "—"}</p>
              )}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Last Name</Label>
              {editing ? (
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm font-semibold text-foreground">{lastName || "—"}</p>
              )}
            </div>
          </div>

          {/* Phone / Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Phone Number</Label>
              {editing ? (
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-1"
                  placeholder="Enter phone"
                />
              ) : (
                <p className="mt-1 text-sm font-semibold text-foreground">{phoneNumber || "—"}</p>
              )}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email Address</Label>
              <p className="mt-1 text-sm font-semibold text-foreground break-all">
                {profile?.email || "—"}
              </p>
            </div>
          </div>

          {/* User Type */}
          <div>
            <Label className="text-xs text-muted-foreground">User Type</Label>
            <p className="mt-1 text-sm font-semibold text-foreground">{profile?.user_type || "—"}</p>
          </div>

          {/* User ID */}
          <div>
            <Label className="text-xs text-muted-foreground">User ID</Label>
            <p className="mt-1 text-sm font-semibold text-foreground">{profile?.custom_user_id || "—"}</p>
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

export default ProfilePage;
