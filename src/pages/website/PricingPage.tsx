import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check, Crown, Zap, Gift, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

const plans = [
  {
    id: "trial", name: "Free Trial", price: "$0", period: "7 days", icon: Gift,
    desc: "Try everything free for 7 days",
    features: ["All 4 calculators", "Educational videos", "No credit card required", "Expires after 7 days"],
    gradient: "linear-gradient(135deg, hsl(270,60%,50%), hsl(290,55%,40%))",
    cta: "Start Free Trial",
  },
  {
    id: "monthly", name: "Monthly", price: "$1", period: "month", icon: Zap,
    desc: "Perfect for trying out our tools",
    features: ["All 4 calculators", "Educational videos", "Saved calculation history", "Cancel anytime"],
    gradient: "",
    cta: "Subscribe Monthly",
  },
  {
    id: "yearly", name: "Yearly", price: "$12", period: "year", icon: Crown, badge: "Best Value",
    desc: "Best value — save with annual billing",
    features: ["Everything in Monthly", "12 months access", "Priority access to new tools", "Cancel anytime"],
    gradient: "linear-gradient(135deg, hsl(200,30%,18%), hsl(200,25%,12%))",
    cta: "Subscribe Yearly",
  },
];

const faqs = [
  { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time through PayPal. Your access will continue until the end of your billing period." },
  { q: "What happens after the free trial?", a: "After your 7-day free trial, you'll need to subscribe to a monthly or yearly plan to continue accessing the calculators and videos." },
  { q: "Is there a refund policy?", a: "Since our plans start at just $1/month, we don't offer refunds, but you can cancel at any time." },
  { q: "What payment methods do you accept?", a: "We accept payments through PayPal, which supports credit cards, debit cards, and PayPal balance." },
];

const PricingPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero */}
      <section className="py-20 lg:py-24" style={{ background: "linear-gradient(135deg, hsl(197 50% 92%), hsl(200 20% 98%))" }}>
        <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center">
          <motion.div {...fadeUp}>
            <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl tracking-tight">Simple, Transparent<br /><span className="text-gradient">Pricing</span></h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">Start free, then choose the plan that works for you.</p>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan, i) => {
              const isDark = !!plan.gradient;
              return (
                <motion.div key={plan.id} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`relative rounded-2xl p-6 shadow-lg ${isDark ? "text-white" : "bg-card border border-border"}`}
                  style={isDark ? { background: plan.gradient } : undefined}
                >
                  {plan.badge && (
                    <span className="absolute -top-3 left-5 gradient-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">{plan.badge}</span>
                  )}
                  <plan.icon className={`h-8 w-8 mb-4 ${isDark ? "text-primary" : "text-primary"}`} />
                  <h3 className={`text-xl font-bold mb-1 ${isDark ? "text-white" : "text-foreground"}`}>{plan.name}</h3>
                  <p className={`text-sm mb-4 ${isDark ? "text-white/60" : "text-muted-foreground"}`}>{plan.desc}</p>
                  <div className="mb-5">
                    <span className={`text-4xl font-extrabold ${isDark ? "text-white" : "text-foreground"}`}>{plan.price}</span>
                    <span className={`text-sm ml-1 ${isDark ? "text-white/50" : "text-muted-foreground"}`}>/ {plan.period}</span>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex items-center gap-2 text-sm ${isDark ? "text-white/80" : "text-muted-foreground"}`}>
                        <Check className="h-4 w-4 text-primary shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full rounded-xl h-11 font-bold ${isDark ? "bg-white text-foreground hover:bg-white/90" : "gradient-primary glow-primary text-primary-foreground"}`}
                    onClick={() => navigate("/signup")}
                  >
                    {plan.cta}
                  </Button>
                </motion.div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-10">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Shield className="h-4 w-4" /> Secure Payment</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4" /> Cancel Anytime</div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-24 bg-accent/30">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-foreground">Pricing FAQs</h2>
          </motion.div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.05, duration: 0.5 }}
                className="rounded-2xl bg-card border border-border p-5 shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
