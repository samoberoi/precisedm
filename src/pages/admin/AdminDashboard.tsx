import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PreciseLogo from "@/components/PreciseLogo";
import { toast } from "@/hooks/use-toast";
import {
  Users,
  Plus,
  LogOut,
  FileText,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Calendar,
  Activity,
} from "lucide-react";

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  user_type: string;
  custom_user_id: string;
  created_at: string;
  last_sign_in_at: string | null;
}

interface SubmissionRow {
  id: string;
  user_id: string;
  form_type: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  created_at: string;
  user_name: string;
  user_email: string;
}

type ViewMode = "dashboard" | "users" | "submissions" | "submission-detail";

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

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [formStats, setFormStats] = useState<Record<string, number>>({});
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionRow | null>(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    user_type: "student",
    custom_user_id: "",
  });

  const fetchUsers = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/admin-users`,
      {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.json();
    if (res.ok) {
      setUsers(data.users);
      setTotal(data.total);
      setFormStats(data.formStats || {});
      setTotalSubmissions(data.totalSubmissions || 0);
    } else {
      toast({ title: "Error", description: data.error, variant: "destructive" });
    }
    setLoading(false);
  };

  const fetchSubmissions = async () => {
    setSubmissionsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/admin-users?action=submissions`,
      {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.json();
    if (res.ok) {
      setSubmissions(data.submissions || []);
    }
    setSubmissionsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.full_name) {
      toast({ title: "Error", description: "Fill all required fields", variant: "destructive" });
      return;
    }

    setCreating(true);
    const { data: { session } } = await supabase.auth.getSession();
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/admin-users`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      }
    );
    const data = await res.json();
    setCreating(false);

    if (res.ok) {
      toast({ title: "User created successfully" });
      setDialogOpen(false);
      setForm({ email: "", password: "", full_name: "", user_type: "student", custom_user_id: "" });
      fetchUsers();
    } else {
      toast({ title: "Error", description: data.error, variant: "destructive" });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleViewUsers = () => setViewMode("users");
  const handleViewSubmissions = () => {
    fetchSubmissions();
    setViewMode("submissions");
  };
  const handleViewSubmissionDetail = (sub: SubmissionRow) => {
    setSelectedSubmission(sub);
    setViewMode("submission-detail");
  };
  const handleBack = () => {
    if (viewMode === "submission-detail") setViewMode("submissions");
    else setViewMode("dashboard");
  };

  const videoCount = 3; // Hardcoded based on app videos

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {viewMode !== "dashboard" && (
              <button onClick={handleBack} className="mr-2 p-1.5 rounded-lg hover:bg-muted transition-colors">
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
            )}
            <PreciseLogo size={32} />
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-foreground">PreciseDM</span>
              <span className="text-xs font-semibold bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full">
                Admin
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="rounded-lg gap-2 text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* ─── Dashboard View ─── */}
          {viewMode === "dashboard" && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Overview of your platform activity</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Users Card */}
                <button
                  onClick={handleViewUsers}
                  className="group text-left rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-extrabold text-foreground mt-1">{loading ? "—" : total}</p>
                </button>

                {/* Forms Card */}
                <button
                  onClick={handleViewSubmissions}
                  className="group text-left rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                      <FileText className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Form Submissions</p>
                  <p className="text-3xl font-extrabold text-foreground mt-1">{loading ? "—" : totalSubmissions}</p>
                </button>

                {/* Videos Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                      <PlayCircle className="h-6 w-6 text-secondary-foreground" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Videos</p>
                  <p className="text-3xl font-extrabold text-foreground mt-1">{videoCount}</p>
                </div>

                {/* Forms Available */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                      <Activity className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Active Forms</p>
                  <p className="text-3xl font-extrabold text-foreground mt-1">4</p>
                </div>
              </div>

              {/* Form Breakdown */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm mb-8">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Form Submissions Breakdown</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Object.entries(FORM_LABELS).map(([key, label]) => (
                    <div key={key} className="rounded-xl border border-border p-4 text-center">
                      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
                      <p className="text-2xl font-extrabold text-foreground">{formStats[key] || 0}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-bold text-foreground mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2 rounded-xl font-semibold">
                        <Plus className="h-4 w-4" />
                        Add New User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="mx-4 rounded-xl">
                      <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateUser} className="space-y-4 mt-2">
                        <div className="space-y-1.5">
                          <Label>Full Name *</Label>
                          <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="John Doe" className="h-11 rounded-xl bg-muted/40" />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Email *</Label>
                          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@example.com" className="h-11 rounded-xl bg-muted/40" />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Password *</Label>
                          <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 8 characters" className="h-11 rounded-xl bg-muted/40" />
                        </div>
                        <div className="space-y-1.5">
                          <Label>User Type</Label>
                          <Select value={form.user_type} onValueChange={(v) => setForm({ ...form, user_type: v })}>
                            <SelectTrigger className="h-11 rounded-xl bg-muted/40"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="practitioner">Practitioner</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>User ID (optional)</Label>
                          <Input value={form.custom_user_id} onChange={(e) => setForm({ ...form, custom_user_id: e.target.value })} placeholder="Hospital / Student ID" className="h-11 rounded-xl bg-muted/40" />
                        </div>
                        <Button type="submit" disabled={creating} className="w-full h-11 rounded-xl font-semibold">
                          {creating ? "Creating..." : "Create User"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" className="gap-2 rounded-xl font-semibold" onClick={handleViewUsers}>
                    <Users className="h-4 w-4" />
                    View All Users
                  </Button>
                  <Button variant="outline" className="gap-2 rounded-xl font-semibold" onClick={handleViewSubmissions}>
                    <FileText className="h-4 w-4" />
                    View Submissions
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Users View ─── */}
          {viewMode === "users" && (
            <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-foreground">Users</h1>
                  <p className="text-sm text-muted-foreground mt-1">{total} total users</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 rounded-xl font-semibold">
                      <Plus className="h-4 w-4" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="mx-4 rounded-xl">
                    <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
                    <form onSubmit={handleCreateUser} className="space-y-4 mt-2">
                      <div className="space-y-1.5">
                        <Label>Full Name *</Label>
                        <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="John Doe" className="h-11 rounded-xl bg-muted/40" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Email *</Label>
                        <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@example.com" className="h-11 rounded-xl bg-muted/40" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Password *</Label>
                        <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 8 characters" className="h-11 rounded-xl bg-muted/40" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>User Type</Label>
                        <Select value={form.user_type} onValueChange={(v) => setForm({ ...form, user_type: v })}>
                          <SelectTrigger className="h-11 rounded-xl bg-muted/40"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="practitioner">Practitioner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>User ID (optional)</Label>
                        <Input value={form.custom_user_id} onChange={(e) => setForm({ ...form, custom_user_id: e.target.value })} placeholder="Hospital / Student ID" className="h-11 rounded-xl bg-muted/40" />
                      </div>
                      <Button type="submit" disabled={creating} className="w-full h-11 rounded-xl font-semibold">
                        {creating ? "Creating..." : "Create User"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((u, i) => (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="rounded-xl border border-border bg-card p-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                        {(u.full_name || u.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{u.full_name || "—"}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <span className="text-xs font-medium bg-accent px-2.5 py-1 rounded-full text-accent-foreground capitalize shrink-0">
                        {u.user_type}
                      </span>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(u.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {users.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">No users yet</div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ─── Submissions View ─── */}
          {viewMode === "submissions" && (
            <motion.div key="submissions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-foreground">Form Submissions</h1>
                <p className="text-sm text-muted-foreground mt-1">{submissions.length} total submissions</p>
              </div>

              {submissionsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((s, i) => (
                    <motion.button
                      key={s.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => handleViewSubmissionDetail(s)}
                      className="w-full text-left rounded-xl border border-border bg-card p-4 flex items-center gap-4 hover:shadow-sm hover:border-primary/20 transition-all"
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold shrink-0 ${FORM_COLORS[s.form_type] || "bg-muted text-muted-foreground"}`}>
                        {(FORM_LABELS[s.form_type] || s.form_type).slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground">{FORM_LABELS[s.form_type] || s.form_type}</p>
                        <p className="text-xs text-muted-foreground truncate">by {s.user_name} • {s.user_email}</p>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {new Date(s.created_at).toLocaleString()}
                        </p>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </motion.button>
                  ))}
                  {submissions.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">No submissions yet</div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ─── Submission Detail View ─── */}
          {viewMode === "submission-detail" && selectedSubmission && (
            <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-6">
                <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 ${FORM_COLORS[selectedSubmission.form_type] || "bg-muted text-muted-foreground"}`}>
                  {FORM_LABELS[selectedSubmission.form_type] || selectedSubmission.form_type}
                </span>
                <h1 className="text-2xl font-extrabold text-foreground">Submission Detail</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  by {selectedSubmission.user_name} • {new Date(selectedSubmission.created_at).toLocaleString()}
                </p>
              </div>

              {/* User Info */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm mb-4">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  User Information
                </h3>
                <div className="space-y-2">
                  <DetailRow label="Name" value={selectedSubmission.user_name} />
                  <DetailRow label="Email" value={selectedSubmission.user_email} />
                </div>
              </div>

              {/* Results */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm mb-4">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Results
                </h3>
                <div className="space-y-2">
                  {Object.entries(selectedSubmission.results).map(([key, value]) => (
                    <DetailRow key={key} label={formatLabel(key)} value={String(value ?? "—")} />
                  ))}
                </div>
              </div>

              {/* Inputs */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Submitted Inputs
                </h3>
                <div className="space-y-2">
                  {Object.entries(selectedSubmission.inputs).map(([key, value]) => (
                    <DetailRow key={key} label={formatLabel(key)} value={String(value ?? "—")} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between py-1.5 border-b border-border/50 last:border-b-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-semibold text-foreground text-right max-w-[60%]">{value}</span>
  </div>
);

export default AdminDashboard;
