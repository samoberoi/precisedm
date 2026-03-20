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
    const { data: { user: caller } } = await supabaseAdmin.auth.getUser(token);
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: caller.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // GET = list users with count + stats
    if (req.method === "GET") {
      // If action=subscriptions, return all subscription records with user details
      if (action === "subscriptions") {
        const { data: allSubs, error } = await supabaseAdmin
          .from("subscriptions")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const { data: profiles } = await supabaseAdmin
          .from("profiles")
          .select("user_id, full_name, email, user_type");

        const enriched = (allSubs || []).map((s: any) => {
          const profile = profiles?.find((p: any) => p.user_id === s.user_id);
          return {
            ...s,
            user_name: profile?.full_name || "Unknown",
            user_email: profile?.email || "",
            user_type: profile?.user_type || "student",
          };
        });

        return new Response(
          JSON.stringify({ subscriptions: enriched, total: enriched.length }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // If action=submissions, return form submission data
      if (action === "submissions") {
        const { data: submissions, error } = await supabaseAdmin
          .from("form_submissions")
          .select("id, user_id, form_type, created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Get profiles for user names
        const { data: profiles } = await supabaseAdmin
          .from("profiles")
          .select("user_id, full_name");

        const enriched = (submissions || []).map((s: any) => {
          const profile = profiles?.find((p: any) => p.user_id === s.user_id);
          return {
            id: s.id,
            user_id: s.user_id,
            form_type: s.form_type,
            created_at: s.created_at,
            user_name: profile?.full_name || "Unknown",
          };
        });

        // Compute stats
        const stats: Record<string, number> = {};
        for (const s of submissions || []) {
          stats[s.form_type] = (stats[s.form_type] || 0) + 1;
        }

        return new Response(
          JSON.stringify({ submissions: enriched, stats, total: (submissions || []).length }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Default: list users
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("*");

      const users = (usersData?.users || []).map((u: any) => {
        const profile = profiles?.find((p: any) => p.user_id === u.id);
        return {
          id: u.id,
          email: u.email,
          full_name: profile?.full_name || "",
          user_type: profile?.user_type || "student",
          custom_user_id: profile?.custom_user_id || "",
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
        };
      });

      // Also get submission counts
      const { data: submissions } = await supabaseAdmin
        .from("form_submissions")
        .select("form_type");

      const formStats: Record<string, number> = {};
      for (const s of submissions || []) {
        formStats[s.form_type] = (formStats[s.form_type] || 0) + 1;
      }

      // Get subscription stats
      const { data: allSubs } = await supabaseAdmin
        .from("subscriptions")
        .select("*");

      const activeSubs = (allSubs || []).filter(
        (s: any) => s.status === "active" && s.next_billing_date && new Date(s.next_billing_date) > new Date()
      );

      // Deduplicate: keep only the latest subscription per user
      const latestPerUser = new Map<string, any>();
      for (const s of activeSubs) {
        const existing = latestPerUser.get(s.user_id);
        if (!existing || new Date(s.created_at) > new Date(existing.created_at)) {
          latestPerUser.set(s.user_id, s);
        }
      }
      const uniqueActiveSubs = Array.from(latestPerUser.values());

      const subscribedUserIds = new Set(uniqueActiveSubs.map((s: any) => s.user_id));
      const monthlySubs = uniqueActiveSubs.filter((s: any) => s.plan_type === "monthly");
      const yearlySubs = uniqueActiveSubs.filter((s: any) => s.plan_type === "yearly");

      const now = new Date();
      const fifteenDaysLater = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
      const upcomingRenewals = uniqueActiveSubs
        .filter((s: any) => new Date(s.next_billing_date) <= fifteenDaysLater)
        .map((s: any) => {
          const profile = profiles?.find((p: any) => p.user_id === s.user_id);
          return {
            ...s,
            user_name: profile?.full_name || "Unknown",
            user_email: profile?.email || "",
          };
        })
        .sort((a: any, b: any) => new Date(a.next_billing_date).getTime() - new Date(b.next_billing_date).getTime());

      return new Response(
        JSON.stringify({ 
          users, 
          total: users.length, 
          formStats,
          totalSubmissions: (submissions || []).length,
          subscriptionStats: {
            totalSubscribed: subscribedUserIds.size,
            totalUnsubscribed: users.length - subscribedUserIds.size,
            monthly: monthlySubs.length,
            yearly: yearlySubs.length,
            upcomingRenewals,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST = create user
    if (req.method === "POST") {
      const body = await req.json();
      const { email, password, full_name, user_type, custom_user_id } = body;

      if (!email || !password || !full_name) {
        return new Response(
          JSON.stringify({ error: "Email, password and full name are required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const isAdmin = user_type === "admin";
      const actualUserType = isAdmin ? "student" : (user_type || "student");

      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name,
            user_type: actualUserType,
            custom_user_id: custom_user_id || null,
            accepted_terms: true,
          },
        });

      if (createError) throw createError;

      const newUserId = newUser.user.id;

      // If admin type selected, add admin role
      if (isAdmin) {
        await supabaseAdmin.from("user_roles").insert({ user_id: newUserId, role: "admin" });
      }

      return new Response(
        JSON.stringify({ message: "User created", user_id: newUserId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
