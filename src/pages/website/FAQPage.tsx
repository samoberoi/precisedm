import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ScrollReveal from "@/components/website/ScrollReveal";

const faqs = [
  { category: "General", items: [
    { q: "What is PreciseDM?", a: "PreciseDM is an innovative med-health product that provides insulin dosing calculators for trained healthcare providers. Our tools help individualize starting and maintenance insulin doses across various clinical scenarios." },
    { q: "Who can use PreciseDM?", a: "PreciseDM is designed for trained medical professionals including physicians, pharmacists, nurse practitioners, and other licensed healthcare providers with credentials to prescribe or manage insulin therapy." },
    { q: "Is PreciseDM a replacement for clinical judgment?", a: "No. PreciseDM provides recommended dosage ranges based on evidence-based algorithms. Users should always consult closely with appropriate medical professionals to confirm any recommended dosage is appropriate for a particular patient." },
  ]},
  { category: "Calculators", items: [
    { q: "What calculators are available?", a: "We offer four calculators: DiaForm (Starting insulin dosing), Gestation (pregnancy care dosing), Maintenance (ongoing dose adjustments), and Steroid (steroid-induced hyperglycemia dosing)." },
    
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
    { q: "Can I use PreciseDM on multiple devices?", a: "Yes, your account works across all devices. Simply log in with your credentials on any web browser." },
  ]},
];

const FAQPage = () => (
  <div>
    <section className="py-24 lg:py-32" style={{ background: "linear-gradient(160deg, hsl(197 50% 92%), hsl(200 20% 98%))" }}>
      <div className="mx-auto max-w-[1440px] px-6 xl:px-10 text-center">
        <ScrollReveal>
          <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl lg:text-6xl tracking-tight">Frequently Asked <span className="text-gradient">Questions</span></h1>
          <p className="mt-6 text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">Everything you need to know about PreciseDM.</p>
        </ScrollReveal>
      </div>
    </section>

    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-4xl px-6 xl:px-10 space-y-12">
        {faqs.map((group, gi) => (
          <ScrollReveal key={group.category} delay={gi * 0.05}>
            <h2 className="text-xl lg:text-2xl font-extrabold text-foreground mb-5">{group.category}</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {group.items.map((faq, i) => (
                <AccordionItem key={i} value={`${gi}-${i}`} className="rounded-2xl bg-card border border-border px-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <AccordionTrigger className="text-sm font-bold text-foreground hover:no-underline py-5">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollReveal>
        ))}
      </div>
    </section>
  </div>
);

export default FAQPage;
