// Search Console Search Analytics — uses Google service account JWT auth
import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\\n/g, "\n")
    .replace(/\s/g, "");
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function getAccessToken(scope: string): Promise<string> {
  const raw = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON missing");
  const sa = JSON.parse(raw);
  const key = await importPrivateKey(sa.private_key);
  const jwt = await create(
    { alg: "RS256", typ: "JWT", kid: sa.private_key_id },
    {
      iss: sa.client_email,
      scope,
      aud: "https://oauth2.googleapis.com/token",
      exp: getNumericDate(60 * 60),
      iat: getNumericDate(0),
    },
    key,
  );
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Token error: ${JSON.stringify(data)}`);
  return data.access_token;
}

const SITE = "https://precisedm.com/";

function dateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const token = await getAccessToken("https://www.googleapis.com/auth/webmasters.readonly");
    const startDate = dateNDaysAgo(28);
    const endDate = dateNDaysAgo(2); // GSC has ~2-day delay

    const base = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`;
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    const totalsReq = fetch(base, {
      method: "POST",
      headers,
      body: JSON.stringify({ startDate, endDate, dimensions: [] }),
    });
    const queriesReq = fetch(base, {
      method: "POST",
      headers,
      body: JSON.stringify({ startDate, endDate, dimensions: ["query"], rowLimit: 100 }),
    });
    const pagesReq = fetch(base, {
      method: "POST",
      headers,
      body: JSON.stringify({ startDate, endDate, dimensions: ["page"], rowLimit: 25 }),
    });
    const countriesReq = fetch(base, {
      method: "POST",
      headers,
      body: JSON.stringify({ startDate, endDate, dimensions: ["country"], rowLimit: 10 }),
    });

    const [totalsRes, queriesRes, pagesRes, countriesRes] = await Promise.all([
      totalsReq, queriesReq, pagesReq, countriesReq,
    ]);
    const totals = await totalsRes.json();
    const queries = await queriesRes.json();
    const pages = await pagesRes.json();
    const countries = await countriesRes.json();

    if (!totalsRes.ok) throw new Error(`GSC totals error: ${JSON.stringify(totals)}`);

    const t = totals.rows?.[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    const result = {
      dateRange: { startDate, endDate },
      totals: {
        clicks: t.clicks ?? 0,
        impressions: t.impressions ?? 0,
        ctr: t.ctr ?? 0,
        position: t.position ?? 0,
      },
      queries: (queries.rows ?? []).map((r: any) => ({
        query: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: r.ctr,
        position: r.position,
      })),
      pages: (pages.rows ?? []).map((r: any) => ({
        page: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: r.ctr,
        position: r.position,
      })),
      countries: (countries.rows ?? []).map((r: any) => ({
        country: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
      })),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("gsc-report error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
