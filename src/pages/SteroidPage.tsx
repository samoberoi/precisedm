import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Info, RotateCcw, Printer } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { useSaveSubmission } from "@/hooks/use-save-submission";
import BottomNav from "@/components/BottomNav";
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
  "Hawaiian / Pacific Islander",
  "Other",
];

/* ── Calculation helpers ── */

interface CalcResult {
  bmi: number;
  egfr: number;
  categoryCode: string;
  doseLowPerKg: number;
  doseHighPerKg: number;
  doseLowUnits: number;
  doseHighUnits: number;
  weightKg: number;
}

function calculate(
  ageNum: number,
  weightLbs: number,
  feet: number,
  inches: number,
  a1cNum: number,
  scr: number,
  gender: string,
  dialysis: string
): CalcResult {
  // Step 1 — height in inches
  const heightIn = feet * 12 + inches;

  // Step 2 — BMI
  const bmi = (weightLbs / (heightIn * heightIn)) * 703;

  // Step 3 — eGFR (CKD-EPI 2021 race-free)
  const isFemale = gender === "female";
  const K = isFemale ? 0.7 : 0.9;
  const alpha = isFemale ? -0.241 : -0.302;

  let egfr =
    142 *
    Math.pow(Math.min(scr / K, 1), alpha) *
    Math.pow(Math.max(scr / K, 1), -1.2) *
    Math.pow(0.9938, ageNum);

  if (isFemale) egfr *= 1.012;

  // Step 4 — Dose category
  let categoryCode: string;
  let doseLow: number;
  let doseHigh: number;

  if (egfr < 30 || dialysis === "yes") {
    categoryCode = "RGC1";
    doseLow = 0.10;
    doseHigh = 0.14;
  } else if (bmi < 30) {
    categoryCode = "RMB1";
    doseLow = 0.15;
    doseHigh = 0.18;
  } else if (bmi < 35) {
    categoryCode = "RMB2";
    doseLow = 0.18;
    doseHigh = 0.20;
  } else if (bmi < 40) {
    categoryCode = "RMB3";
    doseLow = 0.20;
    doseHigh = 0.22;
  } else {
    categoryCode = "RMB4";
    doseLow = 0.22;
    doseHigh = 0.26;
  }

  // Step 5 — weight conversion
  const weightKg = weightLbs * 0.453592;

  // Step 6 — daily dose
  const doseLowUnits = Math.round(doseLow * weightKg);
  const doseHighUnits = Math.round(doseHigh * weightKg);

  return {
    bmi: Math.round(bmi * 10) / 10,
    egfr: Math.round(egfr * 10) / 10,
    categoryCode,
    doseLowPerKg: doseLow,
    doseHighPerKg: doseHigh,
    doseLowUnits,
    doseHighUnits,
    weightKg: Math.round(weightKg * 10) / 10,
  };
}

/* ── Page Component ── */

const SteroidPage = () => {
  const navigate = useNavigate();
  const { firstName } = useProfile();
  const { saveSubmission } = useSaveSubmission();
  const resultsRef = useRef<HTMLDivElement>(null);

  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [a1c, setA1c] = useState("");
  const [serumCreatinine, setSerumCreatinine] = useState("");
  const [gender, setGender] = useState("male");
  const [race, setRace] = useState("black");
  const [dialysis, setDialysis] = useState("no");

  const [result, setResult] = useState<CalcResult | null>(null);

  const handleCalculate = () => {
    const ageNum = parseFloat(age);
    const weightNum = parseFloat(weight);
    const feetNum = parseFloat(heightFeet);
    const inchesNum = parseFloat(heightInches) || 0;
    const a1cNum = parseFloat(a1c);
    const scrNum = parseFloat(serumCreatinine);

    if (!ageNum || ageNum < 18) {
      toast({ title: "Invalid Age", description: "Age must be 18 or older.", variant: "destructive" });
      return;
    }
    if (!weightNum || weightNum <= 0) {
      toast({ title: "Invalid Weight", description: "Please enter a valid weight.", variant: "destructive" });
      return;
    }
    if (!feetNum || feetNum <= 0) {
      toast({ title: "Invalid Height", description: "Please enter a valid height.", variant: "destructive" });
      return;
    }
    if (!a1cNum || a1cNum <= 0) {
      toast({ title: "Invalid A1c", description: "Please enter a valid A1c value.", variant: "destructive" });
      return;
    }
    if (!scrNum || scrNum <= 0) {
      toast({ title: "Invalid Serum Creatinine", description: "Please enter a valid value.", variant: "destructive" });
      return;
    }

    const res = calculate(ageNum, weightNum, feetNum, inchesNum, a1cNum, scrNum, gender, dialysis);
    setResult(res);
    saveSubmission("steroid", { age, weight, heightFeet, heightInches, a1c, serumCreatinine, gender, race, dialysis }, {
      doseLowUnits: res.doseLowUnits,
      doseHighUnits: res.doseHighUnits,
      bmi: res.bmi,
      egfr: res.egfr,
      categoryCode: res.categoryCode,
    });
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleStartOver = () => {
    setAge("");
    setWeight("");
    setHeightFeet("");
    setHeightInches("");
    setA1c("");
    setSerumCreatinine("");
    setGender("male");
    setRace("black");
    setDialysis("no");
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrint = () => window.print();

  const raceLabel = raceOptions.find((r) => r.toLowerCase() === race) ?? race;

  return (
    <div className="min-h-screen bg-background pb-28">
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
        <h2 className="text-xl font-extrabold text-foreground">Welcome to Steroid Insulin Dosing</h2>
        <p className="text-sm text-muted-foreground mt-1">
          This tool calculates the initial insulin dose range for steroid induced hyperglycemia.
        </p>
      </motion.div>

      {/* Form */}
      {!result && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mx-5 mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm space-y-5"
        >
          <FieldGroup label="Age">
            <Input type="number" placeholder="ex: 18 years and older" value={age} onChange={(e) => setAge(e.target.value)} />
          </FieldGroup>

          <FieldGroup label="Weight (lbs)">
            <Input type="number" placeholder="ex: 140" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </FieldGroup>

          <div>
            <Label className="text-sm font-semibold text-foreground mb-2 block">Height</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-muted-foreground mb-1 block">feet</span>
                <Input type="number" placeholder="ex: 6" value={heightFeet} onChange={(e) => setHeightFeet(e.target.value)} />
              </div>
              <div>
                <span className="text-xs text-muted-foreground mb-1 block">inches</span>
                <Input type="number" placeholder="ex: 3" value={heightInches} onChange={(e) => setHeightInches(e.target.value)} />
              </div>
            </div>
          </div>

          <FieldGroup label="A1c">
            <Input type="number" step="0.1" placeholder="ex: 8.3" value={a1c} onChange={(e) => setA1c(e.target.value)} />
          </FieldGroup>

          <FieldGroup label="Serum Creatinine (mg/dL)">
            <Input type="number" step="0.1" placeholder="ex: 1.2" value={serumCreatinine} onChange={(e) => setSerumCreatinine(e.target.value)} />
          </FieldGroup>

          <RadioField
            label="Gender"
            options={["Male", "Female"]}
            value={gender}
            onChange={setGender}
          />

          <RadioField
            label="Race"
            options={raceOptions}
            value={race}
            onChange={setRace}
          />

          <RadioField
            label="Dialysis?"
            options={["No", "Yes"]}
            value={dialysis}
            onChange={setDialysis}
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
            {/* Dosage Card */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-sm">
              <h3 className="text-lg font-extrabold text-foreground mb-4">Recommended Steroid Dosage</h3>

              <div className="mt-5 rounded-xl bg-primary/10 p-4 text-center">
                <p className="text-sm font-semibold text-muted-foreground mb-1">Recommended Total Daily Dose</p>
                <p className="text-3xl font-extrabold text-primary">
                  {result.doseLowUnits} to {result.doseHighUnits}
                </p>
                <p className="text-sm font-bold text-primary/80">units/day</p>
              </div>
            </div>

            {/* Submitted Inputs Card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-lg font-extrabold text-foreground mb-4">Submitted Inputs</h3>
              <div className="space-y-3">
                <ResultRow label="A1c" value={a1c} />
                <ResultRow label="Weight" value={`${weight} lbs (${result.weightKg} kg)`} />
                <ResultRow label="Height" value={`${heightFeet}' ${heightInches || 0}"`} />
                <ResultRow label="Serum Creatinine" value={`${serumCreatinine} mg/dL`} />
                <ResultRow label="Age" value={`${age} years`} />
                <ResultRow label="Gender" value={gender === "male" ? "Male" : "Female"} />
                <ResultRow label="Race" value={raceLabel} />
                <ResultRow label="Dialysis" value={dialysis === "yes" ? "Yes" : "No"} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleStartOver} variant="outline" className="flex-1 h-12 rounded-xl font-bold gap-2">
                <RotateCcw className="h-4 w-4" />
                Start Over
              </Button>
              <Button onClick={handlePrint} className="flex-1 h-12 rounded-xl font-bold gap-2">
                <Printer className="h-4 w-4" />
                Print Results
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
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

export default SteroidPage;
