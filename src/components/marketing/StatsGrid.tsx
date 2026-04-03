type StatItem = {
  label: string;
  value: string;
  note: string;
};

export function StatsGrid({ items }: { items: StatItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.03)]"
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/35">{item.label}</p>
          <p className="mt-4 text-2xl font-black text-black sm:text-3xl">{item.value}</p>
          <p className="mt-3 text-sm leading-relaxed text-black/55">{item.note}</p>
        </div>
      ))}
    </div>
  );
}
