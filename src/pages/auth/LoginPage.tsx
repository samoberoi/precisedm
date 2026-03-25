import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import PreciseLogo from "@/components/PreciseLogo";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setSkipMode } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
          body: JSON.stringify({ email: email.trim() }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");
      toast({ title: "Code sent!", description: "Check your email for the verification code." });
      setStep("otp");
    } catch (err: any) {
      toast({ title: err.message || "Failed to send code", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
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

      // Use the magic link to sign in
      if (data.action_link) {
        const url = new URL(data.action_link);
        const token_hash = url.searchParams.get("token_hash") || url.searchParams.get("token");
        if (token_hash) {
          const { error } = await supabase.auth.verifyOtp({ token_hash, type: "magiclink" });
          if (error) throw error;
        }
      }

      toast({ title: "Welcome to PreciseDM!" });
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: session.session.user.id, _role: "admin" });
        navigate(isAdmin ? "/admin" : "/home");
      } else {
        navigate("/home");
      }
    } catch (err: any) {
      toast({ title: err.message || "Verification failed", variant: "destructive" });
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => { setSkipMode(true); navigate("/home"); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col px-8 pt-16 bg-background">
      <div className="flex justify-center mb-10">
        <PreciseLogo size={64} />
      </div>

      <h1 className="text-2xl font-extrabold text-foreground text-center tracking-tight">
        Sign in to PreciseDM
      </h1>

      <AnimatePresence mode="wait">
        {step === "email" && (
          <motion.form key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            onSubmit={handleSendOtp} className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-muted-foreground font-medium">Email Address</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-2xl bg-card border-border shadow-sm" autoFocus />
            </div>
            <p className="text-xs text-muted-foreground">We'll send a 6-digit verification code to your email.</p>
            <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl text-base font-bold gradient-primary glow-primary">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</> : "Send Verification Code"}
            </Button>
          </motion.form>
        )}

        {step === "otp" && (
          <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="mt-8 space-y-5">
            <p className="text-sm text-muted-foreground text-center">
              Enter the 6-digit code sent to <span className="font-semibold text-foreground">{email}</span>
            </p>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp} onComplete={handleVerifyOtp}>
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
            <Button onClick={handleVerifyOtp} disabled={loading || otp.length !== 6} className="w-full h-12 rounded-2xl text-base font-bold gradient-primary glow-primary">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying...</> : "Verify & Sign In"}
            </Button>
            <div className="flex justify-between items-center">
              <button onClick={() => { setStep("email"); setOtp(""); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3 w-3" /> Change email
              </button>
              <button onClick={handleSendOtp} disabled={loading} className="text-sm text-primary font-medium hover:underline">
                Resend code
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={handleSkip} className="mt-4 text-sm text-muted-foreground underline underline-offset-2 mx-auto">Skip</button>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don't have an account? <Link to="/signup" className="text-primary font-semibold">Sign Up</Link>
      </p>
    </motion.div>
  );
};

export default LoginPage;
