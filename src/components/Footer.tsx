import { Link } from "react-router-dom";
import { Coffee, Mail, ShieldCheck, CircleHelp } from "lucide-react";
import { SUPPORT_EMAIL } from "@/src/content/siteContent";

export default function Footer() {
  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "About", href: "/about" },
        { name: "Explore", href: "/explore" },
        { name: "How it Works", href: "/how-it-works" },
        { name: "Creators", href: "/creators" },
        { name: "FAQ", href: "/faq" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "Contact", href: "/contact" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Refund / Dispute Policy", href: "/refunds" },
      ],
    },
  ];

  return (
    <footer className="border-t border-black/5 bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]">
          <div>
            <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-black">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
                <Coffee size={18} />
              </div>
              DropSomething
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-black/60">
              DropSomething is a creator tipping platform built to help creators receive direct support from their audience through one simple page.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-black">
                  <ShieldCheck size={16} />
                  Trust and security
                </div>
                <p className="mt-2 text-sm leading-relaxed text-black/55">
                  Secure payment messaging, support links, and policy pages are available across the platform.
                </p>
              </div>
              <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-black">
                  <Mail size={16} />
                  Support contact
                </div>
                <p className="mt-2 text-sm leading-relaxed text-black/55">{SUPPORT_EMAIL}</p>
              </div>
            </div>
          </div>
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-black/40">{section.title}</h3>
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-sm text-black/60 transition-colors hover:text-black">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-black/5 pt-8 text-sm text-black/40 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} DropSomething. All rights reserved.</p>
          <Link to="/contact" className="inline-flex items-center gap-2 font-semibold text-black/55 hover:text-black">
            <CircleHelp size={16} />
            Need help? Contact support
          </Link>
        </div>
      </div>
    </footer>
  );
}
