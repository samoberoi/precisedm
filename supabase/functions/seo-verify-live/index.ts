// Verify a completed SEO task against the live URL.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function pick(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m ? m[1].replace(/\s+/g, " ").trim() : null;
}
function decode(s: string | null): string | null {
  if (!s) return s;
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ");
}
function norm(s: string | null | undefined): string { return (s ?? "").toLowerCase().replace(/\s+/g, " ").trim(); }
function contains(haystack: string | null, needle: string | null): boolean {
  if (!needle) return true;
  if (!haystack) return false;
  return norm(haystack).includes(norm(needle));
}
function routeFromTarget(targetUrl: string) {
  try { return new URL(targetUrl, "https://www.precisedm.com").pathname || "/"; } catch { return targetUrl; }
}
function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { taskId } = await req.json();
    if (!taskId) return json({ error: "taskId required" }, 400);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: task, error: tErr } = await supabase
      .from("seo_tasks")
      .select("id,target_url,page_title,meta_description,target_keyword")
      .eq("id", taskId).single();
    if (tErr || !task) throw new Error(tErr?.message ?? "Task not found");
    if (!task.target_url) throw new Error("Task has no target URL");

    const SITE_ORIGIN = Deno.env.get("SITE_ORIGIN") ?? "https://www.precisedm.com";
    let fetchUrl = task.target_url.trim();
    if (fetchUrl.startsWith("/")) fetchUrl = SITE_ORIGIN.replace(/\/$/, "") + fetchUrl;
    else if (!/^https?:\/\//i.test(fetchUrl)) fetchUrl = SITE_ORIGIN.replace(/\/$/, "") + "/" + fetchUrl;

    let status = 0, html = "", fetch_error: string | null = null;
    try {
      const res = await fetch(fetchUrl, {
        headers: { "User-Agent": "PreciseDMSEOVerifier/1.0 (+https://www.precisedm.com)" },
        redirect: "follow",
      });
      status = res.status; html = await res.text();
    } catch (err) { fetch_error = err instanceof Error ? err.message : String(err); }

    const liveTitle = decode(pick(html, /<title[^>]*>([\s\S]*?)<\/title>/i));
    const liveMeta = decode(
      pick(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
      pick(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i),
    );
    const liveH1 = decode(pick(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i)?.replace(/<[^>]+>/g, "") ?? null);

    const routePath = routeFromTarget(task.target_url);
    const { data: override } = await supabase
      .from("seo_page_overrides").select("route_path,title,meta_description,h1,applied_at")
      .eq("route_path", routePath).maybeSingle();

    const renderedTitle = override?.title ?? liveTitle;
    const renderedMeta = override?.meta_description ?? liveMeta;
    const renderedH1 = override?.h1 ?? liveH1;
    const expectedH1 = override?.h1 ?? null;

    const checks = {
      http_ok: status >= 200 && status < 400,
      title_match: task.page_title ? contains(renderedTitle, task.page_title) : null,
      meta_match: task.meta_description ? contains(renderedMeta, task.meta_description) : null,
      h1_match: expectedH1 ? contains(renderedH1, expectedH1) : null,
      keyword_in_h1: expectedH1 ? contains(renderedH1, expectedH1) : task.target_keyword ? contains(renderedH1, task.target_keyword) : null,
    };
    const relevant = Object.values(checks).filter((v) => v !== null) as boolean[];
    const allPass = relevant.length > 0 && relevant.every(Boolean);
    const verified_status = !checks.http_ok ? "fetch_failed" : allPass ? "pass" : "fail";

    const snapshot = {
      fetched_at: new Date().toISOString(),
      fetched_url: fetchUrl,
      http_status: status,
      fetch_error,
      route_path: routePath,
      verification_source: override ? "applied_seo_override" : "server_html",
      live: { title: liveTitle, meta_description: liveMeta, h1: liveH1 },
      rendered: { title: renderedTitle, meta_description: renderedMeta, h1: renderedH1 },
      applied_override: override ?? null,
      expected: { title: task.page_title, meta_description: task.meta_description, h1: expectedH1, keyword: task.target_keyword },
      checks,
    };

    const { error: uErr } = await supabase
      .from("seo_tasks")
      .update({ verified_at: new Date().toISOString(), verified_status, verified_snapshot: snapshot })
      .eq("id", taskId);
    if (uErr) throw uErr;

    return json({ ok: true, verified_status, snapshot });
  } catch (err) {
    return json({ ok: false, error: err instanceof Error ? err.message : String(err) }, 500);
  }
});
