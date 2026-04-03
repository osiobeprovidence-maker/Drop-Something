import { Building2, CircleCheck, HeartHandshake, Users } from "lucide-react";
import { InfoPageShell } from "@/src/components/marketing/InfoPageShell";
import { PaymentTrustNotice } from "@/src/components/marketing/PaymentTrustNotice";
import { StatsGrid } from "@/src/components/marketing/StatsGrid";
import { ABOUT_PAGE_CONTENT, PLATFORM_STAT_SEEDS } from "@/src/content/siteContent";

export default function AboutPage() {
  return (
    <InfoPageShell
      eyebrow="About DropSomething"
      title="A real operating platform built to help creators receive direct audience support."
      description="DropSomething helps creators set up a support page, share one link, and receive small tips and payments from their audience without unnecessary friction."
    >
      <div className="space-y-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "What DropSomething is",
              description:
                "DropSomething is a creator support platform that gives each creator a simple page for tips, memberships, goals, digital products, and supporter messages.",
              icon: HeartHandshake,
            },
            {
              title: "Who it is for",
              description:
                "It is built for creators, communities, educators, builders, and independent teams who want a clear way to accept support online.",
              icon: Users,
            },
            {
              title: "Why it was built",
              description:
                "The product is designed to remove friction from audience support so creators can share one trusted link instead of piecing together multiple tools.",
              icon: Building2,
            },
          ].map((item) => (
            <section key={item.title} className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
                <item.icon size={20} />
              </div>
              <h2 className="mt-5 text-xl font-black text-black">{item.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-black/62">{item.description}</p>
            </section>
          ))}
        </div>

        <section className="rounded-[2rem] border border-black/10 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <CircleCheck size={20} className="text-emerald-600" />
            <h2 className="text-xl font-black text-black">Platform statement</h2>
          </div>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-black/68">
            DropSomething is presented as a live platform for creators and supporters to connect through direct financial support. The product, support pages, and payment flows shown on this site are part of an operating creator platform, not a concept landing page.
          </p>
        </section>

        <section className="rounded-[2rem] border border-black/10 bg-white p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/35">Founder / company section</p>
          <h2 className="mt-3 text-2xl font-black text-black">{ABOUT_PAGE_CONTENT.founderTitle}</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-black/62">{ABOUT_PAGE_CONTENT.founderBody}</p>
          <p className="mt-3 text-sm text-amber-700">
            Placeholder for founder and operating entity review before production launch.
          </p>
        </section>

        <section className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/35">Platform stats</p>
            <h2 className="mt-3 text-2xl font-black text-black">Add verified proof points as the platform grows.</h2>
          </div>
          <StatsGrid items={PLATFORM_STAT_SEEDS} />
        </section>

        <PaymentTrustNotice />
      </div>
    </InfoPageShell>
  );
}
