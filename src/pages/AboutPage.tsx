import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useProfile } from "@/hooks/use-profile";
import { ChevronLeft, ArrowUpRight } from "lucide-react";

import aboutHero from "@/assets/about-hero.jpg";
import drColleenCook from "@/assets/dr-colleen-cook.jpg";
import drMelanieProctor from "@/assets/dr-melanie-proctor.jpg";
import drSuzanneChung from "@/assets/dr-suzanne-chung.jpg";
import visionImage from "@/assets/vision-image.jpg";
import missionImage from "@/assets/mission-image.jpg";

const AboutPage = () => {
  const navigate = useNavigate();
  const { firstName } = useProfile();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pb-36 md:pb-16"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-12 pb-3 md:pt-8">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-sm md:hidden">
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg md:text-2xl font-bold text-foreground md:w-full">About Us</h1>
          <div className="w-10 md:hidden" />
        </div>

        {/* Hero */}
        <div className="px-5 pt-2">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl h-[200px] md:h-[300px]"
            style={{
              background: "linear-gradient(135deg, hsl(197 50% 85%), hsl(197 40% 75%), hsl(200 30% 65%))",
            }}
          >
            <img src={aboutHero} alt="About Us" className="absolute inset-0 w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(200,30%,18%)]/80 to-transparent" />
            <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-10">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Our Story</p>
              <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mt-1">
                This is how we<br />got started
              </h2>
            </div>
          </motion.div>
        </div>

        {/* Our Team */}
        <div className="px-5 pt-6 pb-3">
          <h2 className="text-[22px] md:text-2xl font-extrabold text-foreground tracking-tight">Our Team</h2>
        </div>

        {/* Team Cards */}
        <div className="pl-5 pr-2 pb-2 md:px-5">
          <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-none">
            {[
              { img: drColleenCook, name: "Dr. Colleen Cook", credentials: "PharmD, BC-ADM, CDCES", role: "CEO" },
              { img: drMelanieProctor, name: "Dr. Melanie Proctor", credentials: "PharmD, BCGP", role: "COO" },
              { img: drSuzanneChung, name: "Dr. Suzanne Chung", credentials: "PhD Analytical Chemistry", role: "COO" },
            ].map((doc, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="shrink-0 w-[260px] md:w-full overflow-hidden rounded-2xl shadow-sm relative"
                style={{ minHeight: 320 }}
              >
                <img src={doc.img} alt={doc.name} className="w-full h-full object-cover absolute inset-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg font-extrabold text-white leading-tight">{doc.name}</h3>
                  <p className="text-xs text-white/70 mt-0.5">{doc.credentials}</p>
                  <p className="text-xs text-white/50 mt-0.5">{doc.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Our History */}
        <div className="px-5 pt-2 pb-3">
          <h2 className="text-[22px] md:text-2xl font-extrabold text-foreground tracking-tight">Our History</h2>
        </div>

        <div className="px-5 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-[hsl(200,30%,18%)] p-5 md:p-8 shadow-lg"
          >
            <div className="space-y-3 text-sm md:text-base text-white/80 leading-relaxed">
              <p>
                Precise DM is an innovative med-health company with a vision to improve the diabetes
                care of our community members. Being aware of the growing epidemiology of diabetes, where
                it is projected that 1 in 3 Americans will have Type 2 diabetes by the year 2050, it became
                imperative that something be done to help improve the care of diabetes patients.
              </p>
              <p>
                In response, we worked together to develop our first product called "diaForm" intended to be
                used by health care providers with credentials to confidently individualize and determine the starting and
                maintenance insulin doses for new or existing diabetes patients new to insulin.
              </p>
              <p>
                Precise DM will continue to work on more insulin dosing tools to help improve the delivery of
                diabetes care.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Vision & Mission Grid */}
        <div className="px-5 pb-4">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {[
              { img: visionImage, title: "Our Vision", desc: "Advance healthcare for individuals with Diabetes." },
              { img: missionImage, title: "Our Mission", desc: "Individualize care with quick, easy, accurate tools." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
                className="relative overflow-hidden rounded-2xl bg-card border border-border shadow-sm"
                style={{ minHeight: 180 }}
              >
                <img src={item.img} alt={item.title} className="h-24 md:h-40 w-full object-cover" />
                <div className="p-3 md:p-4">
                  <p className="text-sm md:text-base font-bold text-foreground">{item.title}</p>
                  <p className="text-[11px] md:text-sm text-muted-foreground mt-1 leading-snug">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AboutPage;
