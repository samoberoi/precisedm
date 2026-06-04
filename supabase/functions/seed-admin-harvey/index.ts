import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const email = "harvey@hyperrevamp.com";
    const password = "Harvey@12345";

    const { data: list } = await admin.auth.admin.listUsers();
    let user = list?.users?.find((u) => u.email === email);
    if (!user) {
      const { data: created, error } = await admin.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { full_name: "Harvey", user_type: "practitioner", accepted_terms: true },
      });
      if (error) throw error;
      user = created.user;
    }

    const { data: roleRow } = await admin
      .from("user_roles").select("id").eq("user_id", user!.id).eq("role", "admin").maybeSingle();
    if (!roleRow) {
      await admin.from("user_roles").insert({ user_id: user!.id, role: "admin" });
    }

    return new Response(JSON.stringify({ ok: true, email, password, user_id: user!.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
