import heroDoctor from "@/assets/hero-doctor.jpg";
import aboutHero from "@/assets/about-hero.jpg";
import visionImage from "@/assets/vision-image.jpg";
import missionImage from "@/assets/mission-image.jpg";
import diaformCard from "@/assets/diaform-card.jpg";
import connectHero from "@/assets/connect-hero.jpg";

export interface BlogPost {
  slug: string;
  img: string;
  title: string;
  excerpt: string;
  date: string;
  read: string;
  category: string;
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "understanding-initial-insulin-dosing",
    img: heroDoctor,
    title: "Understanding Initial Insulin Dosing: A Guide for Practitioners",
    excerpt: "Learn the fundamentals of calculating initial insulin doses using evidence-based algorithms and BMI categorization.",
    date: "Mar 15, 2026",
    read: "5 min read",
    category: "Clinical Guide",
    content: `
## The Foundation of Insulin Dosing

Initiating insulin therapy is one of the most critical decisions in diabetes management. Getting the starting dose right sets the trajectory for glycemic control and patient safety. This guide walks through the evidence-based approach used by clinical experts worldwide.

### Why Initial Dosing Matters

An incorrect starting dose can lead to either persistent hyperglycemia (if too low) or dangerous hypoglycemia (if too high). The goal is to find a safe, effective starting point that can be titrated over time.

### The BMI-Based Approach

Body Mass Index (BMI) is a key factor in determining insulin sensitivity. Patients with higher BMIs tend to have greater insulin resistance and therefore require higher initial doses.

**General guidelines:**
- **BMI < 25:** Start with 0.4–0.5 units/kg/day
- **BMI 25–30:** Start with 0.5–0.6 units/kg/day  
- **BMI > 30:** Start with 0.6–0.7 units/kg/day

These ranges are starting points — individual patient factors such as renal function, hepatic status, and concurrent medications must also be considered.

### Total Daily Dose (TDD) Calculation

The TDD is typically split between basal and prandial (mealtime) insulin. The most common approach is the **50/50 split**:

- **50% as basal insulin** (e.g., glargine, detemir, or degludec)
- **50% as prandial insulin** (e.g., lispro, aspart, or glulisine), divided equally across three meals

For example, a 90 kg patient with a BMI of 32:
- TDD = 90 × 0.6 = 54 units/day
- Basal = 27 units
- Prandial = 27 units ÷ 3 = 9 units per meal

### Monitoring and Titration

After initiation, frequent blood glucose monitoring is essential. Fasting blood glucose guides basal dose adjustments, while pre-meal and 2-hour post-meal readings guide prandial changes.

**Titration rules of thumb:**
- Adjust basal by 2–4 units every 3–4 days based on fasting glucose
- Adjust prandial doses based on carbohydrate counting or pattern management

### When to Use PreciseDM

Our DiaForm calculator automates this entire process. Simply enter the patient's weight, BMI category, and clinical context — and receive an evidence-based starting regimen in seconds.

---

*This article is for educational purposes and is intended for licensed healthcare providers. Always use clinical judgment in conjunction with algorithmic recommendations.*
    `,
  },
  {
    slug: "diaform-simplifies-basal-prandial-split",
    img: diaformCard,
    title: "How DiaForm Simplifies the 50/50 Basal-Prandial Split",
    excerpt: "Explore how our DiaForm calculator automates the TDD calculation and provides accurate basal-prandial split recommendations.",
    date: "Mar 10, 2026",
    read: "4 min read",
    category: "Product",
    content: `
## Introducing the DiaForm Calculator

Calculating insulin doses manually introduces room for error — especially in busy clinical settings. DiaForm was built to eliminate that risk.

### What Is the 50/50 Split?

The 50/50 basal-prandial split is the most widely recommended starting regimen for insulin-naïve patients. It divides the total daily dose equally between long-acting (basal) and rapid-acting (prandial) insulin.

### How DiaForm Works

1. **Enter patient weight** — the calculator uses this to determine the weight-based dose
2. **Select BMI category** — adjusts the units/kg factor for insulin resistance
3. **Review the output** — DiaForm presents basal dose, per-meal prandial dose, and total daily dose

### Clinical Accuracy

DiaForm's algorithm is based on the same guidelines taught in pharmacy and endocrinology programs. The formulas are peer-reviewed and validated against published dosing protocols.

### Benefits for Providers

- **Speed:** Get a complete regimen in under 10 seconds
- **Consistency:** Standardize dosing across your practice
- **Documentation:** Save calculations for patient records
- **Education:** Great teaching tool for pharmacy students and residents

### Real-World Example

A 75 kg patient with a BMI of 28:
- DiaForm calculates TDD = 75 × 0.55 = ~41 units
- Basal = 20 units
- Prandial = 7 units per meal

This matches what an experienced endocrinologist would calculate — but delivered in seconds.

---

*Try DiaForm today in the PreciseDM toolkit. Available to all subscribers.*
    `,
  },
  {
    slug: "managing-steroid-induced-hyperglycemia",
    img: aboutHero,
    title: "Managing Steroid-Induced Hyperglycemia",
    excerpt: "Best practices for insulin dosing when patients are on corticosteroid therapy and experiencing elevated blood glucose.",
    date: "Mar 5, 2026",
    read: "6 min read",
    category: "Clinical Guide",
    content: `
## The Steroid-Glucose Challenge

Corticosteroids are among the most commonly prescribed medications in clinical practice, yet they frequently cause significant hyperglycemia — even in patients without pre-existing diabetes.

### Why Steroids Raise Blood Glucose

Glucocorticoids increase hepatic glucose output and decrease peripheral insulin sensitivity. The result is a dose-dependent rise in blood glucose that often peaks in the afternoon and evening.

### Patterns by Steroid Type

Different corticosteroids have different pharmacokinetic profiles:

- **Prednisone / Prednisolone:** Peak effect 4–8 hours after dosing. Predominantly causes afternoon/evening hyperglycemia.
- **Dexamethasone:** Longer duration. Can cause hyperglycemia throughout the 24-hour period.
- **Methylprednisolone (IV):** Rapid onset. May require immediate insulin coverage.

### Insulin Strategies

**For patients already on insulin:**
- Increase TDD by 20–40% depending on steroid dose
- May need additional prandial coverage for lunch and dinner

**For steroid-naïve patients developing hyperglycemia:**
- Start with NPH insulin timed to the steroid dose
- For prednisone given in the morning: give NPH at the same time
- Dose: 0.1–0.3 units/kg, titrated every 1–2 days

**For high-dose or continuous steroids:**
- Consider basal-bolus regimen
- Use correction factor: 1800/TDD for rapid-acting insulin

### Our Steroid Calculator

The PreciseDM Steroid calculator accounts for the type and dose of corticosteroid, patient weight, and existing insulin regimen to provide tailored recommendations.

### Monitoring

- Check blood glucose at least 4 times daily during steroid therapy
- Adjust insulin as steroid doses are tapered — hypoglycemia risk increases as steroids decrease

---

*Steroid-induced hyperglycemia is transient but can be dangerous if unmanaged. Use evidence-based tools to guide your approach.*
    `,
  },
  {
    slug: "future-of-diabetes-care-technology",
    img: visionImage,
    title: "The Future of Diabetes Care Technology",
    excerpt: "How digital health tools like PreciseDM are transforming the way healthcare providers manage diabetes treatment.",
    date: "Feb 28, 2026",
    read: "4 min read",
    category: "Industry",
    content: `
## Digital Transformation in Diabetes Care

The landscape of diabetes management is evolving rapidly. From continuous glucose monitors to AI-powered dosing tools, technology is reshaping how clinicians approach treatment.

### The Problem with Traditional Approaches

Manual insulin dose calculations are:
- **Time-consuming** — especially in complex cases
- **Error-prone** — mental math under clinical pressure
- **Inconsistent** — different providers may use different protocols

### How Technology Bridges the Gap

Digital tools like PreciseDM standardize the dosing process while preserving clinical flexibility. They serve as a decision-support layer — not a replacement for clinical judgment.

### Key Trends Shaping the Future

**1. Point-of-Care Calculators**
Bedside and mobile tools that give instant, evidence-based recommendations. PreciseDM leads this category for insulin-specific calculations.

**2. AI-Assisted Pattern Recognition**
Machine learning algorithms that analyze glucose trends and recommend dose adjustments proactively.

**3. Interoperability**
The ability for dosing tools, EHRs, and glucose monitors to share data seamlessly, reducing manual entry and improving accuracy.

**4. Education at Scale**
Digital platforms enable pharmacy students and new practitioners to learn dosing principles through interactive calculators rather than static textbooks.

### Where PreciseDM Fits

PreciseDM focuses on the foundational layer: getting the initial dose right. Our calculators cover four critical scenarios — initial dosing (DiaForm), gestational diabetes, steroid-induced hyperglycemia, and maintenance adjustments.

### Looking Ahead

We're exploring:
- Integration with electronic health records
- Expanded calculator support for pediatric and renal populations
- Analytics dashboards for practice-level insights

---

*The future of diabetes care is precise, digital, and accessible. We're building it.*
    `,
  },
  {
    slug: "insulin-sensitivity-factor-explained",
    img: missionImage,
    title: "Insulin Sensitivity Factor: What You Need to Know",
    excerpt: "A deep dive into the ISF formula (1800/TDD) and how it guides maintenance dose adjustments.",
    date: "Feb 20, 2026",
    read: "5 min read",
    category: "Clinical Guide",
    content: `
## What Is the Insulin Sensitivity Factor?

The Insulin Sensitivity Factor (ISF), also called the correction factor, tells you how much one unit of rapid-acting insulin will lower a patient's blood glucose.

### The Formula

For rapid-acting insulin analogs (lispro, aspart, glulisine):

**ISF = 1800 ÷ TDD**

For regular insulin:

**ISF = 1500 ÷ TDD**

Where TDD is the patient's total daily insulin dose.

### Why It Matters

The ISF is essential for:
- **Correction doses** — calculating how much extra insulin to give when glucose is above target
- **Sick day management** — guiding supplemental insulin during illness
- **Pump therapy** — programming the correction factor into insulin pumps

### Practical Example

A patient taking 60 units/day total:
- ISF = 1800 ÷ 60 = 30 mg/dL per unit
- If glucose is 250 mg/dL and target is 130 mg/dL:
- Correction dose = (250 − 130) ÷ 30 = 4 units

### Common Pitfalls

**1. Using outdated TDD**
If a patient's doses have been recently adjusted, recalculate ISF with the current TDD.

**2. Ignoring insulin on board**
Stacking correction doses without accounting for active insulin can cause hypoglycemia.

**3. Applying ISF universally**
ISF may vary by time of day — many patients are more insulin-resistant in the morning.

### The Maintenance Calculator

Our Maintenance calculator uses the ISF as a core component. It takes the patient's current TDD, glucose readings, and targets to recommend dose adjustments with built-in safety checks.

---

*Understanding ISF is fundamental to safe insulin management. Let PreciseDM do the math so you can focus on the patient.*
    `,
  },
  {
    slug: "gestational-diabetes-dosing-considerations",
    img: connectHero,
    title: "Gestational Diabetes: Dosing Considerations",
    excerpt: "Trimester-specific insulin adjustments and how our Gestation calculator accounts for changing needs during pregnancy.",
    date: "Feb 15, 2026",
    read: "7 min read",
    category: "Clinical Guide",
    content: `
## Insulin Therapy in Gestational Diabetes

Gestational diabetes mellitus (GDM) affects up to 10% of pregnancies. When lifestyle modifications fail to achieve glycemic targets, insulin therapy becomes the standard of care.

### Why Pregnancy Changes Insulin Needs

Pregnancy is a state of progressive insulin resistance, driven by placental hormones (human placental lactogen, cortisol, progesterone). Insulin requirements can increase dramatically across trimesters:

- **First trimester:** Relatively lower insulin resistance; risk of hypoglycemia
- **Second trimester:** Insulin needs begin to rise significantly
- **Third trimester:** Peak insulin resistance; doses may be 2–3× first-trimester levels

### Starting Insulin in GDM

**Indications to start insulin:**
- Fasting glucose consistently > 95 mg/dL despite diet therapy
- 1-hour postprandial > 140 mg/dL or 2-hour > 120 mg/dL

**Initial dosing approach:**
- Total daily dose: 0.7–1.0 units/kg/day (based on current pregnancy weight)
- Typically start lower (0.7 units/kg) and titrate up
- Split as 50% basal / 50% prandial, or adjust based on glucose patterns

### Trimester-Specific Adjustments

| Trimester | Typical TDD Range | Key Consideration |
|-----------|-------------------|-------------------|
| First | 0.7 units/kg/day | Watch for hypoglycemia |
| Second | 0.8–0.9 units/kg/day | Rising insulin resistance |
| Third | 1.0+ units/kg/day | Peak resistance, frequent adjustments |

### Postpartum Considerations

Insulin requirements drop dramatically after delivery. Most patients with GDM can discontinue insulin immediately postpartum, but glucose should be monitored to rule out persistent diabetes.

### The Gestation Calculator

Our Gestation calculator factors in:
- Current gestational age (trimester)
- Patient weight
- Pre-existing vs. gestational diabetes
- Current glucose patterns

It produces a trimester-appropriate starting regimen with basal and prandial breakdowns.

### Safety First

Tight glycemic control in pregnancy reduces risks of:
- Macrosomia (large-for-gestational-age infants)
- Neonatal hypoglycemia
- Preeclampsia
- Cesarean delivery

But overly aggressive dosing increases maternal hypoglycemia risk. Balance is key.

---

*Gestational diabetes management requires precision and vigilance. PreciseDM's Gestation calculator helps you find the right starting point for every trimester.*
    `,
  },
];
