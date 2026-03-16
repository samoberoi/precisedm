import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export const useSaveSubmission = () => {
  const { user } = useAuth();

  const saveSubmission = async (
    formType: string,
    inputs: Record<string, unknown>,
    results: Record<string, unknown>
  ) => {
    if (!user) return;

    const { error } = await supabase.from("form_submissions" as any).insert({
      user_id: user.id,
      form_type: formType,
      inputs,
      results,
    } as any);

    if (error) {
      console.error("Error saving submission:", error);
    }
  };

  return { saveSubmission };
};
