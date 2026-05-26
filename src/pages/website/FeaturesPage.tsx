import { useNavigate } from "react-router-dom";
import { Calculator, Zap, BookOpen, Shield, History, UserCheck, Printer, BarChart3, ArrowRight, ChevronRight } from "lucide-react";
import Seo from "@/components/Seo";
import { getPageSeo } from "@/lib/seo-config";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/website/ScrollReveal";
import diaformIcon from "@/assets/diaform-card-icon.png";
import gestationIcon from "@/assets/gestation-card-icon.png";
import maintenanceIcon from "@/assets/maintenance-icon.png";
import steroidIcon from "@/assets/steroid-icon.png";

const highlights = [
  { icon: Calculator, title: "4 Precision Calculators", desc: "Customized Starting, Maintenance, Steroid and Gestation insulin dosing tools using patient-specific inputs.", accent: "hsl(210, 80%, 50%)" },
  { icon: Zap, title: "Instant Results", desc: "Evidence-based algorithms deliver recommended insulin dose ranges in seconds.", accent: "hsl(45, 85%, 50%)" },
  
  { icon: Shield, title: "Secure Data", desc: "Your patient data is handled with care and stored securely.", accent: "hsl(160, 60%, 45%)" },
  { icon: History, title: "Saved History", desc: "Review past calculations and track your usage over time.", accent: "hsl(197, 100%, 55%)" },
  { icon: UserCheck, title: "Professional Grade", desc: "Built by PharmD experts for licensed healthcare professionals.", accent: "hsl(270, 60%, 55%)" },
  
  { icon: BarChart3, title: "Smart Analytics", desc: "Understand dosing patterns and outcomes with built-in insights.", accent: "hsl(120, 50%, 45%)" },
];

const calculatorDetails = [
  { name: "Starting", subtitle: "Initial Insulin Dosing", desc: "4-step wizard for initial insulin dosing. Dual-unit support, MDRD eGFR calculation, BMI categorization, and 50/50 Basal-Prandial TDD split.", icon: diaformIcon, gradient: "linear-gradient(135deg, hsl(210,80%,50%), hsl(210,90%,40%))", features: ["Dual unit support", "MDRD eGFR calculation", "BMI categorization", "50/50 TDD split"] },
  { name: "Maintenance", subtitle: "Ongoing Insulin Dose Adjustments", desc: "Ongoing dose adjustment using Insulin Sensitivity Factor (ISF = 1800/TDD), hypoglycemia history, and blood glucose levels.", icon: maintenanceIcon, gradient: "linear-gradient(135deg, hsl(45,85%,50%), hsl(35,80%,42%))", features: ["ISF calculation", "Hypo history check", "BG level analysis", "Dose fine-tuning"] },
  { name: "Steroid", subtitle: "Insulin Dose Adjustments for Steroid-induced Hyperglycemia", desc: "Calculate insulin requirements for steroid-induced hyperglycemia with dosage and steroid type considerations.", icon: steroidIcon, gradient: "linear-gradient(135deg, hsl(200,30%,22%), hsl(200,25%,15%))", features: ["Steroid type aware", "Dose-dependent", "Category mapping", "Range output"] },
  { name: "Gestation", subtitle: "Insulin Dose Adjustments in Gestation Diabetes", desc: "Specialized calculator for insulin dosing during pregnancy, with trimester-specific adjustments and gestational diabetes support.", icon: gestationIcon, gradient: "linear-gradient(135deg, hsl(15,80%,55%), hsl(10,75%,45%))", features: ["Trimester-specific", "Gestational diabetes", "Weight adjustments", "Safety guardrails"] },
];

const FeaturesPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Seo page={getPageSeo("/features")!} />
      {/* Hero */}
      <section className="py-24 lg:py-32" style={{ background: "linear-gradient(160deg, hsl(197 50% 92%), hsl(200 20% 98%))" }}>
        <div className="mx-auto max-w-[1440px] px-6 xl:px-10 text-center">
          <ScrollReveal>
            <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl lg:text-6xl tracking-tight">Powerful Features for<br /><span className="text-gradient">Precision Dosing</span></h1>
            <p className="mt-6 text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">Everything you need to individualize insulin therapy with confidence and accuracy.</p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ Feature Highlights — Alternating rows ═══ */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-[1440px] px-6 xl:px-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 0.04}>
                <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 hover:shadow-xl transition-all duration-300 h-full">
                  <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-3xl" style={{ background: f.accent }} />
                  <div className="relative">
                    <div className="h-11 w-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${f.accent}15` }}>
                      <f.icon className="h-5 w-5" style={{ color: f.accent }} />
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-1.5">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: f.accent }} />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <ScrollReveal>
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl lg:text-5xl mb-5">Experience It Yourself</h2>
            <p className="text-lg text-muted-foreground mb-10">Start your free trial and access all features today.</p>
            <Button size="lg" onClick={() => navigate("/pricing")} className="rounded-xl gradient-primary glow-primary font-bold text-base h-14 px-10">
              Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
