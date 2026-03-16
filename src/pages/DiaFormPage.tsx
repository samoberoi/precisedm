import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Info, RotateCcw, Printer, Pencil, ChevronRight, Check } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { useSaveSubmission } from "@/hooks/use-save-submission";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import diaformIcon from "@/assets/diaform-icon.png";

const raceOptions = [
  "Black", "Caucasian", "Hispanic", "Asian",
  "American Indian", "Hawaiian/Pacific Islander", "Other",
];

interface FormData {
  measurementSystem: string;
  weight: string;
  heightFeet: string;
  heightInches: string;
  heightCm: string;
  serumCreatinine: string;
  creatinineUnits: string;
  a1c: string;
  age: string;
  gender: string;
  race: string;
  dialysis: string;
}

interface CalcResult {
  bmi: number;
  bmiCategory: string;
  egfr: number;
  kidneyCategory: string;
  doseCategory: string;
  doseLow: number;
  doseHigh: number;
  doseLowPerKg: number;
  doseHighPerKg: number;
  weightKg: number;
  weightLbs: number;
  heightInches: number;
  scrMgDl: number;
  inputs: FormData;
}

const initialForm: FormData = {
  measurementSystem: "imperial",
  weight: "",
  heightFeet: "",
  heightInches: "",
  heightCm: "",
  serumCreatinine: "",
  creatinineUnits: "mg/dl",
  a1c: "",
  age: "",
  gender: "male",
  race: "other",
  dialysis: "no",
};

const doseRanges: Record<string, { low: number; high: number; label: string }> = {
  MB1: { low: 0.15, high: 0.18, label: "MB1 (0.15–0.18 units/kg)" },
  MB2: { low: 0.18, high: 0.23, label: "MB2 (0.18–0.23 units/kg)" },
  MB3: { low: 0.23, high: 0.28, label: "MB3 (0.23–0.28 units/kg)" },
  MB4: { low: 0.28, high: 0.33, label: "MB4 (0.28–0.33 units/kg)" },
  GC1: { low: 0.10, high: 0.15, label: "GC1 (0.10–0.15 units/kg)" },
  GC2: { low: 0.15, high: 0.20, label: "GC2 (0.15–0.20 units/kg)" },
  DLS1: { low: 0.10, high: 0.15, label: "DLS1 (0.10–0.15 units/kg)" },
};

function calculate(form: FormData): CalcResult {
  const ageNum = parseFloat(form.age);
  const isImperial = form.measurementSystem === "imperial";
  let weightLbs: number;
  let heightIn: number;
  if (isImperial) {
    weightLbs = parseFloat(form.weight);
    heightIn = parseFloat(form.heightFeet) * 12 + (parseFloat(form.heightInches) || 0);
  } else {
    weightLbs = parseFloat(form.weight) * 2.20462;
    heightIn = parseFloat(form.heightCm) * 0.393701;
  }
  const bmi = (weightLbs / (heightIn * heightIn)) * 703;
  let bmiCategory: string;
  if (bmi < 24) bmiCategory = "MS11";
  else if (bmi < 31) bmiCategory = "MS12";
  else if (bmi < 41) bmiCategory = "MS13";
  else bmiCategory = "MS14";
  let scrMgDl = parseFloat(form.serumCreatinine);
  if (form.creatinineUnits === "µmol/l") scrMgDl = scrMgDl * 0.01131221;
  const genderFactor = form.gender === "female" ? 0.742 : 1;
  const raceFactor = form.race === "black" ? 1.212 : 1;
  const egfrRaw = 175 * Math.pow(ageNum, -0.203) * Math.pow(scrMgDl, -1.154) * genderFactor * raceFactor;
  const egfr = Math.floor(egfrRaw);
  let kidneyCategory: string;
  if (egfr >= 58) kidneyCategory = "MS21";
  else if (egfr >= 16) kidneyCategory = "MS22";
  else kidneyCategory = "MS23";
  let doseCategory: string;
  if (form.dialysis === "yes" || kidneyCategory === "MS23") {
    doseCategory = "DLS1";
  } else if (kidneyCategory === "MS22") {
    doseCategory = bmi >= 24 ? "GC2" : "GC1";
  } else {
    const bmiToDose: Record<string, string> = { MS11: "MB1", MS12: "MB2", MS13: "MB3", MS14: "MB4" };
    doseCategory = bmiToDose[bmiCategory];
  }
  const range = doseRanges[doseCategory];
  const weightKg = weightLbs / 2.20462;
  const doseLow = Math.round(range.low * weightKg);
  const doseHigh = Math.round(range.high * weightKg);
  return {
    bmi: Math.round(bmi * 10) / 10, bmiCategory, egfr, kidneyCategory, doseCategory,
    doseLow, doseHigh, doseLowPerKg: range.low, doseHighPerKg: range.high,
    weightKg: Math.round(weightKg * 10) / 10, weightLbs: Math.round(weightLbs * 10) / 10,
    heightInches: Math.round(heightIn * 10) / 10, scrMgDl: Math.round(scrMgDl * 100) / 100, inputs: form,
  };
}

/* ── Step definitions ── */
const STEPS = [
  { title: "Basics", subtitle: "Measurement & body" },
  { title: "Lab Values", subtitle: "Creatinine & A1c" },
  { title: "Demographics", subtitle: "Age, gender & race" },
  { title: "Review", subtitle: "Confirm & calculate" },
];

const DiaFormPage = () => {
  const navigate = useNavigate();
  const { firstName } = useProfile();
  const { saveSubmission } = useSaveSubmission();
  const resultsRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormData>({ ...initialForm });
  const [result, setResult] = useState<CalcResult | null>(null);
  const [step, setStep] = useState(0);

  const update = (key: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isImperial = form.measurementSystem === "imperial";

  const validateStep = (s: number): boolean => {
    if (s === 0) {
      if (!form.weight || parseFloat(form.weight) <= 0) {
        toast({ title: "Enter weight", variant: "destructive" }); return false;
      }
      if (isImperial && (!form.heightFeet || parseFloat(form.heightFeet) <= 0)) {
        toast({ title: "Enter height", variant: "destructive" }); return false;
      }
      if (!isImperial && (!form.heightCm || parseFloat(form.heightCm) <= 0)) {
        toast({ title: "Enter height", variant: "destructive" }); return false;
      }
    }
    if (s === 1) {
      if (!form.serumCreatinine || parseFloat(form.serumCreatinine) <= 0) {
        toast({ title: "Enter serum creatinine", variant: "destructive" }); return false;
      }
      if (!form.a1c || parseFloat(form.a1c) <= 0) {
        toast({ title: "Enter A1c", variant: "destructive" }); return false;
      }
    }
    if (s === 2) {
      const ageNum = parseFloat(form.age);
      if (!ageNum || ageNum < 18) {
        toast({ title: "Age must be 18+", variant: "destructive" }); return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleCalculate = () => {
    const res = calculate(form);
    setResult(res);
    saveSubmission("diaform", form as any, {
      doseLow: res.doseLow, doseHigh: res.doseHigh,
      bmi: res.bmi, egfr: res.egfr, doseCategory: res.doseCategory,
    });
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleEditInputs = () => { setResult(null); setStep(0); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleFreshStart = () => { setForm({ ...initialForm }); setResult(null); setStep(0); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);

  const goNext = () => { setDirection(1); nextStep(); };
  const goPrev = () => { setDirection(-1); prevStep(); };

  return (
    <div className="min-h-screen bg-background pb-28">
      <SubscriptionBanner />

      {/* Header */}
      <div className="px-5 pt-12 pb-3">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-sm">
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">DiaForm</h1>
          <button onClick={() => navigate("/disclaimer")} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-sm">
            <Info className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="px-5 pt-1">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-5"
          style={{ background: "linear-gradient(135deg, hsl(210,80%,50%), hsl(210,90%,35%))" }}
        >
          <div className="relative z-10">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Initial Dosing</p>
            <h2 className="text-xl font-extrabold text-white mt-1">DiaForm Calculator</h2>
            <p className="text-xs text-white/70 mt-1 max-w-[220px]">Calculate initial insulin dose for adult diabetes patients</p>
          </div>
          <img src={diaformIcon} alt="" className="absolute bottom-0 right-3 h-20 w-20 opacity-20" />
        </motion.div>
      </div>

      {!result && (
        <>
          {/* Progress Steps */}
          <div className="px-5 mt-5">
            <div className="flex items-center justify-between">
              {STEPS.map((s, i) => (
                <div key={i} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                        i < step
                          ? "bg-primary text-primary-foreground"
                          : i === step
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i < step ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className={`text-[10px] mt-1 font-medium text-center leading-tight ${
                      i <= step ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {s.title}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 mt-[-14px] rounded-full transition-colors duration-300 ${
                      i < step ? "bg-primary" : "bg-muted"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="px-5 mt-5 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <h3 className="text-base font-bold text-foreground mb-1">{STEPS[step].title}</h3>
                <p className="text-xs text-muted-foreground mb-5">{STEPS[step].subtitle}</p>

                {step === 0 && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block">Measurement System</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {["imperial", "metric"].map((v) => (
                          <button key={v} onClick={() => update("measurementSystem", v)}
                            className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                              form.measurementSystem === v
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-background text-foreground"
                            }`}>
                            {v === "imperial" ? "Imperial" : "Metric"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <FieldGroup label={isImperial ? "Weight (lbs)" : "Weight (kg)"}>
                      <Input type="number" placeholder={isImperial ? "ex: 140" : "ex: 63.5"} value={form.weight} onChange={(e) => update("weight", e.target.value)} className="rounded-xl h-12 bg-background" />
                    </FieldGroup>
                    {isImperial ? (
                      <div>
                        <Label className="text-sm font-semibold text-foreground mb-2 block">Height</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs text-muted-foreground mb-1 block">Feet</span>
                            <Input type="number" placeholder="5" value={form.heightFeet} onChange={(e) => update("heightFeet", e.target.value)} className="rounded-xl h-12 bg-background" />
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground mb-1 block">Inches</span>
                            <Input type="number" placeholder="10" value={form.heightInches} onChange={(e) => update("heightInches", e.target.value)} className="rounded-xl h-12 bg-background" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <FieldGroup label="Height (cm)">
                        <Input type="number" placeholder="170" value={form.heightCm} onChange={(e) => update("heightCm", e.target.value)} className="rounded-xl h-12 bg-background" />
                      </FieldGroup>
                    )}
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <FieldGroup label="Serum Creatinine">
                      <Input type="number" step="0.1" placeholder="1.2" value={form.serumCreatinine} onChange={(e) => update("serumCreatinine", e.target.value)} className="rounded-xl h-12 bg-background" />
                    </FieldGroup>
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block">Creatinine Units</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[{ v: "mg/dl", l: "mg/dL" }, { v: "µmol/l", l: "µmol/L" }].map(({ v, l }) => (
                          <button key={v} onClick={() => update("creatinineUnits", v)}
                            className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                              form.creatinineUnits === v
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-background text-foreground"
                            }`}>
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                    <FieldGroup label="A1c (%)">
                      <Input type="number" step="0.1" placeholder="8.3" value={form.a1c} onChange={(e) => update("a1c", e.target.value)} className="rounded-xl h-12 bg-background" />
                    </FieldGroup>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <FieldGroup label="Age (18+)">
                      <Input type="number" placeholder="45" value={form.age} onChange={(e) => update("age", e.target.value)} className="rounded-xl h-12 bg-background" />
                    </FieldGroup>
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block">Gender</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {["male", "female"].map((v) => (
                          <button key={v} onClick={() => update("gender", v)}
                            className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all capitalize ${
                              form.gender === v
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-background text-foreground"
                            }`}>
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block">Race</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {raceOptions.map((opt) => {
                          const val = opt.toLowerCase();
                          return (
                            <button key={opt} onClick={() => update("race", val)}
                              className={`rounded-xl border px-3 py-2.5 text-xs font-medium transition-all text-left ${
                                form.race === val
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border bg-background text-foreground"
                              }`}>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block">Dialysis?</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {["no", "yes"].map((v) => (
                          <button key={v} onClick={() => update("dialysis", v)}
                            className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all capitalize ${
                              form.dialysis === v
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-background text-foreground"
                            }`}>
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground mb-3">Please review your inputs before calculating.</p>
                    <ReviewRow label="System" value={form.measurementSystem === "imperial" ? "Imperial" : "Metric"} />
                    <ReviewRow label="Weight" value={isImperial ? `${form.weight} lbs` : `${form.weight} kg`} />
                    <ReviewRow label="Height" value={isImperial ? `${form.heightFeet}'${form.heightInches || 0}"` : `${form.heightCm} cm`} />
                    <ReviewRow label="Serum Cr." value={`${form.serumCreatinine} ${form.creatinineUnits === "mg/dl" ? "mg/dL" : "µmol/L"}`} />
                    <ReviewRow label="A1c" value={`${form.a1c}%`} />
                    <ReviewRow label="Age" value={`${form.age} yrs`} />
                    <ReviewRow label="Gender" value={form.gender === "male" ? "Male" : "Female"} />
                    <ReviewRow label="Race" value={raceOptions.find((r) => r.toLowerCase() === form.race) ?? form.race} />
                    <ReviewRow label="Dialysis" value={form.dialysis === "yes" ? "Yes" : "No"} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="px-5 mt-4 flex gap-3">
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
                Calculate Dose
              </Button>
            )}
          </div>
        </>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-5 mt-5 space-y-4"
          >
            {/* Dose Card */}
            <div className="rounded-3xl overflow-hidden shadow-lg"
              style={{ background: "linear-gradient(135deg, hsl(210,80%,50%), hsl(210,90%,35%))" }}>
              <div className="p-6 text-center">
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Recommended Dosage Range</p>
                <p className="text-5xl font-extrabold text-white mt-2">
                  {result.doseLow}–{result.doseHigh}
                </p>
                <p className="text-sm font-bold text-white/80 mt-1">units</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-4 mx-4 mb-4 rounded-2xl">
                <p className="text-xs text-white/90 leading-relaxed">
                  This represents <span className="font-bold">50% of TDD</span>. Basal = 50% TDD, Prandial = 50% TDD ÷ 3 meals.
                </p>
              </div>
            </div>

            {/* Computed Values */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-3">Computed Values</h3>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="BMI" value={String(result.bmi)} />
                <StatCard label="eGFR" value={String(result.egfr)} />
                <StatCard label="Weight (kg)" value={String(result.weightKg)} />
                <StatCard label="Dose Category" value={result.doseCategory} />
              </div>
            </div>

            {/* Submitted Inputs */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-3">Submitted Inputs</h3>
              <div className="space-y-2">
                <ReviewRow label="System" value={result.inputs.measurementSystem === "imperial" ? "Imperial" : "Metric"} />
                <ReviewRow label="Weight" value={result.inputs.measurementSystem === "imperial" ? `${result.inputs.weight} lbs (${result.weightKg} kg)` : `${result.inputs.weight} kg (${result.weightLbs} lbs)`} />
                <ReviewRow label="Height" value={result.inputs.measurementSystem === "imperial" ? `${result.inputs.heightFeet}'${result.inputs.heightInches || 0}"` : `${result.inputs.heightCm} cm`} />
                <ReviewRow label="Serum Cr." value={`${result.inputs.serumCreatinine} ${result.inputs.creatinineUnits === "mg/dl" ? "mg/dL" : "µmol/L"}`} />
                <ReviewRow label="A1c" value={result.inputs.a1c} />
                <ReviewRow label="Age" value={`${result.inputs.age} yrs`} />
                <ReviewRow label="Gender" value={result.inputs.gender === "male" ? "Male" : "Female"} />
                <ReviewRow label="Race" value={raceOptions.find((r) => r.toLowerCase() === result.inputs.race) ?? result.inputs.race} />
                <ReviewRow label="Dialysis" value={result.inputs.dialysis === "yes" ? "Yes" : "No"} />
              </div>
            </div>

            {/* Actions */}
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

const ReviewRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <span className="text-sm font-bold text-foreground">{value}</span>
  </div>
);

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-background border border-border p-3 text-center">
    <p className="text-lg font-extrabold text-foreground">{value}</p>
    <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
  </div>
);

export default DiaFormPage;
