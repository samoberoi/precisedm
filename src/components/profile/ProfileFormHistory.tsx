import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Calendar, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SubmissionRecord {
  id: string;
  form_type: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  created_at: string;
}

const FORM_LABELS: Record<string, string> = {
  diaform: "DiaForm",
  maintenance: "Maintenance",
  steroid: "Steroid",
  gestation: "Gestation",
};

const FORM_COLORS: Record<string, string> = {
  diaform: "bg-primary/15 text-primary",
  maintenance: "bg-secondary text-secondary-foreground",
  steroid: "bg-accent text-accent-foreground",
  gestation: "bg-destructive/15 text-destructive",
};

function formatLabel(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()).trim();
}

// Only show the actual dosage result fields per form type
const RESULT_KEYS: Record<string, string[]> = {
  diaform: ["doseLow", "doseHigh"],
  steroid: ["doseLowUnits", "doseHighUnits"],
  maintenance: ["basalRecommendation", "prandialRecommendation"],
  gestation: ["basalRecommendation", "prandialRecommendation"],
};

const RESULT_LABELS: Record<string, string> = {
  doseLow: "Dose Low (units)",
  doseHigh: "Dose High (units)",
  doseLowUnits: "Dose Low (units)",
  doseHighUnits: "Dose High (units)",
  basalRecommendation: "Basal Recommendation",
  prandialRecommendation: "Prandial Recommendation",
};

const ProfileFormHistory = ({ userId }: { userId?: string }) => {
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionRecord | null>(null);

  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      const { data } = await supabase.from("form_submissions" as any).select("*").eq("user_id", userId).order("created_at", { ascending: false }) as any;
      if (data) setSubmissions(data);
    };
    fetch();
  }, [userId]);

  const submissionStats = submissions.reduce((acc, s) => { acc[s.form_type] = (acc[s.form_type] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <>
      {submissions.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-4">
          {Object.entries(FORM_LABELS).map(([key, label]) => (
            <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-card border border-border shadow-sm p-3 text-center">
              <p className="text-lg font-extrabold text-foreground">{submissionStats[key] || 0}</p>
              <p className="text-[10px] font-medium text-muted-foreground leading-tight">{label}</p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-5">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">Form History</h2>
        </div>
        <div className="space-y-2">
          {submissions.map((s) => (
            <button key={s.id} onClick={() => setSelectedSubmission(selectedSubmission?.id === s.id ? null : s)}
              className="w-full text-left rounded-2xl bg-card border border-border shadow-sm p-3 active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold shrink-0 ${FORM_COLORS[s.form_type] || "bg-muted text-muted-foreground"}`}>
                  {(FORM_LABELS[s.form_type] || s.form_type).slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{FORM_LABELS[s.form_type] || s.form_type}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(s.created_at).toLocaleString()}</p>
                </div>
                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${selectedSubmission?.id === s.id ? "rotate-90" : ""}`} />
              </div>
              <AnimatePresence>
                {selectedSubmission?.id === s.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-3 pt-3 border-t border-border space-y-3">
                      <div>
                        <p className="text-xs font-bold text-primary mb-1.5">Results</p>
                        <div className="space-y-1">{(RESULT_KEYS[s.form_type] || Object.keys(s.results)).filter((key) => s.results[key] != null).map((key) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{RESULT_LABELS[key] || formatLabel(key)}</span>
                            <span className="font-semibold text-foreground text-right max-w-[60%]">{String(s.results[key] ?? "—")}</span>
                          </div>
                        ))}</div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground mb-1.5">Inputs</p>
                        <div className="space-y-1">{Object.entries(s.inputs).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{formatLabel(key)}</span>
                            <span className="font-medium text-foreground">{String(value ?? "—")}</span>
                          </div>
                        ))}</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          ))}
          {submissions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No form submissions yet</p>
              <p className="text-xs text-muted-foreground mt-1">Your history will appear here</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileFormHistory;
