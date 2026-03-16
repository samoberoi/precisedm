import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";
import { ChevronLeft, Phone, Mail, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import connectHero from "@/assets/connect-hero.jpg";

const ConnectPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !email.trim() || !message.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: { phone: phone.trim(), email: email.trim(), message: message.trim(), userName: user?.user_metadata?.full_name || "Anonymous" },
      });
      if (error) throw error;
      toast({ title: "Message sent successfully!" });
      setPhone(""); setEmail(""); setMessage("");
    } catch {
      toast({ title: "Failed to send message. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const { firstName } = useProfile();

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-sm">
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Connect</h1>
        <div className="w-10" />
      </div>

      {/* Hero */}
      <div className="px-5 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl h-[180px]"
          style={{
            background: "linear-gradient(135deg, hsl(197 50% 85%), hsl(197 40% 75%), hsl(200 30% 65%))",
          }}
        >
          <img src={connectHero} alt="Connect" className="absolute inset-0 w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(200,30%,18%)]/80 to-transparent" />
          <div className="relative z-10 flex flex-col justify-end h-full p-6">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Get in touch</p>
            <h2 className="text-2xl font-extrabold text-white leading-tight mt-1">
              Connect<br />With Us
            </h2>
          </div>
        </motion.div>
      </div>

      {/* Contact Cards */}
      <div className="px-5 pt-5 grid grid-cols-2 gap-3">
        <a href="tel:612-916-4059" className="flex flex-col items-start rounded-2xl bg-card border border-border shadow-sm p-4 active:scale-[0.97] transition-transform">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-3">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-bold text-foreground">Call Us</p>
          <p className="text-xs text-muted-foreground mt-0.5">612-916-4059</p>
        </a>
        <a href="mailto:precise.diabetes@gmail.com" className="flex flex-col items-start rounded-2xl bg-[hsl(200,30%,18%)] shadow-lg p-4 active:scale-[0.97] transition-transform">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary mb-3">
            <Mail className="h-5 w-5 text-primary-foreground" />
          </div>
          <p className="text-sm font-bold text-white">Email Us</p>
          <p className="text-xs text-white/60 mt-0.5 break-all">precise.diabetes@gmail.com</p>
        </a>
      </div>

      {/* Contact Form */}
      <div className="px-5 pt-5">
        <h2 className="text-[22px] font-extrabold text-foreground tracking-tight mb-4">Send a Message</h2>
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs text-muted-foreground font-medium">Phone Number</Label>
            <Input id="phone" type="tel" placeholder="Enter Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="rounded-2xl border-border bg-card h-12 shadow-sm" maxLength={20} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs text-muted-foreground font-medium">Email Address</Label>
            <Input id="email" type="email" placeholder="Enter Email Address" value={email} onChange={(e) => setEmail(e.target.value)}
              className="rounded-2xl border-border bg-card h-12 shadow-sm" maxLength={255} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-xs text-muted-foreground font-medium">Message</Label>
            <Textarea id="message" placeholder="Enter Your Message.." value={message} onChange={(e) => setMessage(e.target.value)}
              className="rounded-2xl border-border bg-card min-h-[110px] shadow-sm" maxLength={1000} />
          </div>
          <Button type="submit" disabled={loading}
            className="w-full rounded-2xl py-6 text-base font-bold gradient-primary glow-primary">
            {loading ? "Sending..." : "Submit"}
          </Button>
        </motion.form>
      </div>
    </div>
  );
};

export default ConnectPage;
