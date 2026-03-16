import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ProfileSubscriptionSection = () => {
  const { subscription, isActive, daysRemaining, loading: subLoading } = useSubscription();
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
      className="mt-4 rounded-2xl bg-card border border-border shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-base font-bold text-foreground">Subscription</h2>
      </div>
      {subLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : isActive && subscription ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Plan</span>
            <span className="text-sm font-bold text-foreground capitalize">
              {subscription.plan_type === "monthly" ? "Monthly" : subscription.plan_type === "trial" ? "Free Trial" : "Yearly"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Status</span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-500">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />Active
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Valid For</span>
            <span className="text-sm font-bold text-foreground">{daysRemaining} day{daysRemaining !== 1 ? "s" : ""}</span>
          </div>
          {subscription.next_billing_date && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Next Renewal</span>
              <span className="text-sm font-medium text-foreground">{new Date(subscription.next_billing_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-3">
          <p className="text-sm text-muted-foreground">No active subscription</p>
          <Button size="sm" className="mt-2 rounded-xl gradient-primary" onClick={() => navigate("/subscription")}>View Plans</Button>
        </div>
      )}
    </motion.div>
  );
};

export default ProfileSubscriptionSection;
