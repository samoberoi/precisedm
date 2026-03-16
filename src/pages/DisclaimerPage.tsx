import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useProfile } from "@/hooks/use-profile";


const sections = [
  {
    title: "Disclaimer of Liability",
    paragraphs: [
      "The diaForm process developed by PreciseDM, LLC is intended only for use by trained medical professionals. While the diaForm process will provide a recommended insulin dosage range, users should consult closely with appropriate medical professionals, including treating physicians, to confirm any recommended dosage is appropriate for a particular patient.",
      "PreciseDM, LLC shall not be held liable for any improper or incorrect use of the diaForm product (including any error in inputting data or interpreting of the information described and/or contained therein and assumes no responsibility for anyone's use of the information.",
      "In no event shall PreciseDM, LLC or its contributors be liable for any direct, indirect, incidental, special, exemplary, or consequential damages however caused on any theory of liability, whether in contract, strict liability, tort (including negligence or otherwise), or any other theory arising in any way out of the use of this system, even if advised of the possibility of such damage.",
    ],
  },
  {
    title: "Indemnification",
    paragraphs: [
      "User agrees to defend, indemnify, and hold harmless, PreciseDM, LLC, its contributors, any entity jointly created by them, their respective affiliates and their respective directors, officers, employees, and agents from and against all claims and expenses, including attorneys' fees, arising out of the use of the diaForm process by user or user's account.",
    ],
  },
  {
    title: "Disclaimer of Warranties",
    paragraphs: [
      "Although the data contained in or produced by the diaForm process has been produced and processed from sources believed to be reliable, no warranty, expressed or implied, is made regarding accuracy, adequacy, completeness, legality, reliability, or usefulness of any information.",
      'PreciseDM, LLC provides this information on an "AS IS" basis. All warranties of any kind, whether express or implied, are disclaimed to the greatest extent permitted by law.',
    ],
  },
];

const DisclaimerPage = () => {
  const navigate = useNavigate();
  const { firstName } = useProfile();

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-sm">
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Disclaimer</h1>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="px-5 mt-3 space-y-3">
        {sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl bg-card border border-border shadow-sm p-5"
          >
            <h2 className="text-base font-bold text-foreground mb-3">{section.title}</h2>
            <div className="space-y-3">
              {section.paragraphs.map((p, j) => (
                <p key={j} className="text-sm leading-relaxed text-muted-foreground">{p}</p>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DisclaimerPage;
