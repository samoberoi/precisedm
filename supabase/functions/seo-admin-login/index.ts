// Simple ID + Password gate for /admin/seo (Atman99-style).
// Verifies static credentials, then issues a magic-link token for the
// admin@precisedm.com account so the dashboard's RLS queries work.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ADMIN_LOGIN_ID = "8373914073";
const ADMIN_LOGIN_PASSWORD = "069829";
const ADMIN_EMAIL = "admin@precisedm.com";
const ADMIN_PASSWORD = "Admin@12345";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { user_id, password } = await req.json();
    if (user_id !== ADMIN_LOGIN_ID || password !== ADMIN_LOGIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Ensure admin user exists with admin role
    const { data: list } = await admin.auth.admin.listUsers();
    let adminUser = list?.users?.find((u) => u.email === ADMIN_EMAIL);
    if (!adminUser) {
      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email: ADMIN_EMAIL, password: ADMIN_PASSWORD, email_confirm: true,
        user_metadata: { full_name: "PreciseDM Admin", user_type: "practitioner", accepted_terms: true },
      });
      if (cErr) throw cErr;
      adminUser = created.user;
    }
    const { data: roleRow } = await admin
      .from("user_roles").select("id").eq("user_id", adminUser!.id).eq("role", "admin").maybeSingle();
    if (!roleRow) await admin.from("user_roles").insert({ user_id: adminUser!.id, role: "admin" });

    const { data: link, error: lErr } = await admin.auth.admin.generateLink({
      type: "magiclink", email: ADMIN_EMAIL,
    });
    if (lErr) throw lErr;
    const props: any = (link as any).properties || {};
    const token_hash = props.hashed_token || props.token_hash;
    if (!token_hash) throw new Error("Failed to mint session token");

    return new Response(JSON.stringify({ token_hash }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
