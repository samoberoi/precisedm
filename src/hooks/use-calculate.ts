import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useCalculate<TResult>() {
  const [loading, setLoading] = useState(false);

  const calculate = async (
    formType: string,
    inputs: Record<string, unknown>
  ): Promise<TResult | null> => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({ title: "Please log in", variant: "destructive" });
        return null;
      }

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/calculate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ form_type: formType, inputs }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Calculation Error",
          description: data.error || "Something went wrong",
          variant: "destructive",
        });
        return null;
      }

      return data.results as TResult;
    } catch (err) {
      console.error("Calculate error:", err);
      toast({
        title: "Network Error",
        description: "Could not reach the server. Please check your connection.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { calculate, loading };
}
