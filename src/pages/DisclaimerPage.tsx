import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";

const sections = [
  {
    title: "Disclaimer of Liability",
    paragraphs: [
      "The diaForm process developed by PreciseDM, LLC is intended only for use by trained medical professionals. While the diaForm process will provide a recommended insulin dosage range, users should consult closely with appropriate medical professionals, including treating physicians, to confirm any recommended dosage is appropriate for a particular patient.",
      "PreciseDM, LLC shall not be held liable for any improper or incorrect use of the diaForm product (including any error in inputting data or interpreting of the information described and/or contained therein and assumes no responsibility for anyone's use of the information.",
      "In no event shall PreciseDM, LLC or its contributors be liable for any direct, indirect, incidental, special, exemplary, or consequential damages (including, but not limited to, procurement of substitute goods or services; loss of use, data, or profits; or business interruption) however caused on any theory of liability, whether in contract, strict liability, tort (including negligence or otherwise), or any other theory arising in any way out of the use of this system, even if advised of the possibility of such damage. This disclaimer of liability applies to any damages or injury, whether based on alleged breach of contract, tortious behavior, negligence or any other cause of action, including but not limited to damages or injuries caused by or resulting from any failure of performance, error, omission, interruption, deletion, defect, delay in operation or transmission, computer virus, communication line failure, and/or theft, destruction or unauthorized access to, alteration of, or use of any record.",
    ],
  },
  {
    title: "Indemnification",
    paragraphs: [
      "User agrees to defend, indemnify, and hold harmless, PreciseDM, LLC, its contributors, any entity jointly created by them, their respective affiliates and their respective directors, officers, employees, and agents from and against all claims and expenses, including attorneys' fees, arising out of the use of the diaForm process by user or user's account.",
    ],
  },
  {
    title: "Disclaimer of Warranties/Accuracy and Use of Data/Computer Viruses",
    paragraphs: [
      "Although the data contained in or produced by the diaForm process has been produced and processed from sources believed to be reliable, no warranty, expressed or implied, is made regarding accuracy, adequacy, completeness, legality, reliability, or usefulness of any information. User should rely upon its own independent medical training and experience when using the diaForm process.",
      'This disclaimer applies to both isolated and aggregate uses of the information. PreciseDM, LLC provides this information on an "AS IS" basis. All warranties of any kind, whether express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, freedom from contamination by computer viruses, and non-infringement of proprietary rights are disclaimed to the greatest extent permitted by law.',
      "Changes may be periodically added to the information herein; these changes may or may not be incorporated in any new version of the publication. If the user has obtained information from the diaForm process from a source other than PreciseDM, LLC itself, the user must be aware that electronic data can be altered subsequent to original distribution. Data can also quickly become out-of-date. It is recommended that the user pay careful attention to the contents of any data or information associated with a file, and that the originator of the data or information be contacted with any questions regarding appropriate use. If the user finds any errors or omissions, we encourage the user to report them to PreciseDM, LLC.",
    ],
  },
];

const DisclaimerPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const displayName =
    user?.user_metadata?.full_name?.split(" ")[0] || "User";

  return (
    <div className="min-h-screen bg-muted/40 pb-28">
      {/* Header */}
      <div className="bg-background px-5 pt-6 pb-5 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-foreground mb-3"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <p className="text-xs text-muted-foreground">Hello !</p>
        <h1 className="text-xl font-bold text-foreground">{displayName}</h1>
      </div>

      {/* Content */}
      <div className="px-5 mt-5 space-y-4">
        {sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <h2 className="text-lg font-bold text-foreground mb-3">
              {section.title}
            </h2>
            <div className="space-y-3">
              {section.paragraphs.map((p, j) => (
                <p
                  key={j}
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  {p}
                </p>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default DisclaimerPage;
