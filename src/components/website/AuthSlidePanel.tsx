import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Check, User, Mail, Sparkles, CreditCard, Crown, Zap, Loader2, GraduationCap, Building2, IdCard } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getPaymentRedirectBaseUrl, shouldUseWebsitePaymentRoutes } from "@/lib/website-routes";
import logoIcon from "@/assets/logo-icon.png";

interface AuthSlidePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "login" | "signup";
}

type Step = "login" | "login-otp" | "signup-name" | "signup-email" | "signup-otp" | "signup-plan" | "signup-student-info" | "success";

const standardPlans = [
  { id: "trial", name: "Free Trial", price: "Free", period: "7 days", icon: Zap, desc: "Try all features for 7 days", gradient: "from-emerald-500 to-teal-600" },
  { id: "monthly", name: "Monthly", price: "$10", period: "/month", icon: CreditCard, desc: "Full access, billed monthly", gradient: "from-primary to-blue-600" },
  { id: "yearly", name: "Yearly", price: "$72", period: "/year", icon: Crown, desc: "Best value — save 40%", gradient: "from-amber-500 to-orange-600", badge: "Best Value" },
];

const studentPlans = [
  { id: "trial", name: "Free Trial", price: "Free", period: "7 days", icon: Zap, desc: "Try all features for 7 days", gradient: "from-emerald-500 to-teal-600" },
  { id: "student_monthly", name: "Student Monthly", price: "$4.99", period: "/month", icon: GraduationCap, desc: "Discounted monthly for students", gradient: "from-primary to-blue-600" },
  { id: "student_yearly", name: "Student Yearly", price: "$54", period: "/year", icon: Crown, desc: "Best student value — save 10%", gradient: "from-amber-500 to-orange-600", badge: "Best Value" },
];

const AuthSlidePanel = ({ open, onOpenChange, mode: initialMode = "login" }: AuthSlidePanelProps) => {
  const [step, setStep] = useState<Step>(initialMode === "signup" ? "signup-name" : "login");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("trial");
  const [planAudience, setPlanAudience] = useState<"practitioner" | "student">("practitioner");
  const [college, setCollege] = useState("");
  const [studentIdNumber, setStudentIdNumber] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const { toast } = useToast();
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (open) {
      setStep(initialMode === "signup" ? "signup-name" : "login");
      setEmail(""); setFullName(""); setOtp("");
      setLoading(false); setSelectedPlan("trial");
      setPlanAudience("practitioner");
      setCollege(""); setStudentIdNumber("");
      setConfirmed(false);
    }
  }, [open, initialMode]);

  const sendOtp = async (extraData?: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
          body: JSON.stringify({ email: email.trim(), full_name: fullName.trim(), ...extraData }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");
      toast({ title: "Code sent!", description: "Check your email for the verification code." });
      return true;
    } catch (err: any) {
      toast({ title: err.message || "Failed to send code", variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
          body: JSON.stringify({ email: email.trim(), code: otp }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");

      if (data.action_link) {
        const url = new URL(data.action_link);
        const token_hash = url.searchParams.get("token_hash") || url.searchParams.get("token");
        if (token_hash) {
          const { error } = await supabase.auth.verifyOtp({ token_hash, type: "magiclink" });
          if (error) throw error;
        }
      }
      return data;
    } catch (err: any) {
      toast({ title: err.message || "Verification failed", variant: "destructive" });
      setOtp("");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleLoginOtp = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Please enter a valid email", variant: "destructive" }); return;
    }
    if (!confirmed) {
      toast({ title: "Please confirm the practitioner declaration to continue", variant: "destructive" }); return;
    }
    const ok = await sendOtp();
    if (ok) { goNext(); setStep("login-otp"); }
  };

  const handleLoginVerify = async () => {
    const data = await verifyOtp();
    if (data) {
      toast({ title: "Welcome back! You're now logged in." });
      onOpenChange(false);
    }
  };

  const handleSignupSendOtp = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Please enter a valid email", variant: "destructive" }); return;
    }
    const ok = await sendOtp();
    if (ok) { goNext(); setStep("signup-otp"); }
  };

  const handleSignupVerify = async () => {
    const data = await verifyOtp();
    if (data) {
      if (data.is_new_user) {
        goNext(); setStep("signup-plan");
      } else {
        toast({ title: "Welcome back!" });
        onOpenChange(false);
      }
    }
  };

  const startPaypalCheckout = async (planType: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");
    const appMode = window.location.pathname.startsWith("/subscription") && !window.location.pathname.startsWith("/subscription-plans");
    const baseUrl = getPaymentRedirectBaseUrl();
    const useWebsiteRoutes = shouldUseWebsitePaymentRoutes();
    const returnPath = useWebsiteRoutes ? "/subscription-plans/success" : appMode ? "/subscription/success" : "/subscription-plans/success";
    const cancelPath = useWebsiteRoutes ? "/subscription-plans" : appMode ? "/subscription" : "/subscription-plans";
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paypal-subscription?action=create`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ plan_type: planType, return_url: `${baseUrl}${returnPath}`, cancel_url: `${baseUrl}${cancelPath}` }),
      }
    );
    const data = await res.json();
    if (data.approve_url) { window.location.href = data.approve_url; return; }
    throw new Error(data.error || "Could not create subscription");
  };

  const handlePlanSelect = async () => {
    // Student plans require college + student ID before checkout
    if (selectedPlan === "student_monthly" || selectedPlan === "student_yearly") {
      goNext(); setStep("signup-student-info");
      return;
    }
    setLoading(true);
    try {
      if (selectedPlan === "trial") {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from("subscriptions").insert({
            user_id: session.user.id, plan_type: "trial", status: "active",
            start_date: new Date().toISOString(),
            next_billing_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }
        goNext(); setStep("success");
      } else {
        await startPaypalCheckout(selectedPlan);
      }
    } catch (err: any) {
      toast({ title: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentInfoSubmit = async () => {
    if (!college.trim() || !studentIdNumber.trim()) {
      toast({ title: "Please enter your college/university and student ID", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");
      const { error } = await supabase.from("profiles").update({
        user_type: "student",
        college: college.trim(),
        student_id_number: studentIdNumber.trim(),
      }).eq("id", session.user.id);
      if (error) throw error;
      await startPaypalCheckout(selectedPlan);
    } catch (err: any) {
      toast({ title: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const signupSteps = [
    { key: "signup-name" as Step, num: 1, label: "Name" },
    { key: "signup-email" as Step, num: 2, label: "Email" },
    { key: "signup-otp" as Step, num: 3, label: "Verify" },
    { key: "signup-plan" as Step, num: 4, label: "Plan" },
  ];

  const currentStepIndex = signupSteps.findIndex(s => s.key === step);
  const isSignupFlow = step.startsWith("signup") || step === "success";

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  const goNext = () => setDirection(1);
  const goBack = () => setDirection(-1);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto bg-background border-l border-border p-0 [&>button]:hidden">
        <div className="flex flex-col h-full min-h-[500px]">
          <div className="px-6 pt-8 pb-4">
            <div className="flex items-center gap-3">
              <img src={logoIcon} alt="PreciseDM" className="h-10 w-10 rounded-full" />
              <span className="text-lg font-extrabold text-foreground tracking-tight">PreciseDM</span>
            </div>
          </div>

          {isSignupFlow && step !== "success" && (
            <div className="px-6 pb-4">
              <div className="flex items-center gap-1.5">
                {signupSteps.map((s, i) => (
                  <div key={s.key} className="flex items-center gap-1.5">
                    <div className={`flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-bold transition-all ${
                      i < currentStepIndex ? "gradient-primary text-primary-foreground" :
                      i === currentStepIndex ? "bg-primary/15 text-primary ring-2 ring-primary/30" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {i < currentStepIndex ? <Check className="h-3 w-3" /> : s.num}
                    </div>
                    <span className={`text-[10px] font-medium hidden sm:inline ${i === currentStepIndex ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                    {i < signupSteps.length - 1 && <div className={`h-px w-4 ${i < currentStepIndex ? "bg-primary" : "bg-border"}`} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 px-6 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {/* LOGIN - Email */}
              {step === "login" && (
                <motion.div key="login" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <h2 className="text-2xl font-extrabold text-foreground mb-1">Welcome Back</h2>
                  <p className="text-sm text-muted-foreground mb-6">Enter your email and we'll send you a verification code.</p>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                          className="rounded-xl h-11 border-border bg-card pl-10"
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleLoginOtp(); } }} autoFocus />
                      </div>
                    </div>
                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-card border border-border cursor-pointer">
                      <Checkbox
                        checked={confirmed}
                        onCheckedChange={(v) => setConfirmed(v === true)}
                        className="mt-0.5"
                      />
                      <span className="text-xs text-muted-foreground leading-relaxed">
                        I confirm that I am a licensed medical practitioner, accept full responsibility for using this website's information, and will abide by professional ethics and data privacy laws as per the law of the land.
                      </span>
                    </label>
                    <Button onClick={handleLoginOtp} disabled={loading || !confirmed} className="w-full rounded-xl h-12 font-bold gradient-primary glow-primary text-base">
                      {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</> : <>Send Code <ArrowRight className="ml-2 h-4 w-4" /></>}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* LOGIN - OTP */}
              {step === "login-otp" && (
                <motion.div key="login-otp" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <h2 className="text-2xl font-extrabold text-foreground mb-1">Enter Code</h2>
                  <p className="text-sm text-muted-foreground mb-6">We sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span></p>
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <InputOTP maxLength={6} value={otp} onChange={setOtp} onComplete={handleLoginVerify}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <Button onClick={handleLoginVerify} disabled={loading || otp.length !== 6} className="w-full rounded-xl h-12 font-bold gradient-primary glow-primary text-base">
                      {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying...</> : <>Verify & Sign In <ArrowRight className="ml-2 h-4 w-4" /></>}
                    </Button>
                    <div className="flex justify-between items-center">
                      <button onClick={() => { goBack(); setStep("login"); setOtp(""); }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-3 w-3" /> Change email
                      </button>
                      <button onClick={handleLoginOtp} disabled={loading} className="text-xs text-primary font-medium hover:underline">Resend code</button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SIGNUP Step 1: Name */}
              {step === "signup-name" && (
                <motion.div key="signup-name" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <h2 className="text-2xl font-extrabold text-foreground mb-1">What's your name?</h2>
                  <p className="text-sm text-muted-foreground mb-6">Let's get started with the basics.</p>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Dr. Jane Smith" value={fullName} onChange={(e) => setFullName(e.target.value)}
                          className="rounded-xl h-12 border-border bg-card pl-10 text-base"
                          onKeyDown={(e) => { if (e.key === "Enter" && fullName.trim()) { goNext(); setStep("signup-email"); } }} autoFocus />
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        if (!fullName.trim()) { toast({ title: "Please enter your name", variant: "destructive" }); return; }
                        goNext(); setStep("signup-email");
                      }}
                      className="w-full rounded-xl h-12 font-bold gradient-primary glow-primary text-base"
                    >
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* SIGNUP Step 2: Email */}
              {step === "signup-email" && (
                <motion.div key="signup-email" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <h2 className="text-2xl font-extrabold text-foreground mb-1">Your email address</h2>
                  <p className="text-sm text-muted-foreground mb-6">We'll send a verification code to confirm your email.</p>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                          className="rounded-xl h-12 border-border bg-card pl-10 text-base"
                          onKeyDown={(e) => { if (e.key === "Enter" && email.trim()) handleSignupSendOtp(); }} autoFocus />
                      </div>
                    </div>
                    <Button onClick={handleSignupSendOtp} disabled={loading} className="w-full rounded-xl h-12 font-bold gradient-primary glow-primary text-base">
                      {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</> : <>Send Code <ArrowRight className="ml-2 h-4 w-4" /></>}
                    </Button>
                    <button onClick={() => { goBack(); setStep("signup-name"); }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mx-auto">
                      <ArrowLeft className="h-3 w-3" /> Back
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SIGNUP Step 3: OTP Verify */}
              {step === "signup-otp" && (
                <motion.div key="signup-otp" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <h2 className="text-2xl font-extrabold text-foreground mb-1">Verify your email</h2>
                  <p className="text-sm text-muted-foreground mb-6">Enter the 6-digit code sent to <span className="font-semibold text-foreground">{email}</span></p>
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <InputOTP maxLength={6} value={otp} onChange={setOtp} onComplete={handleSignupVerify}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <Button onClick={handleSignupVerify} disabled={loading || otp.length !== 6} className="w-full rounded-xl h-12 font-bold gradient-primary glow-primary text-base">
                      {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying...</> : <>Verify <ArrowRight className="ml-2 h-4 w-4" /></>}
                    </Button>
                    <div className="flex justify-between items-center">
                      <button onClick={() => { goBack(); setStep("signup-email"); setOtp(""); }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-3 w-3" /> Back
                      </button>
                      <button onClick={handleSignupSendOtp} disabled={loading} className="text-xs text-primary font-medium hover:underline">Resend code</button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SIGNUP Step 4: Plan */}
              {step === "signup-plan" && (
                <motion.div key="signup-plan" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <h2 className="text-2xl font-extrabold text-foreground mb-1">Choose your plan</h2>
                  <p className="text-sm text-muted-foreground mb-4">Start with a free trial or pick a plan that suits you.</p>

                  {/* Audience toggle */}
                  <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-muted mb-4">
                    {(["practitioner", "student"] as const).map((aud) => (
                      <button
                        key={aud}
                        type="button"
                        onClick={() => {
                          setPlanAudience(aud);
                          setSelectedPlan("trial");
                        }}
                        className={`flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-semibold transition-all ${
                          planAudience === aud ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {aud === "student" && <GraduationCap className="h-3.5 w-3.5" />}
                        {aud === "practitioner" ? "Practitioner" : "Student"}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3 mb-5">
                    {(planAudience === "student" ? studentPlans : standardPlans).map((plan) => (
                      <button key={plan.id} onClick={() => setSelectedPlan(plan.id)}
                        className={`w-full flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                          selectedPlan === plan.id ? "border-primary bg-primary/5 shadow-md" : "border-border bg-card hover:border-primary/30"
                        }`}>
                        <div className={`flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br ${plan.gradient} text-white shrink-0`}>
                          <plan.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">{plan.name}</span>
                            {plan.badge && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full">{plan.badge}</span>}
                          </div>
                          <p className="text-xs text-muted-foreground">{plan.desc}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-lg font-extrabold text-foreground">{plan.price}</span>
                          <span className="text-xs text-muted-foreground">{plan.period}</span>
                        </div>
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selectedPlan === plan.id ? "border-primary bg-primary" : "border-muted-foreground/30"
                        }`}>
                          {selectedPlan === plan.id && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                      </button>
                    ))}
                  </div>
                  <Button onClick={handlePlanSelect} disabled={loading} className="w-full rounded-xl h-12 font-bold gradient-primary glow-primary text-base">
                    {loading ? "Processing..." : selectedPlan === "trial" ? "Start Free Trial" : "Continue"} {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </motion.div>
              )}

              {/* SIGNUP Student Info: only for student plans */}
              {step === "signup-student-info" && (
                <motion.div key="signup-student-info" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <h2 className="text-2xl font-extrabold text-foreground mb-1">Verify your student status</h2>
                  <p className="text-sm text-muted-foreground mb-5">Required for the student plan. Your details help us confirm eligibility.</p>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">College / University</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="e.g. Johns Hopkins University" value={college} onChange={(e) => setCollege(e.target.value)}
                          className="rounded-xl h-12 border-border bg-card pl-10 text-base" autoFocus />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Student ID Number</Label>
                      <div className="relative">
                        <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Your student ID" value={studentIdNumber} onChange={(e) => setStudentIdNumber(e.target.value)}
                          className="rounded-xl h-12 border-border bg-card pl-10 text-base"
                          onKeyDown={(e) => { if (e.key === "Enter") handleStudentInfoSubmit(); }} />
                      </div>
                    </div>
                    <Button onClick={handleStudentInfoSubmit} disabled={loading} className="w-full rounded-xl h-12 font-bold gradient-primary glow-primary text-base">
                      {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</> : <>Continue to Payment <ArrowRight className="ml-2 h-4 w-4" /></>}
                    </Button>
                    <button onClick={() => { goBack(); setStep("signup-plan"); }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mx-auto">
                      <ArrowLeft className="h-3 w-3" /> Back to plans
                    </button>
                  </div>
                </motion.div>
              )}


              {/* SUCCESS */}
              {step === "success" && (
                <motion.div key="success" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <div className="flex flex-col items-center text-center py-8">
                    <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mb-6">
                      <Sparkles className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-foreground mb-2">You're all set!</h2>
                    <p className="text-sm text-muted-foreground mb-8 max-w-xs">Your account is ready. Enjoy full access to PreciseDM's precision calculators.</p>
                    <Button onClick={() => { toast({ title: "Welcome to PreciseDM!" }); onOpenChange(false); }}
                      className="rounded-xl h-12 font-bold gradient-primary glow-primary text-base px-8">
                      Start Exploring <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom toggle */}
          {(step === "login" || step === "login-otp" || step === "signup-name" || step === "signup-email") && (
            <div className="px-6 pb-8 pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                {step.startsWith("login") ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={() => {
                    setOtp("");
                    if (step.startsWith("login")) { goNext(); setStep("signup-name"); }
                    else { goBack(); setStep("login"); }
                  }}
                  className="text-primary font-semibold hover:underline"
                >
                  {step.startsWith("login") ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AuthSlidePanel;
