// OAuth callback (PUBLIC, no JWT). Exchanges code → refresh_token, stores it,
// then redirects user back to /admin/seo?google=connected.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

async function verify(payloadB64: string, sig: string, secret: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expected = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
  const expectedB64 = btoa(String.fromCharCode(...new Uint8Array(expected))).replace(/=+$/, "");
  return expectedB64 === sig;
}

function htmlRedirect(url: string, _message: string) {
  return new Response(null, {
    status: 302,
    headers: { Location: url, "Cache-Control": "no-store" },
  });
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const errorParam = url.searchParams.get("error");

    let returnBase = "/admin/seo";

    if (errorParam) {
      return htmlRedirect(`${returnBase}?google=error&reason=${encodeURIComponent(errorParam)}`, "Sign-in cancelled.");
    }
    if (!code || !state) {
      return htmlRedirect(`${returnBase}?google=error&reason=missing_code`, "Missing OAuth code.");
    }

    const [payloadB64, sig] = state.split(".");
    if (!payloadB64 || !sig) {
      return htmlRedirect(`${returnBase}?google=error&reason=bad_state`, "Bad state.");
    }
    const ok = await verify(payloadB64, sig, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    if (!ok) {
      return htmlRedirect(`${returnBase}?google=error&reason=bad_sig`, "State signature invalid.");
    }
    const decoded = JSON.parse(atob(payloadB64)) as { uid: string; exp: number; returnTo?: string };
    if (Date.now() > decoded.exp) {
      return htmlRedirect(`${returnBase}?google=error&reason=expired`, "State expired.");
    }
    if (decoded.returnTo && decoded.returnTo.startsWith("http")) {
      try {
        const u = new URL(decoded.returnTo);
        returnBase = `${u.origin}/admin/seo`;
      } catch { /* ignore */ }
    }

    const projectRef = (Deno.env.get("SUPABASE_URL") ?? "").match(/https:\/\/([^.]+)/)?.[1] ?? "";
    const redirectUri = `https://${projectRef}.supabase.co/functions/v1/seo-google-oauth-callback`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: Deno.env.get("GOOGLE_OAUTH_CLIENT_ID")!,
        client_secret: Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET")!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokenRes.ok) {
      return htmlRedirect(`${returnBase}?google=error&reason=${encodeURIComponent(tokens.error || "exchange")}`, "Token exchange failed.");
    }

    const refreshToken: string | undefined = tokens.refresh_token;
    const accessToken: string | undefined = tokens.access_token;
    const expiresIn: number = tokens.expires_in ?? 3600;
    if (!refreshToken) {
      return htmlRedirect(`${returnBase}?google=error&reason=no_refresh`, "No refresh token returned. Re-auth with prompt=consent.");
    }

    // Discover a GSC site
    let propertyUrl: string | null = null;
    try {
      const sitesRes = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const sites = await sitesRes.json();
      const candidates: string[] = (sites.siteEntry ?? [])
        .filter((s: any) => s.permissionLevel && s.permissionLevel !== "siteUnverifiedUser")
        .map((s: any) => s.siteUrl);
      propertyUrl = candidates.find((s) => s.includes("precisedm")) ?? candidates[0] ?? null;
    } catch (e) {
      console.warn("sites lookup failed", e);
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: existing } = await admin
      .from("seo_integrations").select("id").eq("provider", "google").maybeSingle();

    const payload = {
      provider: "google",
      property_url: propertyUrl,
      refresh_token: refreshToken,
      access_token: accessToken ?? null,
      access_token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      connected_by_user_id: decoded.uid,
      connected_at: new Date().toISOString(),
      last_refreshed_at: new Date().toISOString(),
      last_error: null,
    };

    if (existing?.id) {
      await admin.from("seo_integrations").update(payload).eq("id", existing.id);
    } else {
      await admin.from("seo_integrations").insert(payload);
    }

    return htmlRedirect(`${returnBase}?google=connected`, "Connected.");
  } catch (e) {
    console.error(e);
    return htmlRedirect(`/admin/seo?google=error&reason=${encodeURIComponent(String(e))}`, "Failed.");
  }
});
