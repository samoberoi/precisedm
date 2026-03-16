import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";
import { Info, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
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
        body: {
          phone: phone.trim(),
          email: email.trim(),
          message: message.trim(),
          userName: user?.user_metadata?.full_name || "Anonymous",
        },
      });

      if (error) throw error;

      toast({ title: "Message sent successfully!" });
      setPhone("");
      setEmail("");
      setMessage("");
    } catch (err) {
      toast({ title: "Failed to send message. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const { firstName } = useProfile();

  return (
    <div className="min-h-screen gradient-surface pb-28">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <div>
          <p className="text-sm text-muted-foreground">Hello !!</p>
          <h2 className="text-xl font-bold text-foreground">{firstName}</h2>
        </div>
        <button
          onClick={() => navigate("/disclaimer")}
          className="flex h-10 w-10 items-center justify-center rounded-full glass-card"
        >
          <Info className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <div className="px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-foreground mb-4"
        >
          Connect With Us
        </motion.h1>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl overflow-hidden mb-6 relative"
        >
          <img src={connectHero} alt="Connect with us" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
        </motion.div>

        {/* Contact Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-muted-foreground text-xs">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-xl border-border bg-card/60 backdrop-blur-sm h-12"
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground text-xs">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border-border bg-card/60 backdrop-blur-sm h-12"
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-muted-foreground text-xs">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter Your Message.."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="rounded-xl border-border bg-card/60 backdrop-blur-sm min-h-[120px]"
              maxLength={1000}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full py-6 text-base font-semibold gradient-primary glow-primary"
          >
            {loading ? "Sending..." : "Submit"}
          </Button>
        </motion.form>

        {/* Divider */}
        <div className="flex justify-center my-6">
          <div className="w-24 h-1 rounded-full bg-border" />
        </div>

        {/* Contact Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <a
            href="tel:612-916-4059"
            className="flex items-center gap-4 rounded-2xl glass-card p-4 hover:border-primary/30 transition-colors"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-primary">
              <Phone className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Give Us A Call</h3>
              <p className="text-sm text-muted-foreground">612-916-4059</p>
            </div>
          </a>

          <a
            href="mailto:precise.diabetes@gmail.com"
            className="flex items-center gap-4 rounded-2xl glass-card p-4 hover:border-primary/30 transition-colors"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-primary">
              <Mail className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Send Us A Message</h3>
              <p className="text-sm text-muted-foreground">precise.diabetes@gmail.com</p>
            </div>
          </a>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ConnectPage;
