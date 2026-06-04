import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, History, Gift } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const planLabel = (p: string) =>
  p === "monthly" ? "Monthly" : p === "yearly" ? "Yearly" : p === "trial" ? "Free Trial" : p;

const ProfileSubscriptionSection = () => {
  const { subscription, isActive, daysRemaining, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("subscriptions")
      .select("id, plan_type, status, start_date, next_billing_date, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setHistory(data || []);
        setHistoryLoading(false);
      });
  }, [user]);

  const hasUsedTrial = history.some((h) => h.plan_type === "trial");

  const statusPill = (h: any) => {
    if (h.status === "active") return { text: "Active", cls: "text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20" };
    if (h.plan_type === "trial") return { text: "Trial expired", cls: "text-muted-foreground bg-muted" };
    return { text: h.status === "cancelled" ? "Cancelled" : "Expired", cls: "text-muted-foreground bg-muted" };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mt-4 rounded-2xl bg-card border border-border shadow-sm p-5"
    >
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
            <span className="text-sm font-bold text-foreground">{planLabel(subscription.plan_type)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Status</span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-500">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Active
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Valid For</span>
            <span className="text-sm font-bold text-foreground">
              {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}
            </span>
          </div>
          {subscription.next_billing_date && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Next Renewal</span>
              <span className="text-sm font-medium text-foreground">
                {new Date(subscription.next_billing_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-3">
          {hasUsedTrial && (
            <div className="mb-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Gift className="h-4 w-4" />
              <span>Free trial already used on this account</span>
            </div>
          )}
          <p className="text-sm text-muted-foreground">No active subscription</p>
          <Button size="sm" className="mt-2 rounded-xl gradient-primary" onClick={() => navigate("/subscription")}>
            View Plans
          </Button>
        </div>
      )}

      {!historyLoading && history.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <div className="flex items-center gap-2 mb-3">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">History</h3>
          </div>
          <ul className="space-y-2">
            {history.map((h) => {
              const pill = statusPill(h);
              const start = h.start_date || h.created_at;
              const end = h.next_billing_date;
              return (
                <li
                  key={h.id}
                  className="flex items-center justify-between rounded-xl bg-background/60 border border-border px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{planLabel(h.plan_type)}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {start ? new Date(start).toLocaleDateString() : "—"}
                      {end ? ` → ${new Date(end).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  <span className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${pill.cls}`}>{pill.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default ProfileSubscriptionSection;
