// PreciseDM SEO/AEO/GEO Implementation Dashboard
// Admin-only at /admin/seo.
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  CheckCircle2, Circle, Clock, ExternalLink, FileText, Hash, Loader2,
  Calendar as CalendarIcon, Target, AlertCircle, Filter, BookOpen, Check, Rocket,
  Sparkles, Settings2, Zap, ShieldCheck, Download, Search, Info, BarChart3,
} from "lucide-react";
import AdminSeoAnalytics from "./AdminSeoAnalytics";
import AdminSeoKeywords from "./AdminSeoKeywords";
import AdminSeoIndexing from "./AdminSeoIndexing";
import { generateSeoPlanPdf } from "@/lib/seoPlanPdf";

const SITE_ORIGIN = "https://www.precisedm.com/";

function gscInspectUrl(targetUrl: string) {
  return `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(SITE_ORIGIN)}&url=${encodeURIComponent(targetUrl)}`;
}
function bingSubmitUrl(targetUrl: string) {
  return `https://www.bing.com/webmasters/submiturl?url=${encodeURIComponent(targetUrl)}`;
}

type SeoSettings = {
  blog_approval_required: boolean;
  auto_execute: boolean;
  last_auto_run_at: string | null;
};

type Task = {
  id: string;
  scheduled_date: string | null;
  week: number;
  section: string;
  category: string;
  deliverable_type: string | null;
  priority: string;
  effort_minutes: number;
  title: string;
  description: string | null;
  target_url: string | null;
  target_keyword: string | null;
  secondary_keywords: string[] | null;
  page_title: string | null;
  meta_description: string | null;
  content_brief: string | null;
  status: string;
  completed_at: string | null;
  completed_by: string | null;
  notes: string | null;
  blog_slug: string | null;
  verified_at?: string | null;
  verified_status?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  verified_snapshot?: any;
};

type BlogPost = {
  id: string;
  slug: string;
  url: string;
  title: string;
  meta_description: string | null;
  primary_keyword: string | null;
  secondary_keywords: string[] | null;
  body_md: string;
  scheduled_date: string | null;
  status: string;
  client_notes: string | null;
  internal_notes: string | null;
  approved_at: string | null;
  deployed_at: string | null;
  read_minutes: number | null;
};

const SECTION_TONE: Record<string, string> = {
  SEO: "bg-emerald-100 text-emerald-800 border-emerald-200",
  AEO: "bg-violet-100 text-violet-800 border-violet-200",
  GEO: "bg-amber-100 text-amber-800 border-amber-200",
};
const PRIORITY_TONE: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-blue-100 text-blue-700 border-blue-200",
  low: "bg-slate-100 text-slate-700 border-slate-200",
};
const STATUS_LABEL: Record<string, string> = {
  todo: "Not started", in_progress: "In progress", done: "Completed", blocked: "Blocked",
};

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}
function fmtDateTime(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
function displayPath(url: string | null) {
  if (!url) return "—";
  try { return new URL(url, SITE_ORIGIN).pathname || "/"; } catch { return url; }
}
function todayISO() { return new Date().toISOString().slice(0, 10); }

export default function AdminSeo() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [settings, setSettings] = useState<SeoSettings>({ blog_approval_required: true, auto_execute: true, last_auto_run_at: null });
  const [loading, setLoading] = useState(true);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [filterSection, setFilterSection] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>(() => new Date().toISOString().slice(0, 7));

  // Admin gating
  useEffect(() => {
    (async () => {
      if (!user) { setIsAdmin(false); return; }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!data);
    })();
  }, [user]);

  useEffect(() => { if (isAdmin) void load(); }, [isAdmin]);

  async function load() {
    setLoading(true);
    const [tRes, pRes, sRes] = await Promise.all([
      supabase.from("seo_tasks").select("*")
        .order("scheduled_date", { ascending: true })
        .order("sort_order", { ascending: true }),
      supabase.from("seo_blog_posts").select("*")
        .order("scheduled_date", { ascending: true }),
      supabase.from("seo_settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    if (tRes.error || pRes.error) toast.error("Failed to load plan");
    setTasks((tRes.data ?? []) as Task[]);
    setPosts((pRes.data ?? []) as BlogPost[]);
    const s = sRes.data as SeoSettings | null;
    if (s) setSettings(s);
    setLoading(false);
  }

  async function updateSettings(patch: Partial<SeoSettings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    const { error } = await supabase.from("seo_settings").update(patch).eq("id", 1);
    if (error) toast.error("Settings save failed");
    else toast.success("Settings saved");
  }

  async function markDoneManually(id: string, presetNote?: string) {
    const task = tasks.find((t) => t.id === id);
    const defaultNote = presetNote ?? `Marked done manually on ${new Date().toLocaleDateString("en-IN")}`;
    const note = window.prompt(`Mark "${task?.title ?? "this task"}" as done?\n\nAdd a short note:`, defaultNote);
    if (note === null) return;
    setSavingId(id);
    const existing = task?.notes ? `${task.notes}\n\n` : "";
    const { error } = await supabase.from("seo_tasks").update({
      status: "done",
      completed_at: new Date().toISOString(),
      completed_by: user?.id ?? null,
      notes: `${existing}${note || defaultNote}`,
    }).eq("id", id);
    setSavingId(null);
    if (error) { toast.error("Failed to mark done"); return; }
    toast.success("Marked done manually");
    await load();
  }

  function isManualTask(t?: Task) {
    if (!t) return false;
    if (t.deliverable_type && /manual|external|gmb|backlink|outreach|social/i.test(t.deliverable_type)) return true;
    if (/^external:/i.test(t.title)) return true;
    return false;
  }

  async function executeTaskNow(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (isManualTask(task)) { await markDoneManually(id); return; }
    setSavingId(id);
    toast.loading("Executing SEO task…", { id: "seo-exec" });
    const { data, error } = await supabase.functions.invoke("seo-auto-execute", { body: { taskId: id } });
    setSavingId(null);
    if (error) { toast.error(error.message || "Execution failed", { id: "seo-exec" }); return; }
    const result = (data as { results?: Array<{ completed?: boolean; blocked?: boolean; reason?: string }> })?.results?.[0];
    if (result?.completed) { toast.success("Executed and marked completed", { id: "seo-exec" }); await load(); return; }
    const reason = result?.reason ?? "needs manual work";
    toast.warning(`Not auto-completed: ${reason}`, {
      id: "seo-exec",
      action: { label: "Mark done manually", onClick: () => markDoneManually(id, `Marked done manually (${reason}) on ${new Date().toLocaleDateString("en-IN")}`) },
    });
    await load();
  }

  async function updateTask(id: string, patch: Partial<Task>) {
    if (patch.status === "done") { await executeTaskNow(id); return; }
    setSavingId(id);
    const apply: Record<string, unknown> = { ...patch };
    if (patch.status && patch.status !== "done") { apply.completed_at = null; apply.completed_by = null; }
    const { error } = await supabase.from("seo_tasks").update(apply as never).eq("id", id);
    if (error) toast.error("Save failed");
    else { setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...apply } as Task : t))); toast.success("Saved"); }
    setSavingId(null);
  }

  async function updatePost(id: string, patch: Partial<BlogPost>) {
    setSavingId(id);
    const apply: Record<string, unknown> = { ...patch };
    if (patch.status === "approved" && !posts.find(p => p.id === id)?.approved_at) {
      apply.approved_at = new Date().toISOString();
      apply.approved_by = user?.id ?? null;
    }
    if (patch.status === "deployed") apply.deployed_at = new Date().toISOString();
    const { error } = await supabase.from("seo_blog_posts").update(apply as never).eq("id", id);
    if (error) toast.error("Save failed");
    else { setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...apply } as BlogPost : p))); toast.success("Saved"); }
    setSavingId(null);
  }

  const monthOptions = useMemo(() => {
    const set = new Set<string>();
    set.add(new Date().toISOString().slice(0, 7));
    for (const t of tasks) if (t.scheduled_date) set.add(t.scheduled_date.slice(0, 7));
    for (const p of posts) if (p.scheduled_date) set.add(p.scheduled_date.slice(0, 7));
    return Array.from(set).sort();
  }, [tasks, posts]);

  const filtered = useMemo(() => tasks.filter((t) =>
    (filterSection === "all" || t.section === filterSection) &&
    (filterStatus === "all" || t.status === filterStatus) &&
    (filterMonth === "all" || (t.scheduled_date ? t.scheduled_date.slice(0, 7) === filterMonth : false)),
  ), [tasks, filterSection, filterStatus, filterMonth]);

  const byDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of filtered) {
      const k = t.scheduled_date ?? "unscheduled";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(t);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const today = todayISO();
    const dueToday = tasks.filter((t) => t.scheduled_date === today && t.status !== "done").length;
    const overdue = tasks.filter((t) => t.scheduled_date && t.scheduled_date < today && t.status !== "done").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    return { total, done, dueToday, overdue, inProgress, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [tasks]);

  async function runDueTasksNow() {
    toast.loading("Executing due SEO tasks…", { id: "seo-run" });
    const { data, error } = await supabase.functions.invoke("seo-auto-execute", { body: {} });
    if (error) { toast.error(error.message || "SEO execution failed", { id: "seo-run" }); return; }
    const processed = (data as { processed?: number })?.processed ?? 0;
    toast.success(`Execution finished: ${processed} task(s) processed`, { id: "seo-run" });
    await load();
  }

  const openTask = openTaskId ? tasks.find((t) => t.id === openTaskId) ?? null : null;

  if (isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8 max-w-md text-center space-y-3">
          <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-semibold">Admin access required</h2>
          <p className="text-sm text-muted-foreground">Sign in with an admin account to view the SEO dashboard.</p>
          <Button onClick={() => navigate("/login")}>Go to login</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-violet-50 via-white to-emerald-50 p-6 md:p-8">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-200/40 blur-3xl" />
          <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-violet-700 mb-2">
                <Sparkles className="h-3.5 w-3.5" /> PreciseDM · 30-day execution
              </div>
              <h1 className="font-serif text-3xl md:text-4xl leading-tight">SEO / AEO / GEO Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                Day-by-day SEO · AEO · GEO plan for precisedm.com. Every task is mapped to a specific page,
                keyword and deliverable. Click any line item to see exactly what gets done, when, and by whom.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-white/70 backdrop-blur border-emerald-200 text-emerald-800">
                <ShieldCheck className="h-3 w-3 mr-1" /> {stats.done}/{stats.total} shipped
              </Badge>
              {settings.auto_execute && (
                <Badge variant="outline" className="bg-white/70 backdrop-blur border-violet-200 text-violet-800">
                  <Zap className="h-3 w-3 mr-1" /> Auto-execute on
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Automation control bar */}
        <Card className="p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm font-medium">Automation</div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
              <div>
                <div className="text-sm font-medium">Blog approval required by client</div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  When ON, blogs only deploy after you mark them <em>Approved</em>.
                  When OFF, blogs auto-publish on their scheduled date.
                </p>
              </div>
              <Switch checked={settings.blog_approval_required} onCheckedChange={(v) => updateSettings({ blog_approval_required: v })} />
            </div>
            <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
              <div>
                <div className="text-sm font-medium">Auto-execute scheduled tasks</div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Runs the daily executor: applies page SEO or publishes eligible blogs, then marks completed.
                  {settings.last_auto_run_at && <> Last run: {fmtDateTime(settings.last_auto_run_at)}.</>}
                </p>
                <Button size="sm" variant="outline" className="mt-2" onClick={runDueTasksNow}>Run now</Button>
              </div>
              <Switch checked={settings.auto_execute} onCheckedChange={(v) => updateSettings({ auto_execute: v })} />
            </div>
          </div>
        </Card>

        {/* Indexing notice */}
        <Card className="p-4 md:p-5 border-amber-200 bg-amber-50/60">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-700 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <div className="text-sm font-semibold text-amber-900">Heads up: pages must be re-indexed after each change</div>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                Google and Bing don't see edits until they re-crawl the URL. Once a task is marked <em>Completed</em>,
                open it (or use the <strong>Indexing</strong> column in the All-tasks tab) and click <strong>Inspect on Google</strong> → <em>Request indexing</em>, and <strong>Submit to Bing</strong>.
              </p>
            </div>
          </div>
        </Card>

        {/* KPI tiles */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <KpiTile label="Plan progress" value={`${stats.pct}%`} sub={`${stats.done} / ${stats.total} tasks`} accent="bg-emerald-50" />
          <KpiTile label="Due today" value={String(stats.dueToday)} sub={fmtDate(todayISO())} accent="bg-blue-50" />
          <KpiTile label="In progress" value={String(stats.inProgress)} sub="Active now" accent="bg-amber-50" />
          <KpiTile label="Overdue" value={String(stats.overdue)} sub="Needs reschedule" accent={stats.overdue ? "bg-red-50" : "bg-slate-50"} />
          <KpiTile label="Total tasks" value={String(stats.total)} sub="Across 30 days" accent="bg-violet-50" />
        </div>

        <Progress value={stats.pct} className="h-2" />

        <Tabs defaultValue="calendar">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="calendar"><CalendarIcon className="h-4 w-4 mr-2" />Calendar</TabsTrigger>
            <TabsTrigger value="blogs"><BookOpen className="h-4 w-4 mr-2" />Blogs ({posts.length})</TabsTrigger>
            <TabsTrigger value="table"><FileText className="h-4 w-4 mr-2" />All tasks</TabsTrigger>
            <TabsTrigger value="keywords"><Hash className="h-4 w-4 mr-2" />Keyword map</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-2" />Analytics</TabsTrigger>
            <TabsTrigger value="rankings"><Search className="h-4 w-4 mr-2" />Keywords</TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterSection} onValueChange={setFilterSection}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All channels</SelectItem>
                <SelectItem value="SEO">SEO</SelectItem>
                <SelectItem value="AEO">AEO</SelectItem>
                <SelectItem value="GEO">GEO</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="todo">Not started</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="done">Execute & complete</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All months</SelectItem>
                {monthOptions.map((m) => {
                  const d = new Date(`${m}-01T00:00:00`);
                  const label = d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
                  const cur = new Date().toISOString().slice(0, 7);
                  const suffix = m === cur ? " · This month" : m < cur ? " · Past" : " · Upcoming";
                  return <SelectItem key={m} value={m}>{label}{suffix}</SelectItem>;
                })}
              </SelectContent>
            </Select>
            <div className="ml-auto">
              <Button size="sm" variant="outline" onClick={async () => {
                try {
                  toast.loading("Building plan PDF…", { id: "pdf" });
                  const blob = await generateSeoPlanPdf({
                    tasks: tasks.map((t) => ({
                      scheduled_date: t.scheduled_date, section: t.section, category: t.category,
                      deliverable_type: t.deliverable_type, priority: t.priority, title: t.title,
                      description: t.description, target_url: t.target_url, target_keyword: t.target_keyword, status: t.status,
                    })),
                    blogs: posts.map((b) => ({
                      scheduled_date: b.scheduled_date, slug: b.slug, title: b.title,
                      primary_keyword: b.primary_keyword, secondary_keywords: b.secondary_keywords,
                      meta_description: b.meta_description, status: b.status,
                    })),
                    blogApprovalRequired: settings.blog_approval_required,
                    clientName: "PreciseDM",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url; a.download = `PreciseDM-SEO-Plan-${new Date().toISOString().slice(0, 10)}.pdf`;
                  a.click(); URL.revokeObjectURL(url);
                  toast.success("Plan PDF downloaded", { id: "pdf" });
                } catch (e) { console.error(e); toast.error("Failed to build PDF", { id: "pdf" }); }
              }}>
                <Download className="h-4 w-4 mr-2" />Download plan (PDF)
              </Button>
            </div>
          </div>

          <TabsContent value="calendar" className="mt-4">
            {loading ? <Loader /> : (
              <div className="space-y-4">
                {byDay.length === 0 ? (
                  <Card className="p-10 text-center text-sm text-muted-foreground">
                    Nothing scheduled for this month yet. Try a different month from the dropdown above.
                  </Card>
                ) : byDay.map(([day, items]) => (
                  <DayCard key={day} day={day} items={items}
                    onOpen={(id) => setOpenTaskId(id)}
                    onStatus={(id, status) => updateTask(id, { status })}
                    savingId={savingId} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="table" className="mt-4">
            {loading ? <Loader /> : (
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-left">
                    <tr>
                      <th className="px-3 py-2">Scheduled</th>
                      <th className="px-3 py-2">Channel</th>
                      <th className="px-3 py-2">Task</th>
                      <th className="px-3 py-2">Target page</th>
                      <th className="px-3 py-2">Primary keyword</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Completed</th>
                      <th className="px-3 py-2">Indexing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t) => (
                      <tr key={t.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => setOpenTaskId(t.id)}>
                        <td className="px-3 py-2 whitespace-nowrap">{fmtDate(t.scheduled_date)}</td>
                        <td className="px-3 py-2"><Badge variant="outline" className={SECTION_TONE[t.section]}>{t.section}</Badge></td>
                        <td className="px-3 py-2 max-w-[28rem]">{t.title}</td>
                        <td className="px-3 py-2 text-muted-foreground truncate max-w-[14rem]">{displayPath(t.target_url)}</td>
                        <td className="px-3 py-2 text-muted-foreground">{t.target_keyword ?? "—"}</td>
                        <td className="px-3 py-2"><StatusPill status={t.status} /></td>
                        <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{fmtDateTime(t.completed_at)}</td>
                        <td className="px-3 py-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <IndexingActions status={t.status} url={t.target_url} compact />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="keywords" className="mt-4">
            <KeywordMap tasks={tasks} onOpen={setOpenTaskId} />
          </TabsContent>

          <TabsContent value="blogs" className="mt-4">
            <BlogsBoard posts={posts} onOpen={setOpenPostId} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-4 space-y-4">
            <AdminSeoIndexing />
            <AdminSeoAnalytics />
          </TabsContent>

          <TabsContent value="rankings" className="mt-4">
            <AdminSeoKeywords />
          </TabsContent>
        </Tabs>

        <Sheet open={!!openTaskId} onOpenChange={(o) => !o && setOpenTaskId(null)}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            {openTask && (
              <TaskDetail task={openTask}
                post={openTask.blog_slug ? posts.find(p => p.slug === openTask.blog_slug) ?? null : null}
                saving={savingId === openTask.id}
                onChange={(patch) => updateTask(openTask.id, patch)}
                onOpenPost={(id) => { setOpenTaskId(null); setOpenPostId(id); }} />
            )}
          </SheetContent>
        </Sheet>

        <Sheet open={!!openPostId} onOpenChange={(o) => !o && setOpenPostId(null)}>
          <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
            {openPostId && (() => {
              const p = posts.find(x => x.id === openPostId);
              if (!p) return null;
              return <PostDetail post={p} saving={savingId === p.id} onChange={(patch) => updatePost(p.id, patch)} />;
            })()}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

/* ---------- subcomponents ---------- */

function Loader() {
  return <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center"><Loader2 className="h-4 w-4 animate-spin" /> Loading plan…</div>;
}

function KpiTile({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  return (
    <Card className={`p-4 ${accent} border-0`}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
    </Card>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone = status === "done" ? "bg-emerald-100 text-emerald-700" :
    status === "in_progress" ? "bg-blue-100 text-blue-700" :
    status === "blocked" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600";
  return <span className={`text-xs px-2 py-0.5 rounded-full ${tone}`}>{STATUS_LABEL[status] ?? status}</span>;
}

function DayCard({ day, items, onOpen, onStatus, savingId }: {
  day: string; items: Task[]; onOpen: (id: string) => void;
  onStatus: (id: string, status: string) => void; savingId: string | null;
}) {
  const today = todayISO();
  const isPast = day < today;
  const isToday = day === today;
  const allDone = items.every((t) => t.status === "done");

  return (
    <Card className="overflow-hidden">
      <div className={`px-4 py-3 flex items-center justify-between border-b ${
        isToday ? "bg-amber-50" : isPast && !allDone ? "bg-red-50" : "bg-muted/30"
      }`}>
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-semibold">{fmtDate(day)}</div>
            <div className="text-xs text-muted-foreground">
              {items.length} task{items.length === 1 ? "" : "s"} · {items.reduce((a, t) => a + t.effort_minutes, 0)} min
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isToday && <Badge className="bg-amber-200 text-amber-900 hover:bg-amber-200">Today</Badge>}
          {isPast && !allDone && <Badge variant="outline" className="border-red-300 text-red-700"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>}
          {allDone && <Badge variant="outline" className="border-emerald-300 text-emerald-700"><CheckCircle2 className="h-3 w-3 mr-1" />Done</Badge>}
        </div>
      </div>
      <div className="divide-y">
        {items.map((t) => (
          <div key={t.id} className="px-4 py-3 flex items-start gap-3 hover:bg-muted/20">
            <button onClick={() => onStatus(t.id, t.status === "done" ? "todo" : "done")} className="mt-1 shrink-0" aria-label="Toggle done" disabled={savingId === t.id}>
              {t.status === "done" ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
            </button>
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onOpen(t.id)}>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge variant="outline" className={SECTION_TONE[t.section]}>{t.section}</Badge>
                <Badge variant="outline" className={PRIORITY_TONE[t.priority]}>{t.priority}</Badge>
                {t.deliverable_type && <Badge variant="secondary">{t.deliverable_type}</Badge>}
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{t.effort_minutes}m</span>
              </div>
              <div className={`font-medium ${t.status === "done" ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                {t.target_url && <span className="flex items-center gap-1"><Target className="h-3 w-3" />{displayPath(t.target_url)}</span>}
                {t.target_keyword && <span className="flex items-center gap-1"><Hash className="h-3 w-3" />{t.target_keyword}</span>}
                {t.completed_at && <span className="flex items-center gap-1 text-emerald-700"><CheckCircle2 className="h-3 w-3" />Done {fmtDateTime(t.completed_at)}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TaskDetail({ task, post, saving, onChange, onOpenPost }: {
  task: Task; post: BlogPost | null; saving: boolean;
  onChange: (patch: Partial<Task>) => void; onOpenPost: (id: string) => void;
}) {
  const [notes, setNotes] = useState(task.notes ?? "");
  useEffect(() => { setNotes(task.notes ?? ""); }, [task.id, task.notes]);

  return (
    <div className="space-y-5">
      <SheetHeader>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <Badge variant="outline" className={SECTION_TONE[task.section]}>{task.section}</Badge>
          <Badge variant="outline" className={PRIORITY_TONE[task.priority]}>{task.priority}</Badge>
          {task.deliverable_type && <Badge variant="secondary">{task.deliverable_type}</Badge>}
          <Badge variant="outline">Week {task.week}</Badge>
        </div>
        <SheetTitle className="text-xl">{task.title}</SheetTitle>
        <SheetDescription>Scheduled for {fmtDate(task.scheduled_date)} · est. {task.effort_minutes} min · category: {task.category}</SheetDescription>
      </SheetHeader>

      {post && (
        <Card className="p-4 bg-violet-50 border-violet-200 space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-violet-700" />
            <div className="text-sm font-medium">Linked blog draft</div>
            <BlogStatusBadge status={post.status} />
          </div>
          <div className="text-sm">{post.title}</div>
          <div className="text-xs text-muted-foreground">{post.read_minutes ?? "—"} min read · {(post.body_md.length / 1000).toFixed(1)}k chars</div>
          <Button size="sm" variant="outline" onClick={() => onOpenPost(post.id)}>Open full draft & approval workflow</Button>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Scheduled date" value={fmtDate(task.scheduled_date)} />
        <Field label="Completed at" value={fmtDateTime(task.completed_at)} />
      </div>

      {task.target_url && (
        <Field label="Target page" value={
          <div className="space-y-2">
            <a href={task.target_url} target="_blank" rel="noreferrer" className="text-primary inline-flex items-center gap-1 hover:underline break-all">
              {task.target_url} <ExternalLink className="h-3 w-3" />
            </a>
            <div className="rounded-md border border-amber-200 bg-amber-50/60 p-2.5">
              <div className="text-xs font-semibold text-amber-900 inline-flex items-center gap-1.5"><Info className="h-3.5 w-3.5" /> This page must be re-indexed</div>
              <p className="text-[11px] text-amber-900/80 mt-1 leading-relaxed">Once you mark this task <em>Completed</em>, submit the URL so search engines re-crawl your changes:</p>
              <div className="mt-2"><IndexingActions status={task.status} url={task.target_url} /></div>
            </div>
          </div>
        } />
      )}

      {task.target_keyword && (
        <Field label="Primary keyword" value={
          <div className="flex flex-wrap gap-1.5">
            <Badge>{task.target_keyword}</Badge>
            {(task.secondary_keywords ?? []).map((k) => <Badge key={k} variant="outline">{k}</Badge>)}
          </div>
        } />
      )}

      {task.page_title && <Field label="Recommended <title>" value={<code className="text-xs bg-muted px-2 py-1 rounded block">{task.page_title}</code>} />}
      {task.meta_description && <Field label="Recommended meta description" value={<code className="text-xs bg-muted px-2 py-1 rounded block whitespace-pre-wrap">{task.meta_description}</code>} />}

      {task.content_brief && (<Field label="Content brief / what to do" value={<p className="text-sm leading-relaxed whitespace-pre-wrap">{task.content_brief}</p>} />)}
      {task.description && !task.content_brief && (<Field label="Description" value={<p className="text-sm leading-relaxed">{task.description}</p>} />)}

      {task.status === "done" && task.target_url && (<VerifyLivePanel task={task} onVerified={(patch) => onChange(patch)} />)}

      <div className="space-y-2">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Status</div>
        <Select value={task.status} onValueChange={(v) => onChange({ status: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">Not started</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="done">Execute & complete</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Execution notes</div>
        <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Links shipped, screenshots, blockers, ranking before/after…" />
        <Button size="sm" onClick={() => onChange({ notes })} disabled={saving}>
          {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null} Save notes
        </Button>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</div>
      <div>{value}</div>
    </div>
  );
}

function KeywordMap({ tasks, onOpen }: { tasks: Task[]; onOpen: (id: string) => void }) {
  const rows = tasks.filter((t) => t.target_keyword);
  return (
    <div className="border rounded-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left">
          <tr>
            <th className="px-3 py-2">Primary keyword</th>
            <th className="px-3 py-2">Target page</th>
            <th className="px-3 py-2">Scheduled</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Channel</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => onOpen(t.id)}>
              <td className="px-3 py-2 font-medium">{t.target_keyword}</td>
              <td className="px-3 py-2 text-muted-foreground truncate max-w-[18rem]">{displayPath(t.target_url)}</td>
              <td className="px-3 py-2 whitespace-nowrap">{fmtDate(t.scheduled_date)}</td>
              <td className="px-3 py-2"><StatusPill status={t.status} /></td>
              <td className="px-3 py-2"><Badge variant="outline" className={SECTION_TONE[t.section]}>{t.section}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const BLOG_STATUS_TONE: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  in_review: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  deployed: "bg-violet-100 text-violet-800 border-violet-200",
};
const BLOG_STATUS_LABEL: Record<string, string> = {
  draft: "Draft", in_review: "In review", approved: "Approved", deployed: "Deployed",
};

function BlogStatusBadge({ status }: { status: string }) {
  return <Badge variant="outline" className={BLOG_STATUS_TONE[status]}>{BLOG_STATUS_LABEL[status] ?? status}</Badge>;
}

function BlogsBoard({ posts, onOpen }: { posts: BlogPost[]; onOpen: (id: string) => void }) {
  const today = todayISO();
  const stats = useMemo(() => ({
    total: posts.length,
    deployed: posts.filter(p => p.status === "deployed").length,
    approved: posts.filter(p => p.status === "approved").length,
    in_review: posts.filter(p => p.status === "in_review").length,
    draft: posts.filter(p => p.status === "draft").length,
  }), [posts]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiTile label="Total drafts" value={String(stats.total)} sub="Articles ready to review" accent="bg-violet-50" />
        <KpiTile label="In draft" value={String(stats.draft)} sub="Awaiting review" accent="bg-slate-50" />
        <KpiTile label="In review" value={String(stats.in_review)} sub="With client" accent="bg-amber-50" />
        <KpiTile label="Approved" value={String(stats.approved)} sub="Ready to publish" accent="bg-emerald-50" />
        <KpiTile label="Deployed" value={String(stats.deployed)} sub="Live on site" accent="bg-blue-50" />
      </div>

      <Card className="p-4 bg-muted/30">
        <h3 className="font-serif text-lg mb-1">Blog publishing schedule</h3>
        <p className="text-xs text-muted-foreground">In-depth articles mapped to target keyword clusters. Click any card to read the full draft, leave notes, approve, or mark deployed.</p>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {posts.map((p) => {
          const overdue = p.scheduled_date && p.scheduled_date < today && p.status !== "deployed";
          return (
            <Card key={p.id} className="p-4 hover:shadow-md transition cursor-pointer" onClick={() => onOpen(p.id)}>
              <div className="flex items-center justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <BlogStatusBadge status={p.status} />
                  {p.status === "deployed" && <Badge variant="outline" className="border-emerald-300 text-emerald-700"><Rocket className="h-3 w-3 mr-1" />Live</Badge>}
                  {overdue && <Badge variant="outline" className="border-red-300 text-red-700"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{fmtDate(p.scheduled_date)}</span>
              </div>
              <h4 className="font-medium leading-snug mb-2">{p.title}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                {p.primary_keyword && <Badge variant="secondary">{p.primary_keyword}</Badge>}
                <span>{p.read_minutes ?? "—"} min read</span>
              </div>
              {p.meta_description && <p className="text-xs text-muted-foreground line-clamp-2">{p.meta_description}</p>}
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                {p.approved_at && <span className="flex items-center gap-1 text-emerald-700"><Check className="h-3 w-3" />Approved {fmtDateTime(p.approved_at)}</span>}
                {p.deployed_at && <span className="flex items-center gap-1 text-violet-700"><Rocket className="h-3 w-3" />Deployed {fmtDateTime(p.deployed_at)}</span>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function PostDetail({ post, saving, onChange }: {
  post: BlogPost; saving: boolean; onChange: (patch: Partial<BlogPost>) => void;
}) {
  const [clientNotes, setClientNotes] = useState(post.client_notes ?? "");
  const [internalNotes, setInternalNotes] = useState(post.internal_notes ?? "");
  useEffect(() => { setClientNotes(post.client_notes ?? ""); setInternalNotes(post.internal_notes ?? ""); }, [post.id]);

  return (
    <div className="space-y-5">
      <SheetHeader>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <BlogStatusBadge status={post.status} />
          {post.primary_keyword && <Badge variant="secondary">{post.primary_keyword}</Badge>}
          <Badge variant="outline">{post.read_minutes ?? "—"} min read</Badge>
        </div>
        <SheetTitle className="text-xl leading-snug">{post.title}</SheetTitle>
        <SheetDescription>Scheduled {fmtDate(post.scheduled_date)} · {post.url}</SheetDescription>
      </SheetHeader>

      <Card className="p-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground mr-2">Workflow:</span>
        <Button size="sm" variant={post.status === "in_review" ? "default" : "outline"} onClick={() => onChange({ status: "in_review" })} disabled={saving}>Send for review</Button>
        <Button size="sm" variant={post.status === "approved" ? "default" : "outline"} onClick={() => onChange({ status: "approved" })} disabled={saving} className={post.status === "approved" ? "" : "text-emerald-700 border-emerald-300"}><Check className="h-3 w-3 mr-1" /> Approve</Button>
        <Button size="sm" variant={post.status === "deployed" ? "default" : "outline"} onClick={() => onChange({ status: "deployed" })} disabled={saving} className={post.status === "deployed" ? "" : "text-violet-700 border-violet-300"}><Rocket className="h-3 w-3 mr-1" /> Mark deployed</Button>
        <Button size="sm" variant="ghost" onClick={() => onChange({ status: "draft" })} disabled={saving}>Back to draft</Button>
      </Card>

      {post.meta_description && <Field label="Meta description" value={<code className="text-xs bg-muted px-2 py-1 rounded block whitespace-pre-wrap">{post.meta_description}</code>} />}
      {(post.secondary_keywords?.length ?? 0) > 0 && <Field label="Secondary keywords" value={<div className="flex flex-wrap gap-1.5">{post.secondary_keywords!.map(k => <Badge key={k} variant="outline">{k}</Badge>)}</div>} />}

      <Field label="Article (markdown)" value={
        <div className="prose prose-sm max-w-none border rounded-lg p-4 bg-muted/20 max-h-[60vh] overflow-y-auto whitespace-pre-wrap font-sans text-sm leading-relaxed">{post.body_md}</div>
      } />

      <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
        <Field label="Approved at" value={fmtDateTime(post.approved_at)} />
        <Field label="Deployed at" value={fmtDateTime(post.deployed_at)} />
      </div>

      <div className="space-y-2">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Client notes / suggested changes</div>
        <Textarea rows={4} value={clientNotes} onChange={(e) => setClientNotes(e.target.value)} placeholder="Suggest edits, tone changes, things to add or remove…" />
        <Button size="sm" onClick={() => onChange({ client_notes: clientNotes })} disabled={saving}>
          {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null} Save client notes
        </Button>
      </div>

      <div className="space-y-2">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Internal notes</div>
        <Textarea rows={3} value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} placeholder="Where it's deployed, GSC ranking, internal links added…" />
        <Button size="sm" variant="outline" onClick={() => onChange({ internal_notes: internalNotes })} disabled={saving}>Save internal notes</Button>
      </div>
    </div>
  );
}

function VerifyLivePanel({ task, onVerified }: { task: Task; onVerified: (patch: Partial<Task>) => void }) {
  const [busy, setBusy] = useState(false);
  const snap = task.verified_snapshot as
    | { http_status?: number; verification_source?: string;
        live?: { title?: string | null; meta_description?: string | null; h1?: string | null };
        rendered?: { title?: string | null; meta_description?: string | null; h1?: string | null };
        checks?: Record<string, boolean | null>; }
    | null | undefined;

  async function runVerify() {
    setBusy(true);
    toast.loading("Fetching live page…", { id: "seo-verify" });
    const { data, error } = await supabase.functions.invoke("seo-verify-live", { body: { taskId: task.id } });
    setBusy(false);
    if (error || !data?.ok) { toast.error(`Verify failed: ${error?.message ?? data?.error ?? "unknown"}`, { id: "seo-verify" }); return; }
    const status = data.verified_status as string;
    if (status === "pass") toast.success("Verified live — all checks passed", { id: "seo-verify" });
    else if (status === "fail") toast.warning("Live page is missing some recommended values", { id: "seo-verify" });
    else toast.error("Could not fetch the live page", { id: "seo-verify" });
    onVerified({ verified_at: new Date().toISOString(), verified_status: status, verified_snapshot: data.snapshot });
  }

  const tone = task.verified_status === "pass" ? "border-emerald-200 bg-emerald-50" :
    task.verified_status === "fail" ? "border-amber-200 bg-amber-50" :
    task.verified_status === "fetch_failed" ? "border-red-200 bg-red-50" :
    "border-slate-200 bg-slate-50";

  return (
    <div className={`rounded-md border p-3 ${tone}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Live verification</div>
        <Button size="sm" variant="outline" onClick={runVerify} disabled={busy}>
          {busy ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Search className="h-3 w-3 mr-1" />}
          {task.verified_at ? "Re-verify" : "Verify live"}
        </Button>
      </div>
      {task.verified_at ? (
        <div className="mt-2 space-y-1.5 text-[11px]">
          <div className="text-muted-foreground">
            Last checked {fmtDateTime(task.verified_at)} · HTTP {snap?.http_status ?? "?"} · status: <strong>{task.verified_status}</strong>
            {snap?.verification_source ? <> · source: {snap.verification_source === "applied_seo_override" ? "applied override" : "server HTML"}</> : null}
          </div>
          <CheckRow label="Title contains recommended" result={snap?.checks?.title_match ?? null} live={snap?.rendered?.title ?? snap?.live?.title} />
          <CheckRow label="Meta description matches" result={snap?.checks?.meta_match ?? null} live={snap?.rendered?.meta_description ?? snap?.live?.meta_description} />
          <CheckRow label="H1 matches applied recommendation" result={snap?.checks?.h1_match ?? snap?.checks?.keyword_in_h1 ?? null} live={snap?.rendered?.h1 ?? snap?.live?.h1} />
        </div>
      ) : (
        <div className="mt-1.5 text-[11px] text-muted-foreground">Fetches the live URL and confirms the recommended title, meta description, and H1 keyword are actually present.</div>
      )}
    </div>
  );
}

function CheckRow({ label, result, live }: { label: string; result: boolean | null; live?: string | null }) {
  const icon = result === true ? <CheckCircle2 className="h-3 w-3 text-emerald-600" />
    : result === false ? <Circle className="h-3 w-3 text-red-600 fill-red-600" />
    : <Circle className="h-3 w-3 text-slate-400" />;
  return (
    <div className="flex items-start gap-1.5">
      {icon}
      <div className="flex-1">
        <div>{label}{result === null && <span className="text-muted-foreground"> · n/a</span>}</div>
        {live && <div className="text-muted-foreground truncate" title={live}>Live: “{live}”</div>}
      </div>
    </div>
  );
}

function IndexingActions({ status, url, compact = false }: { status: string; url: string | null; compact?: boolean }) {
  if (!url) return <span className="text-xs text-muted-foreground">—</span>;
  if (status !== "done") {
    return <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Clock className="h-3 w-3" />After completion</span>;
  }
  return (
    <div className={compact ? "flex items-center gap-1.5" : "flex flex-wrap items-center gap-2"}>
      <a href={gscInspectUrl(url)} target="_blank" rel="noreferrer"
        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
        title="Open Google Search Console URL Inspection">
        <Search className="h-3 w-3" /> Inspect on Google
      </a>
      <a href={bingSubmitUrl(url)} target="_blank" rel="noreferrer"
        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100"
        title="Submit URL to Bing Webmaster Tools">
        <Search className="h-3 w-3" /> Submit to Bing
      </a>
      {!compact && <span className="text-[11px] text-muted-foreground">Submit after the live page change is verified.</span>}
    </div>
  );
}
