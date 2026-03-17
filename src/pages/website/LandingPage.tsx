import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Shield, Zap, BookOpen, Calculator, Play, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroDoctor from "@/assets/hero-doctor.jpg";
import diaformIcon from "@/assets/diaform-card-icon.png";
import gestationIcon from "@/assets/gestation-card-icon.png";
import maintenanceIcon from "@/assets/maintenance-icon.png";
import steroidIcon from "@/assets/steroid-icon.png";
import drColleenCook from "@/assets/dr-colleen-cook.jpg";
import drMelanieProctor from "@/assets/dr-melanie-proctor.jpg";
import drSuzanneChung from "@/assets/dr-suzanne-chung.jpg";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

const features = [
  { icon: Calculator, title: "Advanced Calculators", desc: "4 precision insulin dosing calculators for different clinical scenarios." },
  { icon: Zap, title: "Instant Results", desc: "Calculate recommended dosages in seconds with evidence-based algorithms." },
  { icon: BookOpen, title: "Educational Videos", desc: "Learn insulin dosing techniques through guided video tutorials." },
  { icon: Shield, title: "Secure & Reliable", desc: "HIPAA-aware design with saved history and secure data handling." },
];

const calculators = [
  { name: "DiaForm", desc: "Initial Insulin Dosing", icon: diaformIcon, gradient: "linear-gradient(135deg, hsl(210,80%,50%), hsl(210,90%,40%))" },
  { name: "Gestation", desc: "Pregnancy Care Dosing", icon: gestationIcon, gradient: "linear-gradient(135deg, hsl(15,80%,55%), hsl(10,75%,45%))" },
  { name: "Maintenance", desc: "Ongoing Dose Adjustments", icon: maintenanceIcon, gradient: "linear-gradient(135deg, hsl(45,85%,50%), hsl(35,80%,42%))" },
  { name: "Steroid", desc: "Steroid-Induced Dosing", icon: steroidIcon, gradient: "linear-gradient(135deg, hsl(200,30%,22%), hsl(200,25%,15%))" },
];

const steps = [
  { num: "01", title: "Create Account", desc: "Sign up in seconds with your email." },
  { num: "02", title: "Subscribe", desc: "Choose a plan or start with a free trial." },
  { num: "03", title: "Fill Forms", desc: "Enter patient data into our precision calculators." },
  { num: "04", title: "Get Results", desc: "Receive individualized insulin dosage recommendations." },
];

const team = [
  { img: drColleenCook, name: "Dr. Colleen Cook", title: "PharmD, BC-ADM, CDCES", role: "CEO" },
  { img: drMelanieProctor, name: "Dr. Melanie Proctor", title: "PharmD, BCGP", role: "COO" },
  { img: drSuzanneChung, name: "Dr. Suzanne Chung", title: "PhD Analytical Chemistry", role: "COO" },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(135deg, hsl(197 50% 92%), hsl(197 30% 96%), hsl(200 20% 98%))" }} />
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div {...fadeUp}>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-6">
                <Zap className="h-3.5 w-3.5" /> Precision Insulin Dosing
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.1]">
                Individualize Insulin Dosing with{" "}
                <span className="text-gradient">Confidence</span>
              </h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-lg leading-relaxed">
                An innovative toolkit for trained healthcare providers to quickly and accurately determine starting and maintenance insulin doses across clinical scenarios.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => navigate("/signup")} className="rounded-xl gradient-primary glow-primary font-bold text-base h-12 px-7">
                  Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/w/features")} className="rounded-xl font-bold text-base h-12 px-7">
                  Explore Features
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-primary" /> Free 7-day trial</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-primary" /> No credit card</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-primary" /> Cancel anytime</div>
              </div>
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.15, duration: 0.5 }} className="relative">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl" style={{ background: "linear-gradient(135deg, hsl(197 50% 85%), hsl(197 40% 75%))" }}>
                <img src={heroDoctor} alt="Healthcare professional" className="h-[400px] w-full object-cover object-top lg:h-[480px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="absolute -bottom-5 -left-5 rounded-2xl bg-card border border-border shadow-xl p-4 hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                    <Calculator className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">4 Calculators</p>
                    <p className="text-xs text-muted-foreground">Precision dosing tools</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">Why Choose Precise DM?</h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">Built by pharmacists and clinical experts to transform diabetes care delivery.</p>
          </motion.div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div key={f.title} {...fadeUp} transition={{ delay: i * 0.08, duration: 0.5 }}
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

      {/* Calculators Preview */}
      <section className="py-20 lg:py-24 bg-accent/30">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">Our Calculator Suite</h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">Four precision tools covering the full spectrum of insulin dosing needs.</p>
          </motion.div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {calculators.map((c, i) => (
              <motion.div key={c.name} {...fadeUp} transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group relative overflow-hidden rounded-2xl p-6 text-white shadow-lg hover:scale-[1.02] transition-transform cursor-pointer"
                style={{ background: c.gradient, minHeight: 180 }}
                onClick={() => navigate("/signup")}
              >
                <h3 className="text-lg font-bold">{c.name}</h3>
                <p className="text-sm text-white/60 mt-1">{c.desc}</p>
                <img src={c.icon} alt={c.name} className="absolute bottom-4 right-4 h-14 w-14 object-contain opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-white/80">
                  Try it <ChevronRight className="h-4 w-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">How It Works</h2>
            <p className="mt-3 text-lg text-muted-foreground">Four simple steps to precision dosing.</p>
          </motion.div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div key={s.num} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.5 }} className="text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary text-xl font-extrabold mb-4">
                  {s.num}
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 lg:py-24 bg-accent/30">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">Meet Our Team</h2>
            <p className="mt-3 text-lg text-muted-foreground">Clinical experts dedicated to improving diabetes care.</p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
            {team.map((t, i) => (
              <motion.div key={t.name} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-lg transition-shadow">
                <img src={t.img} alt={t.name} className="h-64 w-full object-cover" />
                <div className="p-5">
                  <h3 className="text-base font-bold text-foreground">{t.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.title}</p>
                  <p className="text-xs text-primary font-semibold mt-1">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl mb-4">Ready to Transform Diabetes Care?</h2>
            <p className="text-lg text-muted-foreground mb-8">Start your free 7-day trial today. No credit card required.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={() => navigate("/signup")} className="rounded-xl gradient-primary glow-primary font-bold text-base h-12 px-8">
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/w/pricing")} className="rounded-xl font-bold text-base h-12 px-8">
                View Pricing
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
