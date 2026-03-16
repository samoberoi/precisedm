import { useSubscription } from "@/hooks/use-subscription";
import { Shield } from "lucide-react";

const SubscriptionBanner = () => {
  const { subscription, isActive, daysRemaining } = useSubscription();
  if (!isActive || !subscription) return null;

  return (
    <div className="mx-4 mt-2 mb-1 flex items-center gap-2 rounded-2xl bg-card border border-primary/15 shadow-sm px-4 py-2.5">
      <Shield className="h-4 w-4 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-foreground">{subscription.plan_type === "monthly" ? "Monthly" : "Yearly"} Plan</span>
        <span className="text-xs text-muted-foreground ml-2">Renews in {daysRemaining} days</span>
      </div>
    </div>
  );
};

export default SubscriptionBanner;
