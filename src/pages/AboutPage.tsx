import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Info } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import aboutHero from "@/assets/about-hero.jpg";
import drColleenCook from "@/assets/dr-colleen-cook.jpg";

const AboutPage = () => {
  const { user } = useAuth();
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "There";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pb-28"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-10 pb-2">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Hello !!</p>
          <p className="text-lg font-bold text-foreground">{firstName}</p>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/60 backdrop-blur-sm">
          <Info className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* About Us Section */}
      <div className="px-6 pt-4 pb-3">
        <h1 className="text-2xl font-extrabold text-foreground">About Us</h1>
      </div>

      <div className="px-6 py-3">
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={aboutHero}
            alt="About Us"
            className="h-52 w-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/40" />
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <p className="text-xl font-bold text-primary-foreground text-center leading-snug">
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
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={drColleenCook}
            alt="Dr. Colleen Cook"
            className="h-[420px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
            <h3 className="text-2xl font-bold text-primary-foreground">Dr. Colleen Cook</h3>
            <p className="text-sm text-primary-foreground/80 mt-1">PharmD, BC-ADM, CDCES</p>
            <p className="text-sm text-primary-foreground/80">CEO</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </motion.div>
  );
};

export default AboutPage;
