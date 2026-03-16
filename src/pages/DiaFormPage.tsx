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

const raceOptions = [
  "Black",
  "Caucasian",
  "Hispanic",
  "Asian",
  "American Indian",
  "Hawaiian/Pacific Islander",
  "Other",
];

/* ── Types ── */

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

/* ── Dose range table ── */

const doseRanges: Record<string, { low: number; high: number; label: string }> = {
  MB1: { low: 0.15, high: 0.18, label: "MB1 (0.15–0.18 units/kg)" },
  MB2: { low: 0.18, high: 0.23, label: "MB2 (0.18–0.23 units/kg)" },
  MB3: { low: 0.23, high: 0.28, label: "MB3 (0.23–0.28 units/kg)" },
  MB4: { low: 0.28, high: 0.33, label: "MB4 (0.28–0.33 units/kg)" },
  GC1: { low: 0.10, high: 0.15, label: "GC1 (0.10–0.15 units/kg)" },
  GC2: { low: 0.15, high: 0.20, label: "GC2 (0.15–0.20 units/kg)" },
  DLS1: { low: 0.10, high: 0.15, label: "DLS1 (0.10–0.15 units/kg)" },
};

/* ── Calculation Logic ── */

function calculate(form: FormData): CalcResult {
  const ageNum = parseFloat(form.age);
  const isImperial = form.measurementSystem === "imperial";

  // STEP 1 — Convert units
  let weightLbs: number;
  let heightIn: number;

  if (isImperial) {
    weightLbs = parseFloat(form.weight);
    heightIn = parseFloat(form.heightFeet) * 12 + (parseFloat(form.heightInches) || 0);
  } else {
    weightLbs = parseFloat(form.weight) * 2.20462;
    heightIn = parseFloat(form.heightCm) * 0.393701;
  }

  // STEP 2 — BMI
  const bmi = (weightLbs / (heightIn * heightIn)) * 703;

  let bmiCategory: string;
  if (bmi < 24) bmiCategory = "MS11";
  else if (bmi < 31) bmiCategory = "MS12";
  else if (bmi < 41) bmiCategory = "MS13";
  else bmiCategory = "MS14";

  // STEP 3 — Creatinine conversion
  let scrMgDl = parseFloat(form.serumCreatinine);
  if (form.creatinineUnits === "µmol/l") {
    scrMgDl = scrMgDl * 0.01131221;
  }

  // STEP 4 — eGFR (MDRD)
  const genderFactor = form.gender === "female" ? 0.742 : 1;
  const raceFactor = form.race === "black" ? 1.212 : 1;

  const egfrRaw =
    175 *
    Math.pow(ageNum, -0.203) *
    Math.pow(scrMgDl, -1.154) *
    genderFactor *
    raceFactor;

  const egfr = Math.floor(egfrRaw);

  // STEP 5 — Kidney function category
  let kidneyCategory: string;
  if (egfr >= 58) kidneyCategory = "MS21";
  else if (egfr >= 16) kidneyCategory = "MS22";
  else kidneyCategory = "MS23";

  // STEP 6 — Dose category
  let doseCategory: string;

  if (form.dialysis === "yes" || kidneyCategory === "MS23") {
    doseCategory = "DLS1";
  } else if (kidneyCategory === "MS22") {
    doseCategory = bmi >= 24 ? "GC2" : "GC1";
  } else {
    // MS21
    const bmiToDose: Record<string, string> = {
      MS11: "MB1",
      MS12: "MB2",
      MS13: "MB3",
      MS14: "MB4",
    };
    doseCategory = bmiToDose[bmiCategory];
  }

  // STEP 7 & 8 — Final dose
  const range = doseRanges[doseCategory];
  const weightKg = weightLbs / 2.20462;
  const doseLow = Math.round(range.low * weightKg);
  const doseHigh = Math.round(range.high * weightKg);

  return {
    bmi: Math.round(bmi * 10) / 10,
    bmiCategory,
    egfr,
    kidneyCategory,
    doseCategory,
    doseLow,
    doseHigh,
    doseLowPerKg: range.low,
    doseHighPerKg: range.high,
    weightKg: Math.round(weightKg * 10) / 10,
    weightLbs: Math.round(weightLbs * 10) / 10,
    heightInches: Math.round(heightIn * 10) / 10,
    scrMgDl: Math.round(scrMgDl * 100) / 100,
    inputs: form,
  };
}

/* ── Page Component ── */

const DiaFormPage = () => {
  const navigate = useNavigate();
  const { firstName } = useProfile();
  const { saveSubmission } = useSaveSubmission();
  const resultsRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormData>({ ...initialForm });
  const [result, setResult] = useState<CalcResult | null>(null);

  const update = (key: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isImperial = form.measurementSystem === "imperial";

  const handleCalculate = () => {
    const ageNum = parseFloat(form.age);
    if (!ageNum || ageNum < 18) {
      toast({ title: "Invalid Age", description: "Age must be 18 or older.", variant: "destructive" });
      return;
    }
    if (!form.weight || parseFloat(form.weight) <= 0) {
      toast({ title: "Invalid Weight", description: "Please enter a valid weight.", variant: "destructive" });
      return;
    }
    if (isImperial) {
      if (!form.heightFeet || parseFloat(form.heightFeet) <= 0) {
        toast({ title: "Invalid Height", description: "Please enter a valid height.", variant: "destructive" });
        return;
      }
    } else {
      if (!form.heightCm || parseFloat(form.heightCm) <= 0) {
        toast({ title: "Invalid Height", description: "Please enter a valid height in cm.", variant: "destructive" });
        return;
      }
    }
    if (!form.serumCreatinine || parseFloat(form.serumCreatinine) <= 0) {
      toast({ title: "Invalid Serum Creatinine", description: "Please enter a valid value.", variant: "destructive" });
      return;
    }
    if (!form.a1c || parseFloat(form.a1c) <= 0) {
      toast({ title: "Invalid A1c", description: "Please enter a valid A1c value.", variant: "destructive" });
      return;
    }

    const res = calculate(form);
    setResult(res);
    saveSubmission("diaform", form as any, {
      doseLow: res.doseLow,
      doseHigh: res.doseHigh,
      bmi: res.bmi,
      egfr: res.egfr,
      doseCategory: res.doseCategory,
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

  const raceLabel = raceOptions.find((r) => r.toLowerCase() === form.race) ?? form.race;

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

      {/* Title & Description */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-5 mt-5 mb-2">
        <h2 className="text-xl font-extrabold text-foreground text-center">Welcome to DiaForm Initial Insulin Dosage</h2>
        <p className="text-sm text-muted-foreground mt-2">
          This tool calculates the initial insulin dose range for newly diagnosed adult diabetes patients with an A1c &gt; 9, or for existing diabetes patients requiring insulin therapy.
        </p>
        <div className="mt-3 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">The provider selects the insulin dose which can be used as:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Basal insulin dose with current diabetes regimen</li>
            <li>Basal dose and a prandial dose divided equally over 3 meals (e.g., New DM with an A1c &gt; 9)</li>
            <li>Prandial insulin, divided equally over 3 meals, to the current diabetes regimen</li>
          </ol>
        </div>
      </motion.div>

      {/* Form */}
      {!result && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mx-5 mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm space-y-5"
        >
          <RadioField
            label="Patient's Measurement System"
            options={["Imperial", "Metric"]}
            value={form.measurementSystem}
            onChange={(v) => update("measurementSystem", v)}
          />

          <FieldGroup label={isImperial ? "Weight (lbs)" : "Weight (kg)"}>
            <Input type="number" placeholder={isImperial ? "ex: 140" : "ex: 63.5"} value={form.weight} onChange={(e) => update("weight", e.target.value)} />
          </FieldGroup>

          {isImperial ? (
            <div>
              <Label className="text-sm font-semibold text-foreground mb-2 block">Height</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-muted-foreground mb-1 block">feet</span>
                  <Input type="number" placeholder="ex: 6" value={form.heightFeet} onChange={(e) => update("heightFeet", e.target.value)} />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground mb-1 block">inches</span>
                  <Input type="number" placeholder="ex: 3" value={form.heightInches} onChange={(e) => update("heightInches", e.target.value)} />
                </div>
              </div>
            </div>
          ) : (
            <FieldGroup label="Height (cm)">
              <Input type="number" placeholder="ex: 170" value={form.heightCm} onChange={(e) => update("heightCm", e.target.value)} />
            </FieldGroup>
          )}

          <FieldGroup label="Serum Creatinine">
            <Input type="number" step="0.1" placeholder="ex: 1.2" value={form.serumCreatinine} onChange={(e) => update("serumCreatinine", e.target.value)} />
          </FieldGroup>

          <RadioField
            label="Serum Creatinine Units"
            options={["mg/dL", "µmol/L"]}
            value={form.creatinineUnits}
            onChange={(v) => update("creatinineUnits", v)}
          />

          <FieldGroup label="A1c">
            <Input type="number" step="0.1" placeholder="ex: 8.3" value={form.a1c} onChange={(e) => update("a1c", e.target.value)} />
          </FieldGroup>

          <FieldGroup label="Age">
            <Input type="number" placeholder="ex: 18 years and older" value={form.age} onChange={(e) => update("age", e.target.value)} />
          </FieldGroup>

          <RadioField
            label="Gender"
            options={["Male", "Female"]}
            value={form.gender}
            onChange={(v) => update("gender", v)}
          />

          <RadioField
            label="Race"
            options={raceOptions}
            value={form.race}
            onChange={(v) => update("race", v)}
          />

          <RadioField
            label="Dialysis?"
            options={["No", "Yes"]}
            value={form.dialysis}
            onChange={(v) => update("dialysis", v)}
          />

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
            {/* Main Recommendation */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-sm">
              <h3 className="text-lg font-extrabold text-foreground mb-4">
                Recommended Initial Insulin Dosage
              </h3>

              <div className="rounded-xl bg-primary/10 p-5 text-center mb-4">
                <p className="text-sm font-semibold text-muted-foreground mb-1">Recommended Insulin Dosage Range</p>
                <p className="text-3xl font-extrabold text-primary">
                  {result.doseLow} – {result.doseHigh}
                </p>
                <p className="text-sm font-bold text-primary/80">units</p>
              </div>

              <div className="rounded-xl bg-card border border-border p-4 space-y-2 text-sm text-foreground">
                <p>This represents <span className="font-bold">50% of Total Daily Dose (TDD)</span></p>
                <p>• <span className="font-semibold">Basal insulin</span> = 50% of TDD</p>
                <p>• <span className="font-semibold">Prandial insulin</span> = 50% of TDD divided across 3 meals</p>
              </div>
            </div>


            {/* Submitted Inputs */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-lg font-extrabold text-foreground mb-4">Submitted Inputs</h3>
              <div className="space-y-3">
                <ResultRow label="Measurement System" value={result.inputs.measurementSystem === "imperial" ? "Imperial" : "Metric"} />
                <ResultRow label="Weight" value={result.inputs.measurementSystem === "imperial" ? `${result.inputs.weight} lbs (${result.weightKg} kg)` : `${result.inputs.weight} kg (${result.weightLbs} lbs)`} />
                <ResultRow label="Height" value={result.inputs.measurementSystem === "imperial" ? `${result.inputs.heightFeet}' ${result.inputs.heightInches || 0}"` : `${result.inputs.heightCm} cm`} />
                <ResultRow label="Serum Creatinine" value={`${result.inputs.serumCreatinine} ${result.inputs.creatinineUnits === "mg/dl" ? "mg/dL" : "µmol/L"}${result.inputs.creatinineUnits === "µmol/l" ? ` (${result.scrMgDl} mg/dL)` : ""}`} />
                <ResultRow label="A1c" value={result.inputs.a1c} />
                <ResultRow label="Age" value={`${result.inputs.age} years`} />
                <ResultRow label="Gender" value={result.inputs.gender === "male" ? "Male" : "Female"} />
                <ResultRow label="Race" value={raceOptions.find((r) => r.toLowerCase() === result.inputs.race) ?? result.inputs.race} />
                <ResultRow label="Dialysis" value={result.inputs.dialysis === "yes" ? "Yes" : "No"} />
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

const ResultRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
    <span className="text-sm font-medium text-muted-foreground">{label}</span>
    <span className="text-sm font-bold text-foreground text-right">{value}</span>
  </div>
);

export default DiaFormPage;
