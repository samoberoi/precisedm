import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import { getPageSeo } from "@/lib/seo-config";
import { ArrowRight, Check, Shield, Zap, BookOpen, Calculator, ChevronRight, Star, TrendingUp, Lock, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/website/ScrollReveal";
import AuthSlidePanel from "@/components/website/AuthSlidePanel";
import { useAuth } from "@/contexts/AuthContext";
import { motion, useInView } from "framer-motion";
import heroDoctor from "@/assets/hero-doctor.jpg";
import diaformIcon from "@/assets/diaform-card-icon.png";
import gestationIcon from "@/assets/gestation-card-icon.png";
import maintenanceIcon from "@/assets/maintenance-icon.png";
import steroidIcon from "@/assets/steroid-icon.png";
import drColleenCook from "@/assets/dr-colleen-cook.jpg";
import drMelanieProctor from "@/assets/dr-melanie-proctor.jpg";
import drSuzanneChung from "@/assets/dr-suzanne-chung.jpg";

const features = [
  { icon: Calculator, title: "Advanced Calculators", desc: "4 precision insulin dosing calculators for different clinical scenarios.", accent: "hsl(210, 80%, 50%)" },
  { icon: Zap, title: "Instant Results", desc: "Calculate recommended dosages in seconds with evidence-based algorithms.", accent: "hsl(45, 85%, 50%)" },
  
  { icon: Shield, title: "Secure & Reliable", desc: "Privacy-focused design with saved history and secure data handling.", accent: "hsl(160, 60%, 45%)" },
  { icon: TrendingUp, title: "Smart Analytics", desc: "Track dosing patterns and outcomes with built-in insights.", accent: "hsl(270, 60%, 55%)" },
  { icon: History, title: "Saved History", desc: "Review past calculations and track your usage over time.", accent: "hsl(197, 100%, 55%)" },
];

const calculators = [
  { name: "Starting", desc: "Initial Insulin Dosing", icon: diaformIcon, gradient: "linear-gradient(135deg, hsl(210,80%,50%), hsl(210,90%,40%))", route: "/diaform-tool" },
  { name: "Maintenance", desc: "Ongoing Dose Adjustments", icon: maintenanceIcon, gradient: "linear-gradient(135deg, hsl(45,85%,50%), hsl(35,80%,42%))", route: "/maintenance-tool" },
  { name: "Steroid", desc: "Steroid-Induced Dosing", icon: steroidIcon, gradient: "linear-gradient(135deg, hsl(200,30%,22%), hsl(200,25%,15%))", route: "/steroid-tool" },
  { name: "Gestation", desc: "Pregnancy Care Dosing", icon: gestationIcon, gradient: "linear-gradient(135deg, hsl(15,80%,55%), hsl(10,75%,45%))", route: "/gestation-tool" },
];

const steps = [
  { num: "01", title: "Create Account", desc: "Sign up in seconds with your email." },
  { num: "02", title: "Subscribe", desc: "Choose a plan or start with a free trial." },
  { num: "03", title: "Fill Forms", desc: "Enter patient data into our precision calculators." },
  { num: "04", title: "Get Results", desc: "Receive individualized insulin dosage recommendations." },
];

const team = [
  {
    img: drColleenCook,
    name: "Dr. Colleen Cook",
    title: "PharmD, BC-ADM, CDCES",
    role: "CEO",
    desc: "Colleen Cook is the co-owner of PreciseDM and inventor of the product called diaForm. She has 25+ years' experience working as a hospital pharmacist and has dedicated the last decade of her career to specializing in diabetes care and education. Her passion, energy and drive to enhance diabetes management, inspired her to develop an individualized insulin dosing calculator intended to be used by trained health care professionals, such as physicians, nurses, nurse practitioners, pharmacists and physician assistants. Her mission is to improve diabetes care in her community and to further impact the development of tools to enhance the efficiency of diabetes care to patients.",
  },
  {
    img: drMelanieProctor,
    name: "Dr. Melanie Proctor",
    title: "PharmD, BCGP",
    role: "COO",
    desc: "Melanie Proctor is a PharmD with a BCGP and has been practicing since 2004. She began as a clinical pharmacist at North Country Regional Hospital in Bemidji, MN. She worked for the Regional Hospital for 5 years before moving into Geriatric Pharmacy Consulting for Pharmerica in 2009. She continued consulting for Pharmerica and for various other pharmacies, eventually co-founding a company of her own called Progressive Care Solutions. She sold that company, along with her antibiotic tracking product abxtracker in 2019. She currently works as an inpatient clinical pharmacist at Ridgeview Hospital.",
  },
  {
    img: drSuzanneChung,
    name: "Dr. Suzanne Chung",
    title: "PhD Analytical Chemistry",
    role: "CFO",
    desc: "Suzanne Chung is an analytical chemist with 25+ years' experience in clinical diagnostics systems development and technical support. Her experience extends to medical device development processes and applicable regulatory requirements. She has planned and led feasibility, development verification and validation activities on cross-functional teams to demonstrate product viability design, investigated systemic problem areas to improve quality and customer satisfaction, and delivered results with recommendations to Management.",
  },
];

const stats = [
  { value: 4, label: "Precision Calculators", suffix: "" },
  { value: 3, label: "Clinical Experts", suffix: "+" },
  { value: 50, label: "Basal-Prandial Split", suffix: "/50" },
  { value: 24, label: "Access Anytime", suffix: "/7" },
];

// Animated counter component
const AnimatedCounter = ({ value, suffix, label }: { value: number; suffix: string; label: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = value;
    const duration = 1200;
    const stepTime = Math.max(Math.floor(duration / end), 30);
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl lg:text-4xl font-extrabold text-primary tabular-nums">
        {count}{suffix}
      </p>
      <p className="text-xs text-muted-foreground mt-1.5 font-medium">{label}</p>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");

  const handleCalcClick = (route: string) => {
    if (user) {
      navigate(route);
    } else {
      setAuthMode("signup");
      setAuthOpen(true);
    }
  };

  const handleCTA = () => {
    if (!user) {
      setAuthMode("signup");
      setAuthOpen(true);
    }
  };

  return (
    <div>
      <Seo page={getPageSeo("/")!} />
      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden py-16 lg:py-24 xl:py-28">
        <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(160deg, hsl(197 50% 92%), hsl(197 30% 96%) 40%, hsl(200 20% 98%))" }} />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/3 blur-3xl -z-10" />

        <div className="mx-auto max-w-[1440px] px-6 xl:px-10">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <ScrollReveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-xs font-semibold text-primary mb-6">
                <Zap className="h-3.5 w-3.5" /> Precision Insulin Dosing Platform
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.08]">
                Individualize Insulin Dosing with{" "}
                <span className="text-gradient">Confidence</span>
              </h1>
              <p className="mt-5 text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed">
                An innovative toolkit for trained healthcare providers to quickly and accurately determine starting and maintenance of insulin doses across clinical scenarios.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" onClick={handleCTA} className="rounded-xl gradient-primary glow-primary font-bold text-base h-14 px-10">
                  Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/features")} className="rounded-xl font-bold text-base h-14 px-10 border-2">
                  Explore Features
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-primary" /> Free 7-day trial</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-primary" /> No credit card</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-primary" /> Cancel anytime</div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div className="relative">
                <div className="relative overflow-hidden rounded-3xl shadow-2xl" style={{ background: "linear-gradient(135deg, hsl(197 50% 85%), hsl(197 40% 75%))" }}>
                  <img src={heroDoctor} alt="Healthcare professional using PreciseDM" className="h-[380px] w-full object-cover object-[center_20%] lg:h-[480px] xl:h-[520px]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="absolute -bottom-5 -left-5 rounded-2xl bg-card border border-border shadow-xl p-4 hidden lg:block">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl gradient-primary flex items-center justify-center">
                      <Calculator className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">4 Calculators</p>
                      <p className="text-xs text-muted-foreground">Precision dosing tools</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 rounded-2xl bg-card border border-border shadow-xl p-3 hidden lg:flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <span className="text-xs font-bold text-foreground">5.0</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ Stats Bar with Counting Animation ═══ */}
      <section className="py-10 border-y border-border/50 bg-card/50">
        <div className="mx-auto max-w-[1440px] px-6 xl:px-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s, i) => (
              <ScrollReveal key={s.label} delay={i * 0.08}>
                <AnimatedCounter value={s.value} suffix={s.suffix} label={s.label} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Features – Modern Bento Grid ═══ */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-6 xl:px-10">
          <ScrollReveal className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl lg:text-5xl">Why Choose PreciseDM?</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Built by pharmacists and clinical experts to transform diabetes care delivery.</p>
          </ScrollReveal>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 0.06}>
                <div className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-8 hover:shadow-xl transition-all duration-300 ${i === 0 ? "md:col-span-2 lg:col-span-1 lg:row-span-2" : ""} h-full`}>
                  <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-3xl" style={{ background: f.accent }} />
                  <div className="relative">
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${f.accent}15` }}>
                      <f.icon className="h-6 w-6" style={{ color: f.accent }} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: f.accent }} />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Calculators Preview ═══ */}
      <section className="py-20 lg:py-28 bg-accent/30">
        <div className="mx-auto max-w-[1440px] px-6 xl:px-10">
          <ScrollReveal className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl lg:text-5xl">Our Calculator Suite</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Four precision tools covering the full spectrum of insulin dosing needs.</p>
          </ScrollReveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {calculators.map((c, i) => (
              <ScrollReveal key={c.name} delay={i * 0.08}>
                <div
                  className="group relative overflow-hidden rounded-2xl p-7 text-white shadow-lg hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  style={{ background: c.gradient, minHeight: 200 }}
                  onClick={() => handleCalcClick(c.route)}
                >
                  <h3 className="text-lg font-bold">{c.name}</h3>
                  <p className="text-sm text-white/60 mt-1">{c.desc}</p>
                  <img src={c.icon} alt={c.name} className="absolute bottom-4 right-4 h-16 w-16 object-contain opacity-15 group-hover:opacity-40 transition-opacity duration-300" />
                  <div className="mt-8 flex items-center gap-1 text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                    Try it <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ How it works ═══ */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-6 xl:px-10">
          <ScrollReveal className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl lg:text-5xl">How It Works</h2>
            <p className="mt-4 text-lg text-muted-foreground">Four simple steps to precision dosing.</p>
          </ScrollReveal>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <ScrollReveal key={s.num} delay={i * 0.1}>
                <div className="text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary text-2xl font-extrabold mb-5">
                    {s.num}
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Team ═══ */}
      <section className="py-20 lg:py-28 bg-accent/30">
        <div className="mx-auto max-w-[1440px] px-6 xl:px-10">
          <ScrollReveal className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl lg:text-5xl">Meet Our Team</h2>
            <p className="mt-4 text-lg text-muted-foreground">Clinical experts dedicated to improving diabetes care.</p>
          </ScrollReveal>
          <div className="grid gap-8 sm:grid-cols-3 max-w-5xl mx-auto">
            {team.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 0.1}>
                <div className="rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-xl transition-shadow duration-300">
                  <img src={t.img} alt={t.name} className="h-72 w-full object-cover" />
                  <div className="p-6">
                    <h3 className="text-base font-bold text-foreground">{t.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.title}</p>
                    <p className="text-xs text-primary font-semibold mt-1">{t.role}</p>
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Reviews & Ratings ═══ */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-6 xl:px-10">
          <ScrollReveal className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl lg:text-5xl">What Healthcare Providers Say</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Trusted by clinical professionals across the country.</p>
          </ScrollReveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {[
              { name: "A. McWilliams, NP", role: "Nurse Practitioner", rating: 5, quote: "PreciseDM helped me prescribe an updated insulin regimen for my patient at discharge." },
              { name: "K. Thrift, NP", role: "Nurse Practitioner", rating: 5, quote: "The tool is easily accessible and user friendly. Makes prescribing insulin much simpler and accurate." },
              { name: "Dr. K. Jacobs, DO", role: "OB/GYN", rating: 5, quote: "The PreciseDM tool is tailored to individualize patient care in the management of gestational diabetes. It is easy to use and makes insulin adjustments easy during a busy clinic day." },
              { name: "Kim, NP", role: "Nurse Practitioner", rating: 5, quote: "The tool was easy to use and straightforward." },
              { name: "Hospitalist", role: "Hospitalist", rating: 5, quote: "The tool provided me with an appropriate insulin dose recommendation. The process was quick, easy and reliable." },
              { name: "Hospitalist", role: "Hospitalist", rating: 5, quote: "The tool is absolutely fantastic. I used it on my last shifts when I was doing rounds." },
            ].map((review, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <div className="rounded-2xl border border-border bg-card p-7 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  <div className="flex items-center gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className={`h-4 w-4 ${s < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 italic">"{review.quote}"</p>
                  <div className="mt-5 pt-4 border-t border-border">
                    <p className="text-sm font-bold text-foreground">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.role}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-20 lg:py-28 bg-accent/30">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <ScrollReveal>
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl lg:text-5xl mb-5">Ready to Transform Diabetes Care?</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">Start your free 7-day trial today. No credit card required.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={handleCTA} className="rounded-xl gradient-primary glow-primary font-bold text-base h-14 px-10">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/pricing")} className="rounded-xl font-bold text-base h-14 px-10 border-2">
                View Pricing
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <AuthSlidePanel open={authOpen} onOpenChange={setAuthOpen} mode={authMode} />
    </div>
  );
};

export default LandingPage;
