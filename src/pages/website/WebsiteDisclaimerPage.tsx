import { motion } from "framer-motion";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

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

const WebsiteDisclaimerPage = () => (
  <div>
    <section className="py-20 lg:py-24" style={{ background: "linear-gradient(135deg, hsl(197 50% 92%), hsl(200 20% 98%))" }}>
      <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center">
        <motion.div {...fadeUp}>
          <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl tracking-tight">Medical Disclaimer</h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">Important information about the use of PreciseDM tools.</p>
        </motion.div>
      </div>
    </section>

    <section className="py-20 lg:py-24">
      <div className="mx-auto max-w-3xl px-5 lg:px-8 space-y-6">
        {sections.map((s, i) => (
          <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.05, duration: 0.5 }}
            className="rounded-2xl bg-card border border-border p-6 shadow-sm">
            <h2 className="text-base font-bold text-foreground mb-4">{s.title}</h2>
            <div className="space-y-3">
              {s.paragraphs.map((p, j) => (
                <p key={j} className="text-sm text-muted-foreground leading-relaxed">{p}</p>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  </div>
);

export default WebsiteDisclaimerPage;
