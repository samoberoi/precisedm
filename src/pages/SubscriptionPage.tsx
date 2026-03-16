import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Check, Crown, Zap, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";

const plans = [
  {
    id: "monthly",
    name: "Monthly Plan",
    price: "$1",
    period: "month",
    description: "Perfect for trying out our tools",
    icon: Zap,
    features: [
      "Access to all calculator tools",
      "DiaForm, Steroid, Gestation & Maintenance",
      "Educational video library",
      "Cancel anytime",
    ],
  },
  {
    id: "yearly",
    name: "Yearly Plan",
    price: "$12",
    period: "year",
    description: "Best value — save $0 vs monthly",
    badge: "Best Value",
    icon: Crown,
    features: [
      "Everything in Monthly",
      "12 months for the price of 12",
      "Priority access to new tools",
      "Cancel anytime",
    ],
  },
];

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, isActive, daysRemaining } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubscribe = async (planType: string) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setProcessing(true);
    setSelectedPlan(planType);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const baseUrl = window.location.origin;

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/paypal-subscription?action=create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan_type: planType,
            return_url: `${baseUrl}/subscription/success`,
            cancel_url: `${baseUrl}/subscription`,
          }),
        }
      );

      const data = await res.json();

      if (data.approve_url) {
        window.location.href = data.approve_url;
      } else {
        throw new Error("No approval URL received");
      }
    } catch (err: any) {
      console.error("Subscription error:", err);
      toast({ title: "Error", description: "Failed to create subscription. Please try again.", variant: "destructive" });
    } finally {
      setProcessing(false);
      setSelectedPlan(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen gradient-surface pb-28"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border/50 glass-card-strong">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Subscription</h1>
        </div>
      </div>

      <div className="px-5 pt-6">
        {/* Active Subscription Banner */}
        {isActive && subscription && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl glass-card p-5 border-primary/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Active Subscription</p>
                <p className="text-xs text-muted-foreground">
                  Your Plan: {subscription.plan_type === "monthly" ? "Monthly" : "Yearly"}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Next renewal: <span className="font-semibold text-foreground">{daysRemaining} days remaining</span>
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-semibold border-border"
                onClick={() => window.open("https://www.paypal.com/myaccount/autopay/", "_blank")}
              >
                Manage Subscription
              </Button>
            </div>
          </motion.div>
        )}

        {/* Hero */}
        {!isActive && (
          <div className="text-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary glow-primary mx-auto mb-4">
              <Crown className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground mb-2">Unlock All Tools</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Get full access to DiaForm, Steroid, Gestation, Maintenance calculators and educational videos.
            </p>
          </div>
        )}

        {/* Plan Cards */}
        <div className="space-y-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border-2 p-5 transition-all ${
                plan.badge
                  ? "border-primary/40 glass-card glow-primary"
                  : "border-border/50 glass-card"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-5 gradient-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <plan.icon className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-foreground">{plan.price}</p>
                  <p className="text-xs text-muted-foreground">/ {plan.period}</p>
                </div>
              </div>

              <ul className="space-y-2 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full h-12 rounded-xl font-bold text-sm ${plan.badge ? "gradient-primary glow-primary" : "bg-accent hover:bg-accent/80 text-foreground"}`}
                disabled={processing || isActive}
                onClick={() => handleSubscribe(plan.id)}
              >
                {processing && selectedPlan === plan.id
                  ? "Redirecting to PayPal..."
                  : isActive
                  ? "Already Subscribed"
                  : "Subscribe Now"}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-8 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            Secure Payment
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Check className="h-3.5 w-3.5" />
            Cancel Anytime
          </div>
        </div>
      </div>

      <BottomNav />
    </motion.div>
  );
};

export default SubscriptionPage;
