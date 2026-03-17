import { motion } from "framer-motion";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

const sections = [
  { title: "Information We Collect", content: "We collect personal information you provide during registration (name, email, phone number, user type) and usage data including form submissions, calculation history, and subscription details. We do not collect patient data — all clinical inputs are processed locally and only summary results are stored." },
  { title: "How We Use Your Information", content: "Your information is used to: provide and maintain our services, process subscriptions, save your calculation history, communicate important updates, and improve our products. We do not sell your personal information to third parties." },
  { title: "Data Security", content: "We implement industry-standard security measures including encrypted data transmission (TLS), secure authentication, and row-level security policies on all database tables. Access to your data is restricted to your authenticated account only." },
  { title: "Data Retention", content: "Your account data is retained for as long as your account is active. Form submission history is stored indefinitely for your reference. You may request deletion of your account and associated data by contacting us." },
  { title: "Cookies and Tracking", content: "We use essential cookies for authentication and session management. We do not use third-party tracking cookies or advertising pixels." },
  { title: "Third-Party Services", content: "We use PayPal for payment processing and Resend for transactional emails. These services have their own privacy policies governing how they handle your data." },
  { title: "Your Rights", content: "You have the right to: access your personal data, correct inaccurate data, request deletion of your data, and opt out of non-essential communications. To exercise these rights, please contact us at precise.diabetes@gmail.com." },
  { title: "Changes to This Policy", content: "We may update this privacy policy from time to time. We will notify you of any material changes by email or through a notice on our website." },
  { title: "Contact Us", content: "If you have questions about this Privacy Policy, please contact us at precise.diabetes@gmail.com or call 612-916-4059." },
];

const PrivacyPolicyPage = () => (
  <div>
    <section className="py-20 lg:py-24" style={{ background: "linear-gradient(135deg, hsl(197 50% 92%), hsl(200 20% 98%))" }}>
      <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center">
        <motion.div {...fadeUp}>
          <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl tracking-tight">Privacy Policy</h1>
          <p className="mt-5 text-lg text-muted-foreground">Last updated: March 2026</p>
        </motion.div>
      </div>
    </section>

    <section className="py-20 lg:py-24">
      <div className="mx-auto max-w-3xl px-5 lg:px-8 space-y-6">
        <motion.p {...fadeUp} className="text-sm text-muted-foreground leading-relaxed">
          PreciseDM, LLC ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and application.
        </motion.p>
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

export default PrivacyPolicyPage;
