import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/* ════════════════════════════════════════════════════════════
   PROPRIETARY CALCULATION LOGIC — SERVER-SIDE ONLY
   ════════════════════════════════════════════════════════════ */

// ── DiaForm (Initial Dosing) ──

const doseRanges: Record<string, { low: number; high: number; label: string }> = {
  MB1: { low: 0.15, high: 0.18, label: "MB1 (0.15–0.18 units/kg)" },
  MB2: { low: 0.18, high: 0.23, label: "MB2 (0.18–0.23 units/kg)" },
  MB3: { low: 0.23, high: 0.28, label: "MB3 (0.23–0.28 units/kg)" },
  MB4: { low: 0.28, high: 0.33, label: "MB4 (0.28–0.33 units/kg)" },
  GC1: { low: 0.10, high: 0.15, label: "GC1 (0.10–0.15 units/kg)" },
  GC2: { low: 0.15, high: 0.20, label: "GC2 (0.15–0.20 units/kg)" },
  DLS1: { low: 0.10, high: 0.15, label: "DLS1 (0.10–0.15 units/kg)" },
};

function calculateDiaform(form: Record<string, string>) {
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
    heightInches: Math.round(heightIn * 10) / 10, scrMgDl: Math.round(scrMgDl * 100) / 100,
  };
}

// ── Steroid ──

function calculateSteroid(form: Record<string, string>) {
  const ageNum = parseFloat(form.age);
  const weightLbs = parseFloat(form.weight);
  const feet = parseFloat(form.heightFeet);
  const inches = parseFloat(form.heightInches) || 0;
  const a1cNum = parseFloat(form.a1c);
  const scr = parseFloat(form.serumCreatinine);
  const gender = form.gender;
  const dialysis = form.dialysis;

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

// ── Maintenance ──

function avgOfProvided(values: string[]): number | null {
  const nums = values.map((v) => parseFloat(v)).filter((v) => !isNaN(v) && v > 0);
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function calculateMaintenance(form: Record<string, string>) {
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
    else if (basalBGAvg < 40) { basalRecommendation = `Decrease current basal dose by ${Math.round(bd * 0.2)} - ${Math.round(bd * 0.3)} units`; }
    else if (basalBGAvg <= 70) { basalRecommendation = `Decrease current basal dose by ${Math.round(bd * 0.1)} - ${Math.round(bd * 0.15)} units`; }
    else { basalRecommendation = "ERROR: Your average BG is above 70 meaning no hypoglycemia occurred."; isBasalError = true; }
  } else {
    if (fbg >= 140) {
      const delta = (fbg - 100) / isf;
      const lower = Math.round(delta - 1);
      const upper = Math.round(delta + 1);
      basalRecommendation = lower < 1 ? "No change to basal insulin dose." : `Increase current basal dose by ${lower} - ${upper} units`;
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
      else if (prandialBGAvg < 40) { prandialRecommendation = `Decrease current prandial dose per meal by ${Math.round(pd * 0.2)} - ${Math.round(pd * 0.3)} units`; }
      else if (prandialBGAvg <= 70) { prandialRecommendation = `Decrease current prandial dose per meal by ${Math.round(pd * 0.1)} - ${Math.round(pd * 0.15)} units`; }
      else { prandialRecommendation = "ERROR: Your average BG is above 70 meaning no hypoglycemia occurred."; isPrandialError = true; }
    } else {
      if (pbg >= 140) {
        const delta = (pbg - 100) / isf;
        const deltaMeal = delta / 3;
        let lower = Math.round(deltaMeal - 1); let upper = Math.round(deltaMeal + 1);
        if (lower < 1) lower = 1; if (upper < 2) upper = 2;
        prandialRecommendation = `Increase current prandial dose per meal by ${lower} - ${upper} units`;
      } else if (pbg >= 71) { prandialRecommendation = "No change to prandial insulin dose."; }
      else { prandialRecommendation = "You had hypoglycemia. Please go back and select YES."; isPrandialError = true; }
    }
  }

  return {
    basalRecommendation, isBasalError, prandialRecommendation, isPrandialError,
    basalBGAvg: basalBGAvg !== null ? Math.round(basalBGAvg * 10) / 10 : null,
    prandialBGAvg: prandialBGAvg !== null ? Math.round(prandialBGAvg * 10) / 10 : null,
    tdd, isf,
  };
}

// ── Gestation ──

function calculateGestation(form: Record<string, string>) {
  const bd = parseFloat(form.basalDose);
  const fbg = parseFloat(form.fastingBG);
  const ctd = parseFloat(form.correctionDose) || 0;
  const pv1 = parseFloat(form.breakfastDose) || 0;
  const pv2 = parseFloat(form.lunchDose) || 0;
  const pv3 = parseFloat(form.dinnerDose) || 0;
  const pdt = pv1 + pv2 + pv3;
  let npd = 0;
  if (pv1 > 0) npd++; if (pv2 > 0) npd++; if (pv3 > 0) npd++;
  if (npd === 0) npd = 1;
  const tdd = bd + pdt + ctd;
  let isf = Math.round(1800 / tdd);
  if (isf <= 9) isf = 10;

  let basalRecommendation: string;
  let isBasalError = false;
  const basalHypo = form.basalHypo === "yes";
  const basalBGAvg = basalHypo ? avgOfProvided([form.basalBG1, form.basalBG2, form.basalBG3, form.basalBG4]) : null;

  if (basalHypo) {
    if (basalBGAvg === null) { basalRecommendation = "ERROR: No values for hypoglycemia episodes were given."; isBasalError = true; }
    else if (basalBGAvg <= 40) { basalRecommendation = `Decrease current basal dose by ${Math.round(bd * 0.2)} - ${Math.round(bd * 0.3)} units`; }
    else if (basalBGAvg <= 69) { basalRecommendation = `Decrease current basal dose by ${Math.round(bd * 0.1)} - ${Math.round(bd * 0.15)} units`; }
    else { basalRecommendation = "ERROR: Your average BG is above 69 meaning no hypoglycemia occurred."; isBasalError = true; }
  } else {
    if (fbg >= 96) {
      let delta: number;
      if (isf >= 60) delta = (fbg - 75) / 50;
      else if (isf >= 51) delta = (fbg - 75) / 30;
      else delta = (fbg - 70) / 30;
      if (delta < 0.5) { basalRecommendation = "No change to basal insulin dose."; }
      else { let lower = Math.round(delta); const upper = Math.round(delta + 1); if (lower < 1) lower = 1; basalRecommendation = `Increase current basal dose by ${lower} - ${upper} units`; }
    } else if (fbg >= 78) { basalRecommendation = "No change to basal insulin dose."; }
    else if (fbg >= 70) { basalRecommendation = `Decrease current basal dose by ${Math.round(bd * 0.1)} - ${Math.round(bd * 0.15)} units`; }
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
      if (prandialBGAvg === null) { prandialRecommendation = "ERROR: No values for hypoglycemia episodes were given."; isPrandialError = true; }
      else if (prandialBGAvg <= 40) {
        const perMealLow = Math.round(Math.round(pdt * 0.4) / npd);
        const perMealHigh = Math.round(Math.round(pdt * 0.6) / npd);
        prandialRecommendation = `Decrease meal dose by ${perMealLow} - ${perMealHigh} units per meal`;
      } else if (prandialBGAvg <= 69) {
        const perMealLow = Math.round(Math.round(pdt * 0.15) / npd);
        const perMealHigh = Math.round(Math.round(pdt * 0.3) / npd);
        prandialRecommendation = `Decrease meal dose by ${perMealLow} - ${perMealHigh} units per meal`;
      } else { prandialRecommendation = "ERROR: Your average BG is above 69 meaning no hypoglycemia occurred."; isPrandialError = true; }
    } else {
      if (pbg >= 120) {
        let delta: number;
        if (isf > 50) delta = (pbg - 90) / 40; else delta = (pbg - 90) / 30;
        const deltaMeal = delta / npd;
        let lower = Math.round(deltaMeal); if (lower < 1) lower = 1;
        const upper = lower + 1;
        prandialRecommendation = `Increase current prandial dose per meal by ${lower} - ${upper} units`;
      } else if (pbg >= 96) { prandialRecommendation = "No change to prandial insulin dose."; }
      else if (pbg >= 70) {
        const perMealLow = Math.round(Math.round(pdt * 0.1) / npd);
        const perMealHigh = Math.round(Math.round(pdt * 0.3) / npd);
        prandialRecommendation = `Decrease meal dose by ${perMealLow} - ${perMealHigh} units per meal`;
      } else { prandialRecommendation = "You had hypoglycemia. Please go back and select YES."; isPrandialError = true; }
    }
  }

  return {
    basalRecommendation, isBasalError, prandialRecommendation, isPrandialError,
    basalBGAvg: basalBGAvg !== null ? Math.round(basalBGAvg * 10) / 10 : null,
    prandialBGAvg: prandialBGAvg !== null ? Math.round(prandialBGAvg * 10) / 10 : null,
    pdt, npd, tdd, isf,
  };
}

/* ════════════════════════════════════════════════════════════
   REQUEST HANDLER
   ════════════════════════════════════════════════════════════ */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check active subscription OR admin role
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("status, next_billing_date")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gt("next_billing_date", new Date().toISOString())
        .maybeSingle();

      if (!sub) {
        return new Response(JSON.stringify({ error: "Active subscription required" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Parse request
    const { form_type, inputs } = await req.json();
    if (!form_type || !inputs) {
      return new Response(JSON.stringify({ error: "Missing form_type or inputs" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Route to correct calculator
    let results: Record<string, unknown>;
    switch (form_type) {
      case "diaform":
        results = calculateDiaform(inputs);
        break;
      case "steroid":
        results = calculateSteroid(inputs);
        break;
      case "maintenance":
        results = calculateMaintenance(inputs);
        break;
      case "gestation":
        results = calculateGestation(inputs);
        break;
      default:
        return new Response(JSON.stringify({ error: `Unknown form_type: ${form_type}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Save submission server-side
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    await supabaseAdmin.from("form_submissions").insert({
      user_id: user.id,
      form_type,
      inputs,
      results,
    });

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Calculate error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
