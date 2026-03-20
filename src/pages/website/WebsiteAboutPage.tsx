import ScrollReveal from "@/components/website/ScrollReveal";
import aboutHero from "@/assets/about-hero.jpg";
import drColleenCook from "@/assets/dr-colleen-cook.jpg";
import drMelanieProctor from "@/assets/dr-melanie-proctor.jpg";
import drSuzanneChung from "@/assets/dr-suzanne-chung.jpg";
import visionImage from "@/assets/vision-image.jpg";
import missionImage from "@/assets/mission-image.jpg";

const team = [
  { img: drColleenCook, name: "Dr. Colleen Cook", creds: "PharmD, BC-ADM, CDCES", role: "CEO", desc: "Colleen Cook is the co-owner of PreciseDM and inventor of the product called diaForm. She has 25+ years' experience working as a hospital pharmacist and has dedicated the last decade of her career to specializing in diabetes care and education. Her passion, energy and drive to enhance diabetes management, inspired her to develop an individualized insulin dosing calculator intended to be used by trained health care professionals, such as physicians, nurses, nurse practitioners, pharmacists and physician assistants. Her mission is to improve diabetes care in her community and to further impact the development of tools to enhance the efficiency of diabetes care to patients." },
  { img: drMelanieProctor, name: "Dr. Melanie Proctor", creds: "PharmD, BCGP", role: "COO", desc: "Melanie Proctor is a PharmD with a BCGP and has been practicing since 2004. She began as a clinical pharmacist at North Country Regional Hospital in Bemidji, MN. She worked for the Regional Hospital for 5 years before moving into Geriatric Pharmacy Consulting for Pharmerica in 2009. She continued consulting for Pharmerica and for various other pharmacies, eventually co-founding a company of her own called Progressive Care Solutions. She sold that company, along with her antibiotic tracking product abxtracker in 2019. She currently works as an inpatient clinical pharmacist at Ridgeview Hospital." },
  { img: drSuzanneChung, name: "Dr. Suzanne Chung", creds: "PhD Analytical Chemistry", role: "CFO" },
];

const WebsiteAboutPage = () => (
  <div>
    <section className="relative overflow-hidden py-24 lg:py-32">
      <img src={aboutHero} alt="About PreciseDM" className="absolute inset-0 w-full h-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
      <div className="relative mx-auto max-w-[1440px] px-6 xl:px-10 text-center">
        <ScrollReveal>
          <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl lg:text-6xl tracking-tight">About <span className="text-gradient">PreciseDM</span></h1>
          <p className="mt-6 text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">An innovative healthcare company with a vision to improve the diabetes care of our community members.</p>
        </ScrollReveal>
      </div>
    </section>

    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-5xl px-6 xl:px-10">
        <ScrollReveal>
          <div className="rounded-3xl bg-[hsl(200,30%,18%)] p-10 lg:p-14 shadow-xl text-white">
            <h2 className="text-2xl lg:text-3xl font-extrabold mb-8">Our Story</h2>
            <div className="space-y-5 text-sm text-white/80 leading-relaxed lg:text-base">
              <p>PreciseDM is an innovative healthcare company with a vision to improve the diabetes care of our community members. Being aware of the growing epidemiology of diabetes, where it is projected that 1 in 3 Americans will have Type 2 diabetes by the year 2050, it became imperative that something be done to help improve the care of diabetes patients.</p>
              <p>In response, we worked together to develop our first product called "DiaForm" intended to be used by health care providers with credentials to confidently individualize and determine the starting and maintenance insulin doses for new or existing diabetes patients new to insulin.</p>
              <p>PreciseDM will continue to work on more insulin dosing tools to help improve the delivery of diabetes care.</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>

    <section className="py-24 lg:py-32 bg-accent/30">
      <div className="mx-auto max-w-[1440px] px-6 xl:px-10">
        <div className="grid gap-8 md:grid-cols-2">
          {[
            { img: visionImage, title: "Our Vision", desc: "Advance healthcare for individuals with Diabetes through innovative, accessible technology and clinical tools." },
            { img: missionImage, title: "Our Mission", desc: "Individualize diabetes care with quick, easy, and accurate dosing tools designed for healthcare professionals." },
          ].map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.1}>
              <div className="overflow-hidden rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl transition-shadow duration-300 h-full">
                <img src={item.img} alt={item.title} className="h-64 lg:h-72 w-full object-cover" />
                <div className="p-7">
                  <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-6 xl:px-10">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl lg:text-5xl">Our Leadership Team</h2>
          <p className="mt-4 text-lg text-muted-foreground">Clinical experts with decades of combined experience in diabetes care.</p>
        </ScrollReveal>
        <div className="grid gap-8 sm:grid-cols-3 max-w-5xl mx-auto">
          {team.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 0.1}>
              <div className="rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-xl transition-shadow duration-300">
                <img src={t.img} alt={t.name} className="h-80 w-full object-cover" />
                <div className="p-6">
                   <h3 className="text-base font-bold text-foreground">{t.name}</h3>
                   <p className="text-xs text-muted-foreground mt-0.5">{t.creds}</p>
                   <p className="text-xs text-primary font-semibold mt-1">{t.role}</p>
                   {"desc" in t && t.desc && <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{t.desc}</p>}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default WebsiteAboutPage;
