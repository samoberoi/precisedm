// Fetches GSC + GA4 metrics using the stored Google refresh token. Admin-only.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number } | null> {
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
  return await res.json();
}

async function gscQuery(accessToken: string, siteUrl: string, body: any) {
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify(body) },
  );
  if (!res.ok) { console.error("gsc error", res.status, await res.text()); return { rows: [] }; }
  return await res.json();
}

async function ga4RunReport(accessToken: string, propertyId: string, body: any) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify(body) },
  );
  if (!res.ok) { console.error("ga4 error", res.status, await res.text()); return { rows: [], totals: [] }; }
  return await res.json();
}

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
    const startDate: string = body.startDate;
    const endDate: string = body.endDate;
    const compareStart: string | null = body.compareStart ?? null;
    const compareEnd: string | null = body.compareEnd ?? null;
    if (!startDate || !endDate) {
      return new Response(JSON.stringify({ error: "startDate/endDate required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: integ } = await admin.from("seo_integrations").select("*").eq("provider", "google").maybeSingle();
    if (!integ?.refresh_token) {
      return new Response(JSON.stringify({ error: "not_connected" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let accessToken = integ.access_token as string | null;
    const exp = integ.access_token_expires_at ? new Date(integ.access_token_expires_at).getTime() : 0;
    if (!accessToken || exp - Date.now() < 60_000) {
      const refreshed = await refreshAccessToken(integ.refresh_token);
      if (!refreshed) {
        await admin.from("seo_integrations").update({ last_error: "refresh_failed" }).eq("id", integ.id);
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
    const ga4PropId = Deno.env.get("GA4_PROPERTY_ID");

    const gscTotals = await gscQuery(accessToken!, siteUrl, { startDate, endDate, dimensions: [] });
    const gscQueries = await gscQuery(accessToken!, siteUrl, { startDate, endDate, dimensions: ["query"], rowLimit: 25 });
    const gscPages = await gscQuery(accessToken!, siteUrl, { startDate, endDate, dimensions: ["page"], rowLimit: 25 });
    const gscDevice = await gscQuery(accessToken!, siteUrl, { startDate, endDate, dimensions: ["device"] });
    const gscCountry = await gscQuery(accessToken!, siteUrl, { startDate, endDate, dimensions: ["country"], rowLimit: 10 });
    let gscTotalsPrev: any = null;
    if (compareStart && compareEnd) {
      gscTotalsPrev = await gscQuery(accessToken!, siteUrl, { startDate: compareStart, endDate: compareEnd, dimensions: [] });
    }

    let ga4: any = null, ga4Prev: any = null, ga4Device: any = null, ga4Sources: any = null, ga4Pages: any = null;
    if (ga4PropId) {
      const ga4Metrics = [
        { name: "totalUsers" }, { name: "newUsers" }, { name: "sessions" },
        { name: "screenPageViews" }, { name: "averageSessionDuration" },
        { name: "engagementRate" }, { name: "bounceRate" },
      ];
      ga4 = await ga4RunReport(accessToken!, ga4PropId, { dateRanges: [{ startDate, endDate }], metrics: ga4Metrics });
      if (compareStart && compareEnd) {
        ga4Prev = await ga4RunReport(accessToken!, ga4PropId, { dateRanges: [{ startDate: compareStart, endDate: compareEnd }], metrics: ga4Metrics });
      }
      ga4Device = await ga4RunReport(accessToken!, ga4PropId, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "totalUsers" }, { name: "sessions" }],
      });
      ga4Sources = await ga4RunReport(accessToken!, ga4PropId, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }, { name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      });
      ga4Pages = await ga4RunReport(accessToken!, ga4PropId, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 15,
      });
    }

    return new Response(JSON.stringify({
      connection: { siteUrl, ga4PropertyId: ga4PropId ?? null, connectedAt: integ.connected_at },
      range: { startDate, endDate, compareStart, compareEnd },
      gsc: {
        totals: gscTotals.rows?.[0] ?? null,
        totalsPrev: gscTotalsPrev?.rows?.[0] ?? null,
        queries: gscQueries.rows ?? [],
        pages: gscPages.rows ?? [],
        device: gscDevice.rows ?? [],
        country: gscCountry.rows ?? [],
      },
      ga4: ga4 ? {
        totals: ga4.rows?.[0] ?? null,
        totalsPrev: ga4Prev?.rows?.[0] ?? null,
        device: ga4Device?.rows ?? [],
        sources: ga4Sources?.rows ?? [],
        pages: ga4Pages?.rows ?? [],
        metricHeaders: ga4.metricHeaders ?? [],
      } : null,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
