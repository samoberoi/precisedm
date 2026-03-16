import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PreciseLogo from "@/components/PreciseLogo";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const result = z.string().trim().email().safeParse(email);
    if (!result.success) { setError("Please enter a valid email address"); return; }
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setLoading(false);
    if (resetError) { toast({ title: "Error", description: resetError.message, variant: "destructive" }); }
    else { setSent(true); toast({ title: "Email sent", description: "Check your inbox for the reset link." }); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col px-8 pt-16 bg-background">
      <Link to="/login" className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Login
      </Link>
      <div className="flex justify-center mb-8"><PreciseLogo size={56} /></div>
      <h1 className="text-2xl font-extrabold text-foreground text-center tracking-tight">Reset your password</h1>
      <p className="mt-2 text-muted-foreground text-center text-sm">Enter your email and we'll send you a reset link.</p>

      {sent ? (
        <div className="mt-8 text-center">
          <p className="text-foreground font-medium">Check your email</p>
          <p className="mt-2 text-sm text-muted-foreground">We've sent a password reset link to <strong>{email}</strong></p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="resetEmail" className="text-xs text-muted-foreground font-medium">Email Address</Label>
            <Input id="resetEmail" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-2xl bg-card border-border shadow-sm" />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl text-base font-bold gradient-primary glow-primary">
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      )}
    </motion.div>
  );
};

export default ForgotPasswordPage;
