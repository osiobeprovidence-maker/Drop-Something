type TestimonialItem = {
  name: string;
  role: string;
  quote: string;
  badge?: string;
};

export function TestimonialsGrid({ items }: { items: TestimonialItem[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {items.map((item) => (
        <article
          key={`${item.name}-${item.role}`}
          className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.03)]"
        >
          {item.badge ? (
            <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">
              {item.badge}
            </span>
          ) : null}
          <p className="mt-4 text-base leading-relaxed text-black/75">{item.quote}</p>
          <div className="mt-6 border-t border-black/5 pt-4">
            <p className="text-sm font-bold text-black">{item.name}</p>
            <p className="text-sm text-black/45">{item.role}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
