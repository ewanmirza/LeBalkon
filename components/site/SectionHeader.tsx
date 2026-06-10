export default function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-12">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="h-display text-4xl md:text-5xl mt-3">{title}</h2>
      {sub && <p className="mt-4 text-muted2 font-sans text-[15px] leading-relaxed">{sub}</p>}
    </div>
  );
}
