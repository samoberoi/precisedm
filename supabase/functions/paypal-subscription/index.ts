import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID")!;
  const secret = Deno.env.get("PAYPAL_SECRET")!;
  const res = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${secret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`PayPal auth failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      console.error("JWT validation failed:", claimsError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = { id: claimsData.claims.sub as string, email: claimsData.claims.email as string };

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // CHECK subscription status
    if (req.method === "GET" && action === "status") {
      const { data: sub } = await supabaseAdmin
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gt("next_billing_date", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return new Response(JSON.stringify({ subscription: sub }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // CREATE subscription
    if (req.method === "POST" && action === "create") {
      const { plan_type, return_url, cancel_url } = await req.json();

      const planId = plan_type === "monthly"
        ? Deno.env.get("PAYPAL_MONTHLY_PLAN_ID")!
        : Deno.env.get("PAYPAL_YEARLY_PLAN_ID")!;

      const accessToken = await getPayPalAccessToken();

      const subRes = await fetch("https://api-m.paypal.com/v1/billing/subscriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          plan_id: planId,
          subscriber: {
            email_address: user.email,
          },
          application_context: {
            brand_name: "PreciseDM",
            locale: "en-US",
            shipping_preference: "NO_SHIPPING",
            user_action: "SUBSCRIBE_NOW",
            return_url,
            cancel_url,
          },
        }),
      });

      const subData = await subRes.json();
      if (!subRes.ok) throw new Error(`PayPal create subscription failed: ${JSON.stringify(subData)}`);

      // Store pending subscription
      await supabaseAdmin.from("subscriptions").insert({
        user_id: user.id,
        plan_type,
        paypal_subscription_id: subData.id,
        status: "inactive",
      });

      const approveLink = subData.links?.find((l: any) => l.rel === "approve")?.href;

      return new Response(JSON.stringify({ subscription_id: subData.id, approve_url: approveLink }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTIVATE after PayPal redirect
    if (req.method === "POST" && action === "activate") {
      const { subscription_id } = await req.json();

      const accessToken = await getPayPalAccessToken();

      const detailRes = await fetch(`https://api-m.paypal.com/v1/billing/subscriptions/${subscription_id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const detail = await detailRes.json();

      if (detail.status === "ACTIVE") {
        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "active",
            start_date: detail.start_time,
            next_billing_date: detail.billing_info?.next_billing_time || null,
          })
          .eq("paypal_subscription_id", subscription_id)
          .eq("user_id", user.id);

        return new Response(JSON.stringify({ success: true, status: "active" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: false, status: detail.status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Bad request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PayPal subscription error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
