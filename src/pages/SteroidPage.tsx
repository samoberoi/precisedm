import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Info } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const raceOptions = [
  "Black",
  "Caucasian",
  "Hispanic",
  "Asian",
  "American Indian",
  "Hawaiian / Pacific Islander",
  "Other",
];

const SteroidPage = () => {
  const navigate = useNavigate();
  const { firstName } = useProfile();

  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [a1c, setA1c] = useState("");
  const [serumCreatinine, setSerumCreatinine] = useState("");
  const [gender, setGender] = useState("male");
  const [race, setRace] = useState("black");
  const [dialysis, setDialysis] = useState("no");

  const handleCalculate = () => {
    // Calculation logic will be added later
    console.log({ age, weight, heightFeet, heightInches, a1c, serumCreatinine, gender, race, dialysis });
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="px-5 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-foreground mb-3"
        >
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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 mt-5 mb-2 text-center"
      >
        <h2 className="text-xl font-extrabold text-foreground">
          Welcome to Steroid Insulin Dosing
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          This tool calculates the initial insulin dose range for steroid induced hyperglycemia.
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mx-5 mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm space-y-5"
      >
        {/* Age */}
        <FieldGroup label="Age">
          <Input
            type="number"
            placeholder="ex: 18 years and older"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </FieldGroup>

        {/* Weight */}
        <FieldGroup label="Weight (lbs)">
          <Input
            type="number"
            placeholder="ex: 140"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </FieldGroup>

        {/* Height */}
        <div>
          <Label className="text-sm font-semibold text-foreground mb-2 block">Height</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-muted-foreground mb-1 block">feet</span>
              <Input
                type="number"
                placeholder="ex: 6"
                value={heightFeet}
                onChange={(e) => setHeightFeet(e.target.value)}
              />
            </div>
            <div>
              <span className="text-xs text-muted-foreground mb-1 block">inches</span>
              <Input
                type="number"
                placeholder="ex: 3"
                value={heightInches}
                onChange={(e) => setHeightInches(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* A1c */}
        <FieldGroup label="A1c">
          <Input
            type="number"
            step="0.1"
            placeholder="ex: 8.3"
            value={a1c}
            onChange={(e) => setA1c(e.target.value)}
          />
        </FieldGroup>

        {/* Serum Creatinine */}
        <FieldGroup label="Serum Creatinine (mg/dL)">
          <Input
            type="number"
            step="0.1"
            placeholder="ex: 1.2"
            value={serumCreatinine}
            onChange={(e) => setSerumCreatinine(e.target.value)}
          />
        </FieldGroup>

        {/* Gender */}
        <div>
          <Label className="text-sm font-semibold text-foreground mb-2 block">Gender</Label>
          <RadioGroup value={gender} onValueChange={setGender} className="space-y-2">
            {["Male", "Female"].map((g) => (
              <label
                key={g}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                  gender === g.toLowerCase()
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                }`}
              >
                <RadioGroupItem value={g.toLowerCase()} />
                <span className="text-sm font-medium text-foreground">{g}</span>
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* Race */}
        <div>
          <Label className="text-sm font-semibold text-foreground mb-2 block">Race</Label>
          <RadioGroup value={race} onValueChange={setRace} className="space-y-2">
            {raceOptions.map((r) => {
              const val = r.toLowerCase();
              return (
                <label
                  key={r}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                    race === val
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card"
                  }`}
                >
                  <RadioGroupItem value={val} />
                  <span className="text-sm font-medium text-foreground">{r}</span>
                </label>
              );
            })}
          </RadioGroup>
        </div>

        {/* Dialysis */}
        <div>
          <Label className="text-sm font-semibold text-foreground mb-2 block">Dialysis?</Label>
          <RadioGroup value={dialysis} onValueChange={setDialysis} className="space-y-2">
            {["No", "Yes"].map((d) => (
              <label
                key={d}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                  dialysis === d.toLowerCase()
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                }`}
              >
                <RadioGroupItem value={d.toLowerCase()} />
                <span className="text-sm font-medium text-foreground">{d}</span>
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* Calculate Button */}
        <Button
          onClick={handleCalculate}
          className="w-full h-12 text-base font-bold rounded-xl mt-2"
        >
          Calculate
        </Button>
      </motion.div>

      <BottomNav />
    </div>
  );
};

const FieldGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Label className="text-sm font-semibold text-foreground mb-2 block">{label}</Label>
    {children}
  </div>
);

export default SteroidPage;
