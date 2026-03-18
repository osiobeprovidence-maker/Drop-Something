import { Link } from "react-router-dom";
import { Coffee, Twitter, Github, Instagram } from "lucide-react";

export default function Footer() {
  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Explore", href: "/explore" },
        { name: "How it Works", href: "/how-it-works" },
        { name: "Creators", href: "/creators" },
        { name: "FAQ", href: "/faq" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Contact Us", href: "/contact" },
      ],
    },
  ];

  return (
    <footer className="border-t border-black/5 bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-black">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
                <Coffee size={18} />
              </div>
              DropSomething
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-black/60">
              A simple way to support creators and communities you love. Send small tips, leave messages, and help creators keep creating.
            </p>
            <div className="mt-6 flex gap-4">
              <a href="#" className="text-black/40 hover:text-black">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-black/40 hover:text-black">
                <Github size={20} />
              </a>
              <a href="#" className="text-black/40 hover:text-black">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-black/40">{section.title}</h3>
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-sm text-black/60 hover:text-black transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-black/5 pt-8 text-center text-sm text-black/40">
          <p>© {new Date().getFullYear()} DropSomething. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
