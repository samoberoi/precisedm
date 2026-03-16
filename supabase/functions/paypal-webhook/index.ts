import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const text = await req.text();
    if (!text) {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const body = JSON.parse(text);
    const eventType = body.event_type;
    const resource = body.resource;

    console.log("PayPal webhook event:", eventType);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const subscriptionId = resource?.id || resource?.billing_agreement_id;
    if (!subscriptionId) {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    switch (eventType) {
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "active",
            start_date: resource.start_time,
            next_billing_date: resource.billing_info?.next_billing_time || null,
          })
          .eq("paypal_subscription_id", subscriptionId);
        break;
      }
      case "BILLING.SUBSCRIPTION.CANCELLED": {
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("paypal_subscription_id", subscriptionId);
        break;
      }
      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "suspended" })
          .eq("paypal_subscription_id", subscriptionId);
        break;
      }
      case "PAYMENT.SALE.COMPLETED": {
        // Update next billing date on successful payment
        const billingAgreementId = resource.billing_agreement_id;
        if (billingAgreementId) {
          // Fetch subscription details from PayPal to get updated next_billing_date
          const clientId = Deno.env.get("PAYPAL_CLIENT_ID")!;
          const secret = Deno.env.get("PAYPAL_SECRET")!;
          const tokenRes = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
            method: "POST",
            headers: {
              Authorization: `Basic ${btoa(`${clientId}:${secret}`)}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "grant_type=client_credentials",
          });
          const tokenData = await tokenRes.json();

          const detailRes = await fetch(
            `https://api-m.paypal.com/v1/billing/subscriptions/${billingAgreementId}`,
            { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
          );
          const detail = await detailRes.json();

          await supabaseAdmin
            .from("subscriptions")
            .update({
              status: "active",
              next_billing_date: detail.billing_info?.next_billing_time || null,
            })
            .eq("paypal_subscription_id", billingAgreementId);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
