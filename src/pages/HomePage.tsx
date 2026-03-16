import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import PreciseLogo from "@/components/PreciseLogo";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

const HomePage = () => {
  const { user, isSkipMode, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      if (data) navigate("/admin", { replace: true });
    });
  }, [user, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col px-8 pt-12"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PreciseLogo size={36} />
          <span className="font-bold text-lg text-foreground">PreciseDM</span>
        </div>
        {user ? (
          <Button variant="outline" size="sm" onClick={signOut} className="rounded-lg">
            Sign Out
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/login")}
            className="rounded-lg"
          >
            Sign In
          </Button>
        )}
      </div>

      {isSkipMode && (
        <div className="mt-6 flex items-center gap-2 rounded-xl bg-accent/60 p-4 text-sm text-muted-foreground">
          <Lock className="h-4 w-4 shrink-0" />
          <span>
            You're in preview mode. <button onClick={() => navigate("/login")} className="text-primary font-semibold underline underline-offset-2">Sign in</button> to access all features.
          </span>
        </div>
      )}

      <div className="mt-12 text-center">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {user ? `Welcome back${user.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}!` : "Welcome to PreciseDM"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          Your insulin dosing tools will appear here.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {["Initial Dosing", "Steroid Dosing", "Pregnancy Care", "Maintenance"].map((tool) => (
          <div
            key={tool}
            className="rounded-xl border border-border bg-card p-5 text-center opacity-60"
          >
            <Lock className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground">{tool}</p>
            <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default HomePage;
