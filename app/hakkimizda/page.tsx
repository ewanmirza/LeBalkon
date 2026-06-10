import { getContent, getSeo } from '@/lib/content';
import SectionHeader from '@/components/site/SectionHeader';
import type { Metadata } from 'next';

export const revalidate = 60;
export async function generateMetadata(): Promise<Metadata> { return getSeo('/hakkimizda'); }

export default async function AboutPage() {
  const c = await getContent();
  return (
    <div className="container-site pt-32">
      <SectionHeader eyebrow="Le Balkon" title={c.about_title ?? 'Hikâyemiz'} />
      <div className="grid gap-12 md:grid-cols-2 items-start max-w-5xl mx-auto">
        <div className="rounded-2xl overflow-hidden shadow-image aspect-[3/4] bg-dark-2 border border-gold/10">
          {c.about_image ? <img src={c.about_image} alt={c.about_title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-muted2 font-sans text-sm px-6 text-center">Görsel admin panelinden eklenecek</div>}
        </div>
        <div>
          <p className="text-cream/80 font-sans text-[15px] leading-loose whitespace-pre-line">{c.about_text}</p>
          <div className="mt-10 grid grid-cols-2 gap-6 font-sans text-sm">
            <div className="border border-gold/15 rounded-xl p-5">
              <p className="eyebrow !text-[10px] mb-2">Hafta İçi</p>
              <p className="text-cream text-lg">{c.hours_week}</p>
            </div>
            <div className="border border-gold/15 rounded-xl p-5">
              <p className="eyebrow !text-[10px] mb-2">Hafta Sonu</p>
              <p className="text-cream text-lg">{c.hours_weekend}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
