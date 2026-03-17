import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calculator, Zap, BookOpen, Shield, History, UserCheck, Printer, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import diaformIcon from "@/assets/diaform-card-icon.png";
import gestationIcon from "@/assets/gestation-card-icon.png";
import maintenanceIcon from "@/assets/maintenance-icon.png";
import steroidIcon from "@/assets/steroid-icon.png";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

const allFeatures = [
  { icon: Calculator, title: "4 Precision Calculators", desc: "DiaForm, Gestation, Maintenance, and Steroid dosing tools covering every clinical scenario." },
  { icon: Zap, title: "Instant Results", desc: "Evidence-based algorithms deliver recommended dosage ranges in seconds." },
  { icon: BookOpen, title: "Educational Videos", desc: "Guided video tutorials to help healthcare providers master insulin dosing." },
  { icon: Shield, title: "Secure Data", desc: "Your patient data is handled with care and stored securely." },
  { icon: History, title: "Saved History", desc: "Review past calculations and track your usage over time." },
  { icon: UserCheck, title: "Professional Grade", desc: "Built by PharmD experts for licensed healthcare professionals." },
  { icon: Printer, title: "Print Results", desc: "Generate printable reports for patient records and documentation." },
  { icon: BarChart3, title: "Smart Analytics", desc: "Understand dosing patterns and outcomes with built-in insights." },
];

const calculatorDetails = [
  { name: "DiaForm", desc: "4-step wizard for initial insulin dosing. Dual-unit support, MDRD eGFR calculation, BMI categorization, and 50/50 Basal-Prandial TDD split.", icon: diaformIcon, gradient: "linear-gradient(135deg, hsl(210,80%,50%), hsl(210,90%,40%))" },
  { name: "Gestation", desc: "Specialized calculator for insulin dosing during pregnancy, with trimester-specific adjustments and gestational diabetes support.", icon: gestationIcon, gradient: "linear-gradient(135deg, hsl(15,80%,55%), hsl(10,75%,45%))" },
  { name: "Maintenance", desc: "Ongoing dose adjustment using Insulin Sensitivity Factor (ISF = 1800/TDD), hypoglycemia history, and blood glucose levels.", icon: maintenanceIcon, gradient: "linear-gradient(135deg, hsl(45,85%,50%), hsl(35,80%,42%))" },
  { name: "Steroid", desc: "Calculate insulin requirements for steroid-induced hyperglycemia with dosage and steroid type considerations.", icon: steroidIcon, gradient: "linear-gradient(135deg, hsl(200,30%,22%), hsl(200,25%,15%))" },
];

const FeaturesPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero */}
      <section className="py-20 lg:py-24" style={{ background: "linear-gradient(135deg, hsl(197 50% 92%), hsl(200 20% 98%))" }}>
        <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center">
          <motion.div {...fadeUp}>
            <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl tracking-tight">Powerful Features for<br /><span className="text-gradient">Precision Dosing</span></h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">Everything you need to individualize insulin therapy with confidence and accuracy.</p>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {allFeatures.map((f, i) => (
              <motion.div key={f.title} {...fadeUp} transition={{ delay: i * 0.05, duration: 0.5 }}
                className="rounded-2xl bg-card border border-border p-6 shadow-sm hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator Details */}
      <section className="py-20 lg:py-24 bg-accent/30">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">Calculator Deep Dive</h2>
            <p className="mt-3 text-lg text-muted-foreground">Each tool is purpose-built for a specific clinical scenario.</p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2">
            {calculatorDetails.map((c, i) => (
              <motion.div key={c.name} {...fadeUp} transition={{ delay: i * 0.08, duration: 0.5 }}
                className="relative rounded-2xl p-6 text-white shadow-lg overflow-hidden" style={{ background: c.gradient }}>
                <img src={c.icon} alt={c.name} className="absolute top-4 right-4 h-16 w-16 object-contain opacity-15" />
                <h3 className="text-xl font-bold mb-2">{c.name}</h3>
                <p className="text-sm text-white/70 leading-relaxed max-w-sm">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl mb-4">Experience It Yourself</h2>
            <p className="text-lg text-muted-foreground mb-8">Start your free trial and access all features today.</p>
            <Button size="lg" onClick={() => navigate("/signup")} className="rounded-xl gradient-primary glow-primary font-bold text-base h-12 px-8">
              Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
