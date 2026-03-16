import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PreciseLogo from "@/components/PreciseLogo";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

const resetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get("type") !== "recovery" && !hashParams.get("access_token")) {}
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault(); setErrors({});
    const result = resetSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => { if (err.path[0]) fieldErrors[err.path[0] as string] = err.message; });
      setErrors(fieldErrors); return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Password updated", description: "You can now sign in with your new password." }); await supabase.auth.signOut(); navigate("/login"); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col px-8 pt-16 bg-background">
      <div className="flex justify-center mb-8"><PreciseLogo size={56} /></div>
      <h1 className="text-2xl font-extrabold text-foreground text-center tracking-tight">Set new password</h1>

      <form onSubmit={handleReset} className="mt-8 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="newPassword" className="text-xs text-muted-foreground font-medium">New Password</Label>
          <div className="relative">
            <Input id="newPassword" type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-2xl bg-card border-border shadow-sm pr-12" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmNewPassword" className="text-xs text-muted-foreground font-medium">Confirm Password</Label>
          <Input id="confirmNewPassword" type="password" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-12 rounded-2xl bg-card border-border shadow-sm" />
          {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
        </div>
        <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl text-base font-bold gradient-primary glow-primary">
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </motion.div>
  );
};

export default ResetPasswordPage;
