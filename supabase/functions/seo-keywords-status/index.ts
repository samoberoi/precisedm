// Live keyword rankings from Search Console for every keyword in the SEO plan.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function refreshAccessToken(refreshToken: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: Deno.env.get("GOOGLE_OAUTH_CLIENT_ID")!,
      client_secret: Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET")!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) { console.error("refresh failed", await res.text()); return null; }
  return await res.json() as { access_token: string; expires_in: number };
}

async function gscQuery(accessToken: string, siteUrl: string, body: unknown) {
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify(body) },
  );
  if (!res.ok) { console.error("gsc error", res.status, await res.text()); return { rows: [] as any[] }; }
  return await res.json() as { rows?: Array<{ keys: string[]; clicks: number; impressions: number; ctr: number; position: number }> };
}

function ymd(d: Date) { return d.toISOString().slice(0, 10); }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await supa.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userErr || !userData?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", userData.user.id);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json().catch(() => ({}));
    const days: number = Math.max(1, Math.min(90, Number(body.days ?? 28)));
    const end = new Date(); end.setUTCDate(end.getUTCDate() - 1);
    const start = new Date(); start.setUTCDate(start.getUTCDate() - days);
    const startDate = ymd(start); const endDate = ymd(end);

    type Source = { kind: "task" | "blog"; id: string; title: string; role: "primary" | "secondary"; url: string | null };
    const map = new Map<string, { keyword: string; sources: Source[] }>();
    const add = (raw: string | null | undefined, src: Source) => {
      if (!raw) return;
      const k = raw.trim(); if (!k) return;
      const key = k.toLowerCase();
      if (!map.has(key)) map.set(key, { keyword: k, sources: [] });
      map.get(key)!.sources.push(src);
    };

    const [tasksRes, postsRes] = await Promise.all([
      admin.from("seo_tasks").select("id,title,target_keyword,secondary_keywords,target_url"),
      admin.from("seo_blog_posts").select("id,title,primary_keyword,secondary_keywords,url,slug"),
    ]);
    for (const t of (tasksRes.data ?? [])) {
      add(t.target_keyword, { kind: "task", id: t.id, title: t.title, role: "primary", url: t.target_url });
      for (const s of (t.secondary_keywords ?? [])) add(s, { kind: "task", id: t.id, title: t.title, role: "secondary", url: t.target_url });
    }
    for (const p of (postsRes.data ?? [])) {
      add(p.primary_keyword, { kind: "blog", id: p.id, title: p.title, role: "primary", url: p.url });
      for (const s of (p.secondary_keywords ?? [])) add(s, { kind: "blog", id: p.id, title: p.title, role: "secondary", url: p.url });
    }

    const { data: integ } = await admin.from("seo_integrations").select("*").eq("provider", "google").maybeSingle();
    if (!integ?.refresh_token) {
      return new Response(JSON.stringify({
        error: "not_connected",
        keywords: Array.from(map.values()).map((v) => ({ ...v, status: "not_connected" })),
        range: { startDate, endDate, days },
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let accessToken = integ.access_token as string | null;
    const exp = integ.access_token_expires_at ? new Date(integ.access_token_expires_at).getTime() : 0;
    if (!accessToken || exp - Date.now() < 60_000) {
      const refreshed = await refreshAccessToken(integ.refresh_token);
      if (!refreshed) {
        return new Response(JSON.stringify({ error: "refresh_failed" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      accessToken = refreshed.access_token;
      await admin.from("seo_integrations").update({
        access_token: accessToken,
        access_token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
        last_refreshed_at: new Date().toISOString(),
        last_error: null,
      }).eq("id", integ.id);
    }

    const siteUrl = integ.property_url ?? "https://www.precisedm.com/";
    const gsc = await gscQuery(accessToken!, siteUrl, { startDate, endDate, dimensions: ["query"], rowLimit: 25000 });
    const byQuery = new Map<string, { clicks: number; impressions: number; ctr: number; position: number }>();
    for (const row of (gsc.rows ?? [])) {
      const q = (row.keys?.[0] ?? "").toLowerCase();
      if (q) byQuery.set(q, { clicks: row.clicks ?? 0, impressions: row.impressions ?? 0, ctr: row.ctr ?? 0, position: row.position ?? 0 });
    }

    const keywords = Array.from(map.values()).map((entry) => {
      const m = byQuery.get(entry.keyword.toLowerCase());
      if (!m || m.impressions === 0) return { ...entry, status: "na", clicks: 0, impressions: 0, ctr: 0, position: null };
      return { ...entry, status: "ranking", clicks: m.clicks, impressions: m.impressions, ctr: m.ctr, position: m.position };
    }).sort((a, b) => {
      if (a.position == null && b.position != null) return 1;
      if (b.position == null && a.position != null) return -1;
      if (a.position != null && b.position != null) return a.position - b.position;
      return a.keyword.localeCompare(b.keyword);
    });

    return new Response(JSON.stringify({
      range: { startDate, endDate, days },
      siteUrl,
      generatedAt: new Date().toISOString(),
      total: keywords.length,
      ranking: keywords.filter((k) => k.status === "ranking").length,
      keywords,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
