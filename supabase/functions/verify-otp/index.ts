import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return new Response(JSON.stringify({ error: "Email and code are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();

    // Demo account bypass: allow code 111111 for demo@precisedm.com
    const isDemoBypass = normalizedEmail === "demo@precisedm.com" && trimmedCode === "111111";

    let otpRecord: any = null;

    if (!isDemoBypass) {
      // Find valid OTP
      const { data, error: fetchError } = await supabase
        .from("otp_codes")
        .select("*")
        .eq("email", normalizedEmail)
        .eq("code", trimmedCode)
        .eq("used", false)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !data) {
        return new Response(JSON.stringify({ error: "Invalid or expired code" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      otpRecord = data;

      // Mark OTP as used
      await supabase.from("otp_codes").update({ used: true }).eq("id", otpRecord.id);
    }

    // Check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === normalizedEmail
    );

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user with a random password (OTP-only, password not used)
      const randomPassword = crypto.randomUUID() + crypto.randomUUID();
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password: randomPassword,
        email_confirm: true,
        user_metadata: {
          full_name: otpRecord?.full_name || "",
          user_type: otpRecord?.user_type || "student",
          custom_user_id: otpRecord?.custom_user_id || null,
          accepted_terms: otpRecord?.accepted_terms || false,
          college: otpRecord?.college || null,
          student_id_number: otpRecord?.student_id_number || null,
        },
      });

      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // Generate a session link for the user
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: normalizedEmail,
    });

    if (linkError) throw linkError;

    // Extract token from the link and use it to create a session
    const url = new URL(linkData.properties.action_link);
    const token_hash = url.searchParams.get("token") || url.hash?.split("token=")[1]?.split("&")[0];

    // Return the magic link properties for client-side verification
    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        is_new_user: !existingUser,
        // We'll use a different approach - generate a direct session
        action_link: linkData.properties.action_link,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("verify-otp error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
