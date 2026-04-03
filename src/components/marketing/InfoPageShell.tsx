import { ReactNode } from "react";
import { Link } from "react-router-dom";

export function InfoPageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FCFCFB] pb-20">
      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <span className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white">
            {eyebrow}
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-black sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-black/62">{description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-sm font-bold text-white"
            >
              Create your page
            </Link>
            <Link
              to="/contact"
              className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white px-6 text-sm font-bold text-black"
            >
              Contact support
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">{children}</section>
    </div>
  );
}
