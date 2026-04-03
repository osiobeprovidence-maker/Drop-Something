import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Clock3, Mail, MessageCircleMore, PhoneCall } from "lucide-react";
import { InfoPageShell } from "@/src/components/marketing/InfoPageShell";
import { CONTACT_FAQS, SUPPORT_EMAIL, SUPPORT_RESPONSE_TIME, SUPPORT_WHATSAPP } from "@/src/content/siteContent";

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent(formState.subject || "DropSomething enquiry");
    const body = encodeURIComponent(
      [
        `Name: ${formState.name || "-"}`,
        `Email: ${formState.email || "-"}`,
        `Company: ${formState.company || "-"}`,
        "",
        formState.message || "Please add your message here.",
      ].join("\n"),
    );

    return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  }, [formState]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.location.href = mailtoHref;
  };

  return (
    <InfoPageShell
      eyebrow="Contact"
      title="Reach the team behind DropSomething."
      description="Use the contact details below for support, partnership requests, creator questions, or payment-related issues."
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.03)] sm:p-8"
        >
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/35">Business / support form</p>
            <h2 className="mt-3 text-2xl font-black text-black">Send a message</h2>
            <p className="mt-3 text-sm leading-relaxed text-black/58">
              This form currently opens your email client with the details pre-filled. Connect it to your helpdesk or CRM when your support workflow is ready.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-black">
              Full name
              <input
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-4 focus:border-black focus:outline-none"
                placeholder="Your name"
              />
            </label>
            <label className="text-sm font-medium text-black">
              Email
              <input
                type="email"
                value={formState.email}
                onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-4 focus:border-black focus:outline-none"
                placeholder="name@example.com"
              />
            </label>
            <label className="text-sm font-medium text-black">
              Company or brand
              <input
                value={formState.company}
                onChange={(event) => setFormState((prev) => ({ ...prev, company: event.target.value }))}
                className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-4 focus:border-black focus:outline-none"
                placeholder="Optional"
              />
            </label>
            <label className="text-sm font-medium text-black">
              Subject
              <input
                value={formState.subject}
                onChange={(event) => setFormState((prev) => ({ ...prev, subject: event.target.value }))}
                className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-4 focus:border-black focus:outline-none"
                placeholder="Support, partnership, payments..."
              />
            </label>
          </div>

          <label className="mt-4 block text-sm font-medium text-black">
            Message
            <textarea
              value={formState.message}
              onChange={(event) => setFormState((prev) => ({ ...prev, message: event.target.value }))}
              rows={6}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 focus:border-black focus:outline-none"
              placeholder="Tell us how we can help."
            />
          </label>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-sm font-bold text-white"
            >
              Open email draft
            </button>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white px-6 text-sm font-bold text-black"
            >
              Email support directly
            </a>
          </div>
        </form>

        <div className="space-y-5">
          <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-3">
              <Mail size={18} />
              <h2 className="text-lg font-black text-black">Support email</h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-black/62">{SUPPORT_EMAIL}</p>
            <p className="mt-3 text-xs text-amber-700">
              Placeholder inbox. Confirm the production support address before launch.
            </p>
          </section>

          <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-3">
              <PhoneCall size={18} />
              <h2 className="text-lg font-black text-black">WhatsApp / business contact</h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-black/62">{SUPPORT_WHATSAPP}</p>
            <p className="mt-3 text-xs text-amber-700">
              Placeholder contact. Replace with your approved business line before launch.
            </p>
          </section>

          <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-3">
              <Clock3 size={18} />
              <h2 className="text-lg font-black text-black">Response time</h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-black/62">{SUPPORT_RESPONSE_TIME}</p>
          </section>

          <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-3">
              <MessageCircleMore size={18} />
              <h2 className="text-lg font-black text-black">Quick answers</h2>
            </div>
            <div className="mt-4 space-y-4">
              {CONTACT_FAQS.map((item) => (
                <div key={item.question} className="border-t border-black/5 pt-4 first:border-t-0 first:pt-0">
                  <p className="text-sm font-bold text-black">{item.question}</p>
                  <p className="mt-2 text-sm leading-relaxed text-black/58">{item.answer}</p>
                </div>
              ))}
            </div>
            <Link to="/faq" className="mt-5 inline-flex text-sm font-bold text-black underline underline-offset-4">
              View full FAQ
            </Link>
          </section>
        </div>
      </div>
    </InfoPageShell>
  );
}
