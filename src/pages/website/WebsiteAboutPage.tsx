import { motion } from "framer-motion";
import aboutHero from "@/assets/about-hero.jpg";
import drColleenCook from "@/assets/dr-colleen-cook.jpg";
import drMelanieProctor from "@/assets/dr-melanie-proctor.jpg";
import drSuzanneChung from "@/assets/dr-suzanne-chung.jpg";
import visionImage from "@/assets/vision-image.jpg";
import missionImage from "@/assets/mission-image.jpg";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

const team = [
  { img: drColleenCook, name: "Dr. Colleen Cook", creds: "PharmD, BC-ADM, CDCES", role: "CEO" },
  { img: drMelanieProctor, name: "Dr. Melanie Proctor", creds: "PharmD, BCGP", role: "COO" },
  { img: drSuzanneChung, name: "Dr. Suzanne Chung", creds: "PhD Analytical Chemistry", role: "COO" },
];

const WebsiteAboutPage = () => (
  <div>
    {/* Hero */}
    <section className="relative overflow-hidden py-20 lg:py-28">
      <img src={aboutHero} alt="About PreciseDM" className="absolute inset-0 w-full h-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 text-center">
        <motion.div {...fadeUp}>
          <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl tracking-tight">About <span className="text-gradient">Precise DM</span></h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">An innovative med-health company with a vision to improve the diabetes care of our community members.</p>
        </motion.div>
      </div>
    </section>

    {/* History */}
    <section className="py-20 lg:py-24">
      <div className="mx-auto max-w-4xl px-5 lg:px-8">
        <motion.div {...fadeUp} className="rounded-3xl bg-[hsl(200,30%,18%)] p-8 lg:p-12 shadow-xl text-white">
          <h2 className="text-2xl font-extrabold mb-6">Our Story</h2>
          <div className="space-y-4 text-sm text-white/80 leading-relaxed lg:text-base">
            <p>Precise DM is an innovative med-health company with a vision to improve the diabetes care of our community members. Being aware of the growing epidemiology of diabetes, where it is projected that 1 in 3 Americans will have Type 2 diabetes by the year 2050, it became imperative that something be done to help improve the care of diabetes patients.</p>
            <p>In response, we worked together to develop our first product called "diaForm" intended to be used by health care providers with credentials to confidently individualize and determine the starting and maintenance insulin doses for new or existing diabetes patients new to insulin.</p>
            <p>Precise DM will continue to work on more insulin dosing tools to help improve the delivery of diabetes care.</p>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Vision & Mission */}
    <section className="py-20 lg:py-24 bg-accent/30">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          {[
            { img: visionImage, title: "Our Vision", desc: "Advance healthcare for individuals with Diabetes through innovative, accessible technology and clinical tools." },
            { img: missionImage, title: "Our Mission", desc: "Individualize diabetes care with quick, easy, and accurate dosing tools designed for healthcare professionals." },
          ].map((item, i) => (
            <motion.div key={item.title} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.5 }}
              className="overflow-hidden rounded-2xl bg-card border border-border shadow-sm hover:shadow-lg transition-shadow">
              <img src={item.img} alt={item.title} className="h-56 w-full object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Team */}
    <section className="py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div {...fadeUp} className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">Our Leadership Team</h2>
          <p className="mt-3 text-lg text-muted-foreground">Clinical experts with decades of combined experience in diabetes care.</p>
        </motion.div>
        <div className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
          {team.map((t, i) => (
            <motion.div key={t.name} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.5 }}
              className="rounded-2xl overflow-hidden bg-card border border-border shadow-sm">
              <img src={t.img} alt={t.name} className="h-72 w-full object-cover" />
              <div className="p-5">
                <h3 className="text-base font-bold text-foreground">{t.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t.creds}</p>
                <p className="text-xs text-primary font-semibold mt-1">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default WebsiteAboutPage;
