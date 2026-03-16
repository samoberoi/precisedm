import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { UserGrowthChart, RevenueChart } from "@/components/admin/AdminCharts";
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
import diaformIcon from "@/assets/diaform-card-icon.png";
import gestationIcon from "@/assets/gestation-card-icon.png";
import maintenanceIcon from "@/assets/maintenance-icon.png";
import steroidIcon from "@/assets/steroid-icon.png";
import {
  Users,
  Plus,
  FileText,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Calendar,
  Shield,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
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

const FORM_GRADIENTS: Record<string, string> = {
  diaform: "linear-gradient(135deg, hsl(210,80%,50%), hsl(210,90%,40%))",
  steroid: "linear-gradient(135deg, hsl(200,30%,22%), hsl(200,25%,15%))",
  maintenance: "linear-gradient(135deg, hsl(45,85%,50%), hsl(35,80%,42%))",
  gestation: "linear-gradient(135deg, hsl(15,80%,55%), hsl(10,75%,45%))",
};

const FORM_ICONS: Record<string, string> = {
  diaform: diaformIcon,
  steroid: steroidIcon,
  maintenance: maintenanceIcon,
  gestation: gestationIcon,
};

const AdminDashboard = () => {
  const { user } = useAuth();
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

  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"all_time" | "today" | "yesterday" | "this_week" | "this_month" | "custom">("all_time");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const [subSearchQuery, setSubSearchQuery] = useState("");
  const [subDateFilter, setSubDateFilter] = useState<"all_time" | "today" | "yesterday" | "this_week" | "this_month" | "custom">("all_time");
  const [subCustomStartDate, setSubCustomStartDate] = useState("");
  const [subCustomEndDate, setSubCustomEndDate] = useState("");

  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userDateFilter, setUserDateFilter] = useState<"all_time" | "today" | "yesterday" | "this_week" | "this_month" | "custom">("all_time");
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

  useEffect(() => { fetchUsers(); fetchSubscriptions(); }, []);

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

  const getDateRange = (filter: "all_time" | "today" | "yesterday" | "this_week" | "this_month" | "custom", startDate?: string, endDate?: string): { start: Date; end: Date } | null => {
    if (filter === "all_time") return null;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    switch (filter) {
      case "today": return { start: todayStart, end: todayEnd };
      case "yesterday": { const yStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000); return { start: yStart, end: todayStart }; }
      case "this_week": { const day = todayStart.getDay(); const wStart = new Date(todayStart.getTime() - day * 24 * 60 * 60 * 1000); return { start: wStart, end: todayEnd }; }
      case "this_month": { const mStart = new Date(now.getFullYear(), now.getMonth(), 1); return { start: mStart, end: todayEnd }; }
      case "custom": { const s = startDate ? new Date(startDate) : todayStart; const e = endDate ? new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000) : todayEnd; return { start: s, end: e }; }
    }
  };

  const filterByDateAndSearch = <T extends { created_at: string }>(
    items: T[], df: "all_time" | "today" | "yesterday" | "this_week" | "this_month" | "custom",
    sq: string, cStart: string, cEnd: string, getSearchable: (item: T) => string
  ): T[] => {
    const range = getDateRange(df, cStart, cEnd);
    return items.filter((item) => {
      const inDate = range ? (() => { const d = new Date(item.created_at); return d >= range.start && d < range.end; })() : true;
      return inDate && (!sq || getSearchable(item).toLowerCase().includes(sq.toLowerCase()));
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
    let result = submissionFormFilter ? submissions.filter((s) => s.form_type === submissionFormFilter) : submissions;
    return filterByDateAndSearch(result, dateFilter, searchQuery, customStartDate, customEndDate, (s) => `${s.user_name} ${s.user_email}`);
  }, [submissions, submissionFormFilter, dateFilter, searchQuery, customStartDate, customEndDate]);

  const filteredUsers = useMemo(() => {
    const range = getDateRange(userDateFilter, userCustomStartDate, userCustomEndDate);
    return users.filter((u) => {
      const inDate = range ? (() => { const d = new Date(u.created_at); return d >= range.start && d < range.end; })() : true;
      const inSearch = !userSearchQuery || `${u.full_name} ${u.email}`.toLowerCase().includes(userSearchQuery.toLowerCase());
      return inDate && inSearch;
    });
  }, [users, userDateFilter, userSearchQuery, userCustomStartDate, userCustomEndDate]);

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "Admin";

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
      <Button type="submit" disabled={creating} className="w-full h-11 rounded-xl font-semibold gradient-primary text-primary-foreground">
        {creating ? "Creating..." : "Create User"}
      </Button>
    </form>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background pb-36">
      {/* Top Bar — matching HomePage style */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3">
        <PreciseLogo size={36} variant="icon" />
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-bold uppercase tracking-widest gradient-primary text-primary-foreground px-3 py-1 rounded-full">
            Admin
          </span>
          <button
            onClick={() => navigate("/profile")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border border-primary/20 overflow-hidden"
          >
            <span className="text-sm font-bold text-primary">{firstName.charAt(0)}</span>
          </button>
        </div>
      </div>

      <div className="px-5">
        <AnimatePresence mode="wait">
          {/* ─── Dashboard View ─── */}
          {viewMode === "dashboard" && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              {/* Hero Card */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="relative overflow-hidden rounded-3xl h-[180px] mt-2"
                style={{
                  background: "linear-gradient(135deg, hsl(197 50% 85%), hsl(197 40% 75%), hsl(200 30% 65%))",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(200,30%,18%)]/60 to-transparent" />
                <div className="relative z-10 p-6 flex flex-col justify-end h-full">
                  <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Welcome back</p>
                  <h1 className="text-[28px] font-extrabold text-white leading-[1.1] mt-1 tracking-tight">{firstName}</h1>
                  <p className="text-xs text-white/50 mt-2 leading-relaxed">Your admin dashboard overview</p>
                </div>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mt-5">
                <motion.button
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  onClick={handleViewUsers}
                  className="relative rounded-2xl p-4 text-left shadow-lg active:scale-[0.97] transition-transform"
                  style={{ background: "linear-gradient(135deg, hsl(210,80%,50%), hsl(210,90%,40%))" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-5 w-5 text-white/70" />
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="mx-4 rounded-2xl">
                        <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
                        <CreateUserForm />
                      </DialogContent>
                    </Dialog>
                  </div>
                  <p className="text-2xl font-black text-white">{loading ? "—" : String(total)}</p>
                  <p className="text-xs text-white/60 mt-0.5">Total Users</p>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
                  onClick={() => handleViewSubmissions()}
                  className="relative rounded-2xl p-4 text-left shadow-lg active:scale-[0.97] transition-transform"
                  style={{ background: "linear-gradient(135deg, hsl(150,50%,40%), hsl(160,45%,30%))" }}
                >
                  <FileText className="h-5 w-5 text-white/70 mb-2" />
                  <p className="text-2xl font-black text-white">{loading ? "—" : String(totalSubmissions)}</p>
                  <p className="text-xs text-white/60 mt-0.5">Total Submissions</p>
                </motion.button>
              </div>

              {/* Charts */}
              <div className="mt-5 space-y-4">
                <UserGrowthChart users={users} />
                <RevenueChart subscriptions={allSubscriptions} />
              </div>

              {/* Form Breakdown - 2x2 grid matching toolkit style */}
              <div className="mt-5">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-extrabold text-foreground">Form Submissions</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(FORM_LABELS).map(([key, label], i) => (
                    <motion.button
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.06 }}
                      onClick={() => handleViewSubmissions(key)}
                      className="relative flex flex-col items-start rounded-2xl p-4 text-left transition-all active:scale-[0.97] shadow-lg overflow-hidden"
                      style={{ minHeight: 130, background: FORM_GRADIENTS[key] }}
                    >
                      <p className="text-base font-bold text-white leading-tight">{label}</p>
                      <p className="text-xs text-white/60 mt-0.5">{formStats[key] || 0} submissions</p>
                      <div className="flex-1" />
                      <div className="flex items-end justify-between w-full mt-3">
                        <img src={FORM_ICONS[key]} alt={label} className="h-10 w-10 object-contain opacity-40" />
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Subscription Overview */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-extrabold text-foreground">Subscriptions</h2>
                  </div>
                  <button onClick={() => handleViewSubscriptions()} className="text-xs font-semibold text-primary flex items-center gap-1">
                    View All <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    onClick={() => handleViewSubscriptions("active")}
                    className="rounded-2xl bg-card border border-border shadow-sm p-4 text-left active:scale-[0.97] transition-transform"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <p className="text-xs font-semibold text-muted-foreground">Subscribed</p>
                    </div>
                    <p className="text-2xl font-black text-primary">{subStats.totalSubscribed}</p>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
                    onClick={() => handleViewSubscriptions("inactive")}
                    className="rounded-2xl bg-card border border-border shadow-sm p-4 text-left active:scale-[0.97] transition-transform"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <p className="text-xs font-semibold text-muted-foreground">Unsubscribed</p>
                    </div>
                    <p className="text-2xl font-black text-foreground">{subStats.totalUnsubscribed}</p>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.41 }}
                    onClick={() => handleViewSubscriptions("monthly")}
                    className="rounded-2xl bg-card border border-border shadow-sm p-4 text-left active:scale-[0.97] transition-transform"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs font-semibold text-muted-foreground">Monthly</p>
                    </div>
                    <p className="text-2xl font-black text-foreground">{subStats.monthly}</p>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}
                    onClick={() => handleViewSubscriptions("yearly")}
                    className="rounded-2xl bg-card border border-border shadow-sm p-4 text-left active:scale-[0.97] transition-transform"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs font-semibold text-muted-foreground">Yearly</p>
                    </div>
                    <p className="text-2xl font-black text-foreground">{subStats.yearly}</p>
                  </motion.button>
                </div>

                {/* Upcoming Renewals */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="mt-4 rounded-2xl bg-card border border-border shadow-sm p-4"
                >
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
                          <div key={r.id} className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary text-primary-foreground font-bold text-xs shrink-0">
                              {r.user_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{r.user_name}</p>
                              <p className="text-xs text-muted-foreground truncate">{r.user_email}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={`text-sm font-black ${daysLeft <= 3 ? "text-destructive" : "text-foreground"}`}>{daysLeft}d</p>
                              <p className="text-[10px] text-muted-foreground">{r.plan_type}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle2 className="h-8 w-8 text-primary/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No renewals in the next 15 days</p>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ─── Users View ─── */}
          {viewMode === "users" && (
            <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button onClick={handleBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-sm">
                    <ChevronLeft className="h-5 w-5 text-foreground" />
                  </button>
                  <div>
                    <h1 className="text-xl font-extrabold text-foreground">Users</h1>
                    <p className="text-xs text-muted-foreground">{filteredUsers.length} of {total} users</p>
                  </div>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-md">
                      <Plus className="h-5 w-5" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="mx-4 rounded-2xl">
                    <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
                    <CreateUserForm />
                  </DialogContent>
                </Dialog>
              </div>

              <FilterBar
                dateFilter={userDateFilter} onDateFilterChange={(v) => setUserDateFilter(v)}
                searchQuery={userSearchQuery} onSearchChange={setUserSearchQuery}
                searchPlaceholder="Search by name or email..."
                customStartDate={userCustomStartDate} customEndDate={userCustomEndDate}
                onCustomStartChange={setUserCustomStartDate} onCustomEndChange={setUserCustomEndDate}
              />

              {loading ? <LoadingSpinner /> : (
                <div className="space-y-2">
                  {filteredUsers.map((u, i) => (
                    <motion.div key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      className="rounded-2xl bg-card border border-border shadow-sm p-3 flex items-center gap-3"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-primary-foreground font-bold text-sm shrink-0">
                        {(u.full_name || u.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{u.full_name || "—"}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded-full shrink-0 capitalize">
                        {u.user_type}
                      </span>
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
              <div className="flex items-center gap-3 mb-4">
                <button onClick={handleBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-sm">
                  <ChevronLeft className="h-5 w-5 text-foreground" />
                </button>
                <div>
                  <h1 className="text-xl font-extrabold text-foreground">Subscriptions</h1>
                  <p className="text-xs text-muted-foreground">{filteredSubscriptions.length} records</p>
                </div>
              </div>

              <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
                {(["all", "active", "inactive", "monthly", "yearly"] as const).map((f) => (
                  <button key={f} onClick={() => setSubFilter(f)}
                    className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                      subFilter === f
                        ? "gradient-primary text-primary-foreground border-transparent"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              <FilterBar
                dateFilter={subDateFilter} onDateFilterChange={(v) => setSubDateFilter(v)}
                searchQuery={subSearchQuery} onSearchChange={setSubSearchQuery}
                searchPlaceholder="Search by name, email, or plan..."
                customStartDate={subCustomStartDate} customEndDate={subCustomEndDate}
                onCustomStartChange={setSubCustomStartDate} onCustomEndChange={setSubCustomEndDate}
              />

              {subscriptionsLoading ? <LoadingSpinner /> : (
                <div className="space-y-2">
                  {filteredSubscriptions.map((s, i) => {
                    const isActive = s.status === "active";
                    return (
                      <motion.button key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                        onClick={() => handleViewSubscriptionDetail(s)}
                        className="w-full text-left rounded-2xl bg-card border border-border shadow-sm p-3 flex items-center gap-3 active:scale-[0.98] transition-transform"
                      >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm shrink-0 ${isActive ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          {s.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{s.user_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{s.user_email}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            isActive ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                          }`}>{s.status}</span>
                          <span className="text-[10px] font-medium text-muted-foreground capitalize">{s.plan_type}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </motion.button>
                    );
                  })}
                  {filteredSubscriptions.length === 0 && <EmptyState message="No subscriptions found" />}
                </div>
              )}
            </motion.div>
          )}

          {/* ─── Subscription Detail ─── */}
          {viewMode === "subscription-detail" && selectedSubscription && (
            <motion.div key="sub-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-3 mb-5">
                <button onClick={handleBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-sm">
                  <ChevronLeft className="h-5 w-5 text-foreground" />
                </button>
                <div>
                  <h1 className="text-xl font-extrabold text-foreground">Subscription Detail</h1>
                  <p className="text-xs text-muted-foreground">{selectedSubscription.user_name}</p>
                </div>
              </div>
              <div className="rounded-2xl bg-card border border-border shadow-sm p-5 space-y-1">
                <DetailRow label="User" value={selectedSubscription.user_name} />
                <DetailRow label="Email" value={selectedSubscription.user_email} />
                <DetailRow label="User Type" value={selectedSubscription.user_type} />
                <DetailRow label="Plan" value={selectedSubscription.plan_type} />
                <DetailRow label="Status" value={selectedSubscription.status.charAt(0).toUpperCase() + selectedSubscription.status.slice(1)} />
                <DetailRow label="Start Date" value={selectedSubscription.start_date ? new Date(selectedSubscription.start_date).toLocaleDateString() : "—"} />
                <DetailRow label="Next Billing Date" value={selectedSubscription.next_billing_date ? new Date(selectedSubscription.next_billing_date).toLocaleDateString() : "—"} />
                {selectedSubscription.next_billing_date && selectedSubscription.status === "active" && (
                  <DetailRow label="Days Remaining" value={`${Math.max(0, Math.ceil((new Date(selectedSubscription.next_billing_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days`} />
                )}
                <DetailRow label="PayPal Subscription ID" value={selectedSubscription.paypal_subscription_id || "—"} />
                <DetailRow label="Created" value={new Date(selectedSubscription.created_at).toLocaleString()} />
                <DetailRow label="Last Updated" value={new Date(selectedSubscription.updated_at).toLocaleString()} />
              </div>
            </motion.div>
          )}

          {/* ─── Submissions View ─── */}
          {viewMode === "submissions" && (
            <motion.div key="submissions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-3 mb-4">
                <button onClick={handleBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-sm">
                  <ChevronLeft className="h-5 w-5 text-foreground" />
                </button>
                <div>
                  <h1 className="text-xl font-extrabold text-foreground">
                    {submissionFormFilter ? `${FORM_LABELS[submissionFormFilter] || submissionFormFilter}` : "Submissions"}
                  </h1>
                  <p className="text-xs text-muted-foreground">{filteredSubmissions.length} submissions</p>
                </div>
              </div>

              <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
                <button onClick={() => setSubmissionFormFilter(null)}
                  className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                    !submissionFormFilter ? "gradient-primary text-primary-foreground border-transparent" : "border-border bg-card text-muted-foreground"
                  }`}>All</button>
                {Object.entries(FORM_LABELS).map(([key, label]) => (
                  <button key={key} onClick={() => setSubmissionFormFilter(key)}
                    className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                      submissionFormFilter === key ? "gradient-primary text-primary-foreground border-transparent" : "border-border bg-card text-muted-foreground"
                    }`}>{label}</button>
                ))}
              </div>

              <FilterBar
                dateFilter={dateFilter} onDateFilterChange={(v) => setDateFilter(v)}
                searchQuery={searchQuery} onSearchChange={setSearchQuery}
                searchPlaceholder="Search by name or email..."
                customStartDate={customStartDate} customEndDate={customEndDate}
                onCustomStartChange={setCustomStartDate} onCustomEndChange={setCustomEndDate}
              />

              {submissionsLoading ? <LoadingSpinner /> : (
                <div className="space-y-2">
                  {filteredSubmissions.map((s, i) => (
                    <motion.button key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                      onClick={() => handleViewSubmissionDetail(s)}
                      className="w-full text-left rounded-2xl bg-card border border-border shadow-sm p-3 flex items-center gap-3 active:scale-[0.98] transition-transform"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold shrink-0 gradient-primary text-primary-foreground">
                        {(FORM_LABELS[s.form_type] || s.form_type).slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{FORM_LABELS[s.form_type] || s.form_type}</p>
                        <p className="text-xs text-muted-foreground truncate">{s.user_name} • {new Date(s.created_at).toLocaleDateString()}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </motion.button>
                  ))}
                  {filteredSubmissions.length === 0 && <EmptyState message="No submissions found" />}
                </div>
              )}
            </motion.div>
          )}

          {/* ─── Submission Detail ─── */}
          {viewMode === "submission-detail" && selectedSubmission && (
            <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-3 mb-5">
                <button onClick={handleBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-sm">
                  <ChevronLeft className="h-5 w-5 text-foreground" />
                </button>
                <div>
                  <h1 className="text-xl font-extrabold text-foreground">Submission Detail</h1>
                  <p className="text-xs text-muted-foreground">{selectedSubmission.user_name} • {new Date(selectedSubmission.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-card border border-border shadow-sm p-5 mb-3">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> User Info
                </h3>
                <DetailRow label="Name" value={selectedSubmission.user_name} />
                <DetailRow label="Email" value={selectedSubmission.user_email} />
              </div>

              <div className="rounded-2xl bg-card border border-primary/20 shadow-sm p-5 mb-3">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Results
                </h3>
                {Object.entries(selectedSubmission.results).map(([key, value]) => (
                  <DetailRow key={key} label={formatLabel(key)} value={String(value ?? "—")} />
                ))}
              </div>

              <div className="rounded-2xl bg-card border border-border shadow-sm p-5">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" /> Inputs
                </h3>
                {Object.entries(selectedSubmission.inputs).map(([key, value]) => (
                  <DetailRow key={key} label={formatLabel(key)} value={String(value ?? "—")} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

/* ─── Reusable Components ─── */

type DateFilterType = "all_time" | "today" | "yesterday" | "this_week" | "this_month" | "custom";

const DATE_FILTER_LABELS: Record<DateFilterType, string> = {
  all_time: "All Time",
  today: "Today",
  yesterday: "Yesterday",
  this_week: "This Week",
  this_month: "This Month",
  custom: "Custom Range",
};

const FilterBar = ({
  dateFilter, onDateFilterChange, searchQuery, onSearchChange,
  searchPlaceholder = "Search...", customStartDate, customEndDate,
  onCustomStartChange, onCustomEndChange,
}: {
  dateFilter: DateFilterType; onDateFilterChange: (v: DateFilterType) => void;
  searchQuery: string; onSearchChange: (v: string) => void; searchPlaceholder?: string;
  customStartDate: string; customEndDate: string;
  onCustomStartChange: (v: string) => void; onCustomEndChange: (v: string) => void;
}) => (
  <div className="rounded-2xl border border-border bg-card shadow-sm p-3 mb-4 space-y-3">
    <div className="flex gap-2">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select value={dateFilter} onValueChange={(v) => onDateFilterChange(v as DateFilterType)}>
          <SelectTrigger className="h-9 rounded-xl bg-muted/40 border-border text-xs font-medium flex-1">
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
        <Input value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder} className="pl-9 h-9 rounded-xl bg-muted/40 border-border text-xs" />
      </div>
    </div>
    {dateFilter === "custom" && (
      <div className="flex gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Label className="text-xs text-muted-foreground">Start</Label>
          <Input type="date" value={customStartDate} onChange={(e) => onCustomStartChange(e.target.value)}
            className="h-9 rounded-xl bg-muted/40 border-border text-xs flex-1" />
        </div>
        <div className="flex items-center gap-2 flex-1">
          <Label className="text-xs text-muted-foreground">End</Label>
          <Input type="date" value={customEndDate} onChange={(e) => onCustomEndChange(e.target.value)}
            className="h-9 rounded-xl bg-muted/40 border-border text-xs flex-1" />
        </div>
      </div>
    )}
  </div>
);

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
  return key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()).trim();
}

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between py-2 border-b border-border/50 last:border-b-0">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-sm font-semibold text-foreground text-right max-w-[60%] break-all">{value}</span>
  </div>
);

export default AdminDashboard;
