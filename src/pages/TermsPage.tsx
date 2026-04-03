import { InfoPageShell } from "@/src/components/marketing/InfoPageShell";

// Placeholder legal structure. Replace with counsel-approved language before launch.
const sections = [
  {
    title: "Review notice",
    body:
      "This terms of service page contains placeholder starter language. Founder and legal review is required before production launch.",
  },
  {
    title: "Using the platform",
    body:
      "DropSomething provides tools for creators to publish support pages and for supporters to send payments or messages. Users agree to use the service lawfully and not misuse the platform, payment flow, or creator pages.",
  },
  {
    title: "Accounts and eligibility",
    body:
      "Add the final rules for account creation, age requirements, creator onboarding, identity checks, and any country or category restrictions that apply to your service.",
  },
  {
    title: "Creator responsibilities",
    body:
      "Creators are responsible for the accuracy of their pages, the products or memberships they offer, the delivery of promised benefits, and compliance with local tax or consumer obligations that apply to them.",
  },
  {
    title: "Supporter responsibilities",
    body:
      "Supporters are responsible for providing accurate payment and delivery details, using payment methods they are authorized to use, and raising disputes in good faith with supporting information.",
  },
  {
    title: "Fees, payouts, and provider terms",
    body:
      "Add your final fee language, payout timing rules, chargeback handling process, and references to any payment provider terms that users must also accept.",
  },
  {
    title: "Termination and enforcement",
    body:
      "Add the conditions for suspension, moderation, account removal, prohibited conduct enforcement, and any appeal or support process you intend to offer.",
  },
];

export default function TermsPage() {
  return (
    <InfoPageShell
      eyebrow="Terms of service"
      title="Terms of service starter copy for platform launch preparation."
      description="This structure is ready for a production policy page, but the final legal language must be approved before launch."
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
