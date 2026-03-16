import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Subscription {
  id: string;
  user_id: string;
  plan_type: string;
  paypal_subscription_id: string;
  status: string;
  start_date: string;
  next_billing_date: string;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setSubscription(null);
        setLoading(false);
        return;
      }
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/paypal-subscription?action=status`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      setSubscription(data.subscription || null);
    } catch (err) {
      console.error("Error checking subscription:", err);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const isActive = !!subscription && subscription.status === "active";

  const daysRemaining = subscription?.next_billing_date
    ? Math.max(0, Math.ceil((new Date(subscription.next_billing_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return { subscription, isActive, loading, daysRemaining, refresh: checkSubscription };
};
