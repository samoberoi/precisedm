// SEO task executor. Applies page overrides / publishes blogs and marks tasks done.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SeoTask = {
  id: string; deliverable_type: string | null; scheduled_date: string | null; status: string;
  title: string; target_url: string | null; target_keyword: string | null;
  secondary_keywords: string[] | null; page_title: string | null; meta_description: string | null;
  content_brief: string | null; blog_slug: string | null;
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
function todayISO() { return new Date().toISOString().slice(0, 10); }
function routeFromTarget(targetUrl: string | null) {
  if (!targetUrl) return null;
  try { return new URL(targetUrl, "https://www.precisedm.com").pathname || "/"; }
  catch { return targetUrl.startsWith("/") ? targetUrl : null; }
}
function h1FromBrief(task: SeoTask) {
  const quoted = task.content_brief?.match(/H1(?: to| ')?[\s:]*[“"']([^”"']+)[”"']/i)?.[1];
  if (quoted) return quoted;
  return task.page_title?.split(/[—|]/)[0]?.trim() ?? task.title;
}
function introFromTask(task: SeoTask) {
  return task.meta_description ?? task.content_brief ?? null;
}

async function assertAdmin(req: Request, supabaseUrl: string, anonKey: string) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return false;
  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: userData } = await userClient.auth.getUser();
  if (!userData.user) return false;
  const { data } = await userClient.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
  return data === true;
}

async function executeTask(supabase: ReturnType<typeof createClient>, task: SeoTask, settings: { blog_approval_required: boolean }) {
  const now = new Date().toISOString();
  const type = task.deliverable_type;

  if (type === "meta" || type === "content" || type === "schema" || type === "image-seo") {
    const routePath = routeFromTarget(task.target_url);
    if (!routePath) {
      await supabase.from("seo_tasks").update({ status: "blocked", notes: "Cannot auto-execute: no editable target page URL." }).eq("id", task.id);
      return { completed: false, blocked: true, reason: "missing_target_url" };
    }
    await supabase.from("seo_page_overrides").upsert({
      route_path: routePath,
      title: task.page_title,
      meta_description: task.meta_description,
      h1: h1FromBrief(task),
      intro_copy: introFromTask(task),
      target_keyword: task.target_keyword,
      secondary_keywords: task.secondary_keywords ?? [],
      source_task_id: task.id,
      applied_at: now,
    }, { onConflict: "route_path" });
    await supabase.from("seo_tasks").update({
      status: "done", completed_at: now,
      notes: `Executed: live SEO override applied to ${routePath}. This page must be submitted for re-indexing.`,
    }).eq("id", task.id);
    return { completed: true, kind: "page_override", routePath };
  }

  if (type === "blog" || task.blog_slug) {
    if (!task.blog_slug) {
      await supabase.from("seo_tasks").update({ status: "blocked", notes: "Cannot publish blog: task has no linked blog slug." }).eq("id", task.id);
      return { completed: false, blocked: true, reason: "missing_blog_slug" };
    }
    const { data: post } = await supabase.from("seo_blog_posts").select("id,status").eq("slug", task.blog_slug).maybeSingle();
    if (!post) {
      await supabase.from("seo_tasks").update({ status: "blocked", notes: "Cannot publish blog: linked blog draft was not found." }).eq("id", task.id);
      return { completed: false, blocked: true, reason: "post_not_found" };
    }
    const canDeploy = !settings.blog_approval_required || post.status === "approved" || post.status === "deployed";
    if (!canDeploy) {
      await supabase.from("seo_tasks").update({ status: "blocked", notes: "Blog exists but is not approved yet, so it was not published." }).eq("id", task.id);
      return { completed: false, blocked: true, reason: "approval_required" };
    }
    if (post.status !== "deployed") {
      await supabase.from("seo_blog_posts").update({ status: "deployed", deployed_at: now }).eq("id", post.id);
    }
    await supabase.from("seo_tasks").update({
      status: "done", completed_at: now,
      notes: `Executed: blog published at /blog/${task.blog_slug}. This page must be submitted for re-indexing.`,
    }).eq("id", task.id);
    return { completed: true, kind: "blog", slug: task.blog_slug };
  }

  await supabase.from("seo_tasks").update({
    status: "blocked", completed_at: null,
    notes: "Not auto-completed: this is an external/manual task and must be verified by a person before completion.",
  }).eq("id", task.id);
  return { completed: false, blocked: true, reason: "manual_or_external" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (!["GET", "POST"].includes(req.method)) return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  let requestedTaskId: string | null = null;
  let repairCompleted = false;
  if (req.method === "POST") {
    if (!(await assertAdmin(req, supabaseUrl, anonKey))) return json({ error: "Admin access required" }, 401);
    const body = await req.json().catch(() => ({}));
    requestedTaskId = typeof body.taskId === "string" ? body.taskId : null;
    repairCompleted = body.repairCompleted === true;
  }

  const { data: settingsRow } = await supabase.from("seo_settings").select("*").eq("id", 1).maybeSingle();
  const settings = settingsRow ?? { auto_execute: true, blog_approval_required: true };

  if (req.method === "GET" && !settings.auto_execute) return json({ skipped: true, reason: "auto_execute disabled" });

  const today = todayISO();
  let query = supabase.from("seo_tasks")
    .select("id, deliverable_type, scheduled_date, status, title, target_url, target_keyword, secondary_keywords, page_title, meta_description, content_brief, blog_slug")
    .order("scheduled_date", { ascending: true });

  if (requestedTaskId) query = query.eq("id", requestedTaskId);
  else if (repairCompleted) query = query.eq("status", "done");
  else query = query.neq("status", "done").lte("scheduled_date", today);

  const { data: tasks, error } = await query;
  if (error) return json({ error: error.message }, 500);

  const results = [];
  for (const task of (tasks ?? []) as SeoTask[]) {
    results.push({ taskId: task.id, title: task.title, ...(await executeTask(supabase, task, settings)) });
  }

  const now = new Date().toISOString();
  await supabase.from("seo_settings").update({ last_auto_run_at: now }).eq("id", 1);

  return json({ ok: true, ranAt: now, processed: results.length, results, approvalRequired: settings.blog_approval_required });
});
