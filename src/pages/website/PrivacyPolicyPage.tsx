import ScrollReveal from "@/components/website/ScrollReveal";

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
    <section className="py-24 lg:py-32" style={{ background: "linear-gradient(160deg, hsl(197 50% 92%), hsl(200 20% 98%))" }}>
      <div className="mx-auto max-w-[1440px] px-6 xl:px-10 text-center">
        <ScrollReveal>
          <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl lg:text-6xl tracking-tight">Privacy Policy</h1>
          <p className="mt-6 text-lg text-muted-foreground">Last updated: March 2026</p>
        </ScrollReveal>
      </div>
    </section>

    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-4xl px-6 xl:px-10 space-y-6">
        <ScrollReveal>
          <p className="text-sm text-muted-foreground leading-relaxed">
            PreciseDM, LLC ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and application.
          </p>
        </ScrollReveal>
        {sections.map((s, i) => (
          <ScrollReveal key={i} delay={i * 0.03}>
            <div className="rounded-2xl bg-card border border-border p-7 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-base font-bold text-foreground mb-3">{s.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.content}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  </div>
);

export default PrivacyPolicyPage;
