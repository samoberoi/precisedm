import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Info, RotateCcw, Printer, Pencil } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { useSaveSubmission } from "@/hooks/use-save-submission";

import SubscriptionBanner from "@/components/SubscriptionBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";

/* ── Types ── */

interface FormData {
  basalDose: string;
  fastingBG: string;
  basalHypo: string;
  basalBG1: string;
  basalBG2: string;
  basalBG3: string;
  basalBG4: string;
  usingPrandial: string;
  prandialDose: string;
  prandialBG: string;
  prandialHypo: string;
  prandialBG1: string;
  prandialBG2: string;
  prandialBG3: string;
  prandialBG4: string;
  correctionDose: string;
}

interface CalcResult {
  basalRecommendation: string;
  isBasalError: boolean;
  prandialRecommendation: string | null;
  isPrandialError: boolean;
  basalBGAvg: number | null;
  prandialBGAvg: number | null;
  tdd: number;
  isf: number;
  inputs: FormData;
}

/* ── Helpers ── */

function avgOfProvided(values: string[]): number | null {
  const nums = values.map((v) => parseFloat(v)).filter((v) => !isNaN(v) && v > 0);
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/* ── Calculation Logic (matches PHP spec exactly) ── */

function calculateMaintenance(form: FormData): CalcResult {
  const bd = parseFloat(form.basalDose);
  const fbg = parseFloat(form.fastingBG);
  const ctd = parseFloat(form.correctionDose) || 0;
  const pd = form.usingPrandial === "yes" ? parseFloat(form.prandialDose) || 0 : 0;

  // STEP 1 — TDD
  const pdDaily = pd * 3;
  const tdd = bd + pdDaily + ctd;

  // STEP 2 — ISF
  let isf = Math.round(1800 / tdd);
  if (isf <= 9) isf = 10;

  // ── BASAL ADJUSTMENT ──
  let basalRecommendation: string;
  let isBasalError = false;
  const basalHypo = form.basalHypo === "yes";
  const basalBGAvg = basalHypo
    ? avgOfProvided([form.basalBG1, form.basalBG2, form.basalBG3, form.basalBG4])
    : null;

  if (basalHypo) {
    // CASE 1 — hypoglycemia
    if (basalBGAvg === null) {
      basalRecommendation = "Please enter at least one BG value.";
      isBasalError = true;
    } else if (basalBGAvg < 40) {
      const low = Math.round(bd * 0.2);
      const high = Math.round(bd * 0.3);
      basalRecommendation = `Decrease current basal dose by ${low} to ${high} units`;
    } else if (basalBGAvg <= 70) {
      const low = Math.round(bd * 0.1);
      const high = Math.round(bd * 0.15);
      basalRecommendation = `Decrease current basal dose by ${low} to ${high} units`;
    } else {
      basalRecommendation =
        "ERROR: Your average BG is above 70 meaning no hypoglycemia occurred.";
      isBasalError = true;
    }
  } else {
    // CASE 2 — no hypoglycemia
    if (fbg >= 140) {
      const delta = (fbg - 100) / isf;
      const lower = Math.round(delta - 1);
      const upper = Math.round(delta + 1);
      if (lower < 1) {
        basalRecommendation = "No change to basal insulin dose.";
      } else {
        basalRecommendation = `Increase current basal dose by ${lower} to ${upper} units`;
      }
    } else if (fbg >= 71) {
      basalRecommendation = "No change to basal insulin dose.";
    } else {
      basalRecommendation =
        "You had hypoglycemia. Please go back and select YES.";
      isBasalError = true;
    }
  }

  // ── PRANDIAL ADJUSTMENT ──
  let prandialRecommendation: string | null = null;
  let isPrandialError = false;
  let prandialBGAvg: number | null = null;

  if (form.usingPrandial === "yes") {
    const pbg = parseFloat(form.prandialBG);
    const prandialHypo = form.prandialHypo === "yes";
    prandialBGAvg = prandialHypo
      ? avgOfProvided([form.prandialBG1, form.prandialBG2, form.prandialBG3, form.prandialBG4])
      : null;

    if (prandialHypo) {
      // CASE 1 — prandial hypoglycemia
      if (prandialBGAvg === null) {
        prandialRecommendation = "Please enter at least one prandial BG value.";
        isPrandialError = true;
      } else if (prandialBGAvg < 40) {
        // 20-30% of PD (per meal), then /3 for per-meal
        const decreaseLow = Math.round((pd * 0.2));
        const decreaseHigh = Math.round((pd * 0.3));
        // PD is already per meal, so decrease amounts are per meal
        prandialRecommendation = `Decrease current prandial dose per meal by ${decreaseLow} to ${decreaseHigh} units`;
      } else if (prandialBGAvg <= 70) {
        const decreaseLow = Math.round((pd * 0.1));
        const decreaseHigh = Math.round((pd * 0.15));
        prandialRecommendation = `Decrease current prandial dose per meal by ${decreaseLow} to ${decreaseHigh} units`;
      } else {
        prandialRecommendation =
          "ERROR: Your average BG is above 70 meaning no hypoglycemia occurred.";
        isPrandialError = true;
      }
    } else {
      // CASE 2 — no prandial hypoglycemia
      if (pbg >= 140) {
        const delta = (pbg - 100) / isf;
        const deltaMeal = delta / 3;
        let lower = Math.round(deltaMeal - 1);
        let upper = Math.round(deltaMeal + 1);
        if (lower < 1) lower = 1;
        if (upper < 2) upper = 2;
        prandialRecommendation = `Increase current prandial dose per meal by ${lower} to ${upper} units`;
      } else if (pbg >= 71) {
        prandialRecommendation = "No change to prandial insulin dose.";
      } else {
        prandialRecommendation =
          "You had hypoglycemia. Please go back and select YES.";
        isPrandialError = true;
      }
    }
  }

  return {
    basalRecommendation,
    isBasalError,
    prandialRecommendation,
    isPrandialError,
    basalBGAvg: basalBGAvg !== null ? Math.round(basalBGAvg * 10) / 10 : null,
    prandialBGAvg: prandialBGAvg !== null ? Math.round(prandialBGAvg * 10) / 10 : null,
    tdd,
    isf,
    inputs: form,
  };
}

/* ── Initial form state ── */

const initialForm: FormData = {
  basalDose: "",
  fastingBG: "",
  basalHypo: "no",
  basalBG1: "",
  basalBG2: "",
  basalBG3: "",
  basalBG4: "",
  usingPrandial: "no",
  prandialDose: "",
  prandialBG: "",
  prandialHypo: "no",
  prandialBG1: "",
  prandialBG2: "",
  prandialBG3: "",
  prandialBG4: "",
  correctionDose: "",
};

/* ── Page Component ── */

const MaintenancePage = () => {
  const navigate = useNavigate();
  const { firstName } = useProfile();
  const { saveSubmission } = useSaveSubmission();
  const resultsRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormData>({ ...initialForm });
  const [result, setResult] = useState<CalcResult | null>(null);

  const update = (key: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleCalculate = () => {
    if (!form.basalDose || parseFloat(form.basalDose) <= 0) {
      toast({ title: "Invalid Basal Dose", description: "Please enter a valid basal insulin dose.", variant: "destructive" });
      return;
    }
    if (!form.fastingBG || parseFloat(form.fastingBG) <= 0) {
      toast({ title: "Invalid Fasting BG", description: "Please enter a valid fasting blood glucose.", variant: "destructive" });
      return;
    }
    if (form.usingPrandial === "yes") {
      if (!form.prandialDose || parseFloat(form.prandialDose) <= 0) {
        toast({ title: "Invalid Prandial Dose", description: "Please enter a valid prandial dose.", variant: "destructive" });
        return;
      }
      if (!form.prandialBG || parseFloat(form.prandialBG) <= 0) {
        toast({ title: "Invalid Prandial BG", description: "Please enter a valid prandial blood glucose.", variant: "destructive" });
        return;
      }
    }

    const res = calculateMaintenance(form);
    setResult(res);
    saveSubmission("maintenance", form as any, {
      basalRecommendation: res.basalRecommendation,
      prandialRecommendation: res.prandialRecommendation,
      tdd: res.tdd,
      isf: res.isf,
    });
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleEditInputs = () => {
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFreshStart = () => {
    setForm({ ...initialForm });
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <SubscriptionBanner />
      {/* Header */}
      <div className="px-5 pt-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-foreground mb-3">
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Hello !!</p>
            <h1 className="text-2xl font-bold text-foreground">{firstName}</h1>
          </div>
          <button
            onClick={() => navigate("/disclaimer")}
            className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-border"
          >
            <Info className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Title */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-5 mt-5 mb-2 text-center">
        <h2 className="text-xl font-extrabold text-foreground">Welcome to DiaForm Maintenance Insulin Dosage</h2>
        <p className="text-sm text-muted-foreground mt-1">
          This tool calculates the adjustments to Basal and/or Prandial insulin doses.
        </p>
      </motion.div>

      {/* Form */}
      {!result && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mx-5 mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm space-y-6"
        >
          {/* Basal Section */}
          <FieldGroup label="Basal insulin dose per day (BD), units">
            <Input type="number" placeholder="ex: 10" value={form.basalDose} onChange={(e) => update("basalDose", e.target.value)} />
          </FieldGroup>

          <FieldGroup label="Fasting Blood Glucose (FBG), mg/dL">
            <Input type="number" placeholder="ex: 90" value={form.fastingBG} onChange={(e) => update("fastingBG", e.target.value)} />
          </FieldGroup>

          <div className="pt-1">
            <p className="text-base font-bold text-foreground mb-2">Basal Insulin</p>
            <RadioField
              label="Has patient experienced 2 or more episodes of hypoglycemia (blood glucose < 70) in the last 3 months?"
              options={["Yes", "No"]}
              value={form.basalHypo}
              onChange={(v) => update("basalHypo", v)}
            />
          </div>

          <AnimatePresence>
            {form.basalHypo === "yes" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <BGValuesGroup
                  label="What are the Blood Glucose (BG) Values"
                  values={[form.basalBG1, form.basalBG2, form.basalBG3, form.basalBG4]}
                  placeholders={["ex: 68", "ex: 69", "ex: 67", "ex: 66"]}
                  onChange={(i, v) => update(`basalBG${i + 1}` as keyof FormData, v)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prandial Section */}
          <RadioField
            label="Using Prandial?"
            options={["Yes", "No"]}
            value={form.usingPrandial}
            onChange={(v) => update("usingPrandial", v)}
          />

          <AnimatePresence>
            {form.usingPrandial === "yes" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 overflow-hidden"
              >
                <FieldGroup label="Prandial insulin dose per meal (PD), units">
                  <Input type="number" placeholder="ex: 3" value={form.prandialDose} onChange={(e) => update("prandialDose", e.target.value)} />
                </FieldGroup>

                <FieldGroup label="Prandial Blood Glucose (PBG), mg/dL">
                  <Input type="number" placeholder="ex: 130" value={form.prandialBG} onChange={(e) => update("prandialBG", e.target.value)} />
                </FieldGroup>

                <div className="pt-1">
                  <p className="text-base font-bold text-foreground mb-2">Prandial Insulin</p>
                  <RadioField
                    label="Has patient experienced more than 3 episodes of hypoglycemia (blood glucose < 70) in the last 3 months?"
                    options={["Yes", "No"]}
                    value={form.prandialHypo}
                    onChange={(v) => update("prandialHypo", v)}
                  />
                </div>

                <AnimatePresence>
                  {form.prandialHypo === "yes" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <BGValuesGroup
                        label="What are the Blood Glucose (BG) Values"
                        values={[form.prandialBG1, form.prandialBG2, form.prandialBG3, form.prandialBG4]}
                        placeholders={["ex: 69", "ex: 68", "ex: 66", "ex: 65"]}
                        onChange={(i, v) => update(`prandialBG${i + 1}` as keyof FormData, v)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Correction Dose */}
          <FieldGroup label="Correction insulin dose per day (CTD), units">
            <Input type="number" placeholder="ex: 19" value={form.correctionDose} onChange={(e) => update("correctionDose", e.target.value)} />
          </FieldGroup>

          <Button onClick={handleCalculate} className="w-full h-12 text-base font-bold rounded-xl mt-2">
            Calculate
          </Button>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mx-5 mt-6 space-y-5"
          >
            {/* Main Recommendation Card */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-sm">
              <h3 className="text-lg font-extrabold text-foreground mb-4">
                Recommended Adjustments to Basal and/or Prandial Insulin Doses
              </h3>

              {/* Basal result */}
              <div className={`rounded-xl p-4 text-center mb-3 ${result.isBasalError ? "bg-destructive/10" : "bg-primary/10"}`}>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Basal Insulin</p>
                <p className={`text-base font-extrabold ${result.isBasalError ? "text-destructive" : "text-primary"}`}>
                  {result.basalRecommendation}
                </p>
              </div>

              {/* Prandial result */}
              {result.prandialRecommendation && (
                <div className={`rounded-xl p-4 text-center ${result.isPrandialError ? "bg-destructive/10" : "bg-primary/10"}`}>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Prandial Insulin</p>
                  <p className={`text-base font-extrabold ${result.isPrandialError ? "text-destructive" : "text-primary"}`}>
                    {result.prandialRecommendation}
                  </p>
                </div>
              )}
            </div>

            {/* Submitted Inputs Card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-lg font-extrabold text-foreground mb-4">Submitted Inputs</h3>
              <div className="space-y-3">
                <ResultRow label="Basal Dose (BD)" value={`${result.inputs.basalDose} units`} />
                <ResultRow label="Fasting Blood Glucose" value={`${result.inputs.fastingBG} mg/dL`} />
                <ResultRow label="Basal Hypoglycemia Episodes" value={result.inputs.basalHypo === "yes" ? "Yes" : "No"} />
                {result.inputs.basalHypo === "yes" && (
                  <>
                    <ResultRow
                      label="Basal BG Values"
                      value={[result.inputs.basalBG1, result.inputs.basalBG2, result.inputs.basalBG3, result.inputs.basalBG4].filter(Boolean).join(", ") || "—"}
                    />
                    {result.basalBGAvg !== null && (
                      <ResultRow label="Basal BG Average" value={`${result.basalBGAvg}`} />
                    )}
                  </>
                )}
                <ResultRow label="Using Prandial" value={result.inputs.usingPrandial === "yes" ? "Yes" : "No"} />
                {result.inputs.usingPrandial === "yes" && (
                  <>
                    <ResultRow label="Prandial Dose (PD)" value={`${result.inputs.prandialDose} units/meal`} />
                    <ResultRow label="Prandial Blood Glucose" value={`${result.inputs.prandialBG} mg/dL`} />
                    <ResultRow label="Prandial Hypoglycemia Episodes" value={result.inputs.prandialHypo === "yes" ? "Yes" : "No"} />
                    {result.inputs.prandialHypo === "yes" && (
                      <>
                        <ResultRow
                          label="Prandial BG Values"
                          value={[result.inputs.prandialBG1, result.inputs.prandialBG2, result.inputs.prandialBG3, result.inputs.prandialBG4].filter(Boolean).join(", ") || "—"}
                        />
                        {result.prandialBGAvg !== null && (
                          <ResultRow label="Prandial BG Average" value={`${result.prandialBGAvg}`} />
                        )}
                      </>
                    )}
                  </>
                )}
                <ResultRow label="Correction Dose (CTD)" value={result.inputs.correctionDose ? `${result.inputs.correctionDose} units` : "—"} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleEditInputs} variant="outline" className="flex-1 h-12 rounded-xl font-bold gap-2">
                <Pencil className="h-4 w-4" />
                Edit Inputs
              </Button>
              <Button onClick={handleFreshStart} variant="outline" className="flex-1 h-12 rounded-xl font-bold gap-2">
                <RotateCcw className="h-4 w-4" />
                Fresh Start
              </Button>
            </div>
            <Button onClick={() => window.print()} className="w-full h-12 rounded-xl font-bold gap-2">
              <Printer className="h-4 w-4" />
              Print Results
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Reusable sub-components ── */

const FieldGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Label className="text-sm font-semibold text-foreground mb-2 block">{label}</Label>
    {children}
  </div>
);

const RadioField = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) => (
  <div>
    <Label className="text-sm font-semibold text-foreground mb-2 block">{label}</Label>
    <RadioGroup value={value} onValueChange={onChange} className="space-y-2">
      {options.map((opt) => {
        const val = opt.toLowerCase();
        return (
          <label
            key={opt}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
              value === val ? "border-primary bg-primary/5" : "border-border bg-card"
            }`}
          >
            <RadioGroupItem value={val} />
            <span className="text-sm font-medium text-foreground">{opt}</span>
          </label>
        );
      })}
    </RadioGroup>
  </div>
);

const BGValuesGroup = ({
  label,
  values,
  placeholders,
  onChange,
}: {
  label: string;
  values: string[];
  placeholders: string[];
  onChange: (index: number, value: string) => void;
}) => (
  <div>
    <Label className="text-sm font-semibold text-foreground mb-3 block">{label}</Label>
    <div className="space-y-3 pl-4">
      {["BG1", "BG2", "BG3", "BG4"].map((bgLabel, i) => (
        <div key={bgLabel} className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground w-10">{bgLabel}</span>
          <Input
            type="number"
            placeholder={placeholders[i]}
            value={values[i]}
            onChange={(e) => onChange(i, e.target.value)}
            className="flex-1"
          />
        </div>
      ))}
    </div>
  </div>
);

const ResultRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
    <span className="text-sm font-medium text-muted-foreground">{label}</span>
    <span className="text-sm font-bold text-foreground text-right">{value}</span>
  </div>
);

export default MaintenancePage;
