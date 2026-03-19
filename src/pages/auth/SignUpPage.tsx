import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PreciseLogo from "@/components/PreciseLogo";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

const signUpSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  userType: z.enum(["student", "practitioner"], { required_error: "Select a user type" }),
  customUserId: z.string().max(100).optional(),
  acceptedTerms: z.literal(true, { errorMap: () => ({ message: "You must accept the Terms and Privacy Policy" }) }),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

const SignUpPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "", userType: "" as string, customUserId: "", acceptedTerms: false });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const update = (key: string, value: string | boolean) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault(); setErrors({});
    const result = signUpSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => { if (err.path[0]) fieldErrors[err.path[0] as string] = err.message; });
      setErrors(fieldErrors); return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: form.fullName, user_type: form.userType, custom_user_id: form.customUserId || null, accepted_terms: true } },
    });
    setLoading(false);
    if (error) { toast({ title: "Registration failed", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Registration successful", description: "Check your email to verify your account." }); navigate("/login"); }
  };

  const inputClass = "h-12 rounded-2xl bg-card border-border shadow-sm";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col px-8 pt-12 pb-12 bg-background">
      <div className="flex justify-center mb-6"><PreciseLogo size={56} /></div>
      <h1 className="text-2xl font-extrabold text-foreground text-center tracking-tight">Create your account</h1>

      <form onSubmit={handleSignUp} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-xs text-muted-foreground font-medium">Full Name</Label>
          <Input id="fullName" placeholder="John Doe" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className={inputClass} />
          {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signupEmail" className="text-xs text-muted-foreground font-medium">Email Address</Label>
          <Input id="signupEmail" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signupPassword" className="text-xs text-muted-foreground font-medium">Create Password</Label>
          <div className="relative">
            <Input id="signupPassword" type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={form.password} onChange={(e) => update("password", e.target.value)} className={`${inputClass} pr-12`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-xs text-muted-foreground font-medium">Confirm Password</Label>
          <div className="relative">
            <Input id="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="Re-enter password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} className={`${inputClass} pr-12`} />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
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
          {errors.userType && <p className="text-sm text-destructive">{errors.userType}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="customUserId" className="text-xs text-muted-foreground font-medium">User ID (optional)</Label>
          <Input id="customUserId" placeholder="e.g. Hospital ID" value={form.customUserId} onChange={(e) => update("customUserId", e.target.value)} className={inputClass} />
        </div>
        <div className="flex items-start gap-3 pt-1">
          <Checkbox id="terms" checked={form.acceptedTerms} onCheckedChange={(checked) => update("acceptedTerms", !!checked)} className="mt-0.5" />
          <label htmlFor="terms" className="text-sm text-muted-foreground leading-snug">I accept the <Link to="/w/terms" className="text-primary font-semibold hover:underline">Terms and Conditions</Link> and <Link to="/w/privacy" className="text-primary font-semibold hover:underline">Privacy Policy</Link></label>
        </div>
        {errors.acceptedTerms && <p className="text-sm text-destructive">{errors.acceptedTerms}</p>}
        <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl text-base font-bold gradient-primary glow-primary">
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="text-primary font-semibold">Login</Link></p>
    </motion.div>
  );
};

export default SignUpPage;
