import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function triggerReceipt(payload: {
  userId: string;
  subscriptionId: string;
  paypalSubscriptionId: string | null;
  paypalTransactionId?: string | null;
  planType: string;
  amount?: number;
  paymentDate?: string;
}) {
  try {
    const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-receipt?action=internal`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    console.log("Receipt generation response:", res.status, text);
  } catch (e) {
    console.error("Failed to trigger receipt:", e);
  }
}

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
        const { data: sub } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "active",
            start_date: resource.start_time,
            next_billing_date: resource.billing_info?.next_billing_time || null,
          })
          .eq("paypal_subscription_id", subscriptionId)
          .select("id, user_id, plan_type, paypal_subscription_id")
          .maybeSingle();

        // Generate first receipt for activation if not already done
        if (sub) {
          await triggerReceipt({
            userId: sub.user_id,
            subscriptionId: sub.id,
            paypalSubscriptionId: sub.paypal_subscription_id,
            paypalTransactionId: `ACTIVATION-${subscriptionId}`,
            planType: sub.plan_type,
            paymentDate: resource.start_time,
          });
        }
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
        const billingAgreementId = resource.billing_agreement_id;
        if (billingAgreementId) {
          // Refresh subscription state
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

          const { data: sub } = await supabaseAdmin
            .from("subscriptions")
            .update({
              status: "active",
              next_billing_date: detail.billing_info?.next_billing_time || null,
            })
            .eq("paypal_subscription_id", billingAgreementId)
            .select("id, user_id, plan_type, paypal_subscription_id")
            .maybeSingle();

          if (sub) {
            const amount = resource.amount?.total ? Number(resource.amount.total) : undefined;
            await triggerReceipt({
              userId: sub.user_id,
              subscriptionId: sub.id,
              paypalSubscriptionId: sub.paypal_subscription_id,
              paypalTransactionId: resource.id || `SALE-${billingAgreementId}-${Date.now()}`,
              planType: sub.plan_type,
              amount,
              paymentDate: resource.create_time,
            });
          }
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
