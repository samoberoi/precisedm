import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/use-subscription";
import { Loader2 } from "lucide-react";

interface SubscriptionGateProps { children: React.ReactNode; }

const SubscriptionGate = ({ children }: SubscriptionGateProps) => {
  const navigate = useNavigate();
  const { isActive, loading } = useSubscription();

  useEffect(() => {
    if (!loading && !isActive) navigate("/subscription", { replace: true });
  }, [loading, isActive, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isActive) return null;
  return <>{children}</>;
};

export default SubscriptionGate;
