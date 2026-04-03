import { InfoPageShell } from "@/src/components/marketing/InfoPageShell";

// Placeholder legal structure. Replace with counsel-approved language before launch.
const sections = [
  {
    title: "Review notice",
    body:
      "This is starter privacy policy copy for production preparation. It should be reviewed and finalized by the founder and legal counsel before public launch.",
  },
  {
    title: "Information we collect",
    body:
      "DropSomething may collect account details, creator profile content, support transaction records, support messages, delivery information, and basic device or usage information needed to operate the platform.",
  },
  {
    title: "How information is used",
    body:
      "We use information to provide creator pages, process payments, verify transactions, respond to support requests, improve platform reliability, and comply with legal obligations.",
  },
  {
    title: "Payments",
    body:
      "Payments are processed by third-party payment providers. Sensitive payment credentials are handled by the payment provider and should not be stored directly on DropSomething servers.",
  },
  {
    title: "Sharing and disclosure",
    body:
      "We may share data with service providers that help operate the platform, including payment, hosting, analytics, support, or compliance partners, only as needed to run the service lawfully and reliably.",
  },
  {
    title: "Your choices",
    body:
      "Users should be able to request account updates, ask privacy questions, and review the support contact options listed on the Contact page. Add your final account deletion and data request workflow here.",
  },
  {
    title: "Retention and security",
    body:
      "Define how long account, payment reference, and support records are retained, who can access them, and what operational safeguards are in place to protect them.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <InfoPageShell
      eyebrow="Privacy policy"
      title="Privacy policy starter for founder and legal review."
      description="This page is structured for production use, but the final privacy policy should be reviewed and approved before launch."
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
