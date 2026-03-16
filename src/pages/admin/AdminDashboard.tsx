import { useState, useEffect, useMemo } from "react";
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
  Shield,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Zap,
  Crown,
  BarChart3,
  Eye,
  Search,
  CalendarDays,
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

interface UpcomingRenewal {
  id: string;
  user_id: string;
  plan_type: string;
  next_billing_date: string;
  user_name: string;
  user_email: string;
}

interface SubscriptionRecord {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  start_date: string | null;
  next_billing_date: string | null;
  paypal_subscription_id: string | null;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
  user_type: string;
}

interface SubscriptionStats {
  totalSubscribed: number;
  totalUnsubscribed: number;
  monthly: number;
  yearly: number;
  upcomingRenewals: UpcomingRenewal[];
}

type ViewMode = "dashboard" | "users" | "submissions" | "submission-detail" | "subscriptions" | "subscription-detail";

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
  const [allSubscriptions, setAllSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionRecord | null>(null);
  const [subFilter, setSubFilter] = useState<"all" | "active" | "inactive" | "monthly" | "yearly">("all");
  const [submissionFormFilter, setSubmissionFormFilter] = useState<string | null>(null);

  // Shared filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"today" | "yesterday" | "this_week" | "this_month" | "custom">("today");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Subscriptions-specific filters
  const [subSearchQuery, setSubSearchQuery] = useState("");
  const [subDateFilter, setSubDateFilter] = useState<"today" | "yesterday" | "this_week" | "this_month" | "custom">("today");
  const [subCustomStartDate, setSubCustomStartDate] = useState("");
  const [subCustomEndDate, setSubCustomEndDate] = useState("");

  // Users-specific filters
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userDateFilter, setUserDateFilter] = useState<"today" | "yesterday" | "this_week" | "this_month" | "custom">("today");
  const [userCustomStartDate, setUserCustomStartDate] = useState("");
  const [userCustomEndDate, setUserCustomEndDate] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    user_type: "student",
    custom_user_id: "",
  });
  const [subStats, setSubStats] = useState<SubscriptionStats>({
    totalSubscribed: 0,
    totalUnsubscribed: 0,
    monthly: 0,
    yearly: 0,
    upcomingRenewals: [],
  });

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      Authorization: `Bearer ${session?.access_token}`,
      "Content-Type": "application/json",
    };
  };

  const getBaseUrl = () => {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    return `https://${projectId}.supabase.co/functions/v1/admin-users`;
  };

  const fetchUsers = async () => {
    setLoading(true);
    const headers = await getAuthHeaders();
    const res = await fetch(getBaseUrl(), { headers });
    const data = await res.json();
    if (res.ok) {
      setUsers(data.users);
      setTotal(data.total);
      setFormStats(data.formStats || {});
      setTotalSubmissions(data.totalSubmissions || 0);
      if (data.subscriptionStats) setSubStats(data.subscriptionStats);
    } else {
      toast({ title: "Error", description: data.error, variant: "destructive" });
    }
    setLoading(false);
  };

  const fetchSubmissions = async () => {
    setSubmissionsLoading(true);
    const headers = await getAuthHeaders();
    const res = await fetch(`${getBaseUrl()}?action=submissions`, { headers });
    const data = await res.json();
    if (res.ok) setSubmissions(data.submissions || []);
    setSubmissionsLoading(false);
  };

  const fetchSubscriptions = async () => {
    setSubscriptionsLoading(true);
    const headers = await getAuthHeaders();
    const res = await fetch(`${getBaseUrl()}?action=subscriptions`, { headers });
    const data = await res.json();
    if (res.ok) setAllSubscriptions(data.subscriptions || []);
    setSubscriptionsLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.full_name) {
      toast({ title: "Error", description: "Fill all required fields", variant: "destructive" });
      return;
    }
    setCreating(true);
    const headers = await getAuthHeaders();
    const res = await fetch(getBaseUrl(), {
      method: "POST",
      headers,
      body: JSON.stringify(form),
    });
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

  const handleSignOut = async () => { await signOut(); navigate("/login"); };

  const handleViewUsers = () => setViewMode("users");
  const handleViewSubmissions = (formType?: string) => { fetchSubmissions(); setSubmissionFormFilter(formType || null); setViewMode("submissions"); };
  const handleViewSubscriptions = (filter?: "all" | "active" | "inactive" | "monthly" | "yearly") => {
    fetchSubscriptions();
    if (filter) setSubFilter(filter);
    else setSubFilter("all");
    setViewMode("subscriptions");
  };
  const handleViewSubmissionDetail = (sub: SubmissionRow) => { setSelectedSubmission(sub); setViewMode("submission-detail"); };
  const handleViewSubscriptionDetail = (sub: SubscriptionRecord) => { setSelectedSubscription(sub); setViewMode("subscription-detail"); };
  const handleBack = () => {
    if (viewMode === "submission-detail") setViewMode("submissions");
    else if (viewMode === "subscription-detail") setViewMode("subscriptions");
    else setViewMode("dashboard");
  };

  // Date range helper
  const getDateRange = (filter: "today" | "yesterday" | "this_week" | "this_month" | "custom", startDate?: string, endDate?: string): { start: Date; end: Date } => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    switch (filter) {
      case "today":
        return { start: todayStart, end: todayEnd };
      case "yesterday": {
        const yStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
        return { start: yStart, end: todayStart };
      }
      case "this_week": {
        const day = todayStart.getDay();
        const wStart = new Date(todayStart.getTime() - day * 24 * 60 * 60 * 1000);
        return { start: wStart, end: todayEnd };
      }
      case "this_month": {
        const mStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: mStart, end: todayEnd };
      }
      case "custom": {
        const s = startDate ? new Date(startDate) : todayStart;
        const e = endDate ? new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000) : todayEnd;
        return { start: s, end: e };
      }
    }
  };

  const filterByDateAndSearch = <T extends { created_at: string }>(
    items: T[],
    df: "today" | "yesterday" | "this_week" | "this_month" | "custom",
    sq: string,
    cStart: string,
    cEnd: string,
    getSearchable: (item: T) => string
  ): T[] => {
    const { start, end } = getDateRange(df, cStart, cEnd);
    return items.filter((item) => {
      const d = new Date(item.created_at);
      const inDate = d >= start && d < end;
      const inSearch = !sq || getSearchable(item).toLowerCase().includes(sq.toLowerCase());
      return inDate && inSearch;
    });
  };

  const filteredSubscriptions = useMemo(() => {
    let result = allSubscriptions.filter((s) => {
      if (subFilter === "all") return true;
      if (subFilter === "active") return s.status === "active";
      if (subFilter === "inactive") return s.status !== "active";
      if (subFilter === "monthly") return s.plan_type === "monthly" && s.status === "active";
      if (subFilter === "yearly") return s.plan_type === "yearly" && s.status === "active";
      return true;
    });
    return filterByDateAndSearch(result, subDateFilter, subSearchQuery, subCustomStartDate, subCustomEndDate, (s) => `${s.user_name} ${s.user_email} ${s.plan_type}`);
  }, [allSubscriptions, subFilter, subDateFilter, subSearchQuery, subCustomStartDate, subCustomEndDate]);

  const filteredSubmissions = useMemo(() => {
    let result = submissionFormFilter
      ? submissions.filter((s) => s.form_type === submissionFormFilter)
      : submissions;
    return filterByDateAndSearch(result, dateFilter, searchQuery, customStartDate, customEndDate, (s) => `${s.user_name} ${s.user_email}`);
  }, [submissions, submissionFormFilter, dateFilter, searchQuery, customStartDate, customEndDate]);

  const filteredUsers = useMemo(() => {
    const { start, end } = getDateRange(userDateFilter, userCustomStartDate, userCustomEndDate);
    return users.filter((u) => {
      const d = new Date(u.created_at);
      const inDate = d >= start && d < end;
      const inSearch = !userSearchQuery || `${u.full_name} ${u.email}`.toLowerCase().includes(userSearchQuery.toLowerCase());
      return inDate && inSearch;
    });
  }, [users, userDateFilter, userSearchQuery, userCustomStartDate, userCustomEndDate]);

  const CreateUserForm = () => (
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
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {viewMode !== "dashboard" && (
              <button onClick={handleBack} className="mr-1 p-2 rounded-xl hover:bg-muted transition-colors">
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
            )}
            <PreciseLogo size={32} />
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-lg text-foreground tracking-tight">PreciseDM</span>
              <span className="text-[10px] font-bold uppercase tracking-widest gradient-primary text-primary-foreground px-3 py-1 rounded-full">
                Admin
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="rounded-xl gap-2 text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* ─── Dashboard View ─── */}
          {viewMode === "dashboard" && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
              {/* Hero Header */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground text-sm">Overview of your platform activity</p>
                  </div>
                </div>
              </div>

              {/* Primary Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="group relative text-left rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30 cursor-pointer" onClick={handleViewUsers}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="mx-4 rounded-2xl">
                          <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
                          <CreateUserForm />
                        </DialogContent>
                      </Dialog>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-black text-foreground mt-0.5">{loading ? "—" : String(total)}</p>
                </div>
                <StatCard
                  icon={<FileText className="h-5 w-5" />}
                  label="Total Submissions"
                  value={loading ? "—" : String(totalSubmissions)}
                  onClick={() => handleViewSubmissions()}
                  iconBg="bg-accent text-accent-foreground"
                  clickable
                />
                <StatCard
                  icon={<PlayCircle className="h-5 w-5" />}
                  label="Videos"
                  value={String(3)}
                  iconBg="bg-secondary text-secondary-foreground"
                />
              </div>

              {/* Form Submissions Breakdown - Clickable */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm mb-8">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <h2 className="text-lg font-extrabold text-foreground">Form Submissions</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(FORM_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => handleViewSubmissions(key)}
                      className={`group rounded-xl border border-border p-4 text-center hover:border-primary/30 hover:shadow-md transition-all cursor-pointer ${FORM_COLORS[key]?.split(" ")[0] || "bg-muted/50"}`}
                    >
                      <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
                      <p className="text-2xl font-black text-foreground">{formStats[key] || 0}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 group-hover:text-primary transition-colors">Click to view →</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subscription Overview - Premium Card */}
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center">
                        <Crown className="h-4.5 w-4.5 text-primary-foreground" />
                      </div>
                      <h2 className="text-lg font-extrabold text-foreground">Subscription Overview</h2>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleViewSubscriptions()} className="gap-1.5 text-xs font-semibold text-primary hover:text-primary rounded-lg">
                      View All <ArrowUpRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <button
                      onClick={() => handleViewSubscriptions("active")}
                      className="group rounded-xl border border-border bg-card/80 p-4 text-center hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-center gap-1.5 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <p className="text-xs font-semibold text-muted-foreground">Subscribed</p>
                      </div>
                      <p className="text-3xl font-black text-primary">{subStats.totalSubscribed}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 group-hover:text-primary transition-colors">Click to view →</p>
                    </button>

                    <button
                      onClick={() => handleViewSubscriptions("inactive")}
                      className="group rounded-xl border border-border bg-card/80 p-4 text-center hover:border-destructive/30 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-center gap-1.5 mb-2">
                        <XCircle className="h-4 w-4 text-destructive" />
                        <p className="text-xs font-semibold text-muted-foreground">Unsubscribed</p>
                      </div>
                      <p className="text-3xl font-black text-foreground">{subStats.totalUnsubscribed}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 group-hover:text-destructive transition-colors">Click to view →</p>
                    </button>

                    <button
                      onClick={() => handleViewSubscriptions("monthly")}
                      className="group rounded-xl border border-border bg-card/80 p-4 text-center hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-center gap-1.5 mb-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs font-semibold text-muted-foreground">Monthly</p>
                      </div>
                      <p className="text-3xl font-black text-foreground">{subStats.monthly}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 group-hover:text-primary transition-colors">Click to view →</p>
                    </button>

                    <button
                      onClick={() => handleViewSubscriptions("yearly")}
                      className="group rounded-xl border border-border bg-card/80 p-4 text-center hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-center gap-1.5 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs font-semibold text-muted-foreground">Yearly</p>
                      </div>
                      <p className="text-3xl font-black text-foreground">{subStats.yearly}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 group-hover:text-primary transition-colors">Click to view →</p>
                    </button>
                  </div>

                  {/* Upcoming Renewals */}
                  <div className="border-t border-border/60 pt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-bold text-foreground">Upcoming Renewals</h3>
                      <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Next 15 Days</span>
                    </div>
                    {subStats.upcomingRenewals.length > 0 ? (
                      <div className="space-y-2">
                        {subStats.upcomingRenewals.map((r) => {
                          const daysLeft = Math.max(0, Math.ceil((new Date(r.next_billing_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                          return (
                            <div key={r.id} className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3 hover:bg-card transition-colors">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary text-primary-foreground font-bold text-xs shrink-0">
                                {r.user_name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{r.user_name}</p>
                                <p className="text-xs text-muted-foreground truncate">{r.user_email}</p>
                              </div>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${r.plan_type === "yearly" ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"}`}>
                                {r.plan_type}
                              </span>
                              <div className="text-right shrink-0">
                                <p className={`text-sm font-black ${daysLeft <= 3 ? "text-destructive" : "text-foreground"}`}>{daysLeft}d</p>
                                <p className="text-[10px] text-muted-foreground">{new Date(r.next_billing_date).toLocaleDateString()}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <CheckCircle2 className="h-8 w-8 text-primary/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No renewals in the next 15 days</p>
                      </div>
                    )}
                  </div>
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
                  <p className="text-sm text-muted-foreground mt-1">{filteredUsers.length} of {total} users</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 rounded-xl font-semibold gradient-primary text-primary-foreground border-0 hover:opacity-90">
                      <Plus className="h-4 w-4" /> Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="mx-4 rounded-2xl">
                    <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
                    <CreateUserForm />
                  </DialogContent>
                </Dialog>
              </div>

              <FilterBar
                dateFilter={userDateFilter}
                onDateFilterChange={(v) => setUserDateFilter(v)}
                searchQuery={userSearchQuery}
                onSearchChange={setUserSearchQuery}
                searchPlaceholder="Search by name or email..."
                customStartDate={userCustomStartDate}
                customEndDate={userCustomEndDate}
                onCustomStartChange={setUserCustomStartDate}
                onCustomEndChange={setUserCustomEndDate}
              />

              {loading ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-3">
                  {filteredUsers.map((u, i) => (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="rounded-xl border border-border bg-card p-4 flex items-center gap-4 hover:shadow-md hover:border-primary/20 transition-all"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-primary-foreground font-bold text-sm shrink-0">
                        {(u.full_name || u.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{u.full_name || "—"}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-accent px-2.5 py-1 rounded-full text-accent-foreground capitalize shrink-0">
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
                  {filteredUsers.length === 0 && <EmptyState message="No users found for this filter" />}
                </div>
              )}
            </motion.div>
          )}

          {/* ─── Subscriptions View ─── */}
          {viewMode === "subscriptions" && (
            <motion.div key="subscriptions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-foreground">Subscriptions</h1>
                  <p className="text-sm text-muted-foreground mt-1">{filteredSubscriptions.length} records</p>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {(["all", "active", "inactive", "monthly", "yearly"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setSubFilter(f)}
                    className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                      subFilter === f
                        ? "gradient-primary text-primary-foreground border-transparent"
                        : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30"
                    }`}
                  >
                    {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              <FilterBar
                dateFilter={subDateFilter}
                onDateFilterChange={(v) => setSubDateFilter(v)}
                searchQuery={subSearchQuery}
                onSearchChange={setSubSearchQuery}
                searchPlaceholder="Search by name, email, or plan..."
                customStartDate={subCustomStartDate}
                customEndDate={subCustomEndDate}
                onCustomStartChange={setSubCustomStartDate}
                onCustomEndChange={setSubCustomEndDate}
              />

              {subscriptionsLoading ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-3">
                  {filteredSubscriptions.map((s, i) => {
                    const isActive = s.status === "active";
                    const daysLeft = s.next_billing_date
                      ? Math.max(0, Math.ceil((new Date(s.next_billing_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                      : null;
                    return (
                      <motion.button
                        key={s.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        onClick={() => handleViewSubscriptionDetail(s)}
                        className="w-full text-left rounded-xl border border-border bg-card p-4 flex items-center gap-4 hover:shadow-md hover:border-primary/20 transition-all"
                      >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm shrink-0 ${isActive ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          {s.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{s.user_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{s.user_email}</p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${
                          s.plan_type === "yearly" ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"
                        }`}>
                          {s.plan_type}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${
                          isActive ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                        }`}>
                          {s.status}
                        </span>
                        {daysLeft !== null && isActive && (
                          <div className="text-right shrink-0">
                            <p className={`text-sm font-black ${daysLeft <= 3 ? "text-destructive" : "text-foreground"}`}>{daysLeft}d</p>
                            <p className="text-[10px] text-muted-foreground">left</p>
                          </div>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </motion.button>
                    );
                  })}
                  {filteredSubscriptions.length === 0 && <EmptyState message="No subscriptions found" />}
                </div>
              )}
            </motion.div>
          )}

          {/* ─── Subscription Detail View ─── */}
          {viewMode === "subscription-detail" && selectedSubscription && (
            <motion.div key="sub-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                    selectedSubscription.status === "active" ? "gradient-primary text-primary-foreground" : "bg-destructive/10 text-destructive"
                  }`}>
                    {selectedSubscription.status}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                    selectedSubscription.plan_type === "yearly" ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"
                  }`}>
                    {selectedSubscription.plan_type} plan
                  </span>
                </div>
                <h1 className="text-2xl font-extrabold text-foreground">Subscription Detail</h1>
              </div>

              {/* User Info */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm mb-4">
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Subscriber
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-primary-foreground font-bold text-xl shrink-0">
                    {selectedSubscription.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{selectedSubscription.user_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedSubscription.user_email}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-accent px-2 py-0.5 rounded-full text-accent-foreground mt-1 inline-block">
                      {selectedSubscription.user_type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subscription Details */}
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-primary/5 p-5 shadow-sm mb-4">
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" /> Plan Details
                </h3>
                <div className="space-y-2">
                  <DetailRow label="Plan Type" value={selectedSubscription.plan_type.charAt(0).toUpperCase() + selectedSubscription.plan_type.slice(1)} />
                  <DetailRow label="Status" value={selectedSubscription.status.charAt(0).toUpperCase() + selectedSubscription.status.slice(1)} />
                  <DetailRow label="Start Date" value={selectedSubscription.start_date ? new Date(selectedSubscription.start_date).toLocaleDateString() : "—"} />
                  <DetailRow label="Next Billing Date" value={selectedSubscription.next_billing_date ? new Date(selectedSubscription.next_billing_date).toLocaleDateString() : "—"} />
                  {selectedSubscription.next_billing_date && selectedSubscription.status === "active" && (
                    <DetailRow
                      label="Days Remaining"
                      value={`${Math.max(0, Math.ceil((new Date(selectedSubscription.next_billing_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days`}
                    />
                  )}
                  <DetailRow label="PayPal Subscription ID" value={selectedSubscription.paypal_subscription_id || "—"} />
                  <DetailRow label="Created" value={new Date(selectedSubscription.created_at).toLocaleString()} />
                  <DetailRow label="Last Updated" value={new Date(selectedSubscription.updated_at).toLocaleString()} />
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Submissions View ─── */}
          {viewMode === "submissions" && (
            <motion.div key="submissions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-foreground">
                  {submissionFormFilter ? `${FORM_LABELS[submissionFormFilter] || submissionFormFilter} Submissions` : "Form Submissions"}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">{filteredSubmissions.length} submissions</p>
              </div>

              {/* Form Type Filter Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                <button
                  onClick={() => setSubmissionFormFilter(null)}
                  className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                    !submissionFormFilter
                      ? "gradient-primary text-primary-foreground border-transparent"
                      : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  All
                </button>
                {Object.entries(FORM_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSubmissionFormFilter(key)}
                    className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                      submissionFormFilter === key
                        ? "gradient-primary text-primary-foreground border-transparent"
                        : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <FilterBar
                dateFilter={dateFilter}
                onDateFilterChange={(v) => setDateFilter(v)}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search by name or email..."
                customStartDate={customStartDate}
                customEndDate={customEndDate}
                onCustomStartChange={setCustomStartDate}
                onCustomEndChange={setCustomEndDate}
              />

              {submissionsLoading ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-3">
                  {filteredSubmissions.map((s, i) => (
                    <motion.button
                      key={s.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => handleViewSubmissionDetail(s)}
                      className="w-full text-left rounded-xl border border-border bg-card p-4 flex items-center gap-4 hover:shadow-md hover:border-primary/20 transition-all"
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold shrink-0 ${FORM_COLORS[s.form_type] || "bg-muted text-muted-foreground"}`}>
                        {(FORM_LABELS[s.form_type] || s.form_type).slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground">{FORM_LABELS[s.form_type] || s.form_type}</p>
                        <p className="text-xs text-muted-foreground truncate">by {s.user_name} • {s.user_email}</p>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</p>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </motion.button>
                  ))}
                  {filteredSubmissions.length === 0 && <EmptyState message="No submissions found" />}
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

              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm mb-4">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> User Information
                </h3>
                <div className="space-y-2">
                  <DetailRow label="Name" value={selectedSubmission.user_name} />
                  <DetailRow label="Email" value={selectedSubmission.user_email} />
                </div>
              </div>

              <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-primary/5 p-5 shadow-sm mb-4">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Results
                </h3>
                <div className="space-y-2">
                  {Object.entries(selectedSubmission.results).map(([key, value]) => (
                    <DetailRow key={key} label={formatLabel(key)} value={String(value ?? "—")} />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" /> Submitted Inputs
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

/* ─── Reusable Components ─── */

type DateFilterType = "today" | "yesterday" | "this_week" | "this_month" | "custom";

const DATE_FILTER_LABELS: Record<DateFilterType, string> = {
  today: "Today",
  yesterday: "Yesterday",
  this_week: "This Week",
  this_month: "This Month",
  custom: "Custom Range",
};

const FilterBar = ({
  dateFilter,
  onDateFilterChange,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  customStartDate,
  customEndDate,
  onCustomStartChange,
  onCustomEndChange,
}: {
  dateFilter: DateFilterType;
  onDateFilterChange: (v: DateFilterType) => void;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  customStartDate: string;
  customEndDate: string;
  onCustomStartChange: (v: string) => void;
  onCustomEndChange: (v: string) => void;
}) => (
  <div className="rounded-xl border border-border bg-card/80 p-4 mb-6 space-y-3">
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select value={dateFilter} onValueChange={(v) => onDateFilterChange(v as DateFilterType)}>
          <SelectTrigger className="h-10 rounded-lg bg-muted/40 border-border text-sm font-medium w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATE_FILTER_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9 h-10 rounded-lg bg-muted/40 border-border text-sm"
        />
      </div>
    </div>
    {dateFilter === "custom" && (
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <div className="flex items-center gap-2 flex-1">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Start</Label>
          <Input
            type="date"
            value={customStartDate}
            onChange={(e) => onCustomStartChange(e.target.value)}
            className="h-9 rounded-lg bg-muted/40 border-border text-sm flex-1"
          />
        </div>
        <div className="flex items-center gap-2 flex-1">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">End</Label>
          <Input
            type="date"
            value={customEndDate}
            onChange={(e) => onCustomEndChange(e.target.value)}
            className="h-9 rounded-lg bg-muted/40 border-border text-sm flex-1"
          />
        </div>
      </div>
    )}
  </div>
);

const StatCard = ({ icon, label, value, onClick, iconBg, clickable }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onClick?: () => void;
  iconBg: string;
  clickable?: boolean;
}) => {
  const Comp = clickable ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={`group text-left rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 ${
        clickable ? "hover:shadow-md hover:border-primary/30 cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
        {clickable && <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />}
      </div>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="text-3xl font-black text-foreground mt-0.5">{value}</p>
    </Comp>
  );
};

const LoadingSpinner = () => (
  <div className="flex justify-center py-16">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-16">
    <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
      <Eye className="h-5 w-5 text-muted-foreground" />
    </div>
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between py-2 border-b border-border/50 last:border-b-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-semibold text-foreground text-right max-w-[60%] break-all">{value}</span>
  </div>
);

export default AdminDashboard;
