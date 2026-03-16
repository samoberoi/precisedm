import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";
import { Info } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import aboutHero from "@/assets/about-hero.jpg";
import drColleenCook from "@/assets/dr-colleen-cook.jpg";
import drMelanieProctor from "@/assets/dr-melanie-proctor.jpg";
import drSuzanneChung from "@/assets/dr-suzanne-chung.jpg";
import visionImage from "@/assets/vision-image.jpg";
import missionImage from "@/assets/mission-image.jpg";

const AboutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { firstName } = useProfile();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen gradient-surface pb-28"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-10 pb-2">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Hello !!</p>
          <p className="text-lg font-bold text-foreground">{firstName}</p>
        </div>
        <button onClick={() => navigate("/disclaimer")} className="flex h-10 w-10 items-center justify-center rounded-full glass-card">
          <Info className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* About Us Section */}
      <div className="px-6 pt-4 pb-3">
        <h1 className="text-2xl font-extrabold text-foreground">About Us</h1>
      </div>

      <div className="px-6 py-3">
        <div className="relative overflow-hidden rounded-2xl">
          <img src={aboutHero} alt="About Us" className="h-52 w-full object-cover" />
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" />
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <p className="text-xl font-bold text-foreground text-center leading-snug">
              This is the story{"\n"}about how we got{"\n"}started
            </p>
          </div>
        </div>
      </div>

      {/* Our Team Section */}
      <div className="px-6 pt-4 pb-3">
        <h2 className="text-xl font-extrabold text-foreground">Our Team</h2>
      </div>

      <div className="px-6 py-3">
        <div className="overflow-hidden rounded-2xl glass-card">
          <img src={drColleenCook} alt="Dr. Colleen Cook" className="w-full object-contain" />
        </div>
      </div>

      <div className="px-6 py-3">
        <div className="overflow-hidden rounded-2xl glass-card">
          <img src={drMelanieProctor} alt="Dr. Melanie Proctor" className="w-full object-contain" />
        </div>
      </div>

      <div className="px-6 py-3">
        <div className="flex flex-col items-center">
          <div className="h-48 w-48 rounded-full overflow-hidden ring-2 ring-primary/30">
            <img src={drSuzanneChung} alt="Dr. Suzanne Chung" className="h-full w-full object-cover" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mt-4">Dr. Suzanne Chung</h3>
          <p className="text-sm text-muted-foreground mt-1">PhD Analytical Chemistry</p>
          <p className="text-sm text-muted-foreground">COO</p>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="px-6 pt-6 pb-3">
        <h2 className="text-xl font-extrabold text-foreground">Our Story</h2>
      </div>

      <div className="px-6 py-3">
        <div className="rounded-2xl gradient-primary p-6 glow-primary">
          <h3 className="text-lg font-bold text-primary-foreground text-center mb-4">Our History</h3>
          <div className="space-y-4 text-sm text-primary-foreground/90 leading-relaxed">
            <p>
              Precise DM is an innovative med-health company with a vision to improve the diabetes
              care of our community members. Being aware of the growing epidemiology of diabetes, where
              it is projected that 1 in 3 Americans will have Type 2 diabetes by the year 2050, it became
              imperative that something be done to help improve the care of diabetes patients. Besides
              facing complications regarding new cases of Covid-induced diabetes, the national shortage
              of endocrinologists and diabetic educators has caused many primary care providers to
              become the mainstay for managing diabetes patients.
            </p>
            <p>
              In response, we worked together to develop our first product called "diaForm" intended to be
              used by health care providers with credentials (physicians, physician assistants, nurse
              practitioners, pharmacists) to confidently individualize and determine the starting and
              maintenance insulin doses for new or existing diabetes patients new to insulin. With the ever
              changing status of diabetes, there is no better time to implement and integrate this new
              insulin dosing tool which will not only save provider time with its quick, easy and accurate
              dosing, but will also help to improve diabetes care in our community one member at a time.
            </p>
            <p>
              Precise DM will continue to work on more insulin dosing tools to help improve the delivery of
              diabetes care.
            </p>
          </div>
        </div>
      </div>

      {/* Our Vision */}
      <div className="px-6 py-3">
        <div className="relative overflow-hidden rounded-2xl">
          <img src={visionImage} alt="Our Vision" className="h-52 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-xl font-bold text-foreground mb-1">Our Vision</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              At Precise DM, our aim is to advance the Healthcare for individuals with Diabetes.
            </p>
          </div>
        </div>
      </div>

      {/* Our Mission */}
      <div className="px-6 py-3">
        <div className="relative overflow-hidden rounded-2xl">
          <img src={missionImage} alt="Our Mission" className="h-52 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-xl font-bold text-foreground mb-1">Our Mission</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              We believe that every patient is unique and special in their own way. We strive to
              individualize Diabetes care with insulin dosing tools that are quick, easy and accurate.
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </motion.div>
  );
};

export default AboutPage;
