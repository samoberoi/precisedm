import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Check, Crown, Zap, Shield, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";


const plans = [
  {
    id: "monthly", name: "Monthly Plan", price: "$1", period: "month",
    description: "Perfect for trying out our tools", icon: Zap,
    features: ["Access to all calculator tools", "DiaForm, Steroid, Gestation & Maintenance", "Educational video library", "Cancel anytime"],
  },
  {
    id: "yearly", name: "Yearly Plan", price: "$12", period: "year",
    description: "Best value — save vs monthly", badge: "Best Value", icon: Crown,
    features: ["Everything in Monthly", "12 months for the price of 12", "Priority access to new tools", "Cancel anytime"],
  },
];

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { user, session, loading: authLoading } = useAuth();
  const { subscription, isActive, daysRemaining, refresh } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [trialProcessing, setTrialProcessing] = useState(false);

  const hasUsedTrial = !!subscription && subscription.plan_type === "trial";
  const isTrialActive = isActive && subscription?.plan_type === "trial";

  const handleStartTrial = async () => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }

    setTrialProcessing(true);
    try {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 7);

      const { error } = await supabase.from("subscriptions").insert({
        user_id: user.id,
        plan_type: "trial",
        status: "active",
        start_date: new Date().toISOString(),
        next_billing_date: trialEnd.toISOString(),
      });

      if (error) {
        console.error("Trial insert error:", error);
        throw new Error(error.message);
      }

      toast({ title: "Trial Activated!", description: "You have 7 days of free access to all tools." });
      refresh();
    } catch (err) {
      console.error("Trial error:", err);
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to start trial.", variant: "destructive" });
    } finally {
      setTrialProcessing(false);
    }
  };

  const handleSubscribe = async (planType: string) => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }

    setProcessing(true);
    setSelectedPlan(planType);

    try {
      let accessToken = session?.access_token;
      if (!accessToken) {
        const { data } = await supabase.auth.getSession();
        accessToken = data.session?.access_token;
      }

      if (!accessToken) {
        throw new Error("Please log in again to continue.");
      }

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const baseUrl = window.location.origin;
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/paypal-subscription?action=create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan_type: planType,
          return_url: `${baseUrl}/subscription/success`,
          cancel_url: `${baseUrl}/subscription`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to create subscription.");
      }

      if (data.approve_url) {
        window.location.href = data.approve_url;
      } else {
        throw new Error("No approval URL received");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create subscription.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
      setSelectedPlan(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background pb-36">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-sm">
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Subscription</h1>
        <div className="w-10" />
      </div>

      <div className="px-5 pt-3">
        {/* Active Banner */}
        {isActive && subscription && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-5 rounded-2xl bg-card border border-primary/20 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Active {isTrialActive ? "Free Trial" : "Subscription"}</p>
                <p className="text-xs text-muted-foreground">{isTrialActive ? "7-Day Trial" : subscription.plan_type === "monthly" ? "Monthly" : "Yearly"} Plan</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {isTrialActive ? "Trial expires" : "Next renewal"}: <span className="font-semibold text-foreground">{daysRemaining} days</span>
            </p>
            {!isTrialActive && (
              <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold" onClick={() => window.open("https://www.paypal.com/myaccount/autopay/", "_blank")}>
                Manage Subscription
              </Button>
            )}
          </motion.div>
        )}

        {/* Hero */}
        {!isActive && (
          <div className="text-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary glow-primary mx-auto mb-4">
              <Crown className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground mb-2">Unlock All Tools</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">Full access to all calculators and educational videos.</p>
          </div>
        )}

        {/* Free Trial Tile */}
        {!isActive && !hasUsedTrial && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="relative rounded-2xl p-5 mb-3 shadow-lg overflow-hidden"
            style={{ background: "linear-gradient(135deg, hsl(270,60%,50%), hsl(290,55%,40%))" }}>
            <span className="absolute -top-3 left-5 bg-white text-purple-700 text-xs font-bold px-3 py-1 rounded-full shadow">Free</span>
            <div className="flex items-start justify-between mb-4 pt-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="h-5 w-5 text-white" />
                  <h3 className="text-lg font-bold text-white">1 Week Free Trial</h3>
                </div>
                <p className="text-xs text-white/60">Try all tools free for 7 days — no payment required</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold text-white">$0</p>
                <p className="text-xs text-white/50">/ 7 days</p>
              </div>
            </div>
            <ul className="space-y-2 mb-5">
              {["Full access to all calculator tools", "Educational video library", "No credit card needed", "Automatically expires after 7 days"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                  <Check className="h-4 w-4 text-white shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Button
              className="w-full h-12 rounded-2xl font-bold text-sm bg-white text-purple-700 hover:bg-white/90"
              disabled={trialProcessing}
              onClick={handleStartTrial}>
              {trialProcessing ? "Activating..." : "Start Free Trial"}
            </Button>
          </motion.div>
        )}

        {/* Plans */}
        <div className="space-y-3">
          {plans.map((plan, i) => (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-5 transition-all ${
                plan.badge ? "bg-[hsl(200,30%,18%)] text-white shadow-lg" : "bg-card border border-border shadow-sm"
              }`}>
              {plan.badge && (
                <span className="absolute -top-3 left-5 gradient-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">{plan.badge}</span>
              )}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <plan.icon className={`h-5 w-5 ${plan.badge ? "text-primary" : "text-primary"}`} />
                    <h3 className={`text-lg font-bold ${plan.badge ? "text-white" : "text-foreground"}`}>{plan.name}</h3>
                  </div>
                  <p className={`text-xs ${plan.badge ? "text-white/60" : "text-muted-foreground"}`}>{plan.description}</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-extrabold ${plan.badge ? "text-white" : "text-foreground"}`}>{plan.price}</p>
                  <p className={`text-xs ${plan.badge ? "text-white/50" : "text-muted-foreground"}`}>/ {plan.period}</p>
                </div>
              </div>
              <ul className="space-y-2 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-center gap-2 text-sm ${plan.badge ? "text-white/80" : "text-muted-foreground"}`}>
                    <Check className="h-4 w-4 text-primary shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full h-12 rounded-2xl font-bold text-sm ${plan.badge ? "gradient-primary glow-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-accent"}`}
                disabled={processing || isActive} onClick={() => handleSubscribe(plan.id)}>
                {processing && selectedPlan === plan.id ? "Redirecting to PayPal..." : isActive ? "Already Subscribed" : "Subscribe Now"}
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6 mt-6 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Shield className="h-3.5 w-3.5" /> Secure Payment</div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Check className="h-3.5 w-3.5" /> Cancel Anytime</div>
        </div>
      </div>
    </motion.div>
  );
};

export default SubscriptionPage;
