import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import PreciseLogo from "@/components/PreciseLogo";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", userType: "" as string, customUserId: "", acceptedTerms: false });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"details" | "otp">("details");
  const [loading, setLoading] = useState(false);
  const update = (key: string, value: string | boolean) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) { toast({ title: "Full name is required", variant: "destructive" }); return; }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast({ title: "Please enter a valid email", variant: "destructive" }); return; }
    if (!form.userType) { toast({ title: "Please select a user type", variant: "destructive" }); return; }
    if (!form.acceptedTerms) { toast({ title: "You must accept the Terms and Privacy Policy", variant: "destructive" }); return; }

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
          body: JSON.stringify({
            email: form.email.trim(),
            full_name: form.fullName.trim(),
            user_type: form.userType,
            custom_user_id: form.customUserId || null,
            accepted_terms: form.acceptedTerms,
          }),
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
          body: JSON.stringify({ email: form.email.trim(), code: otp }),
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

      toast({ title: "Account created!", description: "Welcome to PreciseDM." });
      navigate("/home");
    } catch (err: any) {
      toast({ title: err.message || "Verification failed", variant: "destructive" });
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "h-12 rounded-2xl bg-card border-border shadow-sm";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col px-8 pt-12 pb-12 bg-background">
      <div className="flex justify-center mb-6"><PreciseLogo size={56} /></div>
      <h1 className="text-2xl font-extrabold text-foreground text-center tracking-tight">Create your account</h1>

      <AnimatePresence mode="wait">
        {step === "details" && (
          <motion.form key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            onSubmit={handleSendOtp} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs text-muted-foreground font-medium">Full Name</Label>
              <Input id="fullName" placeholder="John Doe" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signupEmail" className="text-xs text-muted-foreground font-medium">Email Address</Label>
              <Input id="signupEmail" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium">User Type</Label>
              <Select value={form.userType} onValueChange={(v) => update("userType", v)}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Select user type" /></SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="practitioner">Practitioner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customUserId" className="text-xs text-muted-foreground font-medium">User ID (optional)</Label>
              <Input id="customUserId" placeholder="e.g. Hospital ID" value={form.customUserId} onChange={(e) => update("customUserId", e.target.value)} className={inputClass} />
            </div>
            <div className="flex items-start gap-3 pt-1">
              <Checkbox id="terms" checked={form.acceptedTerms} onCheckedChange={(checked) => update("acceptedTerms", !!checked)} className="mt-0.5" />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-snug">I accept the <Link to="/w/terms" className="text-primary font-semibold hover:underline">Terms and Conditions</Link> and <Link to="/w/privacy" className="text-primary font-semibold hover:underline">Privacy Policy</Link></label>
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
              Enter the 6-digit code sent to <span className="font-semibold text-foreground">{form.email}</span>
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
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying...</> : "Verify & Create Account"}
            </Button>
            <div className="flex justify-between items-center">
              <button onClick={() => { setStep("details"); setOtp(""); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
              <button onClick={handleSendOtp} disabled={loading} className="text-sm text-primary font-medium hover:underline">
                Resend code
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="text-primary font-semibold">Login</Link></p>
    </motion.div>
  );
};

export default SignUpPage;
