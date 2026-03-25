import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const demoEmail = "demo@precisedm.com";
    const demoPassword = "AppleReview2026!";

    // Check if demo user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existing = existingUsers?.users?.find((u) => u.email === demoEmail);

    if (existing) {
      // Update password in case it changed
      await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        password: demoPassword,
      });

      // Ensure user role exists
      const { data: roleExists } = await supabaseAdmin
        .from("user_roles")
        .select("id")
        .eq("user_id", existing.id)
        .eq("role", "user")
        .maybeSingle();

      if (!roleExists) {
        await supabaseAdmin
          .from("user_roles")
          .insert({ user_id: existing.id, role: "user" });
      }

      // Ensure subscription exists (active) so they can access gated content
      const { data: subExists } = await supabaseAdmin
        .from("subscriptions")
        .select("id")
        .eq("user_id", existing.id)
        .maybeSingle();

      if (!subExists) {
        await supabaseAdmin.from("subscriptions").insert({
          user_id: existing.id,
          plan_type: "monthly",
          status: "active",
          start_date: new Date().toISOString(),
          next_billing_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      return new Response(
        JSON.stringify({ message: "Demo user updated", email: demoEmail }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create demo user
    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: demoEmail,
        password: demoPassword,
        email_confirm: true,
        user_metadata: {
          full_name: "Apple Reviewer",
          user_type: "practitioner",
          accepted_terms: true,
        },
      });

    if (createError) throw createError;

    // Assign user role
    await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newUser.user.id, role: "user" });

    // Create active subscription
    await supabaseAdmin.from("subscriptions").insert({
      user_id: newUser.user.id,
      plan_type: "monthly",
      status: "active",
      start_date: new Date().toISOString(),
      next_billing_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    });

    return new Response(
      JSON.stringify({ message: "Demo user created", email: demoEmail }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
