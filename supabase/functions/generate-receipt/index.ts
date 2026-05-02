import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BUSINESS = {
  name: "PreciseDM",
  website: "https://precisedm.com",
  supportEmail: "support@precisedm.com",
  description: "Customized Insulin Dosing Tool",
};

const PRICING: Record<string, number> = {
  monthly: 12.0,
  yearly: 120.0,
  trial: 0.0,
};

function planLabel(plan: string) {
  if (plan === "monthly") return "PreciseDM Monthly Subscription";
  if (plan === "yearly") return "PreciseDM Yearly Subscription";
  if (plan === "trial") return "PreciseDM Free Trial";
  return `PreciseDM ${plan} Subscription`;
}

async function buildReceiptPdf(opts: {
  receiptNumber: string;
  customerName: string;
  customerEmail: string;
  planType: string;
  amount: number;
  currency: string;
  paymentDate: Date;
  paypalSubscriptionId?: string | null;
  paypalTransactionId?: string | null;
}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]); // A4
  const { width, height } = page.getSize();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const primary = rgb(0.04, 0.43, 0.72);
  const dark = rgb(0.1, 0.1, 0.15);
  const muted = rgb(0.45, 0.45, 0.5);
  const line = rgb(0.85, 0.87, 0.92);

  // Header band
  page.drawRectangle({ x: 0, y: height - 110, width, height: 110, color: primary });
  page.drawText(BUSINESS.name, {
    x: 40, y: height - 55, size: 28, font: bold, color: rgb(1, 1, 1),
  });
  page.drawText(BUSINESS.description, {
    x: 40, y: height - 78, size: 11, font, color: rgb(0.9, 0.95, 1),
  });
  page.drawText(BUSINESS.website.replace(/^https?:\/\//, ""), {
    x: 40, y: height - 95, size: 10, font, color: rgb(0.85, 0.92, 1),
  });

  // Receipt title (right)
  page.drawText("PAYMENT RECEIPT", {
    x: width - 220, y: height - 50, size: 18, font: bold, color: rgb(1, 1, 1),
  });
  page.drawText(`#${opts.receiptNumber}`, {
    x: width - 220, y: height - 72, size: 11, font, color: rgb(0.9, 0.95, 1),
  });
  page.drawText(opts.paymentDate.toUTCString().slice(0, 16), {
    x: width - 220, y: height - 90, size: 10, font, color: rgb(0.85, 0.92, 1),
  });

  // Billed To
  let y = height - 160;
  page.drawText("BILLED TO", { x: 40, y, size: 9, font: bold, color: muted });
  y -= 16;
  page.drawText(opts.customerName || opts.customerEmail, { x: 40, y, size: 12, font: bold, color: dark });
  y -= 14;
  page.drawText(opts.customerEmail, { x: 40, y, size: 10, font, color: muted });

  // Payment info (right)
  let yr = height - 160;
  page.drawText("PAYMENT METHOD", { x: width - 220, y: yr, size: 9, font: bold, color: muted });
  yr -= 16;
  page.drawText("PayPal", { x: width - 220, y: yr, size: 12, font: bold, color: dark });
  yr -= 14;
  if (opts.paypalTransactionId) {
    page.drawText(`Txn: ${opts.paypalTransactionId}`, { x: width - 220, y: yr, size: 9, font, color: muted });
    yr -= 12;
  }
  if (opts.paypalSubscriptionId) {
    page.drawText(`Sub: ${opts.paypalSubscriptionId}`, { x: width - 220, y: yr, size: 9, font, color: muted });
  }

  // Table header
  y = height - 260;
  page.drawLine({ start: { x: 40, y: y + 20 }, end: { x: width - 40, y: y + 20 }, thickness: 1, color: line });
  page.drawText("DESCRIPTION", { x: 40, y, size: 9, font: bold, color: muted });
  page.drawText("AMOUNT", { x: width - 100, y, size: 9, font: bold, color: muted });
  page.drawLine({ start: { x: 40, y: y - 8 }, end: { x: width - 40, y: y - 8 }, thickness: 1, color: line });

  // Item row
  y -= 30;
  page.drawText(planLabel(opts.planType), { x: 40, y, size: 12, font: bold, color: dark });
  page.drawText(`${opts.currency} ${opts.amount.toFixed(2)}`, {
    x: width - 100, y, size: 12, font: bold, color: dark,
  });
  y -= 16;
  page.drawText("Recurring subscription payment", { x: 40, y, size: 10, font, color: muted });

  // Total
  y -= 40;
  page.drawLine({ start: { x: 40, y: y + 18 }, end: { x: width - 40, y: y + 18 }, thickness: 1, color: line });
  page.drawText("TOTAL PAID", { x: width - 220, y, size: 11, font: bold, color: muted });
  page.drawText(`${opts.currency} ${opts.amount.toFixed(2)}`, {
    x: width - 100, y, size: 16, font: bold, color: primary,
  });

  // Status badge
  y -= 35;
  page.drawRectangle({ x: width - 130, y: y - 4, width: 90, height: 22, color: rgb(0.85, 0.96, 0.89) });
  page.drawText("PAID", { x: width - 105, y: y + 4, size: 12, font: bold, color: rgb(0.05, 0.5, 0.2) });

  // Footer
  page.drawLine({ start: { x: 40, y: 110 }, end: { x: width - 40, y: 110 }, thickness: 1, color: line });
  page.drawText("Thank you for your subscription.", { x: 40, y: 90, size: 11, font: bold, color: dark });
  page.drawText(
    `For questions about this receipt, contact ${BUSINESS.supportEmail}`,
    { x: 40, y: 72, size: 9, font, color: muted },
  );
  page.drawText(`${BUSINESS.name} • ${BUSINESS.website}`, {
    x: 40, y: 56, size: 9, font, color: muted,
  });
  page.drawText(
    "This receipt may be used for reimbursement purposes.",
    { x: 40, y: 40, size: 9, font, color: muted },
  );

  return await pdf.save();
}

function uint8ToBase64(bytes: Uint8Array): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)) as any);
  }
  return btoa(bin);
}

async function sendReceiptEmail(opts: {
  to: string;
  customerName: string;
  receiptNumber: string;
  amount: number;
  currency: string;
  planType: string;
  paymentDate: Date;
  pdfBase64: string;
}) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured, skipping email send");
    return false;
  }

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; padding: 24px;">
      <div style="background: linear-gradient(135deg, #0a6dbb, #1e90d8); border-radius: 16px; padding: 28px; color: white;">
        <h1 style="margin: 0; font-size: 22px;">PreciseDM</h1>
        <p style="margin: 6px 0 0; opacity: 0.9; font-size: 13px;">Payment Receipt</p>
      </div>
      <div style="padding: 24px 4px;">
        <p style="font-size: 15px; color: #1a1a2e;">Hi ${opts.customerName || "there"},</p>
        <p style="font-size: 14px; color: #4a4a5a; line-height: 1.5;">
          Thank you for your continued subscription to PreciseDM — your customized insulin dosing tool. Your payment receipt is attached as a PDF and is also saved to your profile for download anytime.
        </p>
        <table style="width: 100%; margin: 20px 0; border-collapse: collapse; background: #f6f8fb; border-radius: 12px; padding: 12px;">
          <tr><td style="padding: 10px 14px; color: #6b7280; font-size: 12px;">Receipt #</td><td style="padding: 10px 14px; text-align: right; font-weight: 600; color: #1a1a2e;">${opts.receiptNumber}</td></tr>
          <tr><td style="padding: 10px 14px; color: #6b7280; font-size: 12px;">Plan</td><td style="padding: 10px 14px; text-align: right; font-weight: 600; color: #1a1a2e; text-transform: capitalize;">${opts.planType}</td></tr>
          <tr><td style="padding: 10px 14px; color: #6b7280; font-size: 12px;">Date</td><td style="padding: 10px 14px; text-align: right; color: #1a1a2e;">${opts.paymentDate.toUTCString().slice(0, 16)}</td></tr>
          <tr><td style="padding: 10px 14px; color: #6b7280; font-size: 12px;">Amount</td><td style="padding: 10px 14px; text-align: right; font-weight: 700; color: #0a6dbb; font-size: 16px;">${opts.currency} ${opts.amount.toFixed(2)}</td></tr>
        </table>
        <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">
          You can use this receipt for reimbursement claims. Need help? Reply to this email or visit <a href="https://precisedm.com" style="color: #0a6dbb;">precisedm.com</a>.
        </p>
      </div>
      <div style="border-top: 1px solid #e5e7eb; padding-top: 14px; text-align: center; font-size: 11px; color: #9ca3af;">
        © ${new Date().getFullYear()} PreciseDM • Customized Insulin Dosing Tool
      </div>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "PreciseDM <no-reply@hyperrevamp.com>",
      to: [opts.to],
      subject: `Your PreciseDM receipt #${opts.receiptNumber}`,
      html,
      attachments: [
        {
          filename: `PreciseDM-Receipt-${opts.receiptNumber}.pdf`,
          content: opts.pdfBase64,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    return false;
  }
  return true;
}

function generateReceiptNumber(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PDM-${y}${m}${d}-${rand}`;
}

async function createReceiptForSubscription(
  supabaseAdmin: any,
  opts: {
    userId: string;
    subscriptionId: string;
    paypalSubscriptionId: string | null;
    paypalTransactionId?: string | null;
    planType: string;
    amount?: number;
    paymentDate?: Date;
  },
) {
  // Idempotency: skip if same paypal_transaction_id already exists
  if (opts.paypalTransactionId) {
    const { data: existing } = await supabaseAdmin
      .from("receipts")
      .select("id")
      .eq("paypal_transaction_id", opts.paypalTransactionId)
      .maybeSingle();
    if (existing) {
      console.log("Receipt already exists for txn:", opts.paypalTransactionId);
      return { skipped: true, id: existing.id };
    }
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("full_name, email")
    .eq("user_id", opts.userId)
    .maybeSingle();

  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(opts.userId);
  const email = profile?.email || authUser?.user?.email || "";
  const name = profile?.full_name || "";

  const amount = opts.amount ?? PRICING[opts.planType] ?? 0;
  const paymentDate = opts.paymentDate
    ? (opts.paymentDate instanceof Date ? opts.paymentDate : new Date(opts.paymentDate as any))
    : new Date();
  const receiptNumber = generateReceiptNumber(paymentDate);

  const pdfBytes = await buildReceiptPdf({
    receiptNumber,
    customerName: name,
    customerEmail: email,
    planType: opts.planType,
    amount,
    currency: "USD",
    paymentDate,
    paypalSubscriptionId: opts.paypalSubscriptionId,
    paypalTransactionId: opts.paypalTransactionId,
  });
  const pdfBase64 = uint8ToBase64(pdfBytes);

  let emailSent = false;
  if (email) {
    emailSent = await sendReceiptEmail({
      to: email,
      customerName: name,
      receiptNumber,
      amount,
      currency: "USD",
      planType: opts.planType,
      paymentDate,
      pdfBase64,
    });
  }

  const { data: inserted, error } = await supabaseAdmin
    .from("receipts")
    .insert({
      user_id: opts.userId,
      subscription_id: opts.subscriptionId,
      receipt_number: receiptNumber,
      paypal_subscription_id: opts.paypalSubscriptionId,
      paypal_transaction_id: opts.paypalTransactionId || null,
      plan_type: opts.planType,
      amount,
      currency: "USD",
      payment_date: paymentDate.toISOString(),
      email_sent_at: emailSent ? new Date().toISOString() : null,
      pdf_base64: pdfBase64,
    })
    .select("id, receipt_number")
    .single();

  if (error) {
    console.error("Receipt insert failed:", error);
    throw error;
  }
  return { id: inserted.id, receipt_number: inserted.receipt_number, email_sent: emailSent };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "generate";

    // Internal call from webhook (service-role authenticated by edge platform)
    if (action === "internal" && req.method === "POST") {
      const body = await req.json();
      const result = await createReceiptForSubscription(supabaseAdmin, body);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authenticated user actions: backfill (admin only) or list/download
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "backfill" && req.method === "POST") {
      // Admin only
      const { data: roleRow } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!roleRow) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: subs } = await supabaseAdmin
        .from("subscriptions")
        .select("id, user_id, plan_type, paypal_subscription_id, start_date, status")
        .eq("status", "active")
        .in("plan_type", ["monthly", "yearly"])
        .not("paypal_subscription_id", "is", null);

      let created = 0;
      let skipped = 0;
      for (const s of subs || []) {
        const { data: existing } = await supabaseAdmin
          .from("receipts")
          .select("id")
          .eq("subscription_id", s.id)
          .limit(1)
          .maybeSingle();
        if (existing) {
          skipped++;
          continue;
        }
        try {
          await createReceiptForSubscription(supabaseAdmin, {
            userId: s.user_id,
            subscriptionId: s.id,
            paypalSubscriptionId: s.paypal_subscription_id,
            paypalTransactionId: `BACKFILL-${s.id}`,
            planType: s.plan_type,
            paymentDate: s.start_date ? new Date(s.start_date) : new Date(),
          });
          created++;
        } catch (e) {
          console.error("Backfill failed for sub", s.id, e);
        }
      }
      return new Response(JSON.stringify({ created, skipped, total: subs?.length || 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Bad request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-receipt error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
