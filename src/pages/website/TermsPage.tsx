import { motion } from "framer-motion";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

const sections = [
  { title: "Acceptance of Terms", content: "By accessing or using the Precise DM website and application, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you should not use our services." },
  { title: "Eligibility", content: "Precise DM is intended for use by trained medical professionals including physicians, pharmacists, nurse practitioners, and other licensed healthcare providers. By using our services, you represent that you have the appropriate credentials and training." },
  { title: "Account Responsibilities", content: "You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You agree to notify us immediately of any unauthorized use of your account." },
  { title: "Subscription and Payments", content: "Paid features require an active subscription. Subscriptions are billed through PayPal on a monthly or yearly basis. You may cancel at any time; access continues until the end of the billing period. Free trials are limited to one per user." },
  { title: "Disclaimer of Liability", content: "The diaForm process and all calculators developed by PreciseDM, LLC are intended only for use by trained medical professionals. While our tools provide recommended dosage ranges, users should consult closely with appropriate medical professionals to confirm any recommended dosage is appropriate for a particular patient. PreciseDM, LLC shall not be held liable for any improper or incorrect use of any product." },
  { title: "Indemnification", content: "User agrees to defend, indemnify, and hold harmless PreciseDM, LLC, its contributors, and their respective affiliates from and against all claims and expenses arising out of the use of our services." },
  { title: "Disclaimer of Warranties", content: 'PreciseDM, LLC provides this information on an "AS IS" basis. All warranties of any kind, whether express or implied, are disclaimed to the greatest extent permitted by law.' },
  { title: "Intellectual Property", content: "All content, algorithms, designs, and materials on the Precise DM platform are the intellectual property of PreciseDM, LLC. You may not reproduce, distribute, or create derivative works without our written permission." },
  { title: "Limitation of Liability", content: "In no event shall PreciseDM, LLC be liable for any direct, indirect, incidental, special, exemplary, or consequential damages arising from the use of our services." },
  { title: "Governing Law", content: "These Terms shall be governed by and construed in accordance with the laws of the United States. Any disputes shall be resolved in the appropriate courts." },
  { title: "Changes to Terms", content: "We reserve the right to modify these Terms at any time. Continued use of our services after changes constitutes acceptance of the new terms." },
  { title: "Contact", content: "For questions about these Terms, contact us at precise.diabetes@gmail.com or call 612-916-4059." },
];

const TermsPage = () => (
  <div>
    <section className="py-20 lg:py-24" style={{ background: "linear-gradient(135deg, hsl(197 50% 92%), hsl(200 20% 98%))" }}>
      <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center">
        <motion.div {...fadeUp}>
          <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl tracking-tight">Terms & Conditions</h1>
          <p className="mt-5 text-lg text-muted-foreground">Last updated: March 2026</p>
        </motion.div>
      </div>
    </section>

    <section className="py-20 lg:py-24">
      <div className="mx-auto max-w-3xl px-5 lg:px-8 space-y-6">
        {sections.map((s, i) => (
          <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.03, duration: 0.5 }}
            className="rounded-2xl bg-card border border-border p-6 shadow-sm">
            <h2 className="text-base font-bold text-foreground mb-3">{s.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.content}</p>
          </motion.div>
        ))}
      </div>
    </section>
  </div>
);

export default TermsPage;
