import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ArrowRight, ArrowLeft, Check, User, Mail, Lock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logoIcon from "@/assets/logo-icon.png";

interface AuthSlidePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "login" | "signup";
  redirectTo?: string;
}

type Step = "login" | "signup-name" | "signup-email" | "signup-password" | "success";

const AuthSlidePanel = ({ open, onOpenChange, mode: initialMode = "login", redirectTo }: AuthSlidePanelProps) => {
  const [step, setStep] = useState<Step>(initialMode === "signup" ? "signup-name" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Reset when panel opens
  useEffect(() => {
    if (open) {
      setStep(initialMode === "signup" ? "signup-name" : "login");
      setEmail("");
      setPassword("");
      setFullName("");
      setShowPassword(false);
      setLoading(false);
    }
  }, [open, initialMode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      // Check admin
      const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
      toast({ title: "Welcome back!" });
      onOpenChange(false);
      navigate(isAdmin ? "/admin" : (redirectTo || "/home"));
    } catch (err: any) {
      toast({ title: err.message || "Login failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName.trim() } },
      });
      if (error) throw error;
      setStep("success");
    } catch (err: any) {
      toast({ title: err.message || "Signup failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const signupSteps: { key: Step; num: number; label: string }[] = [
    { key: "signup-name", num: 1, label: "Name" },
    { key: "signup-email", num: 2, label: "Email" },
    { key: "signup-password", num: 3, label: "Password" },
  ];

  const currentStepIndex = signupSteps.findIndex(s => s.key === step);
  const isSignupFlow = step.startsWith("signup") || step === "success";

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);

  const goNext = () => { setDirection(1); };
  const goBack = () => { setDirection(-1); };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto bg-background border-l border-border p-0 [&>button]:hidden">
        <div className="flex flex-col h-full min-h-[500px]">
          {/* Logo header */}
          <div className="px-6 pt-8 pb-4">
            <div className="flex items-center gap-3">
              <img src={logoIcon} alt="PreciseDM" className="h-10 w-10 rounded-full" />
              <span className="text-lg font-extrabold text-foreground tracking-tight">Precise DM</span>
            </div>
          </div>

          {/* Step indicator for signup */}
          {isSignupFlow && step !== "success" && (
            <div className="px-6 pb-4">
              <div className="flex items-center gap-2">
                {signupSteps.map((s, i) => (
                  <div key={s.key} className="flex items-center gap-2">
                    <div className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold transition-all ${
                      i < currentStepIndex ? "gradient-primary text-primary-foreground" :
                      i === currentStepIndex ? "bg-primary/15 text-primary ring-2 ring-primary/30" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {i < currentStepIndex ? <Check className="h-3.5 w-3.5" /> : s.num}
                    </div>
                    <span className={`text-xs font-medium hidden sm:inline ${
                      i === currentStepIndex ? "text-foreground" : "text-muted-foreground"
                    }`}>{s.label}</span>
                    {i < signupSteps.length - 1 && <div className={`h-px w-6 ${i < currentStepIndex ? "bg-primary" : "bg-border"}`} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content area */}
          <div className="flex-1 px-6 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {/* ─── LOGIN ─── */}
              {step === "login" && (
                <motion.div key="login" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <h2 className="text-2xl font-extrabold text-foreground mb-1">Welcome Back</h2>
                  <p className="text-sm text-muted-foreground mb-6">Sign in to access your calculators and saved results.</p>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                          className="rounded-xl h-11 border-border bg-card pl-10" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                          className="rounded-xl h-11 border-border bg-card pl-10 pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <button type="button" onClick={() => { onOpenChange(false); navigate("/forgot-password"); }} className="text-xs text-primary hover:underline">
                      Forgot password?
                    </button>
                    <Button type="submit" disabled={loading} className="w-full rounded-xl h-12 font-bold gradient-primary glow-primary text-base">
                      {loading ? "Signing in..." : "Sign In"} {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* ─── SIGNUP STEP 1: Name ─── */}
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

              {/* ─── SIGNUP STEP 2: Email ─── */}
              {step === "signup-email" && (
                <motion.div key="signup-email" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <h2 className="text-2xl font-extrabold text-foreground mb-1">Your email address</h2>
                  <p className="text-sm text-muted-foreground mb-6">We'll use this for your account login.</p>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                          className="rounded-xl h-12 border-border bg-card pl-10 text-base"
                          onKeyDown={(e) => { if (e.key === "Enter" && email.trim()) { goNext(); setStep("signup-password"); } }} autoFocus />
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast({ title: "Please enter a valid email", variant: "destructive" }); return; }
                        goNext(); setStep("signup-password");
                      }}
                      className="w-full rounded-xl h-12 font-bold gradient-primary glow-primary text-base"
                    >
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <button onClick={() => { goBack(); setStep("signup-name"); }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mx-auto">
                      <ArrowLeft className="h-3 w-3" /> Back
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ─── SIGNUP STEP 3: Password ─── */}
              {step === "signup-password" && (
                <motion.div key="signup-password" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <h2 className="text-2xl font-extrabold text-foreground mb-1">Set a password</h2>
                  <p className="text-sm text-muted-foreground mb-6">Choose a strong password (min 6 characters).</p>

                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                          className="rounded-xl h-12 border-border bg-card pl-10 pr-10 text-base" autoFocus />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {password.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className={`h-1 flex-1 rounded-full ${password.length >= 6 ? "bg-primary" : "bg-border"}`} />
                          <div className={`h-1 flex-1 rounded-full ${password.length >= 8 ? "bg-primary" : "bg-border"}`} />
                          <div className={`h-1 flex-1 rounded-full ${password.length >= 10 ? "bg-primary" : "bg-border"}`} />
                          <span className="text-xs text-muted-foreground ml-1">{password.length >= 10 ? "Strong" : password.length >= 8 ? "Good" : password.length >= 6 ? "OK" : "Weak"}</span>
                        </div>
                      )}
                    </div>
                    <Button type="submit" disabled={loading} className="w-full rounded-xl h-12 font-bold gradient-primary glow-primary text-base">
                      {loading ? "Creating account..." : "Create Account"} {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                    <button type="button" onClick={() => { goBack(); setStep("signup-email"); }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mx-auto">
                      <ArrowLeft className="h-3 w-3" /> Back
                    </button>
                  </form>
                </motion.div>
              )}

              {/* ─── SUCCESS ─── */}
              {step === "success" && (
                <motion.div key="success" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <div className="flex flex-col items-center text-center py-8">
                    <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mb-6">
                      <Sparkles className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-foreground mb-2">You're all set!</h2>
                    <p className="text-sm text-muted-foreground mb-8 max-w-xs">
                      Your account has been created. You can now log in and start using Precise DM's precision calculators.
                    </p>
                    <Button
                      onClick={() => { setStep("login"); setPassword(""); }}
                      className="rounded-xl h-12 font-bold gradient-primary glow-primary text-base px-8"
                    >
                      Log In Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom toggle */}
          {step !== "success" && (
            <div className="px-6 pb-8 pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                {step === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={() => {
                    if (step === "login") { goNext(); setStep("signup-name"); }
                    else { goBack(); setStep("login"); }
                  }}
                  className="text-primary font-semibold hover:underline"
                >
                  {step === "login" ? "Sign Up" : "Sign In"}
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
