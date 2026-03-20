import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface SubscriptionGateProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const SubscriptionGate = ({ children, redirectTo = "/subscription" }: SubscriptionGateProps) => {
  const navigate = useNavigate();
  const { isActive, loading } = useSubscription();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) { setAdminLoading(false); return; }
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(!!data);
      setAdminLoading(false);
    };
    checkAdmin();
  }, [user]);

  useEffect(() => {
    if (!loading && !adminLoading && !isActive && !isAdmin) navigate(redirectTo, { replace: true });
  }, [loading, adminLoading, isActive, isAdmin, navigate, redirectTo]);

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isActive && !isAdmin) return null;
  return <>{children}</>;
};

export default SubscriptionGate;
