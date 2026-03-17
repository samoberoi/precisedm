import { useState } from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import ScrollReveal from "@/components/website/ScrollReveal";

const WebsiteContactPage = () => {
  const { user } = useAuth();
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
        body: { phone: phone.trim(), email: email.trim(), message: message.trim(), userName: user?.user_metadata?.full_name || "Website Visitor" },
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

  return (
    <div>
      <section className="py-24 lg:py-32" style={{ background: "linear-gradient(160deg, hsl(197 50% 92%), hsl(200 20% 98%))" }}>
        <div className="mx-auto max-w-[1440px] px-6 xl:px-10 text-center">
          <ScrollReveal>
            <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl lg:text-6xl tracking-tight">Get in <span className="text-gradient">Touch</span></h1>
            <p className="mt-6 text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">Have questions or feedback? We'd love to hear from you.</p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-[1440px] px-6 xl:px-10">
          <div className="grid gap-14 lg:grid-cols-2">
            <ScrollReveal>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-foreground mb-8">Contact Information</h2>
              <div className="space-y-6">
                {[
                  { icon: Phone, label: "Phone", value: "612-916-4059", href: "tel:612-916-4059" },
                  { icon: Mail, label: "Email", value: "precise.diabetes@gmail.com", href: "mailto:precise.diabetes@gmail.com" },
                  { icon: MapPin, label: "Location", value: "United States", href: undefined },
                ].map((c) => (
                  <div key={c.label} className="flex items-start gap-4">
                    <div className="h-13 w-13 shrink-0 rounded-xl gradient-primary flex items-center justify-center">
                      <c.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{c.label}</p>
                      {c.href ? (
                        <a href={c.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">{c.value}</a>
                      ) : (
                        <p className="text-sm text-muted-foreground">{c.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="rounded-2xl bg-card border border-border p-8 lg:p-10 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-bold text-foreground mb-6">Send a Message</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs text-muted-foreground font-medium">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="Enter Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="rounded-xl border-border bg-background h-12" maxLength={20} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs text-muted-foreground font-medium">Email Address</Label>
                    <Input id="email" type="email" placeholder="Enter Email Address" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="rounded-xl border-border bg-background h-12" maxLength={255} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-xs text-muted-foreground font-medium">Message</Label>
                    <Textarea id="message" placeholder="Enter Your Message..." value={message} onChange={(e) => setMessage(e.target.value)}
                      className="rounded-xl border-border bg-background min-h-[140px]" maxLength={1000} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full rounded-xl h-12 font-bold gradient-primary glow-primary text-base">
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WebsiteContactPage;
