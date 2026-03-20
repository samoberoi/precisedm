import { useNavigate } from "react-router-dom";
import { Check, Crown, Zap, Gift, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/website/ScrollReveal";

const plans = [
  {
    id: "trial", name: "Free Trial", price: "$0", period: "7 days", icon: Gift,
    desc: "Try everything free for 7 days",
    features: ["All 4 calculators", "Saved calculation history", "No credit card required", "Expires after 7 days"],
    gradient: "linear-gradient(135deg, hsl(270,60%,50%), hsl(290,55%,40%))",
    cta: "Start Free Trial",
  },
  {
    id: "monthly", name: "Monthly", price: "$1", period: "month", icon: Zap,
    desc: "Perfect for trying out our tools",
    features: ["All 4 calculators", "Saved calculation history", "Priority support", "Cancel anytime"],
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
  { q: "What happens after the free trial?", a: "After your 7-day free trial, you'll need to subscribe to a monthly or yearly plan to continue accessing the calculators." },
  { q: "Is there a refund policy?", a: "Since our plans start at just $1/month, we don't offer refunds, but you can cancel at any time." },
  { q: "What payment methods do you accept?", a: "We accept payments through PayPal, which supports credit cards, debit cards, and PayPal balance." },
];

const PricingPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <section className="py-24 lg:py-32" style={{ background: "linear-gradient(160deg, hsl(197 50% 92%), hsl(200 20% 98%))" }}>
        <div className="mx-auto max-w-[1440px] px-6 xl:px-10 text-center">
          <ScrollReveal>
            <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl lg:text-6xl tracking-tight">Simple, Transparent<br /><span className="text-gradient">Pricing</span></h1>
            <p className="mt-6 text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">Start free, then choose the plan that works for you.</p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 xl:px-10">
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan, i) => {
              const isDark = !!plan.gradient;
              return (
                <ScrollReveal key={plan.id} delay={i * 0.1}>
                  <div
                    className={`relative rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 h-full ${isDark ? "text-white" : "bg-card border border-border"}`}
                    style={isDark ? { background: plan.gradient } : undefined}
                  >
                    {plan.badge && (
                      <span className="absolute -top-3 left-5 gradient-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">{plan.badge}</span>
                    )}
                    <plan.icon className="h-9 w-9 mb-5 text-primary" />
                    <h3 className={`text-xl font-bold mb-1 ${isDark ? "text-white" : "text-foreground"}`}>{plan.name}</h3>
                    <p className={`text-sm mb-5 ${isDark ? "text-white/60" : "text-muted-foreground"}`}>{plan.desc}</p>
                    <div className="mb-6">
                      <span className={`text-5xl font-extrabold ${isDark ? "text-white" : "text-foreground"}`}>{plan.price}</span>
                      <span className={`text-sm ml-1 ${isDark ? "text-white/50" : "text-muted-foreground"}`}>/ {plan.period}</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((f) => (
                        <li key={f} className={`flex items-center gap-2 text-sm ${isDark ? "text-white/80" : "text-muted-foreground"}`}>
                          <Check className="h-4 w-4 text-primary shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full rounded-xl h-14 font-bold text-base ${isDark ? "bg-white text-foreground hover:bg-white/90" : "gradient-primary glow-primary text-primary-foreground"}`}
                      onClick={() => navigate("/w")}
                    >
                      {plan.cta}
                    </Button>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
          <ScrollReveal delay={0.2}>
            <div className="flex items-center justify-center gap-8 mt-12">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Shield className="h-4 w-4" /> Secure Payment</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4" /> Cancel Anytime</div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-accent/30">
        <div className="mx-auto max-w-4xl px-6 xl:px-10">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">Pricing FAQs</h2>
          </ScrollReveal>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="rounded-2xl bg-card border border-border p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-base font-bold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
