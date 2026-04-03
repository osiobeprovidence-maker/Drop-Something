import { InfoPageShell } from "@/src/components/marketing/InfoPageShell";

// Placeholder legal structure. Replace with counsel-approved language before launch.
const sections = [
  {
    title: "Review notice",
    body:
      "This refund and dispute page is a structured placeholder and requires founder and legal review before production launch.",
  },
  {
    title: "General platform position",
    body:
      "Support payments, creator memberships, product purchases, and event tickets may have different refund expectations. Publish the final rules for each category here so creators and supporters know what to expect.",
  },
  {
    title: "Tips and support payments",
    body:
      "Clarify whether one-time support payments are generally final, when exceptions may apply, and how fraud or accidental transactions are handled.",
  },
  {
    title: "Digital products, memberships, and tickets",
    body:
      "Define when these items are refundable, whether access already granted affects eligibility, and what time window or event-specific rules apply.",
  },
  {
    title: "Physical goods and delivery issues",
    body:
      "Add your rules for missing deliveries, damaged items, incorrect orders, and the evidence needed to review a claim. Explain whether the creator, the platform, or both participate in resolving the issue.",
  },
  {
    title: "Dispute process",
    body:
      "Supporters should first contact platform support with the payment reference, creator name, and issue details. Add your final internal review timeline, escalation path, and payment provider dispute process here.",
  },
  {
    title: "Chargebacks and abuse",
    body:
      "Document how fraudulent claims, repeated abuse, or policy violations are handled for both creators and supporters.",
  },
];

export default function RefundPolicyPage() {
  return (
    <InfoPageShell
      eyebrow="Refunds and disputes"
      title="Refund and dispute policy starter for creator payments and purchases."
      description="This page is designed to help users find refund guidance quickly, but the final rules still need review before launch."
    >
      <div className="space-y-5">
        {sections.map((section) => (
          <section key={section.title} className="rounded-[2rem] border border-black/10 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-black text-black">{section.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-black/62">{section.body}</p>
          </section>
        ))}
      </div>
    </InfoPageShell>
  );
}
