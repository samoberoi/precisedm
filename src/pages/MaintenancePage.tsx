import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Info, RotateCcw, Printer, Pencil, Check } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { useSaveSubmission } from "@/hooks/use-save-submission";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import maintenanceIcon from "@/assets/maintenance-icon.png";

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

/* ── Calculation Logic ── */

function calculateMaintenance(form: FormData): CalcResult {
  const bd = parseFloat(form.basalDose);
  const fbg = parseFloat(form.fastingBG);
  const ctd = parseFloat(form.correctionDose) || 0;
  const pd = form.usingPrandial === "yes" ? parseFloat(form.prandialDose) || 0 : 0;
  const pdDaily = pd * 3;
  const tdd = bd + pdDaily + ctd;
  let isf = Math.round(1800 / tdd);
  if (isf <= 9) isf = 10;

  let basalRecommendation: string;
  let isBasalError = false;
  const basalHypo = form.basalHypo === "yes";
  const basalBGAvg = basalHypo ? avgOfProvided([form.basalBG1, form.basalBG2, form.basalBG3, form.basalBG4]) : null;

  if (basalHypo) {
    if (basalBGAvg === null) { basalRecommendation = "Please enter at least one BG value."; isBasalError = true; }
    else if (basalBGAvg < 40) { basalRecommendation = `Decrease current basal dose by ${Math.round(bd * 0.2)} to ${Math.round(bd * 0.3)} units`; }
    else if (basalBGAvg <= 70) { basalRecommendation = `Decrease current basal dose by ${Math.round(bd * 0.1)} to ${Math.round(bd * 0.15)} units`; }
    else { basalRecommendation = "ERROR: Your average BG is above 70 meaning no hypoglycemia occurred."; isBasalError = true; }
  } else {
    if (fbg >= 140) {
      const delta = (fbg - 100) / isf;
      const lower = Math.round(delta - 1);
      const upper = Math.round(delta + 1);
      basalRecommendation = lower < 1 ? "No change to basal insulin dose." : `Increase current basal dose by ${lower} to ${upper} units`;
    } else if (fbg >= 71) { basalRecommendation = "No change to basal insulin dose."; }
    else { basalRecommendation = "You had hypoglycemia. Please go back and select YES."; isBasalError = true; }
  }

  let prandialRecommendation: string | null = null;
  let isPrandialError = false;
  let prandialBGAvg: number | null = null;

  if (form.usingPrandial === "yes") {
    const pbg = parseFloat(form.prandialBG);
    const prandialHypo = form.prandialHypo === "yes";
    prandialBGAvg = prandialHypo ? avgOfProvided([form.prandialBG1, form.prandialBG2, form.prandialBG3, form.prandialBG4]) : null;

    if (prandialHypo) {
      if (prandialBGAvg === null) { prandialRecommendation = "Please enter at least one prandial BG value."; isPrandialError = true; }
      else if (prandialBGAvg < 40) { prandialRecommendation = `Decrease current prandial dose per meal by ${Math.round(pd * 0.2)} to ${Math.round(pd * 0.3)} units`; }
      else if (prandialBGAvg <= 70) { prandialRecommendation = `Decrease current prandial dose per meal by ${Math.round(pd * 0.1)} to ${Math.round(pd * 0.15)} units`; }
      else { prandialRecommendation = "ERROR: Your average BG is above 70 meaning no hypoglycemia occurred."; isPrandialError = true; }
    } else {
      if (pbg >= 140) {
        const delta = (pbg - 100) / isf;
        const deltaMeal = delta / 3;
        let lower = Math.round(deltaMeal - 1); let upper = Math.round(deltaMeal + 1);
        if (lower < 1) lower = 1; if (upper < 2) upper = 2;
        prandialRecommendation = `Increase current prandial dose per meal by ${lower} to ${upper} units`;
      } else if (pbg >= 71) { prandialRecommendation = "No change to prandial insulin dose."; }
      else { prandialRecommendation = "You had hypoglycemia. Please go back and select YES."; isPrandialError = true; }
    }
  }

  return {
    basalRecommendation, isBasalError, prandialRecommendation, isPrandialError,
    basalBGAvg: basalBGAvg !== null ? Math.round(basalBGAvg * 10) / 10 : null,
    prandialBGAvg: prandialBGAvg !== null ? Math.round(prandialBGAvg * 10) / 10 : null,
    tdd, isf, inputs: form,
  };
}

const initialForm: FormData = {
  basalDose: "", fastingBG: "", basalHypo: "no",
  basalBG1: "", basalBG2: "", basalBG3: "", basalBG4: "",
  usingPrandial: "no", prandialDose: "", prandialBG: "", prandialHypo: "no",
  prandialBG1: "", prandialBG2: "", prandialBG3: "", prandialBG4: "",
  correctionDose: "",
};

/* ── Step definitions ── */
const STEPS = [
  { title: "Basal", subtitle: "Basal dose & fasting BG" },
  { title: "Prandial", subtitle: "Prandial dose & BG" },
  { title: "Review", subtitle: "Confirm & calculate" },
];

/* ── Page Component ── */

const MaintenancePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { firstName } = useProfile();
  const isWebsite = location.pathname.startsWith("/w");
  const disclaimerRoute = isWebsite ? "/w/disclaimer" : "/disclaimer";
  const { saveSubmission } = useSaveSubmission();
  const resultsRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormData>({ ...initialForm });
  const [result, setResult] = useState<CalcResult | null>(null);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const update = (key: keyof FormData, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const validateStep = (s: number): boolean => {
    if (s === 0) {
      if (!form.basalDose || parseFloat(form.basalDose) <= 0) { toast({ title: "Invalid Basal Dose", description: "Please enter a valid basal insulin dose.", variant: "destructive" }); return false; }
      if (!form.fastingBG || parseFloat(form.fastingBG) <= 0) { toast({ title: "Invalid Fasting BG", description: "Please enter a valid fasting blood glucose.", variant: "destructive" }); return false; }
    }
    if (s === 1 && form.usingPrandial === "yes") {
      if (!form.prandialDose || parseFloat(form.prandialDose) <= 0) { toast({ title: "Invalid Prandial Dose", variant: "destructive" }); return false; }
      if (!form.prandialBG || parseFloat(form.prandialBG) <= 0) { toast({ title: "Invalid Prandial BG", variant: "destructive" }); return false; }
    }
    return true;
  };

  const nextStep = () => { if (!validateStep(step)) return; if (step < STEPS.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };
  const goNext = () => { setDirection(1); nextStep(); };
  const goPrev = () => { setDirection(-1); prevStep(); };

  const handleCalculate = () => {
    const res = calculateMaintenance(form);
    setResult(res);
    saveSubmission("maintenance", form as any, { basalRecommendation: res.basalRecommendation, prandialRecommendation: res.prandialRecommendation, tdd: res.tdd, isf: res.isf });
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleEditInputs = () => { setResult(null); setStep(0); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleFreshStart = () => { setForm({ ...initialForm }); setResult(null); setStep(0); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  const cx = isWebsite ? "max-w-4xl mx-auto px-6 lg:px-10" : "px-5";

  return (
    <div className={`min-h-screen bg-background ${isWebsite ? "py-10" : "pb-36"}`}>
      {!isWebsite && <SubscriptionBanner />}

      {!isWebsite && (
        <div className="px-5 pt-12 pb-3">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-sm">
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">Maintenance</h1>
            <button onClick={() => navigate(disclaimerRoute)} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-sm">
              <Info className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </div>
      )}

      <div className={isWebsite ? cx : "px-5 pt-2"}>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-2xl ${isWebsite ? "p-8 lg:p-10" : "p-5"}`}
          style={{ background: "linear-gradient(135deg, hsl(45,85%,50%), hsl(35,80%,42%))" }}>
          <div className="relative z-10">
            <p className={`font-semibold text-white/60 uppercase tracking-widest ${isWebsite ? "text-xs" : "text-[10px]"}`}>Ongoing Doses</p>
            <h2 className={`font-extrabold text-white mt-1 ${isWebsite ? "text-2xl lg:text-3xl" : "text-lg"}`}>Maintenance Calculator</h2>
            <p className={`text-white/70 mt-2 leading-snug ${isWebsite ? "text-sm max-w-md" : "text-[11px] max-w-[200px]"}`}>Calculate adjustments to Basal and Prandial insulin doses</p>
          </div>
          <img src={maintenanceIcon} alt="" className={`absolute -bottom-2 -right-2 opacity-15 object-contain ${isWebsite ? "h-32 w-32" : "h-24 w-24"}`} />
        </motion.div>
      </div>

      {!result && (
        <>
          {/* Progress Steps */}
          <div className={`${isWebsite ? cx + " mt-5" : "px-6 mt-5"}`}>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-[18px] left-0 right-0 flex px-6">
                {STEPS.slice(0, -1).map((_, i) => (
                  <div key={i} className="flex-1 mx-1">
                    <div className={`h-[2px] rounded-full transition-colors duration-300 ${i < step ? "bg-primary" : "bg-border"}`} />
                  </div>
                ))}
              </div>
              {STEPS.map((s, i) => (
                <div key={i} className="flex flex-col items-center z-10" style={{ minWidth: 60 }}>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                    i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20" : "bg-muted text-muted-foreground"
                  }`}>
                    {i < step ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`text-[10px] mt-1.5 font-semibold text-center leading-tight ${i <= step ? "text-primary" : "text-muted-foreground"}`}>
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className={`${isWebsite ? cx + " mt-5" : "px-5 mt-5"} overflow-hidden`}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div key={step} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-1">{STEPS[step].title}</h3>
                <p className="text-xs text-muted-foreground mb-5">{STEPS[step].subtitle}</p>

                {step === 0 && (
                  <div className="space-y-4">
                    <FieldGroup label="Basal insulin dose per day (BD), units">
                      <Input type="number" placeholder="ex: 10" value={form.basalDose} onChange={(e) => update("basalDose", e.target.value)} className="rounded-xl h-12 bg-background" />
                    </FieldGroup>
                    <FieldGroup label="Fasting Blood Glucose (FBG), mg/dL">
                      <Input type="number" placeholder="ex: 90" value={form.fastingBG} onChange={(e) => update("fastingBG", e.target.value)} className="rounded-xl h-12 bg-background" />
                    </FieldGroup>
                    <div className="pt-1">
                      <p className="text-base font-bold text-foreground mb-2">Basal Insulin</p>
                      <RadioField label="Has patient experienced 2 or more episodes of hypoglycemia (blood glucose < 70) in the last 3 months?" options={["Yes", "No"]} value={form.basalHypo} onChange={(v) => update("basalHypo", v)} />
                    </div>
                    <AnimatePresence>
                      {form.basalHypo === "yes" && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <BGValuesGroup label="What are the Blood Glucose (BG) Values"
                            values={[form.basalBG1, form.basalBG2, form.basalBG3, form.basalBG4]}
                            placeholders={["ex: 68", "ex: 69", "ex: 67", "ex: 66"]}
                            onChange={(i, v) => update(`basalBG${i + 1}` as keyof FormData, v)} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <RadioField label="Using Prandial?" options={["Yes", "No"]} value={form.usingPrandial} onChange={(v) => update("usingPrandial", v)} />
                    <AnimatePresence>
                      {form.usingPrandial === "yes" && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                          <FieldGroup label="Prandial insulin dose per meal (PD), units">
                            <Input type="number" placeholder="ex: 3" value={form.prandialDose} onChange={(e) => update("prandialDose", e.target.value)} className="rounded-xl h-12 bg-background" />
                          </FieldGroup>
                          <FieldGroup label="Prandial Blood Glucose (PBG), mg/dL">
                            <Input type="number" placeholder="ex: 130" value={form.prandialBG} onChange={(e) => update("prandialBG", e.target.value)} className="rounded-xl h-12 bg-background" />
                          </FieldGroup>
                          <div className="pt-1">
                            <p className="text-base font-bold text-foreground mb-2">Prandial Insulin</p>
                            <RadioField label="Has patient experienced more than 3 episodes of hypoglycemia (blood glucose < 70) in the last 3 months?" options={["Yes", "No"]} value={form.prandialHypo} onChange={(v) => update("prandialHypo", v)} />
                          </div>
                          <AnimatePresence>
                            {form.prandialHypo === "yes" && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                <BGValuesGroup label="What are the Blood Glucose (BG) Values"
                                  values={[form.prandialBG1, form.prandialBG2, form.prandialBG3, form.prandialBG4]}
                                  placeholders={["ex: 69", "ex: 68", "ex: 66", "ex: 65"]}
                                  onChange={(i, v) => update(`prandialBG${i + 1}` as keyof FormData, v)} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <FieldGroup label="Correction insulin dose per day (CTD), units">
                      <Input type="number" placeholder="ex: 19" value={form.correctionDose} onChange={(e) => update("correctionDose", e.target.value)} className="rounded-xl h-12 bg-background" />
                    </FieldGroup>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground mb-3">Please review your inputs before calculating.</p>
                    <ReviewRow label="Basal Dose (BD)" value={`${form.basalDose} units`} />
                    <ReviewRow label="Fasting BG" value={`${form.fastingBG} mg/dL`} />
                    <ReviewRow label="Basal Hypo Episodes" value={form.basalHypo === "yes" ? "Yes" : "No"} />
                    {form.basalHypo === "yes" && (
                      <ReviewRow label="Basal BG Values" value={[form.basalBG1, form.basalBG2, form.basalBG3, form.basalBG4].filter(Boolean).join(", ") || "—"} />
                    )}
                    <ReviewRow label="Using Prandial" value={form.usingPrandial === "yes" ? "Yes" : "No"} />
                    {form.usingPrandial === "yes" && (
                      <>
                        <ReviewRow label="Prandial Dose (PD)" value={`${form.prandialDose} units/meal`} />
                        <ReviewRow label="Prandial BG" value={`${form.prandialBG} mg/dL`} />
                        <ReviewRow label="Prandial Hypo" value={form.prandialHypo === "yes" ? "Yes" : "No"} />
                        {form.prandialHypo === "yes" && (
                          <ReviewRow label="Prandial BG Values" value={[form.prandialBG1, form.prandialBG2, form.prandialBG3, form.prandialBG4].filter(Boolean).join(", ") || "—"} />
                        )}
                      </>
                    )}
                    <ReviewRow label="Correction Dose (CTD)" value={form.correctionDose ? `${form.correctionDose} units` : "—"} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className={`${isWebsite ? cx : "px-5"} mt-4 mb-6 flex gap-3`}>
            {step > 0 && (
              <Button variant="outline" onClick={goPrev} className="flex-1 h-12 rounded-xl font-bold gap-1">
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button onClick={goNext} className="flex-1 h-12 rounded-xl font-bold gap-1 gradient-primary glow-primary">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleCalculate} className="flex-1 h-12 rounded-xl font-bold gradient-primary glow-primary">
                Calculate
              </Button>
            )}
          </div>
        </>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div ref={resultsRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className={`${isWebsite ? cx : "px-5"} mt-5 space-y-4`}>
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-sm">
              <h3 className="text-lg font-extrabold text-foreground mb-4">Recommended Adjustments to Basal and/or Prandial Insulin Doses</h3>
              <div className={`rounded-xl p-4 text-center mb-3 ${result.isBasalError ? "bg-destructive/10" : "bg-primary/10"}`}>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Basal Insulin</p>
                <p className={`text-base font-extrabold ${result.isBasalError ? "text-destructive" : "text-primary"}`}>{result.basalRecommendation}</p>
              </div>
              {result.prandialRecommendation && (
                <div className={`rounded-xl p-4 text-center ${result.isPrandialError ? "bg-destructive/10" : "bg-primary/10"}`}>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Prandial Insulin</p>
                  <p className={`text-base font-extrabold ${result.isPrandialError ? "text-destructive" : "text-primary"}`}>{result.prandialRecommendation}</p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-3">Submitted Inputs</h3>
              <div className="space-y-2">
                <ReviewRow label="Basal Dose (BD)" value={`${result.inputs.basalDose} units`} />
                <ReviewRow label="Fasting BG" value={`${result.inputs.fastingBG} mg/dL`} />
                <ReviewRow label="Basal Hypo Episodes" value={result.inputs.basalHypo === "yes" ? "Yes" : "No"} />
                {result.inputs.basalHypo === "yes" && (
                  <>
                    <ReviewRow label="Basal BG Values" value={[result.inputs.basalBG1, result.inputs.basalBG2, result.inputs.basalBG3, result.inputs.basalBG4].filter(Boolean).join(", ") || "—"} />
                    {result.basalBGAvg !== null && <ReviewRow label="Basal BG Average" value={`${result.basalBGAvg}`} />}
                  </>
                )}
                <ReviewRow label="Using Prandial" value={result.inputs.usingPrandial === "yes" ? "Yes" : "No"} />
                {result.inputs.usingPrandial === "yes" && (
                  <>
                    <ReviewRow label="Prandial Dose (PD)" value={`${result.inputs.prandialDose} units/meal`} />
                    <ReviewRow label="Prandial BG" value={`${result.inputs.prandialBG} mg/dL`} />
                    <ReviewRow label="Prandial Hypo" value={result.inputs.prandialHypo === "yes" ? "Yes" : "No"} />
                    {result.inputs.prandialHypo === "yes" && (
                      <>
                        <ReviewRow label="Prandial BG Values" value={[result.inputs.prandialBG1, result.inputs.prandialBG2, result.inputs.prandialBG3, result.inputs.prandialBG4].filter(Boolean).join(", ") || "—"} />
                        {result.prandialBGAvg !== null && <ReviewRow label="Prandial BG Average" value={`${result.prandialBGAvg}`} />}
                      </>
                    )}
                  </>
                )}
                <ReviewRow label="Correction Dose (CTD)" value={result.inputs.correctionDose ? `${result.inputs.correctionDose} units` : "—"} />
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleEditInputs} variant="outline" className="flex-1 h-12 rounded-xl font-bold gap-2">
                <Pencil className="h-4 w-4" /> Edit
              </Button>
              <Button onClick={handleFreshStart} variant="outline" className="flex-1 h-12 rounded-xl font-bold gap-2">
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
            </div>
            <Button onClick={() => window.print()} className="w-full h-12 rounded-xl font-bold gap-2 gradient-primary glow-primary">
              <Printer className="h-4 w-4" /> Print Results
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Sub-components ── */

const FieldGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Label className="text-sm font-semibold text-foreground mb-2 block">{label}</Label>
    {children}
  </div>
);

const RadioField = ({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) => (
  <div>
    <Label className="text-sm font-semibold text-foreground mb-2 block">{label}</Label>
    <RadioGroup value={value} onValueChange={onChange} className="space-y-2">
      {options.map((opt) => {
        const val = opt.toLowerCase();
        return (
          <label key={opt} className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${value === val ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
            <RadioGroupItem value={val} />
            <span className="text-sm font-medium text-foreground">{opt}</span>
          </label>
        );
      })}
    </RadioGroup>
  </div>
);

const BGValuesGroup = ({ label, values, placeholders, onChange }: { label: string; values: string[]; placeholders: string[]; onChange: (index: number, value: string) => void }) => (
  <div>
    <Label className="text-sm font-semibold text-foreground mb-3 block">{label}</Label>
    <div className="space-y-3 pl-4">
      {["BG1", "BG2", "BG3", "BG4"].map((bgLabel, i) => (
        <div key={bgLabel} className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground w-10">{bgLabel}</span>
          <Input type="number" placeholder={placeholders[i]} value={values[i]} onChange={(e) => onChange(i, e.target.value)} className="flex-1 rounded-xl h-12 bg-background" />
        </div>
      ))}
    </div>
  </div>
);

const ReviewRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <span className="text-sm font-bold text-foreground text-right">{value}</span>
  </div>
);

export default MaintenancePage;
