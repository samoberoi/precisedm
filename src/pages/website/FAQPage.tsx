import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

const faqs = [
  { category: "General", items: [
    { q: "What is Precise DM?", a: "Precise DM is an innovative med-health product that provides insulin dosing calculators for trained healthcare providers. Our tools help individualize starting and maintenance insulin doses across various clinical scenarios." },
    { q: "Who can use Precise DM?", a: "Precise DM is designed for trained medical professionals including physicians, pharmacists, nurse practitioners, and other licensed healthcare providers with credentials to prescribe or manage insulin therapy." },
    { q: "Is Precise DM a replacement for clinical judgment?", a: "No. Precise DM provides recommended dosage ranges based on evidence-based algorithms. Users should always consult closely with appropriate medical professionals to confirm any recommended dosage is appropriate for a particular patient." },
  ]},
  { category: "Calculators", items: [
    { q: "What calculators are available?", a: "We offer four calculators: DiaForm (initial insulin dosing), Gestation (pregnancy care dosing), Maintenance (ongoing dose adjustments), and Steroid (steroid-induced hyperglycemia dosing)." },
    { q: "How accurate are the calculations?", a: "Our calculators use evidence-based algorithms developed by clinical pharmacy experts. The DiaForm calculator uses the MDRD eGFR formula, BMI categorization, and the 50/50 Basal-Prandial TDD split methodology." },
    { q: "Can I save my calculations?", a: "Yes, all calculations are automatically saved to your account. You can review past calculations in your form history on the profile page." },
  ]},
  { category: "Subscription", items: [
    { q: "What plans do you offer?", a: "We offer a free 7-day trial (no credit card required), a monthly plan at $1/month, and a yearly plan at $12/year." },
    { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time through PayPal. Your access will continue until the end of your billing period." },
    { q: "What happens after my free trial?", a: "After your 7-day free trial ends, you'll need to subscribe to a monthly or yearly plan to continue accessing the calculators and educational videos." },
    { q: "What payment methods do you accept?", a: "We accept payments through PayPal, which supports credit cards, debit cards, and PayPal balance." },
  ]},
  { category: "Account", items: [
    { q: "How do I reset my password?", a: "Click 'Forgot Password' on the login page, enter your email address, and you'll receive a password reset link." },
    { q: "Can I use Precise DM on multiple devices?", a: "Yes, your account works across all devices. Simply log in with your credentials on any web browser." },
  ]},
];

const FAQPage = () => (
  <div>
    <section className="py-20 lg:py-24" style={{ background: "linear-gradient(135deg, hsl(197 50% 92%), hsl(200 20% 98%))" }}>
      <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center">
        <motion.div {...fadeUp}>
          <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl tracking-tight">Frequently Asked <span className="text-gradient">Questions</span></h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">Everything you need to know about Precise DM.</p>
        </motion.div>
      </div>
    </section>

    <section className="py-20 lg:py-24">
      <div className="mx-auto max-w-3xl px-5 lg:px-8 space-y-10">
        {faqs.map((group, gi) => (
          <motion.div key={group.category} {...fadeUp} transition={{ delay: gi * 0.05, duration: 0.5 }}>
            <h2 className="text-xl font-extrabold text-foreground mb-4">{group.category}</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {group.items.map((faq, i) => (
                <AccordionItem key={i} value={`${gi}-${i}`} className="rounded-2xl bg-card border border-border px-5 shadow-sm">
                  <AccordionTrigger className="text-sm font-bold text-foreground hover:no-underline py-4">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        ))}
      </div>
    </section>
  </div>
);

export default FAQPage;
