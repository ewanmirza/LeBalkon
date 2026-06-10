import { getSeo } from '@/lib/content';
import { supabaseServer } from '@/lib/supabase-server';
import SectionHeader from '@/components/site/SectionHeader';
import type { Metadata } from 'next';

export const revalidate = 60;
export async function generateMetadata(): Promise<Metadata> { return getSeo('/galeri'); }

export default async function GalleryPage() {
  const sb = supabaseServer();
  const { data } = await sb.from('gallery_items').select('*').eq('is_active', true).order('sort_order');
  const items = data ?? [];
  return (
    <div className="container-site pt-32">
      <SectionHeader eyebrow="Mekândan Kareler" title="Galeri" sub="Le Balkon'dan fotoğraf ve videolar." />
      {!items.length && <p className="text-center text-muted2 font-sans">Galeri içerikleri yakında burada.</p>}
      <div className="columns-2 md:columns-3 gap-4 [&>*]:mb-4">
        {items.map((g) => (
          <div key={g.id} className="rounded-xl overflow-hidden border border-gold/10 break-inside-avoid">
            {g.type === 'video'
              ? <video src={g.url} controls playsInline className="w-full" preload="metadata" />
              : <img src={g.url} alt={g.title || 'Le Balkon'} className="w-full hover:scale-[1.03] transition-transform duration-500" loading="lazy" />}
            {g.title && <p className="font-sans text-xs text-muted2 px-3 py-2 bg-dark-2">{g.title}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
