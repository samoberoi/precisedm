import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const SubscriptionSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [activating, setActivating] = useState(true);
  const [success, setSuccess] = useState(false);
  const websiteMode = location.pathname.startsWith("/w");
  const homeRoute = websiteMode ? "/w" : "/home";
  const subscriptionRoute = websiteMode ? "/w/subscription" : "/subscription";

  useEffect(() => {
    const subscriptionId = searchParams.get("subscription_id");
    if (!subscriptionId) { setActivating(false); return; }
    const activate = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const res = await fetch(`https://${projectId}.supabase.co/functions/v1/paypal-subscription?action=activate`, {
          method: "POST",
          headers: { Authorization: `Bearer ${session?.access_token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ subscription_id: subscriptionId }),
        });
        const data = await res.json();
        setSuccess(data.success && data.status === "active");
      } catch (err) { console.error("Activation error:", err); }
      finally { setActivating(false); }
    };
    activate();
  }, [searchParams]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        {activating ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-extrabold text-foreground mb-2">Activating Subscription...</h2>
            <p className="text-sm text-muted-foreground">Please wait while we confirm your payment.</p>
          </>
        ) : success ? (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-primary glow-primary mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-extrabold text-foreground mb-2">Subscription Activated!</h2>
            <p className="text-sm text-muted-foreground mb-6">You now have full access to all tools.</p>
            <Button className="w-full h-12 rounded-2xl font-bold gradient-primary glow-primary" onClick={() => navigate(homeRoute)}>Go to Home</Button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-extrabold text-foreground mb-2">Activation Pending</h2>
            <p className="text-sm text-muted-foreground mb-6">Your subscription is being processed.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-12 rounded-2xl font-bold border-border" onClick={() => navigate(subscriptionRoute)}>Back to Plans</Button>
              <Button className="flex-1 h-12 rounded-2xl font-bold gradient-primary glow-primary" onClick={() => navigate(homeRoute)}>Go Home</Button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default SubscriptionSuccessPage;
