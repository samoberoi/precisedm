import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import steroidIcon from "@/assets/steroid-icon.png";

const raceOptions = [
  "Black", "Caucasian", "Hispanic", "Asian",
  "American Indian", "Hawaiian / Pacific Islander", "Other",
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
  ageNum: number, weightLbs: number, feet: number, inches: number,
  a1cNum: number, scr: number, gender: string, dialysis: string
): CalcResult {
  const heightIn = feet * 12 + inches;
  const bmi = (weightLbs / (heightIn * heightIn)) * 703;
  const isFemale = gender === "female";
  const K = isFemale ? 0.7 : 0.9;
  const alpha = isFemale ? -0.241 : -0.302;
  let egfr = 142 * Math.pow(Math.min(scr / K, 1), alpha) * Math.pow(Math.max(scr / K, 1), -1.2) * Math.pow(0.9938, ageNum);
  if (isFemale) egfr *= 1.012;

  let categoryCode: string, doseLow: number, doseHigh: number;
  if (egfr < 30 || dialysis === "yes") { categoryCode = "RGC1"; doseLow = 0.10; doseHigh = 0.14; }
  else if (bmi < 30) { categoryCode = "RMB1"; doseLow = 0.15; doseHigh = 0.18; }
  else if (bmi < 35) { categoryCode = "RMB2"; doseLow = 0.18; doseHigh = 0.20; }
  else if (bmi < 40) { categoryCode = "RMB3"; doseLow = 0.20; doseHigh = 0.22; }
  else { categoryCode = "RMB4"; doseLow = 0.22; doseHigh = 0.26; }

  const weightKg = weightLbs * 0.453592;
  return {
    bmi: Math.round(bmi * 10) / 10, egfr: Math.round(egfr * 10) / 10, categoryCode,
    doseLowPerKg: doseLow, doseHighPerKg: doseHigh,
    doseLowUnits: Math.round(doseLow * weightKg), doseHighUnits: Math.round(doseHigh * weightKg),
    weightKg: Math.round(weightKg * 10) / 10,
  };
}

/* ── Step definitions ── */
const STEPS = [
  { title: "Body", subtitle: "Age, weight & height" },
  { title: "Lab Values", subtitle: "A1c & creatinine" },
  { title: "Demographics", subtitle: "Gender, race & dialysis" },
  { title: "Review", subtitle: "Confirm & calculate" },
];

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
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const validateStep = (s: number): boolean => {
    if (s === 0) {
      const ageNum = parseFloat(age);
      if (!ageNum || ageNum < 18) { toast({ title: "Invalid Age", description: "Age must be 18 or older.", variant: "destructive" }); return false; }
      if (!weight || parseFloat(weight) <= 0) { toast({ title: "Invalid Weight", description: "Please enter a valid weight.", variant: "destructive" }); return false; }
      if (!heightFeet || parseFloat(heightFeet) <= 0) { toast({ title: "Invalid Height", description: "Please enter a valid height.", variant: "destructive" }); return false; }
    }
    if (s === 1) {
      if (!a1c || parseFloat(a1c) <= 0) { toast({ title: "Invalid A1c", description: "Please enter a valid A1c value.", variant: "destructive" }); return false; }
      if (!serumCreatinine || parseFloat(serumCreatinine) <= 0) { toast({ title: "Invalid Serum Creatinine", description: "Please enter a valid value.", variant: "destructive" }); return false; }
    }
    return true;
  };

  const nextStep = () => { if (!validateStep(step)) return; if (step < STEPS.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };
  const goNext = () => { setDirection(1); nextStep(); };
  const goPrev = () => { setDirection(-1); prevStep(); };

  const handleCalculate = () => {
    const res = calculate(parseFloat(age), parseFloat(weight), parseFloat(heightFeet), parseFloat(heightInches) || 0, parseFloat(a1c), parseFloat(serumCreatinine), gender, dialysis);
    setResult(res);
    saveSubmission("steroid", { age, weight, heightFeet, heightInches, a1c, serumCreatinine, gender, race, dialysis }, {
      doseLowUnits: res.doseLowUnits, doseHighUnits: res.doseHighUnits, bmi: res.bmi, egfr: res.egfr, categoryCode: res.categoryCode,
    });
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleEditInputs = () => { setResult(null); setStep(0); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleFreshStart = () => {
    setAge(""); setWeight(""); setHeightFeet(""); setHeightInches(""); setA1c(""); setSerumCreatinine("");
    setGender("male"); setRace("black"); setDialysis("no"); setResult(null); setStep(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  const raceLabel = raceOptions.find((r) => r.toLowerCase() === race) ?? race;

  return (
    <div className="min-h-screen bg-background pb-36">
      <SubscriptionBanner />

      {/* Header */}
      <div className="px-5 pt-6 pb-3">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-sm">
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Steroid</h1>
          <button onClick={() => navigate("/disclaimer")} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-sm">
            <Info className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="px-5 pt-2">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-5"
          style={{ background: "linear-gradient(135deg, hsl(200,30%,22%), hsl(200,25%,15%))" }}>
          <div className="relative z-10">
            <p className="text-[10px] font-semibold text-white/60 uppercase tracking-widest">Steroid Dosing</p>
            <h2 className="text-lg font-extrabold text-white mt-1">Steroid Calculator</h2>
            <p className="text-[11px] text-white/70 mt-1 max-w-[200px] leading-snug">Calculate insulin dose for steroid-induced hyperglycemia</p>
          </div>
          <img src={steroidIcon} alt="" className="absolute -bottom-2 -right-2 h-24 w-24 opacity-15 object-contain" />
        </motion.div>
      </div>

      {!result && (
        <>
          {/* Progress Steps */}
          <div className="px-6 mt-5">
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
          <div className="px-5 mt-5 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div key={step} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-1">{STEPS[step].title}</h3>
                <p className="text-xs text-muted-foreground mb-5">{STEPS[step].subtitle}</p>

                {step === 0 && (
                  <div className="space-y-4">
                    <FieldGroup label="Age (18+)">
                      <Input type="number" placeholder="ex: 45" value={age} onChange={(e) => setAge(e.target.value)} className="rounded-xl h-12 bg-background" />
                    </FieldGroup>
                    <FieldGroup label="Weight (lbs)">
                      <Input type="number" placeholder="ex: 140" value={weight} onChange={(e) => setWeight(e.target.value)} className="rounded-xl h-12 bg-background" />
                    </FieldGroup>
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block">Height</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-xs text-muted-foreground mb-1 block">Feet</span>
                          <Input type="number" placeholder="5" value={heightFeet} onChange={(e) => setHeightFeet(e.target.value)} className="rounded-xl h-12 bg-background" />
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground mb-1 block">Inches</span>
                          <Input type="number" placeholder="10" value={heightInches} onChange={(e) => setHeightInches(e.target.value)} className="rounded-xl h-12 bg-background" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <FieldGroup label="A1c (%)">
                      <Input type="number" step="0.1" placeholder="ex: 8.3" value={a1c} onChange={(e) => setA1c(e.target.value)} className="rounded-xl h-12 bg-background" />
                    </FieldGroup>
                    <FieldGroup label="Serum Creatinine (mg/dL)">
                      <Input type="number" step="0.1" placeholder="ex: 1.2" value={serumCreatinine} onChange={(e) => setSerumCreatinine(e.target.value)} className="rounded-xl h-12 bg-background" />
                    </FieldGroup>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block">Gender</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {["male", "female"].map((v) => (
                          <button key={v} onClick={() => setGender(v)}
                            className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all capitalize ${
                              gender === v ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground"
                            }`}>{v}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block">Race</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {raceOptions.map((opt) => {
                          const val = opt.toLowerCase();
                          return (
                            <button key={opt} onClick={() => setRace(val)}
                              className={`rounded-xl border px-3 py-2.5 text-xs font-medium transition-all text-left ${
                                race === val ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground"
                              }`}>{opt}</button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block">Dialysis?</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {["no", "yes"].map((v) => (
                          <button key={v} onClick={() => setDialysis(v)}
                            className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all capitalize ${
                              dialysis === v ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground"
                            }`}>{v}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground mb-3">Please review your inputs before calculating.</p>
                    <ReviewRow label="Age" value={`${age} years`} />
                    <ReviewRow label="Weight" value={`${weight} lbs`} />
                    <ReviewRow label="Height" value={`${heightFeet}'${heightInches || 0}"`} />
                    <ReviewRow label="A1c" value={`${a1c}%`} />
                    <ReviewRow label="Serum Creatinine" value={`${serumCreatinine} mg/dL`} />
                    <ReviewRow label="Gender" value={gender === "male" ? "Male" : "Female"} />
                    <ReviewRow label="Race" value={raceLabel} />
                    <ReviewRow label="Dialysis" value={dialysis === "yes" ? "Yes" : "No"} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="px-5 mt-4 mb-6 flex gap-3">
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
          <motion.div ref={resultsRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="px-5 mt-5 space-y-4">
            {/* Dosage Card */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-sm">
              <h3 className="text-lg font-extrabold text-foreground mb-4">Recommended Steroid Dosage</h3>
              <div className="mt-2 rounded-xl bg-primary/10 p-4 text-center">
                <p className="text-sm font-semibold text-muted-foreground mb-1">Recommended Total Daily Dose</p>
                <p className="text-3xl font-extrabold text-primary">{result.doseLowUnits} to {result.doseHighUnits}</p>
                <p className="text-sm font-bold text-primary/80">units/day</p>
              </div>
            </div>

            {/* Submitted Inputs Card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-3">Submitted Inputs</h3>
              <div className="space-y-2">
                <ReviewRow label="A1c" value={a1c} />
                <ReviewRow label="Weight" value={`${weight} lbs (${result.weightKg} kg)`} />
                <ReviewRow label="Height" value={`${heightFeet}'${heightInches || 0}"`} />
                <ReviewRow label="Serum Creatinine" value={`${serumCreatinine} mg/dL`} />
                <ReviewRow label="Age" value={`${age} years`} />
                <ReviewRow label="Gender" value={gender === "male" ? "Male" : "Female"} />
                <ReviewRow label="Race" value={raceLabel} />
                <ReviewRow label="Dialysis" value={dialysis === "yes" ? "Yes" : "No"} />
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

export default SteroidPage;
